#!/bin/bash
#===============================================================================
# O365 Tenancy Snapshot Audit - Pure CLI Version (v1)
#===============================================================================
#
# Replaces PowerShell-dependent queries with az cli + Microsoft Graph API calls.
# Uses `az rest` for Graph API endpoints - works in Azure Cloud Shell.
#
# COVERAGE:
#   ✅ Identity & Access (Entra ID) - Full coverage via Graph API
#   ✅ Users, Groups, Roles - Full coverage via Graph API
#   ✅ Conditional Access - Full coverage via Graph API
#   ✅ Service Principals / App Registrations - Full coverage via Graph API
#   ✅ Security / Secure Score - Full coverage via Graph API
#   ✅ Licensing - Full coverage via Graph API
#   ⚠️  Exchange Online - Limited (transport rules, anti-phish require PowerShell)
#   ⚠️  SharePoint/OneDrive - Limited (tenant settings require PowerShell)
#   ⚠️  Teams - Limited (policies require PowerShell)
#   ⚠️  Compliance/DLP - Limited (DLP policies require PowerShell)
#
# For features marked ⚠️, use the companion PowerShell script or Graph API
# application permissions with client credentials flow.
#
# Dependencies (all pre-installed in Azure Cloud Shell):
#   - az CLI (logged in with user or service principal)
#   - jq
#   - bash
#
# Prerequisites:
#   - Azure CLI logged in: az login
#   - Delegated or Application permissions for Microsoft Graph
#   - Minimum: Directory.Read.All, Policy.Read.All, User.Read.All
#
# Usage:
#   ./07-O365-SS-Audit-AzCLI-v1.sh
#   ./07-O365-SS-Audit-AzCLI-v1.sh --output /path/to/exports
#   ./07-O365-SS-Audit-AzCLI-v1.sh -h
#
#===============================================================================

set -euo pipefail

#-------------------------------------------------------------------------------
# Configuration
#-------------------------------------------------------------------------------

SCRIPT_VERSION="1.0.0"
SCRIPT_NAME="07-O365-SS-Audit-AzCLI-v1"
OUTPUT_DIR="./o365-audit-$(date +%Y%m%d-%H%M%S)"
GRAPH_API_VERSION="v1.0"
GRAPH_API_BASE="https://graph.microsoft.com/${GRAPH_API_VERSION}"
GRAPH_API_BETA="https://graph.microsoft.com/beta"

# Counters
QUERY_TOTAL=0
QUERY_SUCCESS=0
QUERY_FAILED=0
QUERY_CURRENT=0

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
O365 Tenancy Snapshot Audit - Pure CLI Version (v1)
====================================================

Single-script M365/Entra ID audit using ONLY az cli commands and Microsoft Graph API.
No PowerShell. Works in Azure Cloud Shell.

Usage:
  ./07-O365-SS-Audit-AzCLI-v1.sh [OPTIONS]

Options:
  -o, --output DIR    Output directory (default: ./o365-audit-TIMESTAMP)
  -h, --help          Show this help message

Coverage:
  ✅ Full: Identity & Access, Users, Groups, Roles, Conditional Access,
           Service Principals, App Registrations, Security, Licensing
  ⚠️  Limited: Exchange, SharePoint, Teams, DLP (require PowerShell)

Prerequisites:
  1. Azure CLI logged in: az login
  2. Graph API permissions: Directory.Read.All, Policy.Read.All, User.Read.All

Examples:
  # Full audit with default output
  ./07-O365-SS-Audit-AzCLI-v1.sh

  # Custom output directory
  ./07-O365-SS-Audit-AzCLI-v1.sh --output ./my-o365-audit

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

    # Check Azure CLI
    if ! command -v az &> /dev/null; then
        log_error "Azure CLI (az) not found."
        exit 1
    fi

    # Check az login
    if ! az account show &> /dev/null 2>&1; then
        log_error "Not logged in to Azure. Run: az login"
        exit 1
    fi

    # Check jq
    if ! command -v jq &> /dev/null; then
        log_error "jq not found."
        exit 1
    fi

    # Test Graph API access
    if ! az rest --method GET --url "${GRAPH_API_BASE}/organization" &> /dev/null 2>&1; then
        log_warn "Cannot access Microsoft Graph API. You may need to grant consent."
        log_warn "Ensure you have Directory.Read.All permission."
    fi

    log_success "Prerequisites satisfied."
}

#-------------------------------------------------------------------------------
# Banner
#-------------------------------------------------------------------------------

print_banner() {
    echo ""
    echo -e "${BOLD}================================================================${NC}"
    echo -e "${BOLD}  O365 Tenancy Snapshot Audit - Pure CLI Version${NC}"
    echo -e "${BOLD}  Version: ${SCRIPT_VERSION}${NC}"
    echo -e "${BOLD}  $(date '+%Y-%m-%d %H:%M:%S %Z')${NC}"
    echo -e "${BOLD}================================================================${NC}"
    echo ""
}

#-------------------------------------------------------------------------------
# Graph API Query Function
#
# Usage: run_graph_query "QUERY_NAME" "output-file.json" "GRAPH_ENDPOINT" [BETA]
#
# - Uses az rest to call Microsoft Graph API
# - Handles pagination with @odata.nextLink
# - Saves results as a JSON array
#-------------------------------------------------------------------------------

run_graph_query() {
    local query_name="$1"
    local output_file="$2"
    local endpoint="$3"
    local use_beta="${4:-false}"
    local full_path="${OUTPUT_DIR}/${output_file}"

    QUERY_CURRENT=$((QUERY_CURRENT + 1))
    echo -ne "${BLUE}[${QUERY_CURRENT}/${QUERY_TOTAL}]${NC} ${query_name}..."

    local base_url="${GRAPH_API_BASE}"
    if [[ "$use_beta" == "true" ]]; then
        base_url="${GRAPH_API_BETA}"
    fi

    local url="${base_url}${endpoint}"
    local all_results="[]"
    local page=0
    local total_count=0

    while [[ -n "$url" ]]; do
        page=$((page + 1))

        local response
        response=$(az rest --method GET --url "$url" 2>/dev/null) || {
            echo -e " ${RED}FAILED${NC}"
            log_warn "  Query '${query_name}' failed."
            echo "[]" > "$full_path"
            QUERY_FAILED=$((QUERY_FAILED + 1))
            return 0
        }

        # Extract value array (standard Graph API response format)
        local page_data
        page_data=$(echo "$response" | jq -r '.value // []' 2>/dev/null) || page_data="[]"

        # If no .value, check if response is the data itself
        if [[ "$page_data" == "[]" ]] || [[ "$page_data" == "null" ]]; then
            # Try treating response as direct data
            page_data=$(echo "$response" | jq -r 'if type == "array" then . else [.] end' 2>/dev/null) || page_data="[]"
        fi

        local page_count
        page_count=$(echo "$page_data" | jq 'length' 2>/dev/null) || page_count=0

        # Merge results
        all_results=$(echo "$all_results" "$page_data" | jq -s '.[0] + .[1]' 2>/dev/null) || {
            echo -e " ${RED}MERGE FAILED${NC}"
            QUERY_FAILED=$((QUERY_FAILED + 1))
            echo "[]" > "$full_path"
            return 0
        }

        total_count=$((total_count + page_count))

        # Check for next page
        url=$(echo "$response" | jq -r '."@odata.nextLink" // empty' 2>/dev/null) || url=""

        # Safety: max 100 pages
        if [[ $page -ge 100 ]]; then
            log_warn "  Pagination limit for '${query_name}' (${total_count} items)."
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
# PHASE 1: Organization & Tenant Info
#-------------------------------------------------------------------------------

run_org_discovery() {
    log_section "PHASE 1: Organization & Tenant Discovery"

    local org_dir="${OUTPUT_DIR}/01-organization"
    mkdir -p "$org_dir"

    # Get organization details
    log_info "Fetching organization details..."
    az rest --method GET --url "${GRAPH_API_BASE}/organization" \
        --output json > "${org_dir}/organization.json" 2>/dev/null || {
        log_warn "Could not fetch organization details."
        echo "{}" > "${org_dir}/organization.json"
    }

    # Extract key info
    local tenant_id
    tenant_id=$(jq -r '.value[0].id // "unknown"' "${org_dir}/organization.json" 2>/dev/null) || tenant_id="unknown"
    local display_name
    display_name=$(jq -r '.value[0].displayName // "unknown"' "${org_dir}/organization.json" 2>/dev/null) || display_name="unknown"
    local verified_domains
    verified_domains=$(jq -r '.value[0].verifiedDomains | length // 0' "${org_dir}/organization.json" 2>/dev/null) || verified_domains=0

    log_info "Tenant ID:        ${tenant_id}"
    log_info "Display Name:     ${display_name}"
    log_info "Verified Domains: ${verified_domains}"

    # Get verified domains list
    jq '.value[0].verifiedDomains // []' "${org_dir}/organization.json" > "${org_dir}/verified-domains.json" 2>/dev/null || true

    # Get directory quota
    az rest --method GET --url "${GRAPH_API_BASE}/organization?%24select=directorySizeQuota" \
        --output json > "${org_dir}/directory-quota.json" 2>/dev/null || true

    log_success "Organization discovery complete."
}

#-------------------------------------------------------------------------------
# PHASE 2: Identity & Access (Entra ID)
#-------------------------------------------------------------------------------

run_identity_queries() {
    log_section "PHASE 2: Identity & Access (Entra ID)"

    local id_dir="${OUTPUT_DIR}/02-identity"
    mkdir -p "$id_dir"
    local saved_output_dir="$OUTPUT_DIR"
    OUTPUT_DIR="$id_dir"

    # Count queries in this phase
    QUERY_TOTAL=25
    QUERY_CURRENT=0
    QUERY_SUCCESS=0
    QUERY_FAILED=0

    #---------------------------------------------------------------------------
    # Users
    #---------------------------------------------------------------------------
    run_graph_query "All Users" "users-all.json" \
        "/users?\$select=id,displayName,userPrincipalName,accountEnabled,userType,createdDateTime,lastSignInDateTime&\$top=999"

    run_graph_query "Guest Users" "users-guests.json" \
        "/users?\$filter=userType eq 'Guest'&\$select=id,displayName,userPrincipalName,createdDateTime,accountEnabled,externalUserState"

    run_graph_query "Disabled Users" "users-disabled.json" \
        "/users?\$filter=accountEnabled eq false&\$select=id,displayName,userPrincipalName"

    #---------------------------------------------------------------------------
    # Authentication Methods (MFA status via reports)
    #---------------------------------------------------------------------------
    run_graph_query "User Registration Details (MFA)" "mfa-registration-details.json" \
        "/reports/authenticationMethods/userRegistrationDetails" "true"

    run_graph_query "Credential User Registration Count" "mfa-registration-count.json" \
        "/reports/credentialUserRegistrationCount" "true"

    #---------------------------------------------------------------------------
    # Directory Roles
    #---------------------------------------------------------------------------
    run_graph_query "Directory Roles" "directory-roles.json" \
        "/directoryRoles?\$select=id,displayName,description"

    # Global Administrators
    log_info "Fetching Global Administrator members..."
    local global_admin_id
    global_admin_id=$(az rest --method GET --url "${GRAPH_API_BASE}/directoryRoles?\$filter=displayName eq 'Global Administrator'" 2>/dev/null | \
        jq -r '.value[0].id // empty' 2>/dev/null) || global_admin_id=""

    if [[ -n "$global_admin_id" ]]; then
        az rest --method GET --url "${GRAPH_API_BASE}/directoryRoles/${global_admin_id}/members" \
            --output json > "${id_dir}/global-admins.json" 2>/dev/null || echo "[]" > "${id_dir}/global-admins.json"
        local ga_count
        ga_count=$(jq '.value | length // 0' "${id_dir}/global-admins.json" 2>/dev/null) || ga_count=0
        if [[ $ga_count -gt 5 ]]; then
            log_warn "Global Administrators: ${ga_count} (EXCEEDS BEST PRACTICE ≤5)"
        else
            log_info "Global Administrators: ${ga_count}"
        fi
    else
        echo "[]" > "${id_dir}/global-admins.json"
    fi

    #---------------------------------------------------------------------------
    # Conditional Access
    #---------------------------------------------------------------------------
    run_graph_query "Conditional Access Policies" "conditional-access-policies.json" \
        "/identity/conditionalAccess/policies"

    run_graph_query "Named Locations" "named-locations.json" \
        "/identity/conditionalAccess/namedLocations"

    #---------------------------------------------------------------------------
    # Identity Protection (requires Azure AD P2)
    #---------------------------------------------------------------------------
    run_graph_query "Risk Detections (Recent)" "risk-detections.json" \
        "/identityProtection/riskDetections?\$top=100" "true"

    run_graph_query "Risky Users" "risky-users.json" \
        "/identityProtection/riskyUsers?\$top=100" "true"

    #---------------------------------------------------------------------------
    # Service Principals / App Registrations
    #---------------------------------------------------------------------------
    run_graph_query "Service Principals" "service-principals.json" \
        "/servicePrincipals?\$select=id,displayName,appId,servicePrincipalType,accountEnabled,signInAudience&\$top=999"

    run_graph_query "App Registrations" "app-registrations.json" \
        "/applications?\$select=id,displayName,appId,signInAudience,createdDateTime&\$top=999"

    run_graph_query "OAuth2 Permission Grants" "oauth2-permission-grants.json" \
        "/oauth2PermissionGrants"

    #---------------------------------------------------------------------------
    # Groups
    #---------------------------------------------------------------------------
    run_graph_query "Security Groups" "groups-security.json" \
        "/groups?\$filter=securityEnabled eq true&\$select=id,displayName,description,membershipRule,groupTypes&\$top=999"

    run_graph_query "Microsoft 365 Groups" "groups-m365.json" \
        "/groups?\$filter=groupTypes/any(g:g eq 'Unified')&\$select=id,displayName,description,visibility&\$top=999"

    #---------------------------------------------------------------------------
    # Administrative Units
    #---------------------------------------------------------------------------
    run_graph_query "Administrative Units" "administrative-units.json" \
        "/administrativeUnits?\$select=id,displayName,description"

    #---------------------------------------------------------------------------
    # PIM (Privileged Identity Management) - requires P2
    #---------------------------------------------------------------------------
    run_graph_query "PIM Role Assignments" "pim-role-assignments.json" \
        "/roleManagement/directory/roleAssignments" "true"

    run_graph_query "PIM Eligible Assignments" "pim-eligible-assignments.json" \
        "/roleManagement/directory/roleEligibilitySchedules" "true"

    #---------------------------------------------------------------------------
    # Password Policies
    #---------------------------------------------------------------------------
    run_graph_query "Authorization Policy" "authorization-policy.json" \
        "/policies/authorizationPolicy"

    run_graph_query "Authentication Methods Policy" "authentication-methods-policy.json" \
        "/policies/authenticationMethodsPolicy"

    run_graph_query "Password Credential Policies" "password-credential-policies.json" \
        "/policies/passwordCredentialPolicies" "true"

    #---------------------------------------------------------------------------
    # Security Defaults
    #---------------------------------------------------------------------------
    run_graph_query "Security Defaults" "security-defaults.json" \
        "/policies/identitySecurityDefaultsEnforcementPolicy"

    #---------------------------------------------------------------------------
    # Sign-in Logs (sample)
    #---------------------------------------------------------------------------
    run_graph_query "Sign-in Logs (Recent)" "signin-logs-sample.json" \
        "/auditLogs/signIns?\$top=100&\$orderby=createdDateTime desc" "true"

    OUTPUT_DIR="$saved_output_dir"
    log_success "Identity queries complete: ${QUERY_SUCCESS} succeeded, ${QUERY_FAILED} failed"
}

#-------------------------------------------------------------------------------
# PHASE 3: Security (Defender, Secure Score)
#-------------------------------------------------------------------------------

run_security_queries() {
    log_section "PHASE 3: Security (Defender, Secure Score)"

    local sec_dir="${OUTPUT_DIR}/03-security"
    mkdir -p "$sec_dir"
    local saved_output_dir="$OUTPUT_DIR"
    OUTPUT_DIR="$sec_dir"

    QUERY_TOTAL=8
    QUERY_CURRENT=0
    QUERY_SUCCESS=0
    QUERY_FAILED=0

    #---------------------------------------------------------------------------
    # Microsoft Secure Score
    #---------------------------------------------------------------------------
    run_graph_query "Secure Score" "secure-score.json" \
        "/security/secureScores?\$top=1"

    run_graph_query "Secure Score Control Profiles" "secure-score-controls.json" \
        "/security/secureScoreControlProfiles"

    #---------------------------------------------------------------------------
    # Security Alerts
    #---------------------------------------------------------------------------
    run_graph_query "Security Alerts" "security-alerts.json" \
        "/security/alerts?\$top=100"

    run_graph_query "Security Alerts V2" "security-alerts-v2.json" \
        "/security/alerts_v2?\$top=100" "true"

    #---------------------------------------------------------------------------
    # Incidents
    #---------------------------------------------------------------------------
    run_graph_query "Security Incidents" "security-incidents.json" \
        "/security/incidents?\$top=50" "true"

    #---------------------------------------------------------------------------
    # Threat Intelligence
    #---------------------------------------------------------------------------
    run_graph_query "TI Indicators (sample)" "threat-indicators.json" \
        "/security/tiIndicators?\$top=50" "true"

    #---------------------------------------------------------------------------
    # Licensing
    #---------------------------------------------------------------------------
    run_graph_query "Subscribed SKUs (Licensing)" "subscribed-skus.json" \
        "/subscribedSkus"

    run_graph_query "License Details" "license-details.json" \
        "/organization?\$select=assignedPlans"

    OUTPUT_DIR="$saved_output_dir"
    log_success "Security queries complete: ${QUERY_SUCCESS} succeeded, ${QUERY_FAILED} failed"
}

#-------------------------------------------------------------------------------
# PHASE 4: Exchange / Mail (Limited via Graph)
#-------------------------------------------------------------------------------

run_exchange_queries() {
    log_section "PHASE 4: Exchange Online (Limited - Graph API)"

    local exo_dir="${OUTPUT_DIR}/04-exchange"
    mkdir -p "$exo_dir"
    local saved_output_dir="$OUTPUT_DIR"
    OUTPUT_DIR="$exo_dir"

    QUERY_TOTAL=4
    QUERY_CURRENT=0
    QUERY_SUCCESS=0
    QUERY_FAILED=0

    log_warn "Note: Transport rules, anti-phishing, Safe Links/Attachments require PowerShell."
    log_warn "This phase covers Graph API accessible Exchange data only."

    #---------------------------------------------------------------------------
    # Domains (verified domains for email)
    #---------------------------------------------------------------------------
    run_graph_query "Domains" "domains.json" \
        "/domains"

    #---------------------------------------------------------------------------
    # Mailbox Settings (sample - requires Mail.Read)
    #---------------------------------------------------------------------------
    run_graph_query "Organization Mail Settings" "org-mail-settings.json" \
        "/organization?\$select=id,displayName,technicalNotificationMails,securityComplianceNotificationMails"

    #---------------------------------------------------------------------------
    # Mail Flow (limited)
    #---------------------------------------------------------------------------
    log_info "Note: For full Exchange audit (transport rules, anti-phishing, DKIM, DMARC),"
    log_info "      use the companion PowerShell script: 03-O365-SS-Audit-Operating-Deployment-Guide-v1.md"

    # Create a note file for Exchange-specific checks
    cat > "${exo_dir}/EXCHANGE-REQUIRES-POWERSHELL.md" << 'EXONOTE'
# Exchange Online Features Requiring PowerShell

The following Exchange Online audit items require the Exchange Online PowerShell module
(ExchangeOnlineManagement) and cannot be retrieved via Microsoft Graph API:

## Requires PowerShell:
- Transport / Mail Flow Rules
- External Forwarding Rules (critical security check)
- Mailbox-level Forwarding (per-mailbox check)
- Anti-Phishing Policies
- Anti-Spam Policies (Hosted Content Filter)
- DKIM Signing Configuration
- Safe Attachments Policies (Defender for Office 365)
- Safe Links Policies (Defender for Office 365)
- Unified Audit Log Configuration
- Organization Configuration (OAuth, MailTips, etc.)

## How to run PowerShell collection:

```powershell
# Connect
Connect-ExchangeOnline -UserPrincipalName auditor@domain.com

# Transport rules
Get-TransportRule | Export-Csv exchange-transport-rules.csv -NoTypeInformation

# Forwarding rules (HIGH RISK CHECK)
Get-TransportRule | Where-Object { $_.RedirectMessageTo -ne $null -or $_.BlindCopyTo -ne $null } | Export-Csv exchange-forwarding-rules.csv

# Anti-phishing
Get-AntiPhishPolicy | Export-Csv exchange-antiphish-policies.csv

# Audit log status
Get-AdminAuditLogConfig | ConvertTo-Json > exchange-audit-log-config.json

# Disconnect
Disconnect-ExchangeOnline -Confirm:$false
```

Refer to: 03-O365-SS-Audit-Operating-Deployment-Guide-v1.md for full PowerShell procedures.
EXONOTE

    run_graph_query "Accepted Domains" "accepted-domains.json" \
        "/domains?\$filter=isVerified eq true"

    run_graph_query "Domain Service Config" "domain-service-config.json" \
        "/domains?\$select=id,isVerified,supportedServices"

    OUTPUT_DIR="$saved_output_dir"
    log_success "Exchange queries complete: ${QUERY_SUCCESS} succeeded, ${QUERY_FAILED} failed"
}

#-------------------------------------------------------------------------------
# PHASE 5: SharePoint & OneDrive (Limited via Graph)
#-------------------------------------------------------------------------------

run_sharepoint_queries() {
    log_section "PHASE 5: SharePoint & OneDrive (Limited - Graph API)"

    local sp_dir="${OUTPUT_DIR}/05-sharepoint"
    mkdir -p "$sp_dir"
    local saved_output_dir="$OUTPUT_DIR"
    OUTPUT_DIR="$sp_dir"

    QUERY_TOTAL=3
    QUERY_CURRENT=0
    QUERY_SUCCESS=0
    QUERY_FAILED=0

    log_warn "Note: SharePoint tenant settings, site collections, sharing policies require"
    log_warn "      SharePoint Online PowerShell (Microsoft.Online.SharePoint.PowerShell)."

    #---------------------------------------------------------------------------
    # Sites (via Graph - limited to sites user has access to)
    #---------------------------------------------------------------------------
    run_graph_query "SharePoint Sites" "sites.json" \
        "/sites?\$search=*&\$select=id,name,webUrl,displayName&\$top=500"

    run_graph_query "Root Site" "root-site.json" \
        "/sites/root"

    # Create note for SharePoint-specific checks
    cat > "${sp_dir}/SHAREPOINT-REQUIRES-POWERSHELL.md" << 'SPNOTE'
# SharePoint Online Features Requiring PowerShell

The following SharePoint/OneDrive audit items require SharePoint Online PowerShell
and cannot be retrieved via Microsoft Graph API:

## Requires PowerShell:
- SharePoint Tenant Settings (SharingCapability, DefaultSharingLinkType, etc.)
- Site Collection Inventory (all sites with storage, sharing settings)
- External Sharing Summary (per-site sharing capabilities)
- OneDrive Settings (OneDriveSharingCapability, StorageQuota)

## How to run PowerShell collection:

```powershell
# Connect
Connect-SPOService -Url https://contoso-admin.sharepoint.com

# Tenant settings
Get-SPOTenant | ConvertTo-Json > sharepoint-tenant-settings.json

# All sites
Get-SPOSite -Limit All | Export-Csv sharepoint-sites.csv -NoTypeInformation

# Sharing summary
$sites = Get-SPOSite -Limit All
$sites | Group-Object SharingCapability | Export-Csv sharepoint-sharing-summary.csv

# Disconnect
Disconnect-SPOService
```

Refer to: 03-O365-SS-Audit-Operating-Deployment-Guide-v1.md for full PowerShell procedures.
SPNOTE

    run_graph_query "Drives (OneDrive)" "drives.json" \
        "/drives?\$top=100"

    OUTPUT_DIR="$saved_output_dir"
    log_success "SharePoint queries complete: ${QUERY_SUCCESS} succeeded, ${QUERY_FAILED} failed"
}

#-------------------------------------------------------------------------------
# PHASE 6: Teams (Limited via Graph)
#-------------------------------------------------------------------------------

run_teams_queries() {
    log_section "PHASE 6: Teams (Limited - Graph API)"

    local teams_dir="${OUTPUT_DIR}/06-teams"
    mkdir -p "$teams_dir"
    local saved_output_dir="$OUTPUT_DIR"
    OUTPUT_DIR="$teams_dir"

    QUERY_TOTAL=3
    QUERY_CURRENT=0
    QUERY_SUCCESS=0
    QUERY_FAILED=0

    log_warn "Note: Teams policies (meeting, messaging, external access) require"
    log_warn "      MicrosoftTeams PowerShell module."

    #---------------------------------------------------------------------------
    # Teams (via Graph)
    #---------------------------------------------------------------------------
    run_graph_query "Teams" "teams.json" \
        "/groups?\$filter=resourceProvisioningOptions/Any(x:x eq 'Team')&\$select=id,displayName,description,visibility&\$top=999"

    run_graph_query "Teams Templates" "teams-templates.json" \
        "/teamwork/teamTemplates" "true"

    # Create note for Teams-specific checks
    cat > "${teams_dir}/TEAMS-REQUIRES-POWERSHELL.md" << 'TEAMSNOTE'
# Teams Features Requiring PowerShell

The following Teams audit items require MicrosoftTeams PowerShell module
and cannot be retrieved via Microsoft Graph API:

## Requires PowerShell:
- External Access Policies (federation, consumer access)
- Guest Access Configuration
- Meeting Policies (anonymous join, recording, screen sharing)
- Messaging Policies (URL previews, Giphy, edit/delete)
- App Permission Policies

## How to run PowerShell collection:

```powershell
# Connect
Connect-MicrosoftTeams

# External access
Get-CsExternalAccessPolicy | Export-Csv teams-external-access.csv

# Guest config
Get-CsTeamsClientConfiguration | ConvertTo-Json > teams-guest-config.json

# Meeting policies
Get-CsTeamsMeetingPolicy | Export-Csv teams-meeting-policies.csv

# Messaging policies
Get-CsTeamsMessagingPolicy | Export-Csv teams-messaging-policies.csv

# Disconnect
Disconnect-MicrosoftTeams
```

Refer to: 03-O365-SS-Audit-Operating-Deployment-Guide-v1.md for full PowerShell procedures.
TEAMSNOTE

    run_graph_query "Team Owners (sample)" "team-owners-sample.json" \
        "/groups?\$filter=resourceProvisioningOptions/Any(x:x eq 'Team')&\$top=10&\$expand=owners"

    OUTPUT_DIR="$saved_output_dir"
    log_success "Teams queries complete: ${QUERY_SUCCESS} succeeded, ${QUERY_FAILED} failed"
}

#-------------------------------------------------------------------------------
# PHASE 7: Compliance (Limited via Graph)
#-------------------------------------------------------------------------------

run_compliance_queries() {
    log_section "PHASE 7: Compliance & DLP (Limited - Graph API)"

    local comp_dir="${OUTPUT_DIR}/07-compliance"
    mkdir -p "$comp_dir"
    local saved_output_dir="$OUTPUT_DIR"
    OUTPUT_DIR="$comp_dir"

    QUERY_TOTAL=3
    QUERY_CURRENT=0
    QUERY_SUCCESS=0
    QUERY_FAILED=0

    log_warn "Note: DLP policies, sensitivity labels, retention policies require"
    log_warn "      Security & Compliance PowerShell (Connect-IPPSSession)."

    #---------------------------------------------------------------------------
    # Labels (via Graph - Information Protection)
    #---------------------------------------------------------------------------
    run_graph_query "Information Protection Labels" "sensitivity-labels.json" \
        "/informationProtection/policy/labels" "true"

    run_graph_query "Label Policies" "label-policies.json" \
        "/informationProtection/policy" "true"

    # Create note for Compliance-specific checks
    cat > "${comp_dir}/COMPLIANCE-REQUIRES-POWERSHELL.md" << 'COMPNOTE'
# Compliance Features Requiring PowerShell

The following Compliance audit items require Security & Compliance PowerShell
and cannot be retrieved via Microsoft Graph API:

## Requires PowerShell:
- DLP Policies (Data Loss Prevention)
- DLP Rules
- Sensitivity Labels (full config)
- Retention Policies
- Alert Policies

## How to run PowerShell collection:

```powershell
# Connect
Connect-IPPSSession -UserPrincipalName auditor@domain.com

# DLP policies
Get-DlpCompliancePolicy | Export-Csv compliance-dlp-policies.csv

# DLP rules
Get-DlpComplianceRule | Export-Csv compliance-dlp-rules.csv

# Sensitivity labels
Get-Label | Export-Csv compliance-sensitivity-labels.csv

# Retention policies
Get-RetentionCompliancePolicy | Export-Csv compliance-retention-policies.csv

# Alert policies
Get-ProtectionAlert | Export-Csv compliance-alert-policies.csv
```

Refer to: 03-O365-SS-Audit-Operating-Deployment-Guide-v1.md for full PowerShell procedures.
COMPNOTE

    run_graph_query "Data Classification" "data-classification.json" \
        "/dataClassification/sensitiveTypes" "true"

    OUTPUT_DIR="$saved_output_dir"
    log_success "Compliance queries complete: ${QUERY_SUCCESS} succeeded, ${QUERY_FAILED} failed"
}

#-------------------------------------------------------------------------------
# PHASE 8: Generate Summary Report
#-------------------------------------------------------------------------------

generate_report() {
    log_section "PHASE 8: Generate Summary Report"

    local report_file="${OUTPUT_DIR}/O365-Audit-Report.md"
    local timestamp
    timestamp=$(date -u +"%Y-%m-%d %H:%M:%S UTC")

    # Gather stats
    local user_count="N/A"
    local guest_count="N/A"
    local global_admin_count="N/A"
    local ca_policy_count="N/A"
    local sp_count="N/A"
    local group_count="N/A"
    local secure_score="N/A"
    local secure_score_max="N/A"

    if [[ -f "${OUTPUT_DIR}/02-identity/users-all.json" ]]; then
        user_count=$(jq 'length' "${OUTPUT_DIR}/02-identity/users-all.json" 2>/dev/null) || user_count="N/A"
    fi
    if [[ -f "${OUTPUT_DIR}/02-identity/users-guests.json" ]]; then
        guest_count=$(jq 'length' "${OUTPUT_DIR}/02-identity/users-guests.json" 2>/dev/null) || guest_count="N/A"
    fi
    if [[ -f "${OUTPUT_DIR}/02-identity/global-admins.json" ]]; then
        global_admin_count=$(jq '.value | length // 0' "${OUTPUT_DIR}/02-identity/global-admins.json" 2>/dev/null) || global_admin_count="N/A"
    fi
    if [[ -f "${OUTPUT_DIR}/02-identity/conditional-access-policies.json" ]]; then
        ca_policy_count=$(jq 'length' "${OUTPUT_DIR}/02-identity/conditional-access-policies.json" 2>/dev/null) || ca_policy_count="N/A"
    fi
    if [[ -f "${OUTPUT_DIR}/02-identity/service-principals.json" ]]; then
        sp_count=$(jq 'length' "${OUTPUT_DIR}/02-identity/service-principals.json" 2>/dev/null) || sp_count="N/A"
    fi
    if [[ -f "${OUTPUT_DIR}/02-identity/groups-security.json" ]]; then
        group_count=$(jq 'length' "${OUTPUT_DIR}/02-identity/groups-security.json" 2>/dev/null) || group_count="N/A"
    fi
    if [[ -f "${OUTPUT_DIR}/03-security/secure-score.json" ]]; then
        secure_score=$(jq '.[0].currentScore // "N/A"' "${OUTPUT_DIR}/03-security/secure-score.json" 2>/dev/null) || secure_score="N/A"
        secure_score_max=$(jq '.[0].maxScore // "N/A"' "${OUTPUT_DIR}/03-security/secure-score.json" 2>/dev/null) || secure_score_max="N/A"
    fi

    cat > "$report_file" << REPORTEOF
# O365 Tenancy Snapshot Audit Report

**Generated:** ${timestamp}
**Tool:** ${SCRIPT_NAME} v${SCRIPT_VERSION}
**Method:** Pure Azure CLI (Microsoft Graph API via \`az rest\`)

---

## Executive Summary

This report contains the results of an automated M365/Entra ID audit using
Microsoft Graph API. All data was collected using Azure CLI with no PowerShell
dependencies.

### Key Metrics

| Metric | Value |
|--------|-------|
| Total Users | ${user_count} |
| Guest Users | ${guest_count} |
| Global Administrators | ${global_admin_count} |
| Conditional Access Policies | ${ca_policy_count} |
| Service Principals | ${sp_count} |
| Security Groups | ${group_count} |
| Microsoft Secure Score | ${secure_score} / ${secure_score_max} |

---

## Coverage Summary

| Area | Coverage | Notes |
|------|----------|-------|
| Identity & Access | ✅ Full | Users, roles, CA, PIM, service principals |
| Security | ✅ Full | Secure Score, alerts, incidents |
| Exchange Online | ⚠️ Limited | Domains only; transport rules require PowerShell |
| SharePoint/OneDrive | ⚠️ Limited | Sites via Graph; tenant settings require PowerShell |
| Teams | ⚠️ Limited | Teams list; policies require PowerShell |
| Compliance/DLP | ⚠️ Limited | Labels via Graph; DLP policies require PowerShell |

---

## Phase 1: Organization

- Organization details and verified domains

## Phase 2: Identity & Access

- All users with sign-in info
- Guest users inventory
- Global Administrators (critical: check count ≤5)
- Conditional Access policies
- Named locations
- Service principals and app registrations
- OAuth2 permission grants
- Security and M365 groups
- Administrative units
- PIM role assignments
- Authentication methods policy
- Security defaults status

## Phase 3: Security

- Microsoft Secure Score (current vs max)
- Secure Score control profiles
- Security alerts (Defender)
- Security incidents
- Licensing inventory

## Phases 4-7: Exchange, SharePoint, Teams, Compliance

**Note:** Many features in these areas require PowerShell modules:
- Exchange Online: \`ExchangeOnlineManagement\`
- SharePoint: \`Microsoft.Online.SharePoint.PowerShell\`
- Teams: \`MicrosoftTeams\`
- Compliance: \`Connect-IPPSSession\`

See the \`*-REQUIRES-POWERSHELL.md\` files in each folder for PowerShell commands.

---

## Output Files

\`\`\`
${OUTPUT_DIR}/
├── 01-organization/
│   ├── organization.json
│   ├── verified-domains.json
│   └── directory-quota.json
├── 02-identity/
│   ├── users-all.json
│   ├── users-guests.json
│   ├── users-disabled.json
│   ├── mfa-registration-details.json
│   ├── directory-roles.json
│   ├── global-admins.json
│   ├── conditional-access-policies.json
│   ├── named-locations.json
│   ├── service-principals.json
│   ├── app-registrations.json
│   ├── oauth2-permission-grants.json
│   ├── groups-security.json
│   ├── groups-m365.json
│   ├── administrative-units.json
│   ├── pim-role-assignments.json
│   ├── pim-eligible-assignments.json
│   ├── authorization-policy.json
│   ├── authentication-methods-policy.json
│   ├── security-defaults.json
│   └── signin-logs-sample.json
├── 03-security/
│   ├── secure-score.json
│   ├── secure-score-controls.json
│   ├── security-alerts.json
│   ├── security-alerts-v2.json
│   ├── security-incidents.json
│   └── subscribed-skus.json
├── 04-exchange/
│   ├── domains.json
│   ├── accepted-domains.json
│   └── EXCHANGE-REQUIRES-POWERSHELL.md
├── 05-sharepoint/
│   ├── sites.json
│   ├── root-site.json
│   └── SHAREPOINT-REQUIRES-POWERSHELL.md
├── 06-teams/
│   ├── teams.json
│   └── TEAMS-REQUIRES-POWERSHELL.md
├── 07-compliance/
│   ├── sensitivity-labels.json
│   └── COMPLIANCE-REQUIRES-POWERSHELL.md
└── O365-Audit-Report.md
\`\`\`

---

## Next Steps

1. **Review Global Administrators** - Should be ≤5 accounts
2. **Check Conditional Access** - Verify MFA policies exist
3. **Verify Security Defaults** - Disabled if CA policies active
4. **Run PowerShell collection** - For Exchange, SharePoint, Teams, Compliance
5. **Analyze Secure Score** - Review improvement actions
6. **Map to compliance frameworks** - MCSB, ISO 27001, GDPR

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
run_org_discovery
run_identity_queries
run_security_queries
run_exchange_queries
run_sharepoint_queries
run_teams_queries
run_compliance_queries
generate_report

# Calculate elapsed time
END_TIME=$(date +%s)
ELAPSED=$((END_TIME - START_TIME))
ELAPSED_MIN=$((ELAPSED / 60))
ELAPSED_SEC=$((ELAPSED % 60))

# Final summary
echo ""
echo -e "${BOLD}================================================================${NC}"
echo -e "${GREEN}${BOLD}  O365 Audit Complete!${NC}"
echo -e "${BOLD}================================================================${NC}"
echo ""
echo "  Duration:    ${ELAPSED_MIN}m ${ELAPSED_SEC}s"
echo "  Output:      ${OUTPUT_DIR}"
echo ""
echo "  Key files:"
echo "    ${OUTPUT_DIR}/O365-Audit-Report.md"
echo "    ${OUTPUT_DIR}/02-identity/global-admins.json"
echo "    ${OUTPUT_DIR}/02-identity/conditional-access-policies.json"
echo "    ${OUTPUT_DIR}/03-security/secure-score.json"
echo ""
echo "  For full Exchange/SharePoint/Teams/Compliance coverage,"
echo "  run the PowerShell commands in the *-REQUIRES-POWERSHELL.md files."
echo ""
echo "  No PowerShell. Pure Azure CLI + Microsoft Graph API."
echo ""
