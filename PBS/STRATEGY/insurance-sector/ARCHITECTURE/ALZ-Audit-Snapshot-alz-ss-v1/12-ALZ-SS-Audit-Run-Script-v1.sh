#!/bin/bash
#===============================================================================
# ALZ Snapshot Audit - Automated Execution Script
#===============================================================================
# 
# This script automates the entire ALZ audit data collection process.
# It handles authentication, runs all queries, and generates reports.
#
# Usage:
#   ./run_audit.sh                    # Run with defaults
#   ./run_audit.sh --subscriptions "sub1,sub2"  # Filter subscriptions
#   ./run_audit.sh --output ./my-exports        # Custom output directory
#
#===============================================================================

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_DIR="${OUTPUT_DIR:-./alz-audit-exports-$(date +%Y%m%d-%H%M%S)}"
PYTHON_SCRIPT="${SCRIPT_DIR}/alz_audit_executor.py"
QUERIES_FILE="${SCRIPT_DIR}/05-ALZ-SS-Audit-KQL-Queries-v1.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

#-------------------------------------------------------------------------------
# Functions
#-------------------------------------------------------------------------------

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        log_error "Python 3 is required but not installed."
        exit 1
    fi
    
    # Check Azure CLI
    if ! command -v az &> /dev/null; then
        log_error "Azure CLI is required but not installed."
        log_info "Install: curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash"
        exit 1
    fi
    
    # Check Python packages
    python3 -c "import azure.identity" 2>/dev/null || {
        log_warning "Missing Python packages. Installing..."
        pip install azure-identity azure-mgmt-resourcegraph azure-mgmt-resource pandas openpyxl --quiet
    }
    
    log_success "Prerequisites OK"
}

check_azure_login() {
    log_info "Checking Azure authentication..."
    
    if ! az account show &> /dev/null; then
        log_warning "Not logged in to Azure. Starting login..."
        az login
    fi
    
    # Display current context
    TENANT_ID=$(az account show --query tenantId -o tsv)
    SUBSCRIPTION=$(az account show --query name -o tsv)
    USER=$(az account show --query user.name -o tsv)
    
    log_success "Authenticated as: $USER"
    log_info "Tenant: $TENANT_ID"
    log_info "Default subscription: $SUBSCRIPTION"
}

list_subscriptions() {
    log_info "Available subscriptions:"
    az account list --query "[?state=='Enabled'].{Name:name, ID:id}" -o table
}

run_audit() {
    log_info "Starting ALZ Snapshot Audit..."
    log_info "Output directory: $OUTPUT_DIR"
    
    # Build command
    CMD="python3 $PYTHON_SCRIPT --output $OUTPUT_DIR"
    
    # Add config file if exists
    if [[ -f "$QUERIES_FILE" ]]; then
        CMD="$CMD --config $QUERIES_FILE"
        log_info "Using queries from: $QUERIES_FILE"
    else
        log_info "Using built-in queries"
    fi
    
    # Add subscription filter if provided
    if [[ -n "$SUBSCRIPTIONS" ]]; then
        CMD="$CMD --subscriptions $SUBSCRIPTIONS"
    fi
    
    # Execute
    echo ""
    log_info "Executing queries..."
    echo "================================================================================"
    
    $CMD
    
    echo "================================================================================"
    log_success "Audit data collection complete!"
}

run_defender_export() {
    log_info "Exporting Defender for Cloud data..."
    
    # Get secure scores
    for sub in $(az account list --query "[?state=='Enabled'].id" -o tsv); do
        log_info "Processing subscription: $sub"
        
        # Secure Score
        az security secure-score list --subscription "$sub" \
            -o json > "$OUTPUT_DIR/defender-secure-score-${sub:0:8}.json" 2>/dev/null || true
        
        # Regulatory compliance (MCSB)
        az security regulatory-compliance-controls list \
            --standard-name "Microsoft-cloud-security-benchmark" \
            --subscription "$sub" \
            -o json > "$OUTPUT_DIR/mcsb-v2-controls-${sub:0:8}.json" 2>/dev/null || true
    done
    
    log_success "Defender data exported"
}

generate_summary_report() {
    log_info "Generating summary report..."
    
    # Create summary markdown
    cat > "$OUTPUT_DIR/AUDIT_SUMMARY.md" << EOF
# ALZ Snapshot Audit Summary

**Generated:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")
**Tenant:** $TENANT_ID
**Auditor:** $USER

## Files Generated

$(ls -la "$OUTPUT_DIR" | grep -v "^d" | awk '{print "- " $NF " (" $5 " bytes)"}')

## Quick Stats

$(if [[ -f "$OUTPUT_DIR/inventory-by-type.json" ]]; then
    echo "### Resource Count by Type"
    echo ""
    echo "\`\`\`"
    cat "$OUTPUT_DIR/inventory-by-type.json" | python3 -c "
import json, sys
data = json.load(sys.stdin)
for item in data[:15]:
    print(f\"{item.get('type', 'unknown'):60} {item.get('ResourceCount', 0):>6}\")
if len(data) > 15:
    print(f'... and {len(data) - 15} more resource types')
" 2>/dev/null || echo "Unable to parse inventory"
    echo "\`\`\`"
fi)

## Next Steps

1. Review \`execution_summary.json\` for query results
2. Import \`*.csv\` files to Excel for analysis
3. Review \`defender-findings.json\` for security gaps
4. Map findings to MCSB controls using compliance mapping

EOF

    log_success "Summary report generated: $OUTPUT_DIR/AUDIT_SUMMARY.md"
}

show_help() {
    cat << EOF
ALZ Snapshot Audit - Automated Execution Script

Usage: $0 [OPTIONS]

Options:
    -o, --output DIR        Output directory (default: ./alz-audit-exports-TIMESTAMP)
    -s, --subscriptions IDs Comma-separated subscription IDs to query
    -c, --config FILE       Custom queries JSON file
    -d, --defender          Also export Defender for Cloud data
    -l, --list-subs         List available subscriptions and exit
    -h, --help              Show this help message

Examples:
    $0                                  # Run with defaults (all subscriptions)
    $0 -s "sub1-guid,sub2-guid"        # Filter to specific subscriptions
    $0 -o ./my-audit -d                 # Custom output + Defender data
    $0 -l                               # List subscriptions

EOF
}

#-------------------------------------------------------------------------------
# Main
#-------------------------------------------------------------------------------

# Parse arguments
SUBSCRIPTIONS=""
INCLUDE_DEFENDER=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -o|--output)
            OUTPUT_DIR="$2"
            shift 2
            ;;
        -s|--subscriptions)
            SUBSCRIPTIONS="$2"
            shift 2
            ;;
        -c|--config)
            QUERIES_FILE="$2"
            shift 2
            ;;
        -d|--defender)
            INCLUDE_DEFENDER=true
            shift
            ;;
        -l|--list-subs)
            check_azure_login
            list_subscriptions
            exit 0
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Execute
echo ""
echo "================================================================================"
echo "                    ALZ SNAPSHOT AUDIT - DATA COLLECTION                        "
echo "================================================================================"
echo ""

check_prerequisites
check_azure_login
echo ""

# Create output directory
mkdir -p "$OUTPUT_DIR"

run_audit

if [[ "$INCLUDE_DEFENDER" == true ]]; then
    run_defender_export
fi

generate_summary_report

echo ""
log_success "Audit complete! Results saved to: $OUTPUT_DIR"
echo ""
echo "Key files to review:"
echo "  - $OUTPUT_DIR/AUDIT_SUMMARY.md      (Quick overview)"
echo "  - $OUTPUT_DIR/execution_summary.json (Detailed results)"
echo "  - $OUTPUT_DIR/inventory-full.json    (All resources)"
echo "  - $OUTPUT_DIR/defender-findings.json (Security gaps)"
echo ""
