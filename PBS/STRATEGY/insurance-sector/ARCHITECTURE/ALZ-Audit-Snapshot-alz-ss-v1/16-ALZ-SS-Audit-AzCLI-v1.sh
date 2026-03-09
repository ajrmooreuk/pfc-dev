#!/bin/bash
#===============================================================================
# ALZ Snapshot Audit - Pure Azure CLI Version (v1)
#===============================================================================
#
# Replaces Python-dependent scripts (11, 14, 15) with a single script that
# uses ONLY az CLI commands. Works in Azure Cloud Shell without installing
# anything — no Python, no pip, no extra dependencies.
#
# Dependencies (all pre-installed in Azure Cloud Shell):
#   - az CLI (with resource-graph extension)
#   - jq
#   - bash, date, mkdir
#
# Usage:
#   ./16-ALZ-SS-Audit-AzCLI-v1.sh
#   ./16-ALZ-SS-Audit-AzCLI-v1.sh --output /path/to/exports
#   ./16-ALZ-SS-Audit-AzCLI-v1.sh --skip-tenant-discovery
#   ./16-ALZ-SS-Audit-AzCLI-v1.sh --skip-resource-queries
#   ./16-ALZ-SS-Audit-AzCLI-v1.sh -h
#
# Prerequisites:
#   - Azure CLI logged in (az login) or running in Cloud Shell
#   - Reader access to target subscriptions
#   - Management Group Reader (optional, for MG hierarchy)
#
#===============================================================================

set -euo pipefail

#-------------------------------------------------------------------------------
# Configuration
#-------------------------------------------------------------------------------

SCRIPT_VERSION="1.0.0"
SCRIPT_NAME="16-ALZ-SS-Audit-AzCLI-v1"
OUTPUT_DIR="./alz-audit-$(date +%Y%m%d-%H%M%S)"
SKIP_TENANT_DISCOVERY=false
SKIP_RESOURCE_QUERIES=false
PAGE_SIZE=1000

# Counters
QUERY_TOTAL=0
QUERY_SUCCESS=0
QUERY_FAILED=0
QUERY_CURRENT=0
TOTAL_ROWS=0

# Colors (safe for Cloud Shell)
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
        --skip-tenant-discovery)
            SKIP_TENANT_DISCOVERY=true
            shift
            ;;
        --skip-resource-queries)
            SKIP_RESOURCE_QUERIES=true
            shift
            ;;
        -h|--help)
            cat << 'HELPEOF'
ALZ Snapshot Audit - Pure Azure CLI Version (v1)
================================================

Single-script Azure estate audit using ONLY az CLI commands.
No Python. No pip. Works in Azure Cloud Shell out of the box.

Usage:
  ./16-ALZ-SS-Audit-AzCLI-v1.sh [OPTIONS]

Options:
  -o, --output DIR             Output directory (default: ./alz-audit-TIMESTAMP)
  --skip-tenant-discovery      Skip tenant & management group discovery
  --skip-resource-queries      Skip Resource Graph KQL queries
  -h, --help                   Show this help message

Examples:
  # Full audit with default output
  ./16-ALZ-SS-Audit-AzCLI-v1.sh

  # Custom output directory
  ./16-ALZ-SS-Audit-AzCLI-v1.sh --output ./my-audit-results

  # Skip tenant discovery (faster, if you only need resource data)
  ./16-ALZ-SS-Audit-AzCLI-v1.sh --skip-tenant-discovery

  # Only run tenant discovery (skip resource queries)
  ./16-ALZ-SS-Audit-AzCLI-v1.sh --skip-resource-queries

Prerequisites:
  1. Azure CLI: az login (or run in Cloud Shell)
  2. Reader access to target subscriptions
  3. Management Group Reader (optional, for MG hierarchy)

Output:
  JSON files organized by category, plus a markdown summary report.

HELPEOF
            exit 0
            ;;
        *)
            echo -e "${RED}[ERROR]${NC} Unknown option: $1"
            echo "Use -h or --help for usage information."
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

    # Check Azure CLI
    if ! command -v az &> /dev/null; then
        log_error "Azure CLI (az) not found."
        log_error "Install from: https://docs.microsoft.com/cli/azure/install-azure-cli"
        log_error "Or use Azure Cloud Shell: https://shell.azure.com"
        exit 1
    fi

    # Check az login
    if ! az account show &> /dev/null 2>&1; then
        log_error "Not logged in to Azure. Run: az login"
        exit 1
    fi

    # Check jq
    if ! command -v jq &> /dev/null; then
        log_error "jq not found. Install with: apt-get install jq / brew install jq"
        log_error "jq is pre-installed in Azure Cloud Shell."
        exit 1
    fi

    # Check resource-graph extension
    if ! az extension show --name resource-graph &> /dev/null 2>&1; then
        log_warn "resource-graph extension not found. Installing..."
        az extension add --name resource-graph --yes 2>/dev/null || {
            log_error "Failed to install resource-graph extension."
            exit 1
        }
    fi

    log_success "All prerequisites satisfied."
}

#-------------------------------------------------------------------------------
# Banner
#-------------------------------------------------------------------------------

print_banner() {
    echo ""
    echo -e "${BOLD}================================================================${NC}"
    echo -e "${BOLD}  ALZ Snapshot Audit - Pure Azure CLI Version${NC}"
    echo -e "${BOLD}  Version: ${SCRIPT_VERSION}${NC}"
    echo -e "${BOLD}  $(date '+%Y-%m-%d %H:%M:%S %Z')${NC}"
    echo -e "${BOLD}================================================================${NC}"
    echo ""
}

#-------------------------------------------------------------------------------
# Core Query Function
#
# Runs a single Resource Graph KQL query with pagination support.
# Usage: run_query "QUERY_NAME" "output-file.json" "KQL_QUERY_STRING"
#
# - Handles the 1000-row default limit by paginating with --skip-token
# - Saves results as a JSON array to the output file
# - Tracks success/failure counters
# - Gracefully handles errors (does not abort the script)
#-------------------------------------------------------------------------------

run_query() {
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

        # Build the az graph query command
        local cmd="az graph query -q \"${kql_query}\" --first ${PAGE_SIZE} --output json"
        if [[ -n "$skip_token" ]]; then
            cmd="$cmd --skip-token \"${skip_token}\""
        fi

        # Execute
        local response
        response=$(eval "$cmd" 2>/dev/null) || {
            echo -e " ${RED}FAILED${NC}"
            log_warn "  Query '${query_name}' failed. Saving empty result."
            echo "[]" > "$full_path"
            QUERY_FAILED=$((QUERY_FAILED + 1))
            return 0
        }

        # Extract data array and skip_token
        local page_data
        page_data=$(echo "$response" | jq -r '.data // []' 2>/dev/null) || page_data="[]"

        local page_count
        page_count=$(echo "$page_data" | jq 'length' 2>/dev/null) || page_count=0

        # Merge page results
        all_results=$(echo "$all_results" "$page_data" | jq -s '.[0] + .[1]' 2>/dev/null) || {
            echo -e " ${RED}MERGE FAILED${NC}"
            QUERY_FAILED=$((QUERY_FAILED + 1))
            echo "[]" > "$full_path"
            return 0
        }

        total_count=$((total_count + page_count))

        # Check for next page
        skip_token=$(echo "$response" | jq -r '.skip_token // empty' 2>/dev/null) || skip_token=""

        if [[ -z "$skip_token" ]] || [[ "$page_count" -lt "$PAGE_SIZE" ]]; then
            break
        fi

        # Safety: max 50 pages (50,000 rows)
        if [[ $page -ge 50 ]]; then
            log_warn "  Pagination limit reached for '${query_name}' (${total_count} rows)."
            break
        fi
    done

    # Save results
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
# PHASE 1: Tenant & Management Group Discovery (replaces script 14)
#-------------------------------------------------------------------------------

run_tenant_discovery() {
    log_section "PHASE 1: Tenant & Management Group Discovery"

    local td_dir="${OUTPUT_DIR}/01-tenant-discovery"
    mkdir -p "$td_dir"

    # 1a. Current account context
    log_info "Gathering current account context..."
    az account show --output json > "${td_dir}/current-context.json" 2>/dev/null || true

    local tenant_id
    tenant_id=$(az account show --query tenantId -o tsv 2>/dev/null) || tenant_id="unknown"
    local user_name
    user_name=$(az account show --query user.name -o tsv 2>/dev/null) || user_name="unknown"
    local current_sub
    current_sub=$(az account show --query name -o tsv 2>/dev/null) || current_sub="unknown"

    log_info "Tenant ID:    ${tenant_id}"
    log_info "User:         ${user_name}"
    log_info "Subscription: ${current_sub}"

    # 1b. List all accessible tenants
    log_info "Discovering tenants..."
    az account tenant list --output json > "${td_dir}/tenants.json" 2>/dev/null || {
        log_warn "Could not list tenants (may require additional permissions)."
        echo "[]" > "${td_dir}/tenants.json"
    }

    local tenant_count
    tenant_count=$(jq 'length' "${td_dir}/tenants.json" 2>/dev/null) || tenant_count=0
    log_info "Discovered ${tenant_count} tenant(s)."

    # 1c. List all accessible subscriptions
    log_info "Discovering subscriptions..."
    az account list --output json > "${td_dir}/subscriptions-full.json" 2>/dev/null || {
        log_warn "Could not list subscriptions."
        echo "[]" > "${td_dir}/subscriptions-full.json"
    }

    local sub_total
    sub_total=$(jq 'length' "${td_dir}/subscriptions-full.json" 2>/dev/null) || sub_total=0
    local sub_enabled
    sub_enabled=$(jq '[.[] | select(.state == "Enabled")] | length' "${td_dir}/subscriptions-full.json" 2>/dev/null) || sub_enabled=0

    log_info "Subscriptions: ${sub_enabled} enabled / ${sub_total} total"

    # 1d. Subscription summary (name, id, state)
    jq '[.[] | {name, id, state, tenantId, isDefault}]' \
        "${td_dir}/subscriptions-full.json" > "${td_dir}/subscriptions-summary.json" 2>/dev/null || true

    # 1e. Management groups via az CLI
    log_info "Discovering management groups..."
    az account management-group list --output json > "${td_dir}/management-groups.json" 2>/dev/null || {
        log_warn "Could not list management groups (requires Management Group Reader role)."
        echo "[]" > "${td_dir}/management-groups.json"
    }

    local mg_count
    mg_count=$(jq 'length' "${td_dir}/management-groups.json" 2>/dev/null) || mg_count=0
    log_info "Management groups: ${mg_count}"

    # 1f. Management group hierarchy (try to get the tree from root)
    if [[ $mg_count -gt 0 ]]; then
        log_info "Fetching management group hierarchy..."
        local root_mg
        root_mg=$(jq -r '.[0].name // empty' "${td_dir}/management-groups.json" 2>/dev/null)
        if [[ -n "$root_mg" ]]; then
            az account management-group show \
                --name "$root_mg" \
                --expand --recurse \
                --output json > "${td_dir}/mg-hierarchy.json" 2>/dev/null || {
                log_warn "Could not fetch MG hierarchy detail."
                echo "{}" > "${td_dir}/mg-hierarchy.json"
            }
        fi
    fi

    # 1g. Resource counts per subscription
    log_info "Counting resources per subscription..."
    local counts_file="${td_dir}/subscription-resource-counts.json"
    echo "[" > "$counts_file"
    local first=true
    while IFS= read -r sub_id; do
        if [[ -z "$sub_id" ]]; then continue; fi
        local sub_name
        sub_name=$(jq -r --arg id "$sub_id" '.[] | select(.id == $id) | .name // "unknown"' \
            "${td_dir}/subscriptions-full.json" 2>/dev/null) || sub_name="unknown"

        local count
        count=$(az graph query \
            -q "resources | where subscriptionId == '${sub_id}' | summarize count()" \
            --subscriptions "$sub_id" \
            --output json 2>/dev/null | jq -r '.data[0].count_ // 0' 2>/dev/null) || count=0

        if [[ "$first" == "true" ]]; then
            first=false
        else
            echo "," >> "$counts_file"
        fi
        echo "  {\"subscriptionId\": \"${sub_id}\", \"name\": \"${sub_name}\", \"resourceCount\": ${count}}" >> "$counts_file"
        log_info "  ${sub_name}: ${count} resources"
    done < <(jq -r '.[] | select(.state == "Enabled") | .id' "${td_dir}/subscriptions-full.json" 2>/dev/null)
    echo "]" >> "$counts_file"

    # 1h. Subscription-to-MG mapping via Resource Graph
    log_info "Mapping subscriptions to management groups..."
    az graph query -q "
        resourcecontainers
        | where type == 'microsoft.resources/subscriptions'
        | extend mgParent = properties.managementGroupAncestorsChain
        | project subscriptionId, name, mgParent
    " --first 1000 --output json 2>/dev/null | jq '.data // []' > "${td_dir}/subscription-mg-mapping.json" || {
        log_warn "Could not map subscriptions to management groups."
        echo "[]" > "${td_dir}/subscription-mg-mapping.json"
    }

    # 1i. Generate tenant architecture summary
    log_info "Generating tenant discovery summary..."
    local is_multi_tenant="false"
    if [[ $tenant_count -gt 1 ]]; then
        is_multi_tenant="true"
    fi

    cat > "${td_dir}/tenant-discovery.json" << TDJSON
{
  "metadata": {
    "discoveryTimestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "discoveryTool": "${SCRIPT_NAME}",
    "version": "${SCRIPT_VERSION}",
    "method": "az-cli-only"
  },
  "summary": {
    "isMultiTenant": ${is_multi_tenant},
    "tenantCount": ${tenant_count},
    "managementGroupCount": ${mg_count},
    "subscriptionCount": ${sub_total},
    "enabledSubscriptionCount": ${sub_enabled},
    "currentTenantId": "${tenant_id}",
    "currentUser": "${user_name}"
  }
}
TDJSON

    log_success "Tenant discovery complete."
    echo "  Tenants:            ${tenant_count}"
    echo "  Management Groups:  ${mg_count}"
    echo "  Subscriptions:      ${sub_enabled} enabled / ${sub_total} total"
}

#-------------------------------------------------------------------------------
# PHASE 2: Resource Graph Queries (replaces script 11)
#
# All 45 KQL queries organized by category.
# Each query runs via: az graph query -q "..." --first 1000 --output json
#-------------------------------------------------------------------------------

run_resource_queries() {
    log_section "PHASE 2: Resource Graph Queries"

    local rg_dir="${OUTPUT_DIR}/02-resource-inventory"
    mkdir -p "$rg_dir"

    # Save original OUTPUT_DIR and override for run_query
    local saved_output_dir="$OUTPUT_DIR"
    OUTPUT_DIR="$rg_dir"

    # Count total queries (update this if you add/remove queries)
    QUERY_TOTAL=45
    QUERY_CURRENT=0
    QUERY_SUCCESS=0
    QUERY_FAILED=0
    TOTAL_ROWS=0

    #---------------------------------------------------------------------------
    # CATEGORY 1: Summary Queries
    #---------------------------------------------------------------------------
    log_section "Summary Queries"

    run_query "Estate Summary" "summary-metrics.json" \
        "resources | summarize TotalResources = count(), ResourceTypes = dcount(type), Subscriptions = dcount(subscriptionId), ResourceGroups = dcount(resourceGroup), Locations = dcount(location)"

    run_query "Tagging Compliance" "tagging-compliance.json" \
        "resources | extend tagCount = array_length(bag_keys(tags)) | summarize Total = count(), Tagged = countif(tagCount > 0), Untagged = countif(tagCount == 0) | extend TaggingCompliance = round(100.0 * Tagged / Total, 1)"

    run_query "Resource Type Distribution" "resource-types.json" \
        "resources | summarize Count = count() by type | order by Count desc"

    run_query "Region Distribution" "region-distribution.json" \
        "resources | summarize Count = count() by location | order by Count desc"

    #---------------------------------------------------------------------------
    # CATEGORY 2: Inventory Queries
    #---------------------------------------------------------------------------
    log_section "Inventory Queries"

    run_query "Full Inventory" "inventory-full.json" \
        "resources | extend tagCount = array_length(bag_keys(tags)) | project Name = name, Type = type, Location = location, ResourceGroup = resourceGroup, SubscriptionId = subscriptionId, SKU = tostring(sku.name), Kind = kind, TagCount = tagCount, Tags = tostring(tags), ResourceId = id | order by Type asc, Name asc"

    run_query "Resources by Type" "inventory-by-type.json" \
        "resources | summarize Count = count() by type | order by Count desc | project ResourceType = type, Count"

    run_query "Untagged Resources" "untagged-resources.json" \
        "resources | extend tagCount = array_length(bag_keys(tags)) | where tagCount == 0 | project Name = name, Type = type, ResourceGroup = resourceGroup, Location = location, SubscriptionId = subscriptionId | order by Type asc"

    run_query "Tag Key Distribution" "tag-keys.json" \
        "resources | mv-expand bagexpansion=array tags | extend tagKey = tostring(tags[0]) | summarize Count = count() by tagKey | order by Count desc"

    #---------------------------------------------------------------------------
    # CATEGORY 3: Governance Queries
    #---------------------------------------------------------------------------
    log_section "Governance Queries"

    run_query "Management Groups" "management-groups.json" \
        "resourcecontainers | where type == 'microsoft.management/managementgroups' | project Name = name, DisplayName = properties.displayName, TenantId = properties.tenantId, ParentId = tostring(properties.details.parent.id) | order by Name asc"

    run_query "Subscriptions" "subscriptions.json" \
        "resourcecontainers | where type == 'microsoft.resources/subscriptions' | project SubscriptionName = name, SubscriptionId = subscriptionId, State = properties.state, Tags = tostring(tags) | order by SubscriptionName asc"

    run_query "Policy Assignments" "policy-assignments.json" \
        "policyresources | where type == 'microsoft.authorization/policyassignments' | project AssignmentName = name, DisplayName = properties.displayName, Scope = properties.scope, EnforcementMode = properties.enforcementMode, PolicyDefinitionId = properties.policyDefinitionId | order by AssignmentName asc"

    run_query "Policy Compliance" "policy-compliance.json" \
        "policyresources | where type == 'microsoft.policyinsights/policystates' | extend complianceState = tostring(properties.complianceState) | summarize Compliant = countif(complianceState == 'Compliant'), NonCompliant = countif(complianceState == 'NonCompliant') by policyAssignmentId = tostring(properties.policyAssignmentId) | extend ComplianceRate = round(100.0 * Compliant / (Compliant + NonCompliant), 1)"

    run_query "Policy Enforcement Summary" "policy-enforcement.json" \
        "policyresources | where type == 'microsoft.authorization/policyassignments' | extend enforcementMode = tostring(properties.enforcementMode) | summarize Count = count() by enforcementMode"

    #---------------------------------------------------------------------------
    # CATEGORY 4: Security Queries
    #---------------------------------------------------------------------------
    log_section "Security Queries"

    run_query "Key Vaults" "keyvaults.json" \
        "resources | where type == 'microsoft.keyvault/vaults' | extend softDelete = properties.enableSoftDelete, purgeProtection = properties.enablePurgeProtection, rbacAuth = properties.enableRbacAuthorization, publicNetwork = properties.publicNetworkAccess | project Name = name, ResourceGroup = resourceGroup, Location = location, SoftDelete = softDelete, PurgeProtection = purgeProtection, RBACAuth = rbacAuth, PublicAccess = publicNetwork"

    run_query "NSGs" "nsgs.json" \
        "resources | where type == 'microsoft.network/networksecuritygroups' | extend ruleCount = array_length(properties.securityRules) | project Name = name, ResourceGroup = resourceGroup, Location = location, RuleCount = ruleCount, ResourceId = id"

    run_query "NSG Rules Detail" "nsg-rules.json" \
        "resources | where type == 'microsoft.network/networksecuritygroups' | mv-expand rule = properties.securityRules | extend ruleName = tostring(rule.name), direction = tostring(rule.properties.direction), access = tostring(rule.properties.access), priority = toint(rule.properties.priority), sourceAddress = tostring(rule.properties.sourceAddressPrefix), destAddress = tostring(rule.properties.destinationAddressPrefix), destPort = tostring(rule.properties.destinationPortRange) | project NSGName = name, RuleName = ruleName, Direction = direction, Access = access, Priority = priority, SourceAddress = sourceAddress, DestAddress = destAddress, DestPort = destPort"

    run_query "Storage Account Security" "storage-security.json" \
        "resources | where type =~ 'microsoft.storage/storageaccounts' | extend httpsOnly = properties.supportsHttpsTrafficOnly, minTLS = properties.minimumTlsVersion, publicAccess = properties.allowBlobPublicAccess, networkDefaultAction = properties.networkAcls.defaultAction | project Name = name, ResourceGroup = resourceGroup, HTTPSOnly = httpsOnly, MinTLS = minTLS, PublicBlobAccess = publicAccess, NetworkDefault = networkDefaultAction"

    run_query "Public IPs" "public-ips.json" \
        "resources | where type == 'microsoft.network/publicipaddresses' | project Name = name, ResourceGroup = resourceGroup, Location = location, IPAddress = properties.ipAddress, AllocationMethod = properties.publicIPAllocationMethod, SKU = tostring(sku.name)"

    run_query "SQL Server Security" "sql-security.json" \
        "resources | where type == 'microsoft.sql/servers' | extend adminLogin = properties.administratorLogin, publicNetwork = properties.publicNetworkAccess, minTLS = properties.minimalTlsVersion | project Name = name, ResourceGroup = resourceGroup, Location = location, AdminLogin = adminLogin, PublicNetwork = publicNetwork, MinTLS = minTLS"

    #---------------------------------------------------------------------------
    # CATEGORY 5: Network Queries
    #---------------------------------------------------------------------------
    log_section "Network Queries"

    run_query "Virtual Networks" "vnets.json" \
        "resources | where type == 'microsoft.network/virtualnetworks' | extend addressSpace = tostring(properties.addressSpace.addressPrefixes), subnetCount = array_length(properties.subnets), peeringCount = array_length(properties.virtualNetworkPeerings), dnsServers = tostring(properties.dhcpOptions.dnsServers) | project Name = name, ResourceGroup = resourceGroup, Location = location, AddressSpace = addressSpace, SubnetCount = subnetCount, PeeringCount = peeringCount, DNSServers = dnsServers"

    run_query "Subnets" "subnets.json" \
        "resources | where type == 'microsoft.network/virtualnetworks' | mv-expand subnet = properties.subnets | extend subnetName = tostring(subnet.name), addressPrefix = tostring(subnet.properties.addressPrefix), nsg = tostring(subnet.properties.networkSecurityGroup.id), routeTable = tostring(subnet.properties.routeTable.id) | project VNetName = name, SubnetName = subnetName, AddressPrefix = addressPrefix, NSG = iif(isempty(nsg), 'None', split(nsg, '/')[-1]), RouteTable = iif(isempty(routeTable), 'None', split(routeTable, '/')[-1])"

    run_query "Subnets without NSG" "subnets-no-nsg.json" \
        "resources | where type == 'microsoft.network/virtualnetworks' | mv-expand subnet = properties.subnets | extend subnetName = tostring(subnet.name), nsgAssigned = isnotempty(subnet.properties.networkSecurityGroup.id) | where nsgAssigned == false | project VNetName = name, SubnetName = subnetName, Location = location"

    run_query "VNet Peerings" "peerings.json" \
        "resources | where type == 'microsoft.network/virtualnetworks' | mv-expand peering = properties.virtualNetworkPeerings | extend peeringName = tostring(peering.name), peeringState = tostring(peering.properties.peeringState), remoteVNet = tostring(peering.properties.remoteVirtualNetwork.id), allowForwarding = peering.properties.allowForwardedTraffic, allowGateway = peering.properties.allowGatewayTransit | project VNetName = name, PeeringName = peeringName, State = peeringState, RemoteVNet = split(remoteVNet, '/')[-1], AllowForwarding = allowForwarding, AllowGateway = allowGateway"

    run_query "Connectivity Resources" "network-connectivity.json" \
        "resources | where type in~ ('microsoft.network/publicipaddresses','microsoft.network/loadbalancers','microsoft.network/applicationgateways','microsoft.network/azurefirewalls','microsoft.network/bastionhosts','microsoft.network/virtualnetworkgateways','microsoft.network/expressroutecircuits','microsoft.network/privatednszones','microsoft.network/privateendpoints') | project Name = name, Type = type, ResourceGroup = resourceGroup, Location = location, SKU = tostring(sku.name)"

    run_query "Private Endpoints" "private-endpoints.json" \
        "resources | where type == 'microsoft.network/privateendpoints' | extend targetResource = tostring(properties.privateLinkServiceConnections[0].properties.privateLinkServiceId), connectionState = tostring(properties.privateLinkServiceConnections[0].properties.privateLinkServiceConnectionState.status) | project Name = name, ResourceGroup = resourceGroup, Location = location, TargetResource = split(targetResource, '/')[-1], ConnectionState = connectionState"

    #---------------------------------------------------------------------------
    # CATEGORY 6: Identity Queries
    #---------------------------------------------------------------------------
    log_section "Identity Queries"

    run_query "Managed Identities" "managed-identities.json" \
        "resources | where type == 'microsoft.managedidentity/userassignedidentities' | project Name = name, ResourceGroup = resourceGroup, Location = location, ClientId = properties.clientId, PrincipalId = properties.principalId"

    run_query "RBAC Summary" "rbac-summary.json" \
        "authorizationresources | where type == 'microsoft.authorization/roleassignments' | extend principalType = tostring(properties.principalType) | summarize Count = count() by principalType"

    run_query "RBAC Assignments" "rbac-assignments.json" \
        "authorizationresources | where type == 'microsoft.authorization/roleassignments' | extend principalId = tostring(properties.principalId), principalType = tostring(properties.principalType), roleDefId = tostring(properties.roleDefinitionId), scope = tostring(properties.scope) | extend roleDefName = split(roleDefId, '/')[-1] | project PrincipalId = principalId, PrincipalType = principalType, RoleDefinitionId = roleDefName, Scope = scope"

    run_query "Custom Role Definitions" "custom-roles.json" \
        "authorizationresources | where type == 'microsoft.authorization/roledefinitions' | where properties.type == 'CustomRole' | project Name = properties.roleName, Description = properties.description, Permissions = properties.permissions"

    #---------------------------------------------------------------------------
    # CATEGORY 7: Data & AI Queries
    #---------------------------------------------------------------------------
    log_section "Data & AI Queries"

    run_query "Analytics Services" "data-ai-resources.json" \
        "resources | where type in~ ('microsoft.synapse/workspaces','microsoft.databricks/workspaces','microsoft.machinelearningservices/workspaces','microsoft.cognitiveservices/accounts','microsoft.search/searchservices','microsoft.datafactory/factories','microsoft.purview/accounts','microsoft.eventhub/namespaces','microsoft.streamanalytics/streamingjobs','microsoft.kusto/clusters') | project Name = name, Type = type, ResourceGroup = resourceGroup, Location = location, SKU = tostring(sku.name), Kind = kind"

    run_query "Databases" "databases.json" \
        "resources | where type in~ ('microsoft.sql/servers','microsoft.sql/servers/databases','microsoft.documentdb/databaseaccounts','microsoft.dbforpostgresql/flexibleservers','microsoft.dbformysql/flexibleservers','microsoft.cache/redis') | project Name = name, Type = type, ResourceGroup = resourceGroup, Location = location, SKU = tostring(sku.name)"

    run_query "Storage & Data Lake" "storage-datalake.json" \
        "resources | where type =~ 'microsoft.storage/storageaccounts' | extend kind = kind, accessTier = properties.accessTier, isHnsEnabled = properties.isHnsEnabled | project Name = name, ResourceGroup = resourceGroup, Location = location, Kind = kind, AccessTier = accessTier, DataLakeEnabled = isHnsEnabled, SKU = tostring(sku.name)"

    #---------------------------------------------------------------------------
    # CATEGORY 8: MCSB Compliance Queries
    #---------------------------------------------------------------------------
    log_section "MCSB Compliance Queries"

    run_query "MCSB v1 - Storage" "mcsb-v1-storage.json" \
        "resources | where type =~ 'microsoft.storage/storageaccounts' | extend httpsOnly = tostring(properties.supportsHttpsTrafficOnly), minTLS = tostring(properties.minimumTlsVersion), networkDefault = tostring(properties.networkAcls.defaultAction) | extend DP3_DataInTransit = iif(httpsOnly == 'true' and minTLS == 'TLS1_2', 'Compliant', 'Non-Compliant'), NS2_NetworkSegmentation = iif(networkDefault == 'Deny', 'Compliant', 'Review') | project Name = name, HTTPSOnly = httpsOnly, MinTLS = minTLS, NetworkDefault = networkDefault, MCSB_v1_DP3 = DP3_DataInTransit, MCSB_v1_NS2 = NS2_NetworkSegmentation"

    run_query "MCSB v2 - Storage" "mcsb-v2-storage.json" \
        "resources | where type =~ 'microsoft.storage/storageaccounts' | extend httpsOnly = tostring(properties.supportsHttpsTrafficOnly), minTLS = tostring(properties.minimumTlsVersion), networkDefault = tostring(properties.networkAcls.defaultAction), publicAccess = tostring(properties.allowBlobPublicAccess) | extend DP3_v2 = iif(httpsOnly == 'true' and minTLS == 'TLS1_2', 'Compliant', 'Non-Compliant'), NS2_v2 = iif(networkDefault == 'Deny', 'Compliant', 'Review'), DP1_v2 = iif(publicAccess == 'false', 'Compliant', 'Review') | project Name = name, HTTPSOnly = httpsOnly, MinTLS = minTLS, NetworkDefault = networkDefault, PublicBlobAccess = publicAccess, MCSB_v2_DP3 = DP3_v2, MCSB_v2_NS2 = NS2_v2, MCSB_v2_DP1 = DP1_v2"

    run_query "MCSB v1 - Key Vault" "mcsb-v1-keyvault.json" \
        "resources | where type == 'microsoft.keyvault/vaults' | extend softDelete = tostring(properties.enableSoftDelete), purgeProtection = tostring(properties.enablePurgeProtection), rbacAuth = tostring(properties.enableRbacAuthorization) | extend DP5_DataAtRest = iif(softDelete == 'true' and purgeProtection == 'true', 'Compliant', 'Non-Compliant'), IM1_IdentityMgmt = iif(rbacAuth == 'true', 'Compliant', 'Review') | project Name = name, SoftDelete = softDelete, PurgeProtection = purgeProtection, RBACAuth = rbacAuth, MCSB_v1_DP5 = DP5_DataAtRest, MCSB_v1_IM1 = IM1_IdentityMgmt"

    run_query "MCSB v2 - Key Vault" "mcsb-v2-keyvault.json" \
        "resources | where type == 'microsoft.keyvault/vaults' | extend softDelete = tostring(properties.enableSoftDelete), purgeProtection = tostring(properties.enablePurgeProtection), rbacAuth = tostring(properties.enableRbacAuthorization), publicNetwork = tostring(properties.publicNetworkAccess) | extend DP5_v2 = iif(softDelete == 'true' and purgeProtection == 'true', 'Compliant', 'Non-Compliant'), IM1_v2 = iif(rbacAuth == 'true', 'Compliant', 'Review'), NS2_v2 = iif(publicNetwork == 'Disabled', 'Compliant', 'Review') | project Name = name, SoftDelete = softDelete, PurgeProtection = purgeProtection, RBACAuth = rbacAuth, PublicNetwork = publicNetwork, MCSB_v2_DP5 = DP5_v2, MCSB_v2_IM1 = IM1_v2, MCSB_v2_NS2 = NS2_v2"

    run_query "MCSB v2 - Network" "mcsb-v2-network.json" \
        "resources | where type == 'microsoft.network/virtualnetworks' | mv-expand subnet = properties.subnets | extend subnetName = tostring(subnet.name), nsgAssigned = isnotempty(subnet.properties.networkSecurityGroup.id) | extend NS1_v2 = iif(nsgAssigned, 'Compliant', 'Non-Compliant') | project VNetName = name, SubnetName = subnetName, NSGAssigned = nsgAssigned, MCSB_v2_NS1 = NS1_v2"

    #---------------------------------------------------------------------------
    # CATEGORY 9: WAF Pillar Assessment Queries
    #---------------------------------------------------------------------------
    log_section "WAF Pillar Assessment Queries"

    run_query "WAF Reliability - Backup" "waf-reliability-backup.json" \
        "resources | where type in~ ('microsoft.recoveryservices/vaults','microsoft.recoveryservices/vaults/backuppolicies') | project Name = name, Type = type, ResourceGroup = resourceGroup, Location = location"

    run_query "WAF Reliability - Availability Zones" "waf-reliability-zones.json" \
        "resources | where isnotempty(zones) | project Name = name, Type = type, ResourceGroup = resourceGroup, Zones = zones"

    run_query "WAF Cost - Unattached Disks" "waf-cost-unattached-disks.json" \
        "resources | where type =~ 'microsoft.compute/disks' | where managedBy == '' | project Name = name, ResourceGroup = resourceGroup, Location = location, DiskSizeGB = tostring(properties.diskSizeGB), SKU = tostring(sku.name)"

    run_query "WAF Cost - Unused Public IPs" "waf-cost-unused-publicips.json" \
        "resources | where type =~ 'microsoft.network/publicipaddresses' | where properties.ipConfiguration == '' | project Name = name, ResourceGroup = resourceGroup, Location = location, SKU = tostring(sku.name)"

    run_query "WAF OpEx - Diagnostics" "waf-opex-diagnostics.json" \
        "resources | where type =~ 'microsoft.insights/diagnosticsettings' | project Name = name, ResourceId = properties.resourceId, WorkspaceId = properties.workspaceId, StorageAccountId = properties.storageAccountId"

    run_query "WAF OpEx - Alerts" "waf-opex-alerts.json" \
        "resources | where type in~ ('microsoft.insights/metricalerts','microsoft.insights/activitylogalerts','microsoft.insights/scheduledqueryrules') | project Name = name, Type = type, ResourceGroup = resourceGroup, Enabled = tostring(properties.enabled)"

    run_query "WAF Performance - Auto Scale" "waf-perf-autoscale.json" \
        "resources | where type =~ 'microsoft.insights/autoscalesettings' | project Name = name, ResourceGroup = resourceGroup, TargetResourceId = properties.targetResourceUri, Enabled = tostring(properties.enabled)"

    run_query "WAF Performance - CDN" "waf-perf-cdn.json" \
        "resources | where type in~ ('microsoft.cdn/profiles','microsoft.cdn/profiles/endpoints','microsoft.network/frontdoors','microsoft.cdn/profiles/afdendpoints') | project Name = name, Type = type, ResourceGroup = resourceGroup, SKU = tostring(sku.name)"

    # Restore OUTPUT_DIR
    OUTPUT_DIR="$saved_output_dir"

    # Save execution summary
    local exec_summary="${rg_dir}/execution-summary.json"
    cat > "$exec_summary" << EXECJSON
{
  "executionTimestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "tool": "${SCRIPT_NAME}",
  "version": "${SCRIPT_VERSION}",
  "method": "az-graph-query",
  "pageSize": ${PAGE_SIZE},
  "totalQueries": ${QUERY_TOTAL},
  "successful": ${QUERY_SUCCESS},
  "failed": ${QUERY_FAILED},
  "totalRows": ${TOTAL_ROWS}
}
EXECJSON

    log_success "Resource queries complete."
    echo "  Queries:  ${QUERY_SUCCESS} succeeded, ${QUERY_FAILED} failed (${QUERY_TOTAL} total)"
    echo "  Rows:     ${TOTAL_ROWS} total rows collected"
}

#-------------------------------------------------------------------------------
# PHASE 3: Compliance & Security Summary (Defender for Cloud)
#-------------------------------------------------------------------------------

run_compliance_summary() {
    log_section "PHASE 3: Compliance & Security Summary"

    local cs_dir="${OUTPUT_DIR}/03-compliance-summary"
    mkdir -p "$cs_dir"

    # 3a. Secure Scores via Resource Graph
    log_info "Fetching Defender for Cloud secure scores..."
    az graph query -q "
        securityresources
        | where type == 'microsoft.security/securescores'
        | project subscriptionId, score = properties.score.current, max = properties.score.max
    " --first 1000 --output json 2>/dev/null | jq '.data // []' > "${cs_dir}/secure-scores.json" || {
        log_warn "Could not fetch secure scores."
        echo "[]" > "${cs_dir}/secure-scores.json"
    }

    local score_count
    score_count=$(jq 'length' "${cs_dir}/secure-scores.json" 2>/dev/null) || score_count=0
    log_info "Secure scores: ${score_count} subscription(s)"

    # 3b. Assessment Summary via Resource Graph
    log_info "Fetching security assessment summary..."
    az graph query -q "
        securityresources
        | where type == 'microsoft.security/assessments'
        | extend status = tostring(properties.status.code)
        | summarize
            Healthy = countif(status == 'Healthy'),
            Unhealthy = countif(status == 'Unhealthy'),
            NotApplicable = countif(status == 'NotApplicable')
    " --first 1000 --output json 2>/dev/null | jq '.data // []' > "${cs_dir}/assessment-summary.json" || {
        log_warn "Could not fetch assessment summary."
        echo "[]" > "${cs_dir}/assessment-summary.json"
    }

    # 3c. Per-subscription Defender data via az security CLI
    log_info "Fetching per-subscription Defender data..."
    local defender_dir="${cs_dir}/defender-per-sub"
    mkdir -p "$defender_dir"

    while IFS= read -r sub_id; do
        if [[ -z "$sub_id" ]]; then continue; fi
        local sub_short="${sub_id:0:8}"

        # Secure Score
        az security secure-score list \
            --subscription "$sub_id" \
            --output json > "${defender_dir}/secure-score-${sub_short}.json" 2>/dev/null || true

        # MCSB v2 regulatory compliance controls
        az security regulatory-compliance-controls list \
            --standard-name "Microsoft-cloud-security-benchmark" \
            --subscription "$sub_id" \
            --output json > "${defender_dir}/mcsb-v2-controls-${sub_short}.json" 2>/dev/null || true

        log_info "  Processed subscription ${sub_short}..."
    done < <(az account list --query "[?state=='Enabled'].id" -o tsv 2>/dev/null)

    log_success "Compliance summary complete."
}

#-------------------------------------------------------------------------------
# PHASE 4: Generate Markdown Summary Report
#-------------------------------------------------------------------------------

generate_report() {
    log_section "PHASE 4: Generate Summary Report"

    local report_file="${OUTPUT_DIR}/ALZ-Audit-Report.md"
    local timestamp
    timestamp=$(date -u +"%Y-%m-%d %H:%M:%S UTC")

    # Gather stats from output files (best effort)
    local total_resources="N/A"
    local resource_types="N/A"
    local subscriptions="N/A"
    local locations="N/A"
    local tagging_compliance="N/A"
    local untagged_count="N/A"

    if [[ -f "${OUTPUT_DIR}/02-resource-inventory/summary-metrics.json" ]]; then
        total_resources=$(jq -r '.[0].TotalResources // "N/A"' "${OUTPUT_DIR}/02-resource-inventory/summary-metrics.json" 2>/dev/null) || total_resources="N/A"
        resource_types=$(jq -r '.[0].ResourceTypes // "N/A"' "${OUTPUT_DIR}/02-resource-inventory/summary-metrics.json" 2>/dev/null) || resource_types="N/A"
        subscriptions=$(jq -r '.[0].Subscriptions // "N/A"' "${OUTPUT_DIR}/02-resource-inventory/summary-metrics.json" 2>/dev/null) || subscriptions="N/A"
        locations=$(jq -r '.[0].Locations // "N/A"' "${OUTPUT_DIR}/02-resource-inventory/summary-metrics.json" 2>/dev/null) || locations="N/A"
    fi

    if [[ -f "${OUTPUT_DIR}/02-resource-inventory/tagging-compliance.json" ]]; then
        tagging_compliance=$(jq -r '.[0].TaggingCompliance // "N/A"' "${OUTPUT_DIR}/02-resource-inventory/tagging-compliance.json" 2>/dev/null) || tagging_compliance="N/A"
        untagged_count=$(jq -r '.[0].Untagged // "N/A"' "${OUTPUT_DIR}/02-resource-inventory/tagging-compliance.json" 2>/dev/null) || untagged_count="N/A"
    fi

    # Top resource types
    local top_types=""
    if [[ -f "${OUTPUT_DIR}/02-resource-inventory/resource-types.json" ]]; then
        top_types=$(jq -r '.[:15][] | "| \(.type) | \(.Count) |"' "${OUTPUT_DIR}/02-resource-inventory/resource-types.json" 2>/dev/null) || top_types=""
    fi

    # Secure scores
    local secure_scores_table=""
    if [[ -f "${OUTPUT_DIR}/03-compliance-summary/secure-scores.json" ]]; then
        secure_scores_table=$(jq -r '.[] | "| \(.subscriptionId[:12])... | \(.score) | \(.max) |"' "${OUTPUT_DIR}/03-compliance-summary/secure-scores.json" 2>/dev/null) || secure_scores_table=""
    fi

    # Assessment summary
    local healthy="N/A"
    local unhealthy="N/A"
    local not_applicable="N/A"
    if [[ -f "${OUTPUT_DIR}/03-compliance-summary/assessment-summary.json" ]]; then
        healthy=$(jq -r '.[0].Healthy // "N/A"' "${OUTPUT_DIR}/03-compliance-summary/assessment-summary.json" 2>/dev/null) || healthy="N/A"
        unhealthy=$(jq -r '.[0].Unhealthy // "N/A"' "${OUTPUT_DIR}/03-compliance-summary/assessment-summary.json" 2>/dev/null) || unhealthy="N/A"
        not_applicable=$(jq -r '.[0].NotApplicable // "N/A"' "${OUTPUT_DIR}/03-compliance-summary/assessment-summary.json" 2>/dev/null) || not_applicable="N/A"
    fi

    # Tenant info
    local tenant_count="N/A"
    local mg_count="N/A"
    local sub_enabled="N/A"
    if [[ -f "${OUTPUT_DIR}/01-tenant-discovery/tenant-discovery.json" ]]; then
        tenant_count=$(jq -r '.summary.tenantCount // "N/A"' "${OUTPUT_DIR}/01-tenant-discovery/tenant-discovery.json" 2>/dev/null) || tenant_count="N/A"
        mg_count=$(jq -r '.summary.managementGroupCount // "N/A"' "${OUTPUT_DIR}/01-tenant-discovery/tenant-discovery.json" 2>/dev/null) || mg_count="N/A"
        sub_enabled=$(jq -r '.summary.enabledSubscriptionCount // "N/A"' "${OUTPUT_DIR}/01-tenant-discovery/tenant-discovery.json" 2>/dev/null) || sub_enabled="N/A"
    fi

    # MCSB compliance counts
    local mcsb_storage_total="N/A"
    local mcsb_storage_compliant="N/A"
    if [[ -f "${OUTPUT_DIR}/02-resource-inventory/mcsb-v2-storage.json" ]]; then
        mcsb_storage_total=$(jq 'length' "${OUTPUT_DIR}/02-resource-inventory/mcsb-v2-storage.json" 2>/dev/null) || mcsb_storage_total="N/A"
        mcsb_storage_compliant=$(jq '[.[] | select(.MCSB_v2_DP3 == "Compliant")] | length' "${OUTPUT_DIR}/02-resource-inventory/mcsb-v2-storage.json" 2>/dev/null) || mcsb_storage_compliant="N/A"
    fi

    local mcsb_kv_total="N/A"
    local mcsb_kv_compliant="N/A"
    if [[ -f "${OUTPUT_DIR}/02-resource-inventory/mcsb-v2-keyvault.json" ]]; then
        mcsb_kv_total=$(jq 'length' "${OUTPUT_DIR}/02-resource-inventory/mcsb-v2-keyvault.json" 2>/dev/null) || mcsb_kv_total="N/A"
        mcsb_kv_compliant=$(jq '[.[] | select(.MCSB_v2_DP5 == "Compliant")] | length' "${OUTPUT_DIR}/02-resource-inventory/mcsb-v2-keyvault.json" 2>/dev/null) || mcsb_kv_compliant="N/A"
    fi

    local subnets_no_nsg="N/A"
    if [[ -f "${OUTPUT_DIR}/02-resource-inventory/subnets-no-nsg.json" ]]; then
        subnets_no_nsg=$(jq 'length' "${OUTPUT_DIR}/02-resource-inventory/subnets-no-nsg.json" 2>/dev/null) || subnets_no_nsg="N/A"
    fi

    # Write report
    cat > "$report_file" << REPORTEOF
# ALZ Environment Audit Report

**Generated:** ${timestamp}
**Tool:** ${SCRIPT_NAME} v${SCRIPT_VERSION}
**Method:** Pure Azure CLI (no Python dependencies)
**Output Directory:** \`${OUTPUT_DIR}\`

---

## Executive Summary

This report contains the results of an automated Azure environment audit
designed to support Azure Landing Zone (ALZ) planning and implementation.
All data was collected using Azure CLI Resource Graph queries (\`az graph query\`)
with no external dependencies.

| Metric | Value |
|--------|-------|
| Total Resources | ${total_resources} |
| Resource Types | ${resource_types} |
| Subscriptions | ${subscriptions} |
| Regions | ${locations} |
| Tagging Compliance | ${tagging_compliance}% |
| Untagged Resources | ${untagged_count} |

---

## 1. Tenant & Management Group Discovery

| Metric | Value |
|--------|-------|
| Tenants | ${tenant_count} |
| Management Groups | ${mg_count} |
| Enabled Subscriptions | ${sub_enabled} |

**Files:** \`01-tenant-discovery/\`

---

## 2. Resource Inventory

### Execution Summary

| Metric | Value |
|--------|-------|
| Queries Executed | ${QUERY_TOTAL} |
| Successful | ${QUERY_SUCCESS} |
| Failed | ${QUERY_FAILED} |
| Total Rows Collected | ${TOTAL_ROWS} |

### Top Resource Types

| Resource Type | Count |
|---------------|-------|
${top_types}

**Files:** \`02-resource-inventory/\`

---

## 3. Security & Compliance

### Defender for Cloud - Secure Scores

| Subscription | Score | Max |
|-------------|-------|-----|
${secure_scores_table}

### Security Assessment Summary

| Status | Count |
|--------|-------|
| Healthy | ${healthy} |
| Unhealthy | ${unhealthy} |
| Not Applicable | ${not_applicable} |

### MCSB v2 Compliance Snapshot

| Control Area | Total | Compliant | Notes |
|-------------|-------|-----------|-------|
| Storage (DP-3: Data in Transit) | ${mcsb_storage_total} | ${mcsb_storage_compliant} | HTTPS + TLS 1.2 |
| Key Vault (DP-5: Data at Rest) | ${mcsb_kv_total} | ${mcsb_kv_compliant} | Soft Delete + Purge Protection |
| Network (NS-1: Subnet NSGs) | - | - | ${subnets_no_nsg} subnets without NSG |

**Files:** \`03-compliance-summary/\`

---

## 4. Output File Structure

\`\`\`
${OUTPUT_DIR}/
+-- 01-tenant-discovery/
|   +-- current-context.json          # Current az account context
|   +-- tenants.json                  # All accessible tenants
|   +-- subscriptions-full.json       # Full subscription details
|   +-- subscriptions-summary.json    # Subscription summary
|   +-- management-groups.json        # Management group list
|   +-- mg-hierarchy.json             # MG tree structure
|   +-- subscription-resource-counts.json
|   +-- subscription-mg-mapping.json
|   +-- tenant-discovery.json         # Discovery summary
|
+-- 02-resource-inventory/
|   +-- summary-metrics.json          # Estate-wide metrics
|   +-- tagging-compliance.json       # Tagging analysis
|   +-- resource-types.json           # Type distribution
|   +-- region-distribution.json      # Region distribution
|   +-- inventory-full.json           # Complete inventory
|   +-- inventory-by-type.json        # Count by type
|   +-- untagged-resources.json       # Untagged resources
|   +-- tag-keys.json                 # Tag key distribution
|   +-- management-groups.json        # MGs via Resource Graph
|   +-- subscriptions.json            # Subs via Resource Graph
|   +-- policy-assignments.json       # Policy assignments
|   +-- policy-compliance.json        # Policy compliance
|   +-- policy-enforcement.json       # Enforcement modes
|   +-- keyvaults.json                # Key Vault config
|   +-- nsgs.json                     # NSG inventory
|   +-- nsg-rules.json                # NSG rule details
|   +-- storage-security.json         # Storage security
|   +-- public-ips.json               # Public IP addresses
|   +-- sql-security.json             # SQL Server config
|   +-- vnets.json                    # Virtual networks
|   +-- subnets.json                  # Subnet details
|   +-- subnets-no-nsg.json           # Subnets missing NSGs
|   +-- peerings.json                 # VNet peerings
|   +-- network-connectivity.json     # Connectivity resources
|   +-- private-endpoints.json        # Private endpoints
|   +-- managed-identities.json       # Managed identities
|   +-- rbac-summary.json             # RBAC summary
|   +-- rbac-assignments.json         # RBAC detail
|   +-- custom-roles.json             # Custom roles
|   +-- data-ai-resources.json        # Data & AI services
|   +-- databases.json                # Database services
|   +-- storage-datalake.json         # Storage/Data Lake
|   +-- mcsb-v1-storage.json          # MCSB v1 storage
|   +-- mcsb-v2-storage.json          # MCSB v2 storage
|   +-- mcsb-v1-keyvault.json         # MCSB v1 Key Vault
|   +-- mcsb-v2-keyvault.json         # MCSB v2 Key Vault
|   +-- mcsb-v2-network.json          # MCSB v2 network
|   +-- waf-reliability-backup.json   # WAF: backup
|   +-- waf-reliability-zones.json    # WAF: availability zones
|   +-- waf-cost-unattached-disks.json    # WAF: cost
|   +-- waf-cost-unused-publicips.json    # WAF: cost
|   +-- waf-opex-diagnostics.json     # WAF: diagnostics
|   +-- waf-opex-alerts.json          # WAF: alerts
|   +-- waf-perf-autoscale.json       # WAF: autoscale
|   +-- waf-perf-cdn.json             # WAF: CDN/FrontDoor
|   +-- execution-summary.json        # Query execution log
|
+-- 03-compliance-summary/
|   +-- secure-scores.json            # Defender secure scores
|   +-- assessment-summary.json       # Assessment counts
|   +-- defender-per-sub/             # Per-subscription data
|       +-- secure-score-XXXXXXXX.json
|       +-- mcsb-v2-controls-XXXXXXXX.json
|
+-- ALZ-Audit-Report.md              # This report
\`\`\`

---

## 5. Compliance Frameworks Assessed

| Framework | ID | Status |
|-----------|----|--------|
| Microsoft Cloud Security Benchmark v2 | MCSB-v2 | Primary |
| Microsoft Cloud Security Benchmark v1 | MCSB-v1 | Legacy |
| NIST SP 800-53 Rev 5 | NIST-800-53-R5 | Mapped via compliance-mapping.json |
| ISO 27001:2022 | ISO-27001-2022 | Mapped via compliance-mapping.json |
| UK NCSC 14 Cloud Security Principles | NCSC-14 | Reference |

---

## 6. Well-Architected Framework Pillar Coverage

| WAF Pillar | Data Collected | Key Files |
|------------|---------------|-----------|
| Security | NSGs, Storage config, Key Vaults, SQL, Public IPs, RBAC | keyvaults.json, storage-security.json, nsgs.json |
| Reliability | Backup vaults, Availability zones | waf-reliability-backup.json, waf-reliability-zones.json |
| Cost Optimization | Unattached disks, Unused public IPs | waf-cost-unattached-disks.json, waf-cost-unused-publicips.json |
| Operational Excellence | Diagnostics settings, Alerts | waf-opex-diagnostics.json, waf-opex-alerts.json |
| Performance Efficiency | Autoscale settings, CDN/FrontDoor | waf-perf-autoscale.json, waf-perf-cdn.json |

---

## 7. Next Steps

1. **Review** the tenant discovery output to understand current structure
2. **Analyze** the resource inventory for ALZ migration planning
3. **Prioritize** MCSB non-compliant resources for remediation
4. **Address** subnets without NSGs (${subnets_no_nsg} found)
5. **Review** untagged resources (${untagged_count} found) for governance gaps
6. **Map** findings to target ALZ architecture design
7. **Import** JSON files into analysis tools (Excel, Power BI, etc.)

---

*Generated by ${SCRIPT_NAME} v${SCRIPT_VERSION} -- Pure Azure CLI, no Python dependencies.*
*Works in Azure Cloud Shell without installing anything.*
REPORTEOF

    log_success "Report generated: ${report_file}"
}

#===============================================================================
# MAIN EXECUTION
#===============================================================================

print_banner

# Check prerequisites
check_prerequisites

# Create output directory
mkdir -p "${OUTPUT_DIR}"
log_info "Output directory: ${OUTPUT_DIR}"

# Show current Azure context
echo ""
log_info "Current Azure context:"
az account show --query "{Subscription:name, User:user.name, Tenant:tenantId}" --output table 2>/dev/null || true
echo ""

# Record start time
START_TIME=$(date +%s)

# Phase 1: Tenant Discovery
if [[ "$SKIP_TENANT_DISCOVERY" == "false" ]]; then
    run_tenant_discovery
else
    log_warn "Skipping tenant discovery (--skip-tenant-discovery)"
fi

# Phase 2: Resource Graph Queries
if [[ "$SKIP_RESOURCE_QUERIES" == "false" ]]; then
    run_resource_queries
else
    log_warn "Skipping resource queries (--skip-resource-queries)"
fi

# Phase 3: Compliance Summary
run_compliance_summary

# Phase 4: Generate Report
generate_report

# Calculate elapsed time
END_TIME=$(date +%s)
ELAPSED=$((END_TIME - START_TIME))
ELAPSED_MIN=$((ELAPSED / 60))
ELAPSED_SEC=$((ELAPSED % 60))

# Final summary
echo ""
echo -e "${BOLD}================================================================${NC}"
echo -e "${GREEN}${BOLD}  Audit Complete!${NC}"
echo -e "${BOLD}================================================================${NC}"
echo ""
echo "  Duration:    ${ELAPSED_MIN}m ${ELAPSED_SEC}s"
echo "  Output:      ${OUTPUT_DIR}"
echo ""
echo "  Key files:"
echo "    ${OUTPUT_DIR}/ALZ-Audit-Report.md"
if [[ "$SKIP_TENANT_DISCOVERY" == "false" ]]; then
    echo "    ${OUTPUT_DIR}/01-tenant-discovery/tenant-discovery.json"
fi
if [[ "$SKIP_RESOURCE_QUERIES" == "false" ]]; then
    echo "    ${OUTPUT_DIR}/02-resource-inventory/execution-summary.json"
    echo "    ${OUTPUT_DIR}/02-resource-inventory/inventory-full.json"
fi
echo "    ${OUTPUT_DIR}/03-compliance-summary/secure-scores.json"
echo ""
echo "  Queries:     ${QUERY_SUCCESS} succeeded, ${QUERY_FAILED} failed (${QUERY_TOTAL} total)"
echo "  Rows:        ${TOTAL_ROWS} total rows collected"
echo ""
echo "  No Python. No pip. Pure Azure CLI."
echo ""
