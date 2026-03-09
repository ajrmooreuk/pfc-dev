#!/bin/bash
#
# ALZ Full Automated Audit
# ========================
# Single command execution for complete Azure estate audit.
# Minimizes team involvement - just run and wait for results.
#
# Usage:
#   ./15-ALZ-SS-Audit-Full-Auto-v1.sh
#   ./15-ALZ-SS-Audit-Full-Auto-v1.sh --output /path/to/exports
#   ./15-ALZ-SS-Audit-Full-Auto-v1.sh --skip-tenant-discovery
#
# Prerequisites:
#   - Azure CLI installed and logged in (az login)
#   - Python 3.8+ with required packages
#   - Reader access to target subscriptions
#   - Management Group Reader (optional, for MG hierarchy)
#

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_DIR="${OUTPUT_DIR:-./alz-audit-$(date +%Y%m%d-%H%M%S)}"
SKIP_TENANT_DISCOVERY=false
SKIP_RESOURCE_QUERIES=false

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
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
            echo "ALZ Full Automated Audit"
            echo ""
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  -o, --output DIR           Output directory (default: ./alz-audit-TIMESTAMP)"
            echo "  --skip-tenant-discovery    Skip tenant/MG discovery step"
            echo "  --skip-resource-queries    Skip resource graph queries"
            echo "  -h, --help                 Show this help"
            echo ""
            echo "Prerequisites:"
            echo "  1. Azure CLI: az login"
            echo "  2. Python packages: pip install azure-identity azure-mgmt-resourcegraph azure-mgmt-resource azure-mgmt-managementgroups pandas"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check Azure CLI
    if ! command -v az &> /dev/null; then
        log_error "Azure CLI not found. Install from: https://docs.microsoft.com/cli/azure/install-azure-cli"
        exit 1
    fi

    # Check Azure login
    if ! az account show &> /dev/null; then
        log_error "Not logged in to Azure. Run: az login"
        exit 1
    fi

    # Check Python
    if ! command -v python3 &> /dev/null; then
        log_error "Python 3 not found"
        exit 1
    fi

    # Check Python packages
    python3 -c "import azure.identity, azure.mgmt.resourcegraph" 2>/dev/null || {
        log_warn "Missing Python packages. Installing..."
        pip install azure-identity azure-mgmt-resourcegraph azure-mgmt-resource azure-mgmt-managementgroups pandas openpyxl
    }

    log_success "Prerequisites check passed"
}

print_banner() {
    echo ""
    echo "============================================================"
    echo "  ALZ Full Automated Audit"
    echo "  $(date '+%Y-%m-%d %H:%M:%S')"
    echo "============================================================"
    echo ""
}

run_tenant_discovery() {
    log_info "Step 1/3: Running tenant & management group discovery..."

    python3 "${SCRIPT_DIR}/14-ALZ-SS-Audit-Tenant-Discovery-v1.py" \
        --output "${OUTPUT_DIR}/01-tenant-discovery"

    if [ -f "${OUTPUT_DIR}/01-tenant-discovery/tenant-discovery.json" ]; then
        log_success "Tenant discovery complete"

        # Extract summary
        TENANT_COUNT=$(jq -r '.summary.tenantCount' "${OUTPUT_DIR}/01-tenant-discovery/tenant-discovery.json")
        MG_COUNT=$(jq -r '.summary.managementGroupCount' "${OUTPUT_DIR}/01-tenant-discovery/tenant-discovery.json")
        SUB_COUNT=$(jq -r '.summary.enabledSubscriptionCount' "${OUTPUT_DIR}/01-tenant-discovery/tenant-discovery.json")

        echo "  - Tenants: ${TENANT_COUNT}"
        echo "  - Management Groups: ${MG_COUNT}"
        echo "  - Enabled Subscriptions: ${SUB_COUNT}"
    else
        log_warn "Tenant discovery output not found"
    fi
}

run_resource_queries() {
    log_info "Step 2/3: Running resource graph queries..."

    python3 "${SCRIPT_DIR}/11-ALZ-SS-Audit-Query-Executor-v1.py" \
        --config "${SCRIPT_DIR}/05-ALZ-SS-Audit-KQL-Queries-v1.json" \
        --output "${OUTPUT_DIR}/02-resource-inventory" \
        --format both

    if [ -f "${OUTPUT_DIR}/02-resource-inventory/execution_summary.json" ]; then
        log_success "Resource queries complete"

        # Extract summary
        SUCCESSFUL=$(jq -r '.successful' "${OUTPUT_DIR}/02-resource-inventory/execution_summary.json")
        FAILED=$(jq -r '.failed' "${OUTPUT_DIR}/02-resource-inventory/execution_summary.json")

        echo "  - Successful queries: ${SUCCESSFUL}"
        echo "  - Failed queries: ${FAILED}"
    else
        log_warn "Resource query output not found"
    fi
}

run_compliance_summary() {
    log_info "Step 3/3: Generating compliance summary..."

    # Create compliance summary from MCSB queries
    SUMMARY_FILE="${OUTPUT_DIR}/03-compliance-summary/compliance-summary.json"
    mkdir -p "${OUTPUT_DIR}/03-compliance-summary"

    # Use Resource Graph for quick compliance check
    az graph query -q "
        securityresources
        | where type == 'microsoft.security/securescores'
        | project subscriptionId, score = properties.score.current, max = properties.score.max
    " --output json > "${OUTPUT_DIR}/03-compliance-summary/secure-scores.json" 2>/dev/null || true

    az graph query -q "
        securityresources
        | where type == 'microsoft.security/assessments'
        | extend status = tostring(properties.status.code)
        | summarize
            Healthy = countif(status == 'Healthy'),
            Unhealthy = countif(status == 'Unhealthy'),
            NotApplicable = countif(status == 'NotApplicable')
    " --output json > "${OUTPUT_DIR}/03-compliance-summary/assessment-summary.json" 2>/dev/null || true

    log_success "Compliance summary complete"
}

generate_report() {
    log_info "Generating final report..."

    REPORT_FILE="${OUTPUT_DIR}/ALZ-Audit-Report.md"

    cat > "${REPORT_FILE}" << EOF
# ALZ Environment Audit Report

**Generated:** $(date '+%Y-%m-%d %H:%M:%S')
**Output Directory:** ${OUTPUT_DIR}

---

## Executive Summary

This report contains the results of an automated Azure environment audit
designed to support Azure Landing Zone (ALZ) planning and implementation.

## Audit Components

### 1. Tenant & Management Group Discovery
Location: \`01-tenant-discovery/\`

- Tenant structure and multi-tenant detection
- Management group hierarchy
- Subscription enumeration with resource counts

### 2. Resource Inventory
Location: \`02-resource-inventory/\`

- Complete resource inventory (JSON/CSV)
- Security configuration assessment
- Network topology mapping
- MCSB v1/v2 compliance checks

### 3. Compliance Summary
Location: \`03-compliance-summary/\`

- Defender for Cloud secure scores
- Assessment status summary

---

## Output Files

\`\`\`
${OUTPUT_DIR}/
├── 01-tenant-discovery/
│   ├── tenant-discovery.json      # Full tenant structure
│   ├── subscriptions.json         # Subscription list
│   └── tenant-architecture.md     # Mermaid diagram
├── 02-resource-inventory/
│   ├── *.json                     # Query results (JSON)
│   ├── *.csv                      # Query results (CSV)
│   └── execution_summary.json     # Execution log
├── 03-compliance-summary/
│   ├── secure-scores.json         # Defender scores
│   └── assessment-summary.json    # Assessment counts
└── ALZ-Audit-Report.md            # This report
\`\`\`

---

## Next Steps

1. Review tenant-discovery output to understand current structure
2. Analyze resource inventory for ALZ migration planning
3. Review compliance summary for security gaps
4. Use findings to inform ALZ target state design

---

## Compliance Frameworks Assessed

- Microsoft Cloud Security Benchmark (MCSB) v1 & v2
- NIST SP 800-53 Rev 5
- UK NCSC 14 Cloud Security Principles
- ISO 27001:2022

---

*Generated by ALZ-SS-Audit-Full-Auto-v1*
EOF

    log_success "Report generated: ${REPORT_FILE}"
}

# Main execution
print_banner

# Create output directory
mkdir -p "${OUTPUT_DIR}"
log_info "Output directory: ${OUTPUT_DIR}"

# Check prerequisites
check_prerequisites

# Get current account info
log_info "Current Azure context:"
az account show --query "{subscription:name, user:user.name, tenant:tenantId}" --output table

echo ""

# Run audit steps
if [ "$SKIP_TENANT_DISCOVERY" = false ]; then
    run_tenant_discovery
else
    log_warn "Skipping tenant discovery (--skip-tenant-discovery)"
fi

echo ""

if [ "$SKIP_RESOURCE_QUERIES" = false ]; then
    run_resource_queries
else
    log_warn "Skipping resource queries (--skip-resource-queries)"
fi

echo ""

run_compliance_summary

echo ""

generate_report

echo ""
echo "============================================================"
echo "  Audit Complete!"
echo "============================================================"
echo ""
echo "Results saved to: ${OUTPUT_DIR}"
echo ""
echo "Key files:"
echo "  - ${OUTPUT_DIR}/ALZ-Audit-Report.md"
echo "  - ${OUTPUT_DIR}/01-tenant-discovery/tenant-architecture.md"
echo "  - ${OUTPUT_DIR}/02-resource-inventory/execution_summary.json"
echo ""
