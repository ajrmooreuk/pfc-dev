#!/bin/bash
#===============================================================================
# Power Platform & Data Layer Snapshot Audit - Pure CLI Version (v1)
#===============================================================================
#
# Replaces PowerShell-dependent queries with az cli commands.
# Uses Azure Resource Graph for data resources (Synapse, SQL, Fabric).
#
# COVERAGE:
#   ✅ Azure Data Resources - Full coverage via Resource Graph
#      - Synapse Workspaces, SQL Pools
#      - Azure SQL Servers, Databases, Firewall Rules
#      - Storage Accounts (Data Lake enabled)
#      - Fabric Capacities (via az rest)
#   ✅ Third-Party Applications - Full coverage via Graph API
#      - Enterprise Applications
#      - App Permissions
#      - OAuth Grants
#   ⚠️  Power Platform - Limited (environments, apps, flows require PowerShell)
#   ⚠️  Power BI - Limited (workspaces, datasets require PowerShell)
#
# Dependencies (all pre-installed in Azure Cloud Shell):
#   - az CLI (with resource-graph extension)
#   - jq
#   - bash
#
# Prerequisites:
#   - Azure CLI logged in: az login
#   - Reader access to target subscriptions
#   - For Graph API calls: Application.Read.All permission
#
# Usage:
#   ./05-PP-DS-Audit-AzCLI-v1.sh
#   ./05-PP-DS-Audit-AzCLI-v1.sh --output /path/to/exports
#   ./05-PP-DS-Audit-AzCLI-v1.sh -h
#
#===============================================================================

set -euo pipefail

#-------------------------------------------------------------------------------
# Configuration
#-------------------------------------------------------------------------------

SCRIPT_VERSION="1.0.0"
SCRIPT_NAME="05-PP-DS-Audit-AzCLI-v1"
OUTPUT_DIR="./pp-data-audit-$(date +%Y%m%d-%H%M%S)"
PAGE_SIZE=1000
GRAPH_API_BASE="https://graph.microsoft.com/v1.0"
FABRIC_API_BASE="https://api.fabric.microsoft.com/v1"

# Counters
QUERY_TOTAL=0
QUERY_SUCCESS=0
QUERY_FAILED=0
QUERY_CURRENT=0
TOTAL_ROWS=0

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

#-------------------------------------------------------------------------------
# Argument Parsing
#-------------------------------------------------------------------------------

while [[ $# -gt 0 ]]; do
    case $1 in
        -o|--output)
            OUTPUT_DIR="$2"
            shift 2
            ;;
        -h|--help)
            cat << 'HELPEOF'
Power Platform & Data Layer Audit - Pure CLI Version (v1)
==========================================================

Single-script audit for Azure data resources and third-party apps.
Uses Azure Resource Graph and Microsoft Graph API. No PowerShell.

Usage:
  ./05-PP-DS-Audit-AzCLI-v1.sh [OPTIONS]

Options:
  -o, --output DIR    Output directory (default: ./pp-data-audit-TIMESTAMP)
  -h, --help          Show this help message

Coverage:
  ✅ Full: Synapse, Azure SQL, Storage/Data Lake, Third-Party Apps
  ⚠️  Limited: Power Platform, Power BI (require PowerShell)

Prerequisites:
  1. Azure CLI logged in: az login
  2. Reader access to subscriptions
  3. Graph API permissions: Application.Read.All

HELPEOF
            exit 0
            ;;
        *)
            echo -e "${RED}[ERROR]${NC} Unknown option: $1"
            exit 1
            ;;
    esac
done

#-------------------------------------------------------------------------------
# Logging Functions
#-------------------------------------------------------------------------------

log_info()    { echo -e "${BLUE}[INFO]${NC}    $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC}    $1"; }
log_error()   { echo -e "${RED}[ERROR]${NC}   $1"; }
log_section() { echo -e "\n${CYAN}${BOLD}=== $1 ===${NC}"; }

#-------------------------------------------------------------------------------
# Prerequisites Check
#-------------------------------------------------------------------------------

check_prerequisites() {
    log_info "Checking prerequisites..."

    if ! command -v az &> /dev/null; then
        log_error "Azure CLI (az) not found."
        exit 1
    fi

    if ! az account show &> /dev/null 2>&1; then
        log_error "Not logged in to Azure. Run: az login"
        exit 1
    fi

    if ! command -v jq &> /dev/null; then
        log_error "jq not found."
        exit 1
    fi

    # Ensure resource-graph extension
    if ! az extension show --name resource-graph &> /dev/null 2>&1; then
        log_warn "Installing resource-graph extension..."
        az extension add --name resource-graph --yes 2>/dev/null || true
    fi

    log_success "Prerequisites satisfied."
}

#-------------------------------------------------------------------------------
# Banner
#-------------------------------------------------------------------------------

print_banner() {
    echo ""
    echo -e "${BOLD}================================================================${NC}"
    echo -e "${BOLD}  Power Platform & Data Layer Audit - Pure CLI Version${NC}"
    echo -e "${BOLD}  Version: ${SCRIPT_VERSION}${NC}"
    echo -e "${BOLD}  $(date '+%Y-%m-%d %H:%M:%S %Z')${NC}"
    echo -e "${BOLD}================================================================${NC}"
    echo ""
}

#-------------------------------------------------------------------------------
# Resource Graph Query Function
#-------------------------------------------------------------------------------

run_kql_query() {
    local query_name="$1"
    local output_file="$2"
    local kql_query="$3"
    local full_path="${OUTPUT_DIR}/${output_file}"

    QUERY_CURRENT=$((QUERY_CURRENT + 1))
    echo -ne "${BLUE}[${QUERY_CURRENT}/${QUERY_TOTAL}]${NC} ${query_name}..."

    local all_results="[]"
    local skip_token=""
    local page=0
    local total_count=0

    while true; do
        page=$((page + 1))

        local cmd="az graph query -q \"${kql_query}\" --first ${PAGE_SIZE} --output json"
        if [[ -n "$skip_token" ]]; then
            cmd="$cmd --skip-token \"${skip_token}\""
        fi

        local response
        response=$(eval "$cmd" 2>/dev/null) || {
            echo -e " ${RED}FAILED${NC}"
            echo "[]" > "$full_path"
            QUERY_FAILED=$((QUERY_FAILED + 1))
            return 0
        }

        local page_data
        page_data=$(echo "$response" | jq -r '.data // []' 2>/dev/null) || page_data="[]"

        local page_count
        page_count=$(echo "$page_data" | jq 'length' 2>/dev/null) || page_count=0

        all_results=$(echo "$all_results" "$page_data" | jq -s '.[0] + .[1]' 2>/dev/null) || {
            echo -e " ${RED}MERGE FAILED${NC}"
            QUERY_FAILED=$((QUERY_FAILED + 1))
            echo "[]" > "$full_path"
            return 0
        }

        total_count=$((total_count + page_count))

        skip_token=$(echo "$response" | jq -r '.skip_token // empty' 2>/dev/null) || skip_token=""

        if [[ -z "$skip_token" ]] || [[ "$page_count" -lt "$PAGE_SIZE" ]]; then
            break
        fi

        if [[ $page -ge 50 ]]; then
            log_warn "  Pagination limit for '${query_name}' (${total_count} rows)."
            break
        fi
    done

    echo "$all_results" > "$full_path"
    TOTAL_ROWS=$((TOTAL_ROWS + total_count))
    QUERY_SUCCESS=$((QUERY_SUCCESS + 1))

    if [[ $page -gt 1 ]]; then
        echo -e " ${GREEN}OK${NC} (${total_count} rows, ${page} pages)"
    else
        echo -e " ${GREEN}OK${NC} (${total_count} rows)"
    fi
}

#-------------------------------------------------------------------------------
# Graph API Query Function
#-------------------------------------------------------------------------------

run_graph_query() {
    local query_name="$1"
    local output_file="$2"
    local endpoint="$3"
    local full_path="${OUTPUT_DIR}/${output_file}"

    QUERY_CURRENT=$((QUERY_CURRENT + 1))
    echo -ne "${BLUE}[${QUERY_CURRENT}/${QUERY_TOTAL}]${NC} ${query_name}..."

    local url="${GRAPH_API_BASE}${endpoint}"
    local all_results="[]"
    local page=0
    local total_count=0

    while [[ -n "$url" ]]; do
        page=$((page + 1))

        local response
        response=$(az rest --method GET --url "$url" 2>/dev/null) || {
            echo -e " ${RED}FAILED${NC}"
            echo "[]" > "$full_path"
            QUERY_FAILED=$((QUERY_FAILED + 1))
            return 0
        }

        local page_data
        page_data=$(echo "$response" | jq -r '.value // []' 2>/dev/null) || page_data="[]"

        if [[ "$page_data" == "[]" ]] || [[ "$page_data" == "null" ]]; then
            page_data=$(echo "$response" | jq -r 'if type == "array" then . else [.] end' 2>/dev/null) || page_data="[]"
        fi

        local page_count
        page_count=$(echo "$page_data" | jq 'length' 2>/dev/null) || page_count=0

        all_results=$(echo "$all_results" "$page_data" | jq -s '.[0] + .[1]' 2>/dev/null) || {
            echo -e " ${RED}MERGE FAILED${NC}"
            QUERY_FAILED=$((QUERY_FAILED + 1))
            echo "[]" > "$full_path"
            return 0
        }

        total_count=$((total_count + page_count))

        url=$(echo "$response" | jq -r '."@odata.nextLink" // empty' 2>/dev/null) || url=""

        if [[ $page -ge 100 ]]; then
            break
        fi
    done

    echo "$all_results" > "$full_path"
    QUERY_SUCCESS=$((QUERY_SUCCESS + 1))

    if [[ $page -gt 1 ]]; then
        echo -e " ${GREEN}OK${NC} (${total_count} items, ${page} pages)"
    else
        echo -e " ${GREEN}OK${NC} (${total_count} items)"
    fi
}

#-------------------------------------------------------------------------------
# PHASE 1: Power Platform (Limited - note for PowerShell)
#-------------------------------------------------------------------------------

run_power_platform_queries() {
    log_section "PHASE 1: Power Platform (Limited - Requires PowerShell)"

    local pp_dir="${OUTPUT_DIR}/01-power-platform"
    mkdir -p "$pp_dir"

    log_warn "Power Platform environments, apps, and flows require PowerShell."
    log_warn "This phase creates documentation for PowerShell collection."

    # Create note for Power Platform
    cat > "${pp_dir}/POWER-PLATFORM-REQUIRES-POWERSHELL.md" << 'PPNOTE'
# Power Platform Features Requiring PowerShell

Power Platform audit items require the Microsoft.PowerApps.Administration.PowerShell
module and cannot be retrieved via Azure CLI or Microsoft Graph API.

## Requires PowerShell:
- Environment Inventory
- DLP Policies
- Power Apps Inventory (with connectors)
- Power Automate Flows Inventory
- Custom Connectors
- Connection References

## How to run PowerShell collection:

```powershell
# Install module
Install-Module -Name Microsoft.PowerApps.Administration.PowerShell

# Connect
Add-PowerAppsAccount

# Environment inventory
$environments = Get-AdminPowerAppEnvironment
$environments | Export-Csv pp-environments.csv -NoTypeInformation

# DLP Policies
$dlpPolicies = Get-DlpPolicy
$dlpPolicies | ConvertTo-Json -Depth 10 > pp-dlp-policies.json

# Power Apps
$apps = Get-AdminPowerApp
$apps | Export-Csv pp-power-apps.csv -NoTypeInformation

# Power Automate Flows
$flows = Get-AdminFlow
$flows | Export-Csv pp-power-automate-flows.csv -NoTypeInformation

# Custom Connectors
Get-AdminPowerAppConnector | Export-Csv pp-custom-connectors.csv

# Connections
Get-AdminPowerAppConnection | Export-Csv pp-connections.csv
```

Refer to: 03-PP-DS-Audit-Operating-Deployment-Guide-v1.md for full procedures.
PPNOTE

    log_success "Power Platform documentation created."
}

#-------------------------------------------------------------------------------
# PHASE 2: Power BI (Limited - note for PowerShell)
#-------------------------------------------------------------------------------

run_power_bi_queries() {
    log_section "PHASE 2: Power BI (Limited - Requires PowerShell)"

    local pbi_dir="${OUTPUT_DIR}/02-power-bi"
    mkdir -p "$pbi_dir"

    log_warn "Power BI workspaces, datasets, and tenant settings require PowerShell."
    log_warn "This phase creates documentation for PowerShell collection."

    # Create note for Power BI
    cat > "${pbi_dir}/POWER-BI-REQUIRES-POWERSHELL.md" << 'PBINOTE'
# Power BI Features Requiring PowerShell

Power BI audit items require the MicrosoftPowerBIMgmt module
and cannot be retrieved via Azure CLI.

## Requires PowerShell:
- Workspace Inventory
- Workspace Access (users/permissions)
- Datasets / Semantic Models
- Tenant Settings
- Gateways

## How to run PowerShell collection:

```powershell
# Install module
Install-Module -Name MicrosoftPowerBIMgmt

# Connect
Connect-PowerBIServiceAccount

# Workspace inventory
$workspaces = Get-PowerBIWorkspace -Scope Organization -All
$workspaces | Export-Csv pbi-workspaces.csv -NoTypeInformation

# Workspace access
$workspaceAccess = foreach ($ws in $workspaces) {
    Get-PowerBIWorkspace -Scope Organization -Id $ws.Id | Select -ExpandProperty Users
}
$workspaceAccess | Export-Csv pbi-workspace-access.csv

# Datasets
$datasets = foreach ($ws in $workspaces) {
    Get-PowerBIDataset -Scope Organization -WorkspaceId $ws.Id
}
$datasets | Export-Csv pbi-datasets.csv

# Tenant settings (requires Admin API)
Invoke-PowerBIRestMethod -Url "admin/tenantsettings" -Method Get > pbi-tenant-settings.json

# Gateways
Invoke-PowerBIRestMethod -Url "gateways" -Method Get > pbi-gateways.json

# Disconnect
Disconnect-PowerBIServiceAccount
```

Refer to: 03-PP-DS-Audit-Operating-Deployment-Guide-v1.md for full procedures.
PBINOTE

    log_success "Power BI documentation created."
}

#-------------------------------------------------------------------------------
# PHASE 3: Fabric / OneLake (via REST API)
#-------------------------------------------------------------------------------

run_fabric_queries() {
    log_section "PHASE 3: Fabric / OneLake"

    local fabric_dir="${OUTPUT_DIR}/03-fabric"
    mkdir -p "$fabric_dir"

    log_info "Attempting Fabric API queries (requires Fabric Admin access)..."

    # Get access token for Fabric API
    local token
    token=$(az account get-access-token --resource "https://api.fabric.microsoft.com" --query accessToken -o tsv 2>/dev/null) || {
        log_warn "Could not get Fabric API token. Skipping Fabric queries."
        cat > "${fabric_dir}/FABRIC-ACCESS-REQUIRED.md" << 'FABNOTE'
# Fabric API Access Required

Could not obtain access token for Fabric API.

Requirements:
- Azure subscription with Fabric capacity
- Fabric Administrator role
- Or: Use PowerShell with Az module

## Alternative: PowerShell collection

```powershell
$token = (Get-AzAccessToken -ResourceUrl "https://api.fabric.microsoft.com").Token
$headers = @{ Authorization = "Bearer $token" }

# Capacities
Invoke-RestMethod -Uri "https://api.fabric.microsoft.com/v1/admin/capacities" -Headers $headers |
    ConvertTo-Json > fabric-capacities.json

# Workspaces
Invoke-RestMethod -Uri "https://api.fabric.microsoft.com/v1/admin/workspaces" -Headers $headers |
    ConvertTo-Json > fabric-workspaces.json

# Items per workspace
$workspaces = (Invoke-RestMethod -Uri "https://api.fabric.microsoft.com/v1/admin/workspaces" -Headers $headers).value
foreach ($ws in $workspaces) {
    Invoke-RestMethod -Uri "https://api.fabric.microsoft.com/v1/workspaces/$($ws.id)/items" -Headers $headers |
        ConvertTo-Json >> fabric-items.json
}

# Domains
Invoke-RestMethod -Uri "https://api.fabric.microsoft.com/v1/admin/domains" -Headers $headers |
    ConvertTo-Json > fabric-domains.json
```
FABNOTE
        return 0
    }

    # Fabric Capacities
    log_info "Fetching Fabric capacities..."
    az rest --method GET \
        --url "${FABRIC_API_BASE}/admin/capacities" \
        --headers "Authorization=Bearer ${token}" \
        --output json > "${fabric_dir}/fabric-capacities.json" 2>/dev/null || {
        log_warn "Could not fetch Fabric capacities."
        echo "[]" > "${fabric_dir}/fabric-capacities.json"
    }

    # Fabric Workspaces
    log_info "Fetching Fabric workspaces..."
    az rest --method GET \
        --url "${FABRIC_API_BASE}/admin/workspaces" \
        --headers "Authorization=Bearer ${token}" \
        --output json > "${fabric_dir}/fabric-workspaces.json" 2>/dev/null || {
        log_warn "Could not fetch Fabric workspaces."
        echo "[]" > "${fabric_dir}/fabric-workspaces.json"
    }

    # Fabric Domains
    log_info "Fetching Fabric domains..."
    az rest --method GET \
        --url "${FABRIC_API_BASE}/admin/domains" \
        --headers "Authorization=Bearer ${token}" \
        --output json > "${fabric_dir}/fabric-domains.json" 2>/dev/null || {
        log_warn "Could not fetch Fabric domains."
        echo "[]" > "${fabric_dir}/fabric-domains.json"
    }

    log_success "Fabric queries complete."
}

#-------------------------------------------------------------------------------
# PHASE 4: Synapse & Data Warehouse (via Resource Graph)
#-------------------------------------------------------------------------------

run_synapse_queries() {
    log_section "PHASE 4: Synapse & Data Warehouse"

    local synapse_dir="${OUTPUT_DIR}/04-synapse-data"
    mkdir -p "$synapse_dir"
    local saved_output_dir="$OUTPUT_DIR"
    OUTPUT_DIR="$synapse_dir"

    QUERY_TOTAL=12
    QUERY_CURRENT=0
    QUERY_SUCCESS=0
    QUERY_FAILED=0

    #---------------------------------------------------------------------------
    # Synapse
    #---------------------------------------------------------------------------
    run_kql_query "Synapse Workspaces" "synapse-workspaces.json" \
        "resources | where type == 'microsoft.synapse/workspaces' | project name, resourceGroup, subscriptionId, location, managedVirtualNetwork = properties.managedVirtualNetwork, publicNetworkAccess = properties.publicNetworkAccess, managedResourceGroup = properties.managedResourceGroupName"

    run_kql_query "Synapse SQL Pools" "synapse-sql-pools.json" \
        "resources | where type == 'microsoft.synapse/workspaces/sqlpools' | project name, resourceGroup, subscriptionId, sku = sku.name, status = properties.status"

    run_kql_query "Synapse Spark Pools" "synapse-spark-pools.json" \
        "resources | where type == 'microsoft.synapse/workspaces/bigdatapools' | project name, resourceGroup, subscriptionId, nodeSize = properties.nodeSize, nodeCount = properties.nodeCount, autoScale = properties.autoScale.enabled"

    #---------------------------------------------------------------------------
    # Azure SQL
    #---------------------------------------------------------------------------
    run_kql_query "SQL Servers" "sql-servers.json" \
        "resources | where type == 'microsoft.sql/servers' | project name, resourceGroup, subscriptionId, location, adminLogin = properties.administratorLogin, publicNetworkAccess = properties.publicNetworkAccess, minimalTlsVersion = properties.minimalTlsVersion"

    run_kql_query "SQL Databases" "sql-databases.json" \
        "resources | where type == 'microsoft.sql/servers/databases' | project name, resourceGroup, subscriptionId, location, sku = sku.name, tier = sku.tier, status = properties.status, maxSizeBytes = properties.maxSizeBytes, zoneRedundant = properties.zoneRedundant"

    run_kql_query "SQL Firewall Rules" "sql-firewall-rules.json" \
        "resources | where type == 'microsoft.sql/servers/firewallrules' | project name, resourceGroup, startIpAddress = properties.startIpAddress, endIpAddress = properties.endIpAddress"

    run_kql_query "SQL Elastic Pools" "sql-elastic-pools.json" \
        "resources | where type == 'microsoft.sql/servers/elasticpools' | project name, resourceGroup, subscriptionId, sku = sku.name, state = properties.state, maxSizeBytes = properties.maxSizeBytes"

    #---------------------------------------------------------------------------
    # Other Data Services
    #---------------------------------------------------------------------------
    run_kql_query "Data Factory" "data-factory.json" \
        "resources | where type == 'microsoft.datafactory/factories' | project name, resourceGroup, subscriptionId, location, provisioningState = properties.provisioningState, publicNetworkAccess = properties.publicNetworkAccess"

    run_kql_query "Event Hubs" "event-hubs.json" \
        "resources | where type == 'microsoft.eventhub/namespaces' | project name, resourceGroup, subscriptionId, location, sku = sku.name, tier = sku.tier"

    run_kql_query "Stream Analytics" "stream-analytics.json" \
        "resources | where type == 'microsoft.streamanalytics/streamingjobs' | project name, resourceGroup, subscriptionId, location, jobState = properties.jobState"

    run_kql_query "Azure Data Explorer (Kusto)" "kusto-clusters.json" \
        "resources | where type == 'microsoft.kusto/clusters' | project name, resourceGroup, subscriptionId, location, sku = sku.name, state = properties.state"

    run_kql_query "Purview / Data Governance" "purview.json" \
        "resources | where type == 'microsoft.purview/accounts' | project name, resourceGroup, subscriptionId, location, provisioningState = properties.provisioningState"

    OUTPUT_DIR="$saved_output_dir"
    log_success "Synapse/Data queries complete: ${QUERY_SUCCESS} succeeded, ${QUERY_FAILED} failed"
}

#-------------------------------------------------------------------------------
# PHASE 5: Storage & Data Lake
#-------------------------------------------------------------------------------

run_storage_queries() {
    log_section "PHASE 5: Storage & Data Lake"

    local storage_dir="${OUTPUT_DIR}/05-storage"
    mkdir -p "$storage_dir"
    local saved_output_dir="$OUTPUT_DIR"
    OUTPUT_DIR="$storage_dir"

    QUERY_TOTAL=4
    QUERY_CURRENT=0
    QUERY_SUCCESS=0
    QUERY_FAILED=0

    run_kql_query "Storage Accounts" "storage-accounts.json" \
        "resources | where type =~ 'microsoft.storage/storageaccounts' | project name, resourceGroup, subscriptionId, location, kind, sku = sku.name, accessTier = properties.accessTier, isHnsEnabled = properties.isHnsEnabled, httpsOnly = properties.supportsHttpsTrafficOnly, minTlsVersion = properties.minimumTlsVersion, publicAccess = properties.allowBlobPublicAccess, networkDefault = properties.networkAcls.defaultAction"

    run_kql_query "Storage - Data Lake Enabled" "storage-datalake.json" \
        "resources | where type =~ 'microsoft.storage/storageaccounts' | where properties.isHnsEnabled == true | project name, resourceGroup, subscriptionId, location, kind, sku = sku.name"

    run_kql_query "Storage - Private Endpoints" "storage-private-endpoints.json" \
        "resources | where type == 'microsoft.network/privateendpoints' | where properties.privateLinkServiceConnections[0].properties.privateLinkServiceId contains 'storageAccounts' | project name, resourceGroup, targetStorage = split(properties.privateLinkServiceConnections[0].properties.privateLinkServiceId, '/')[-1], connectionState = properties.privateLinkServiceConnections[0].properties.privateLinkServiceConnectionState.status"

    run_kql_query "Storage - Public Network Exposed" "storage-public-access.json" \
        "resources | where type =~ 'microsoft.storage/storageaccounts' | where properties.networkAcls.defaultAction == 'Allow' | project name, resourceGroup, subscriptionId, publicAccess = properties.allowBlobPublicAccess"

    OUTPUT_DIR="$saved_output_dir"
    log_success "Storage queries complete: ${QUERY_SUCCESS} succeeded, ${QUERY_FAILED} failed"
}

#-------------------------------------------------------------------------------
# PHASE 6: Third-Party Applications (via Graph API)
#-------------------------------------------------------------------------------

run_thirdparty_queries() {
    log_section "PHASE 6: Third-Party Applications"

    local tp_dir="${OUTPUT_DIR}/06-third-party"
    mkdir -p "$tp_dir"
    local saved_output_dir="$OUTPUT_DIR"
    OUTPUT_DIR="$tp_dir"

    QUERY_TOTAL=5
    QUERY_CURRENT=0
    QUERY_SUCCESS=0
    QUERY_FAILED=0

    #---------------------------------------------------------------------------
    # Enterprise Applications
    #---------------------------------------------------------------------------
    run_graph_query "Enterprise Applications" "enterprise-apps.json" \
        "/servicePrincipals?\$filter=tags/any(t: t eq 'WindowsAzureActiveDirectoryIntegratedApp')&\$select=id,displayName,appId,servicePrincipalType,accountEnabled,signInAudience&\$top=999"

    run_graph_query "All Service Principals" "service-principals.json" \
        "/servicePrincipals?\$select=id,displayName,appId,servicePrincipalType,accountEnabled&\$top=999"

    run_graph_query "OAuth2 Permission Grants" "oauth2-grants.json" \
        "/oauth2PermissionGrants"

    #---------------------------------------------------------------------------
    # Acturis Detection
    #---------------------------------------------------------------------------
    log_info "Searching for Acturis application..."
    local acturis_result
    acturis_result=$(az rest --method GET \
        --url "${GRAPH_API_BASE}/servicePrincipals?\$filter=contains(displayName,'Acturis') or contains(displayName,'acturis')&\$select=id,displayName,appId" 2>/dev/null) || acturis_result='{"value":[]}'

    local acturis_count
    acturis_count=$(echo "$acturis_result" | jq '.value | length' 2>/dev/null) || acturis_count=0

    if [[ $acturis_count -gt 0 ]]; then
        log_success "Found Acturis application(s): ${acturis_count}"
        echo "$acturis_result" | jq '.value' > "${tp_dir}/acturis-app.json"

        # Get app role assignments for Acturis
        local acturis_id
        acturis_id=$(echo "$acturis_result" | jq -r '.value[0].id // empty' 2>/dev/null)
        if [[ -n "$acturis_id" ]]; then
            az rest --method GET \
                --url "${GRAPH_API_BASE}/servicePrincipals/${acturis_id}/appRoleAssignments" \
                --output json > "${tp_dir}/acturis-permissions.json" 2>/dev/null || echo "[]" > "${tp_dir}/acturis-permissions.json"
        fi
    else
        log_warn "Acturis application not found in Entra ID."
        log_warn "Check for direct API integration or custom SSO."
        echo "[]" > "${tp_dir}/acturis-app.json"
    fi
    QUERY_SUCCESS=$((QUERY_SUCCESS + 1))
    QUERY_CURRENT=$((QUERY_CURRENT + 1))

    #---------------------------------------------------------------------------
    # High-Risk Apps (with application permissions)
    #---------------------------------------------------------------------------
    run_graph_query "App Role Assignments (sample)" "app-role-assignments.json" \
        "/servicePrincipals?\$filter=servicePrincipalType eq 'Application'&\$select=id,displayName,appId&\$top=50"

    OUTPUT_DIR="$saved_output_dir"
    log_success "Third-party queries complete: ${QUERY_SUCCESS} succeeded, ${QUERY_FAILED} failed"
}

#-------------------------------------------------------------------------------
# PHASE 7: Linked Services / Connections
#-------------------------------------------------------------------------------

run_linked_services_queries() {
    log_section "PHASE 7: Data Connections & Linked Services"

    local ls_dir="${OUTPUT_DIR}/07-linked-services"
    mkdir -p "$ls_dir"

    log_info "Checking for Synapse linked services..."

    # Get list of Synapse workspaces
    local synapse_workspaces
    synapse_workspaces=$(az synapse workspace list --output json 2>/dev/null) || synapse_workspaces="[]"

    local ws_count
    ws_count=$(echo "$synapse_workspaces" | jq 'length' 2>/dev/null) || ws_count=0

    if [[ $ws_count -gt 0 ]]; then
        log_info "Found ${ws_count} Synapse workspace(s). Fetching linked services..."

        echo "[" > "${ls_dir}/synapse-linked-services.json"
        local first=true

        while IFS= read -r ws_name; do
            if [[ -z "$ws_name" ]]; then continue; fi

            local linked_services
            linked_services=$(az synapse linked-service list --workspace-name "$ws_name" --output json 2>/dev/null) || linked_services="[]"

            local ls_count
            ls_count=$(echo "$linked_services" | jq 'length' 2>/dev/null) || ls_count=0

            log_info "  ${ws_name}: ${ls_count} linked service(s)"

            if [[ "$first" == "true" ]]; then
                first=false
            else
                echo "," >> "${ls_dir}/synapse-linked-services.json"
            fi

            echo "{\"workspace\": \"${ws_name}\", \"linkedServices\": ${linked_services}}" >> "${ls_dir}/synapse-linked-services.json"

        done < <(echo "$synapse_workspaces" | jq -r '.[].name' 2>/dev/null)

        echo "]" >> "${ls_dir}/synapse-linked-services.json"
    else
        log_warn "No Synapse workspaces found."
        echo "[]" > "${ls_dir}/synapse-linked-services.json"
    fi

    # Data Factory linked services
    log_info "Checking for Data Factory linked services..."
    local adf_factories
    adf_factories=$(az datafactory list --output json 2>/dev/null) || adf_factories="[]"

    local adf_count
    adf_count=$(echo "$adf_factories" | jq 'length' 2>/dev/null) || adf_count=0

    if [[ $adf_count -gt 0 ]]; then
        log_info "Found ${adf_count} Data Factory instance(s). Fetching linked services..."

        echo "[" > "${ls_dir}/adf-linked-services.json"
        local first=true

        while IFS= read -r line; do
            local adf_name rg_name
            adf_name=$(echo "$line" | jq -r '.name' 2>/dev/null)
            rg_name=$(echo "$line" | jq -r '.resourceGroup' 2>/dev/null)

            if [[ -z "$adf_name" ]] || [[ -z "$rg_name" ]]; then continue; fi

            local adf_ls
            adf_ls=$(az datafactory linked-service list \
                --factory-name "$adf_name" \
                --resource-group "$rg_name" \
                --output json 2>/dev/null) || adf_ls="[]"

            local ls_count
            ls_count=$(echo "$adf_ls" | jq 'length' 2>/dev/null) || ls_count=0

            log_info "  ${adf_name}: ${ls_count} linked service(s)"

            if [[ "$first" == "true" ]]; then
                first=false
            else
                echo "," >> "${ls_dir}/adf-linked-services.json"
            fi

            echo "{\"factory\": \"${adf_name}\", \"linkedServices\": ${adf_ls}}" >> "${ls_dir}/adf-linked-services.json"

        done < <(echo "$adf_factories" | jq -c '.[]' 2>/dev/null)

        echo "]" >> "${ls_dir}/adf-linked-services.json"
    else
        log_warn "No Data Factory instances found."
        echo "[]" > "${ls_dir}/adf-linked-services.json"
    fi

    log_success "Linked services queries complete."
}

#-------------------------------------------------------------------------------
# PHASE 8: Generate Summary Report
#-------------------------------------------------------------------------------

generate_report() {
    log_section "PHASE 8: Generate Summary Report"

    local report_file="${OUTPUT_DIR}/PP-Data-Audit-Report.md"
    local timestamp
    timestamp=$(date -u +"%Y-%m-%d %H:%M:%S UTC")

    # Gather stats
    local synapse_count="N/A"
    local sql_server_count="N/A"
    local sql_db_count="N/A"
    local storage_count="N/A"
    local datalake_count="N/A"
    local enterprise_app_count="N/A"
    local acturis_found="No"

    if [[ -f "${OUTPUT_DIR}/04-synapse-data/synapse-workspaces.json" ]]; then
        synapse_count=$(jq 'length' "${OUTPUT_DIR}/04-synapse-data/synapse-workspaces.json" 2>/dev/null) || synapse_count="N/A"
    fi
    if [[ -f "${OUTPUT_DIR}/04-synapse-data/sql-servers.json" ]]; then
        sql_server_count=$(jq 'length' "${OUTPUT_DIR}/04-synapse-data/sql-servers.json" 2>/dev/null) || sql_server_count="N/A"
    fi
    if [[ -f "${OUTPUT_DIR}/04-synapse-data/sql-databases.json" ]]; then
        sql_db_count=$(jq 'length' "${OUTPUT_DIR}/04-synapse-data/sql-databases.json" 2>/dev/null) || sql_db_count="N/A"
    fi
    if [[ -f "${OUTPUT_DIR}/05-storage/storage-accounts.json" ]]; then
        storage_count=$(jq 'length' "${OUTPUT_DIR}/05-storage/storage-accounts.json" 2>/dev/null) || storage_count="N/A"
    fi
    if [[ -f "${OUTPUT_DIR}/05-storage/storage-datalake.json" ]]; then
        datalake_count=$(jq 'length' "${OUTPUT_DIR}/05-storage/storage-datalake.json" 2>/dev/null) || datalake_count="N/A"
    fi
    if [[ -f "${OUTPUT_DIR}/06-third-party/enterprise-apps.json" ]]; then
        enterprise_app_count=$(jq 'length' "${OUTPUT_DIR}/06-third-party/enterprise-apps.json" 2>/dev/null) || enterprise_app_count="N/A"
    fi
    if [[ -f "${OUTPUT_DIR}/06-third-party/acturis-app.json" ]]; then
        local acturis_count
        acturis_count=$(jq 'length' "${OUTPUT_DIR}/06-third-party/acturis-app.json" 2>/dev/null) || acturis_count=0
        if [[ $acturis_count -gt 0 ]]; then
            acturis_found="Yes (${acturis_count} app(s))"
        fi
    fi

    cat > "$report_file" << REPORTEOF
# Power Platform & Data Layer Audit Report

**Generated:** ${timestamp}
**Tool:** ${SCRIPT_NAME} v${SCRIPT_VERSION}
**Method:** Pure Azure CLI (Resource Graph + Graph API)

---

## Executive Summary

This report contains the results of an automated Power Platform and Data Layer
audit. Azure data resources were queried via Resource Graph. Third-party apps
were queried via Microsoft Graph API.

### Key Metrics

| Metric | Value |
|--------|-------|
| Synapse Workspaces | ${synapse_count} |
| SQL Servers | ${sql_server_count} |
| SQL Databases | ${sql_db_count} |
| Storage Accounts | ${storage_count} |
| Data Lake (HNS) Enabled | ${datalake_count} |
| Enterprise Applications | ${enterprise_app_count} |
| Acturis Integration Found | ${acturis_found} |

---

## Coverage Summary

| Area | Coverage | Notes |
|------|----------|-------|
| Synapse / Data Warehouse | ✅ Full | Workspaces, SQL pools, Spark pools |
| Azure SQL | ✅ Full | Servers, databases, firewall, elastic pools |
| Storage / Data Lake | ✅ Full | Accounts, private endpoints, public access |
| Third-Party Apps | ✅ Full | Enterprise apps, permissions, OAuth grants |
| Linked Services | ✅ Full | Synapse + Data Factory linked services |
| Power Platform | ⚠️ Limited | Environments, apps, flows require PowerShell |
| Power BI | ⚠️ Limited | Workspaces, datasets require PowerShell |
| Fabric | ⚠️ Partial | Requires Fabric Admin access |

---

## Data Security Highlights

### Storage Accounts with Public Access

Check \`05-storage/storage-public-access.json\` for storage accounts with:
- Network default action: Allow (not Deny)
- Public blob access enabled

### SQL Firewall Rules

Check \`04-synapse-data/sql-firewall-rules.json\` for:
- Rules allowing 0.0.0.0-255.255.255.255 (all IPs)
- Any "Allow Azure services" rules

### Acturis Integration

${acturis_found}

If Acturis was found, check:
- \`06-third-party/acturis-app.json\` - Application details
- \`06-third-party/acturis-permissions.json\` - API permissions

If not found, investigate:
- Direct API integration (non-Entra ID SSO)
- Custom connector in Power Platform
- Legacy credential-based connection

---

## Output Files

\`\`\`
${OUTPUT_DIR}/
├── 01-power-platform/
│   └── POWER-PLATFORM-REQUIRES-POWERSHELL.md
├── 02-power-bi/
│   └── POWER-BI-REQUIRES-POWERSHELL.md
├── 03-fabric/
│   ├── fabric-capacities.json
│   ├── fabric-workspaces.json
│   └── fabric-domains.json
├── 04-synapse-data/
│   ├── synapse-workspaces.json
│   ├── synapse-sql-pools.json
│   ├── synapse-spark-pools.json
│   ├── sql-servers.json
│   ├── sql-databases.json
│   ├── sql-firewall-rules.json
│   ├── sql-elastic-pools.json
│   ├── data-factory.json
│   ├── event-hubs.json
│   ├── stream-analytics.json
│   ├── kusto-clusters.json
│   └── purview.json
├── 05-storage/
│   ├── storage-accounts.json
│   ├── storage-datalake.json
│   ├── storage-private-endpoints.json
│   └── storage-public-access.json
├── 06-third-party/
│   ├── enterprise-apps.json
│   ├── service-principals.json
│   ├── oauth2-grants.json
│   ├── acturis-app.json
│   ├── acturis-permissions.json
│   └── app-role-assignments.json
├── 07-linked-services/
│   ├── synapse-linked-services.json
│   └── adf-linked-services.json
└── PP-Data-Audit-Report.md
\`\`\`

---

## Next Steps

1. **Run PowerShell collection** for Power Platform and Power BI
2. **Review SQL firewall rules** for overly permissive access
3. **Check storage public access** for data exposure risk
4. **Analyze Acturis integration** method and permissions
5. **Review linked services** for credential management
6. **Map to MCSB controls** for compliance assessment

---

*Generated by ${SCRIPT_NAME} v${SCRIPT_VERSION} -- Pure Azure CLI.*
REPORTEOF

    log_success "Report generated: ${report_file}"
}

#===============================================================================
# MAIN EXECUTION
#===============================================================================

print_banner
check_prerequisites

# Create output directory
mkdir -p "${OUTPUT_DIR}"
log_info "Output directory: ${OUTPUT_DIR}"

# Record start time
START_TIME=$(date +%s)

# Run all phases
run_power_platform_queries
run_power_bi_queries
run_fabric_queries
run_synapse_queries
run_storage_queries
run_thirdparty_queries
run_linked_services_queries
generate_report

# Calculate elapsed time
END_TIME=$(date +%s)
ELAPSED=$((END_TIME - START_TIME))
ELAPSED_MIN=$((ELAPSED / 60))
ELAPSED_SEC=$((ELAPSED % 60))

# Final summary
echo ""
echo -e "${BOLD}================================================================${NC}"
echo -e "${GREEN}${BOLD}  PP & Data Layer Audit Complete!${NC}"
echo -e "${BOLD}================================================================${NC}"
echo ""
echo "  Duration:    ${ELAPSED_MIN}m ${ELAPSED_SEC}s"
echo "  Output:      ${OUTPUT_DIR}"
echo ""
echo "  Key files:"
echo "    ${OUTPUT_DIR}/PP-Data-Audit-Report.md"
echo "    ${OUTPUT_DIR}/04-synapse-data/"
echo "    ${OUTPUT_DIR}/05-storage/"
echo "    ${OUTPUT_DIR}/06-third-party/"
echo ""
echo "  For full Power Platform / Power BI coverage,"
echo "  run the PowerShell commands in the *-REQUIRES-POWERSHELL.md files."
echo ""
echo "  No PowerShell. Pure Azure CLI + Graph API."
echo ""
