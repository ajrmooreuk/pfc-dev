#!/usr/bin/env python3
"""
ALZ Snapshot Audit - Automated Query Executor
==============================================
Executes all KQL queries against Azure Resource Graph API
and exports results to JSON/CSV files.

Requirements:
    pip install azure-identity azure-mgmt-resourcegraph azure-mgmt-resource pandas openpyxl

Authentication:
    - Azure CLI: az login (recommended)
    - Service Principal: Set environment variables
    - Managed Identity: When running in Azure

Usage:
    python alz_audit_executor.py --config queries.json --output ./exports
    python alz_audit_executor.py --subscription-filter "sub1,sub2" --output ./exports
"""

import argparse
import json
import os
import sys
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any

try:
    from azure.identity import DefaultAzureCredential, AzureCliCredential
    from azure.mgmt.resourcegraph import ResourceGraphClient
    from azure.mgmt.resourcegraph.models import QueryRequest, QueryRequestOptions
    from azure.mgmt.resource import SubscriptionClient
    import pandas as pd
except ImportError as e:
    print(f"Missing required package: {e}")
    print("\nInstall requirements:")
    print("  pip install azure-identity azure-mgmt-resourcegraph azure-mgmt-resource pandas openpyxl")
    sys.exit(1)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)-8s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)


class ALZAuditExecutor:
    """
    Executes Azure Resource Graph queries for ALZ Snapshot Audit.
    """
    
    def __init__(
        self,
        credential: Optional[Any] = None,
        subscription_ids: Optional[List[str]] = None
    ):
        """
        Initialize the executor.
        
        Args:
            credential: Azure credential object (uses DefaultAzureCredential if None)
            subscription_ids: List of subscription IDs to query (queries all if None)
        """
        self.credential = credential or DefaultAzureCredential()
        self.resource_graph_client = ResourceGraphClient(self.credential)
        self.subscription_client = SubscriptionClient(self.credential)
        
        # Get subscription IDs if not provided
        if subscription_ids:
            self.subscription_ids = subscription_ids
        else:
            self.subscription_ids = self._get_all_subscriptions()
        
        logger.info(f"Initialized with {len(self.subscription_ids)} subscription(s)")
    
    def _get_all_subscriptions(self) -> List[str]:
        """Get all accessible subscription IDs."""
        subscriptions = []
        for sub in self.subscription_client.subscriptions.list():
            if sub.state == "Enabled":
                subscriptions.append(sub.subscription_id)
        return subscriptions
    
    def execute_query(
        self,
        query: str,
        max_results: int = 10000
    ) -> Dict[str, Any]:
        """
        Execute a single KQL query against Azure Resource Graph.
        
        Args:
            query: KQL query string
            max_results: Maximum number of results to return
            
        Returns:
            Dict containing query results and metadata
        """
        all_results = []
        skip_token = None
        page_count = 0
        
        while True:
            page_count += 1
            
            # Configure query options
            options = QueryRequestOptions(
                top=min(1000, max_results - len(all_results)),
                skip_token=skip_token
            )
            
            # Build request
            request = QueryRequest(
                subscriptions=self.subscription_ids,
                query=query,
                options=options
            )
            
            try:
                # Execute query
                response = self.resource_graph_client.resources(request)
                
                # Collect results
                if response.data:
                    all_results.extend(response.data)
                
                # Check for more pages
                skip_token = response.skip_token
                if not skip_token or len(all_results) >= max_results:
                    break
                    
            except Exception as e:
                logger.error(f"Query execution failed: {e}")
                return {
                    "success": False,
                    "error": str(e),
                    "data": [],
                    "count": 0
                }
        
        return {
            "success": True,
            "data": all_results,
            "count": len(all_results),
            "total_records": getattr(response, 'total_records', len(all_results)),
            "pages": page_count
        }
    
    def execute_query_batch(
        self,
        queries: Dict[str, Dict],
        output_dir: Path,
        export_format: str = "both"
    ) -> Dict[str, Any]:
        """
        Execute multiple queries and export results.
        
        Args:
            queries: Dict of query definitions {name: {query, description, output_file}}
            output_dir: Directory to save results
            export_format: "json", "csv", or "both"
            
        Returns:
            Summary of execution results
        """
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
        
        results_summary = {
            "execution_time": datetime.utcnow().isoformat(),
            "subscriptions": self.subscription_ids,
            "total_queries": len(queries),
            "successful": 0,
            "failed": 0,
            "queries": {}
        }
        
        for query_name, query_def in queries.items():
            logger.info(f"Executing: {query_name}")
            
            query_text = query_def.get("query", query_def.get("kql", ""))
            description = query_def.get("description", "")
            output_file = query_def.get("output_file", f"{query_name}")
            
            if not query_text:
                logger.warning(f"Skipping {query_name}: No query text")
                continue
            
            # Execute query
            result = self.execute_query(query_text)
            
            query_result = {
                "description": description,
                "success": result["success"],
                "count": result["count"],
                "output_files": []
            }
            
            if result["success"]:
                results_summary["successful"] += 1
                
                # Export to JSON
                if export_format in ("json", "both"):
                    json_path = output_dir / f"{output_file}.json"
                    with open(json_path, 'w') as f:
                        json.dump(result["data"], f, indent=2, default=str)
                    query_result["output_files"].append(str(json_path))
                    logger.info(f"  → Exported {result['count']} records to {json_path.name}")
                
                # Export to CSV
                if export_format in ("csv", "both") and result["data"]:
                    try:
                        df = pd.DataFrame(result["data"])
                        csv_path = output_dir / f"{output_file}.csv"
                        df.to_csv(csv_path, index=False)
                        query_result["output_files"].append(str(csv_path))
                        logger.info(f"  → Exported {result['count']} records to {csv_path.name}")
                    except Exception as e:
                        logger.warning(f"  → CSV export failed: {e}")
            else:
                results_summary["failed"] += 1
                query_result["error"] = result.get("error", "Unknown error")
                logger.error(f"  → Failed: {query_result['error']}")
            
            results_summary["queries"][query_name] = query_result
        
        # Save execution summary
        summary_path = output_dir / "execution_summary.json"
        with open(summary_path, 'w') as f:
            json.dump(results_summary, f, indent=2)
        logger.info(f"\nExecution summary saved to {summary_path}")
        
        return results_summary


def load_queries_from_file(filepath: str) -> Dict[str, Dict]:
    """Load query definitions from JSON file."""
    with open(filepath) as f:
        data = json.load(f)
    
    # Handle different JSON structures
    queries = {}
    
    # Structure 1: {category: {queries: [...]}}
    if any(isinstance(v, dict) and "queries" in v for v in data.values() if isinstance(v, dict)):
        for category, category_data in data.items():
            if isinstance(category_data, dict) and "queries" in category_data:
                for query in category_data["queries"]:
                    name = query.get("name", f"{category}_{len(queries)}")
                    queries[name] = {
                        "query": query.get("query", query.get("kql", "")),
                        "description": query.get("description", ""),
                        "output_file": query.get("outputFile", name.replace(" ", "_").lower())
                    }
    
    # Structure 2: {name: {query: ...}}
    elif all(isinstance(v, dict) and ("query" in v or "kql" in v) for v in data.values() if isinstance(v, dict)):
        queries = data
    
    # Structure 3: [{name: ..., query: ...}]
    elif isinstance(data, list):
        for item in data:
            name = item.get("name", f"query_{len(queries)}")
            queries[name] = item
    
    return queries


# ============================================================================
# BUILT-IN QUERIES (if no config file provided)
# ============================================================================

BUILTIN_QUERIES = {
    "resource_inventory": {
        "query": """
resources
| project 
    name,
    type,
    resourceGroup,
    subscriptionId,
    location,
    sku = tostring(sku),
    kind,
    tags,
    id
| order by type asc, name asc
""",
        "description": "Complete resource inventory",
        "output_file": "inventory-full"
    },
    "resource_count_by_type": {
        "query": """
resources
| summarize ResourceCount = count() by type
| order by ResourceCount desc
""",
        "description": "Resource count by type",
        "output_file": "inventory-by-type"
    },
    "untagged_resources": {
        "query": """
resources
| where isnull(tags) or tags == '{}'
| project name, type, resourceGroup, subscriptionId, location, id
| order by type asc
""",
        "description": "Resources without tags (governance gap)",
        "output_file": "untagged-resources"
    },
    "storage_security": {
        "query": """
resources
| where type == 'microsoft.storage/storageaccounts'
| extend 
    httpsOnly = properties.supportsHttpsTrafficOnly,
    minTlsVersion = properties.minimumTlsVersion,
    allowBlobPublicAccess = properties.allowBlobPublicAccess,
    networkDefaultAction = properties.networkAcls.defaultAction
| project 
    name, 
    resourceGroup, 
    subscriptionId,
    location,
    httpsOnly,
    minTlsVersion,
    allowBlobPublicAccess,
    networkDefaultAction
""",
        "description": "Storage account security configuration (MCSB DP-3, NS-2)",
        "output_file": "storage-security"
    },
    "keyvault_config": {
        "query": """
resources
| where type == 'microsoft.keyvault/vaults'
| extend 
    enableRbacAuthorization = properties.enableRbacAuthorization,
    enableSoftDelete = properties.enableSoftDelete,
    enablePurgeProtection = properties.enablePurgeProtection,
    publicNetworkAccess = properties.publicNetworkAccess
| project 
    name, 
    resourceGroup, 
    subscriptionId,
    enableRbacAuthorization,
    enableSoftDelete,
    enablePurgeProtection,
    publicNetworkAccess
""",
        "description": "Key Vault configuration (MCSB DP-5, IM-1)",
        "output_file": "keyvaults"
    },
    "virtual_networks": {
        "query": """
resources
| where type == 'microsoft.network/virtualnetworks'
| extend 
    addressSpace = properties.addressSpace.addressPrefixes,
    dnsServers = properties.dhcpOptions.dnsServers,
    subnets = array_length(properties.subnets)
| project 
    name, 
    resourceGroup, 
    subscriptionId, 
    location,
    addressSpace,
    dnsServers,
    subnets
""",
        "description": "Virtual network inventory",
        "output_file": "vnets"
    },
    "subnets_nsg_status": {
        "query": """
resources
| where type == 'microsoft.network/virtualnetworks'
| mv-expand subnet = properties.subnets
| extend 
    subnetName = subnet.name,
    addressPrefix = subnet.properties.addressPrefix,
    nsgId = subnet.properties.networkSecurityGroup.id,
    hasNsg = isnotnull(subnet.properties.networkSecurityGroup.id)
| project 
    vnetName = name,
    subnetName,
    addressPrefix,
    hasNsg,
    nsgId,
    resourceGroup,
    subscriptionId
""",
        "description": "Subnets with NSG attachment status (MCSB NS-1)",
        "output_file": "subnets-nsg"
    },
    "vnet_peerings": {
        "query": """
resources
| where type == 'microsoft.network/virtualnetworks'
| mv-expand peering = properties.virtualNetworkPeerings
| extend 
    peeringName = peering.name,
    peeringState = peering.properties.peeringState,
    remoteVnet = peering.properties.remoteVirtualNetwork.id
| where isnotnull(peeringName)
| project 
    vnetName = name,
    peeringName,
    peeringState,
    remoteVnet,
    resourceGroup,
    subscriptionId
""",
        "description": "VNet peering relationships",
        "output_file": "peerings"
    },
    "network_security_groups": {
        "query": """
resources
| where type == 'microsoft.network/networksecuritygroups'
| project 
    name, 
    resourceGroup, 
    subscriptionId, 
    location,
    rulesCount = array_length(properties.securityRules),
    defaultRulesCount = array_length(properties.defaultSecurityRules)
""",
        "description": "Network Security Groups inventory",
        "output_file": "nsgs"
    },
    "rbac_assignments": {
        "query": """
authorizationresources
| where type == 'microsoft.authorization/roleassignments'
| extend 
    principalId = properties.principalId,
    principalType = properties.principalType,
    roleDefinitionId = properties.roleDefinitionId,
    scope = properties.scope
| project 
    name,
    principalId,
    principalType,
    roleDefinitionId,
    scope
""",
        "description": "RBAC role assignments",
        "output_file": "rbac-assignments"
    },
    "managed_identities": {
        "query": """
resources
| where identity.type has 'SystemAssigned' or identity.type has 'UserAssigned'
| extend 
    identityType = identity.type,
    principalId = identity.principalId
| project 
    name, 
    type, 
    resourceGroup, 
    subscriptionId,
    identityType,
    principalId
""",
        "description": "Resources with managed identities (MCSB IM-3)",
        "output_file": "managed-identities"
    },
    "sql_databases": {
        "query": """
resources
| where type == 'microsoft.sql/servers/databases' or type == 'microsoft.sql/servers'
| extend 
    minTlsVersion = properties.minimalTlsVersion,
    publicNetworkAccess = properties.publicNetworkAccess
| project 
    name, 
    type,
    resourceGroup, 
    subscriptionId,
    location,
    minTlsVersion,
    publicNetworkAccess
""",
        "description": "SQL Server and Database inventory",
        "output_file": "sql-databases"
    },
    "app_services": {
        "query": """
resources
| where type == 'microsoft.web/sites'
| extend 
    httpsOnly = properties.httpsOnly,
    minTlsVersion = properties.siteConfig.minTlsVersion,
    ftpsState = properties.siteConfig.ftpsState
| project 
    name, 
    resourceGroup, 
    subscriptionId,
    location,
    kind,
    httpsOnly,
    minTlsVersion,
    ftpsState
""",
        "description": "App Service security configuration",
        "output_file": "app-services"
    },
    "policy_assignments": {
        "query": """
policyresources
| where type == 'microsoft.authorization/policyassignments'
| extend 
    displayName = properties.displayName,
    policyDefinitionId = properties.policyDefinitionId,
    scope = properties.scope,
    enforcementMode = properties.enforcementMode
| project 
    name,
    displayName,
    policyDefinitionId,
    scope,
    enforcementMode,
    subscriptionId
""",
        "description": "Azure Policy assignments",
        "output_file": "policy-assignments"
    },
    "defender_assessments": {
        "query": """
securityresources
| where type == 'microsoft.security/assessments'
| extend 
    displayName = properties.displayName,
    status = properties.status.code,
    severity = properties.metadata.severity,
    category = properties.metadata.categories[0]
| where status == 'Unhealthy'
| project 
    displayName,
    status,
    severity,
    category,
    resourceId = properties.resourceDetails.Id,
    subscriptionId
| order by severity asc
""",
        "description": "Defender for Cloud unhealthy assessments",
        "output_file": "defender-findings"
    },
    "disk_encryption": {
        "query": """
resources
| where type == 'microsoft.compute/disks'
| extend 
    encryptionType = properties.encryption.type,
    diskState = properties.diskState
| project 
    name, 
    resourceGroup, 
    subscriptionId,
    location,
    encryptionType,
    diskState,
    sku = sku.name
""",
        "description": "Disk encryption status (MCSB DP-4)",
        "output_file": "disk-encryption"
    },
    "private_endpoints": {
        "query": """
resources
| where type == 'microsoft.network/privateendpoints'
| extend 
    privateLinkServiceId = properties.privateLinkServiceConnections[0].properties.privateLinkServiceId,
    groupIds = properties.privateLinkServiceConnections[0].properties.groupIds
| project 
    name, 
    resourceGroup, 
    subscriptionId,
    location,
    privateLinkServiceId,
    groupIds
""",
        "description": "Private endpoints inventory (MCSB NS-2)",
        "output_file": "private-endpoints"
    },
    "public_ips": {
        "query": """
resources
| where type == 'microsoft.network/publicipaddresses'
| extend 
    ipAddress = properties.ipAddress,
    allocationMethod = properties.publicIPAllocationMethod,
    associatedResource = properties.ipConfiguration.id
| project 
    name, 
    resourceGroup, 
    subscriptionId,
    location,
    ipAddress,
    allocationMethod,
    associatedResource
""",
        "description": "Public IP addresses (exposure analysis)",
        "output_file": "public-ips"
    }
}


def main():
    parser = argparse.ArgumentParser(
        description="ALZ Snapshot Audit - Azure Resource Graph Query Executor",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Run all built-in queries
  python alz_audit_executor.py --output ./exports

  # Run queries from config file
  python alz_audit_executor.py --config queries.json --output ./exports

  # Filter to specific subscriptions
  python alz_audit_executor.py --subscriptions "sub1-guid,sub2-guid" --output ./exports

  # Export only JSON (no CSV)
  python alz_audit_executor.py --format json --output ./exports

  # Run a single ad-hoc query
  python alz_audit_executor.py --query "resources | summarize count() by type" --output ./exports
        """
    )
    
    parser.add_argument(
        "--config", "-c",
        help="Path to queries JSON config file (uses built-in queries if not provided)"
    )
    parser.add_argument(
        "--output", "-o",
        default="./alz-audit-exports",
        help="Output directory for results (default: ./alz-audit-exports)"
    )
    parser.add_argument(
        "--subscriptions", "-s",
        help="Comma-separated list of subscription IDs to query (default: all accessible)"
    )
    parser.add_argument(
        "--format", "-f",
        choices=["json", "csv", "both"],
        default="both",
        help="Export format (default: both)"
    )
    parser.add_argument(
        "--query", "-q",
        help="Execute a single ad-hoc query"
    )
    parser.add_argument(
        "--query-name",
        default="adhoc_query",
        help="Name for ad-hoc query output file"
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Enable verbose logging"
    )
    
    args = parser.parse_args()
    
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    # Parse subscription filter
    subscription_ids = None
    if args.subscriptions:
        subscription_ids = [s.strip() for s in args.subscriptions.split(",")]
    
    # Initialize executor
    logger.info("=" * 60)
    logger.info("ALZ Snapshot Audit - Query Executor")
    logger.info("=" * 60)
    
    try:
        executor = ALZAuditExecutor(subscription_ids=subscription_ids)
    except Exception as e:
        logger.error(f"Failed to initialize Azure connection: {e}")
        logger.error("Ensure you are logged in: az login")
        sys.exit(1)
    
    # Determine queries to run
    if args.query:
        # Single ad-hoc query
        queries = {
            args.query_name: {
                "query": args.query,
                "description": "Ad-hoc query",
                "output_file": args.query_name
            }
        }
    elif args.config:
        # Load from config file
        logger.info(f"Loading queries from: {args.config}")
        queries = load_queries_from_file(args.config)
    else:
        # Use built-in queries
        logger.info("Using built-in ALZ audit queries")
        queries = BUILTIN_QUERIES
    
    logger.info(f"Queries to execute: {len(queries)}")
    logger.info(f"Output directory: {args.output}")
    logger.info(f"Export format: {args.format}")
    logger.info("-" * 60)
    
    # Execute queries
    summary = executor.execute_query_batch(
        queries=queries,
        output_dir=Path(args.output),
        export_format=args.format
    )
    
    # Print summary
    logger.info("=" * 60)
    logger.info("EXECUTION SUMMARY")
    logger.info("=" * 60)
    logger.info(f"Total queries: {summary['total_queries']}")
    logger.info(f"Successful: {summary['successful']}")
    logger.info(f"Failed: {summary['failed']}")
    
    if summary['failed'] > 0:
        logger.warning("\nFailed queries:")
        for name, result in summary['queries'].items():
            if not result.get('success', True):
                logger.warning(f"  - {name}: {result.get('error', 'Unknown')}")
    
    logger.info(f"\nResults saved to: {args.output}")
    
    return 0 if summary['failed'] == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
