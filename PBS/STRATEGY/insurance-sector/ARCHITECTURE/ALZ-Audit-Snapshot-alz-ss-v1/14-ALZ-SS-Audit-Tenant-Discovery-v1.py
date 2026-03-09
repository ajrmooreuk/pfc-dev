#!/usr/bin/env python3
"""
ALZ Tenant & Management Group Discovery
========================================
Automated discovery of Azure tenant(s), management groups, and subscriptions.
Designed for minimal team involvement - single command execution.

Features:
    - Single vs multi-tenant detection
    - Complete MG hierarchy traversal
    - Subscription enumeration with metadata
    - Resource counts per subscription
    - Export to JSON for architecture planning

Requirements:
    pip install azure-identity azure-mgmt-resource azure-mgmt-managementgroups azure-mgmt-resourcegraph

Authentication Options (in order of preference):
    1. Azure CLI: az login (interactive, good for one-time audits)
    2. Service Principal: Set AZURE_CLIENT_ID, AZURE_TENANT_ID, AZURE_CLIENT_SECRET
    3. Managed Identity: When running from Azure VM/Container/Function

Usage:
    # Single tenant discovery (uses current login)
    python 14-ALZ-SS-Audit-Tenant-Discovery-v1.py --output ./tenant-audit

    # Multi-tenant discovery (specify tenant IDs)
    python 14-ALZ-SS-Audit-Tenant-Discovery-v1.py --tenants "tenant1-guid,tenant2-guid" --output ./tenant-audit

    # Service principal auth (for automation)
    export AZURE_CLIENT_ID="app-id"
    export AZURE_TENANT_ID="tenant-id"
    export AZURE_CLIENT_SECRET="secret"
    python 14-ALZ-SS-Audit-Tenant-Discovery-v1.py --output ./tenant-audit
"""

import argparse
import json
import logging
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any

try:
    from azure.identity import DefaultAzureCredential, ClientSecretCredential
    from azure.mgmt.resource import SubscriptionClient
    from azure.mgmt.managementgroups import ManagementGroupsAPI
    from azure.mgmt.resourcegraph import ResourceGraphClient
    from azure.mgmt.resourcegraph.models import QueryRequest
except ImportError as e:
    print(f"Missing required package: {e}")
    print("\nInstall requirements:")
    print("  pip install azure-identity azure-mgmt-resource azure-mgmt-managementgroups azure-mgmt-resourcegraph")
    sys.exit(1)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)-8s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)


class TenantDiscovery:
    """
    Discovers Azure tenant structure including management groups and subscriptions.
    """

    def __init__(self, credential=None, tenant_id: Optional[str] = None):
        """
        Initialize discovery client.

        Args:
            credential: Azure credential (uses DefaultAzureCredential if None)
            tenant_id: Specific tenant ID (auto-detects if None)
        """
        self.credential = credential or DefaultAzureCredential()
        self.tenant_id = tenant_id

        # Initialize clients
        self.subscription_client = SubscriptionClient(self.credential)
        self.mg_client = ManagementGroupsAPI(self.credential)
        self.resource_graph = ResourceGraphClient(self.credential)

    def get_tenant_info(self) -> Dict[str, Any]:
        """Get current tenant information."""
        tenants = list(self.subscription_client.tenants.list())

        tenant_info = {
            "discoveredTenants": len(tenants),
            "tenants": []
        }

        for tenant in tenants:
            tenant_info["tenants"].append({
                "tenantId": tenant.tenant_id,
                "displayName": getattr(tenant, 'display_name', None),
                "tenantCategory": getattr(tenant, 'tenant_category', None),
                "defaultDomain": getattr(tenant, 'default_domain', None),
                "domains": getattr(tenant, 'domains', [])
            })

        return tenant_info

    def get_management_groups(self) -> List[Dict[str, Any]]:
        """Get all management groups with hierarchy."""
        management_groups = []

        try:
            mgs = self.mg_client.management_groups.list()
            for mg in mgs:
                mg_details = self._get_mg_details(mg.name)
                management_groups.append(mg_details)
        except Exception as e:
            logger.warning(f"Could not enumerate management groups: {e}")
            logger.info("This may require elevated permissions (Management Group Reader)")

        return management_groups

    def _get_mg_details(self, mg_name: str) -> Dict[str, Any]:
        """Get detailed information for a management group."""
        try:
            mg = self.mg_client.management_groups.get(
                group_id=mg_name,
                expand="children",
                recurse=True
            )

            return {
                "id": mg.id,
                "name": mg.name,
                "displayName": mg.display_name,
                "tenantId": mg.tenant_id,
                "type": mg.type,
                "parentId": mg.details.parent.id if mg.details and mg.details.parent else None,
                "children": self._parse_children(mg.children) if mg.children else []
            }
        except Exception as e:
            logger.debug(f"Could not get details for MG {mg_name}: {e}")
            return {"name": mg_name, "error": str(e)}

    def _parse_children(self, children) -> List[Dict[str, Any]]:
        """Parse management group children recursively."""
        result = []
        for child in children:
            child_data = {
                "id": child.id,
                "name": child.name,
                "displayName": child.display_name,
                "type": child.type
            }
            if child.children:
                child_data["children"] = self._parse_children(child.children)
            result.append(child_data)
        return result

    def get_subscriptions(self) -> List[Dict[str, Any]]:
        """Get all accessible subscriptions with metadata."""
        subscriptions = []

        for sub in self.subscription_client.subscriptions.list():
            sub_data = {
                "subscriptionId": sub.subscription_id,
                "displayName": sub.display_name,
                "state": sub.state.value if sub.state else None,
                "tenantId": sub.tenant_id,
                "subscriptionPolicies": {
                    "locationPlacementId": sub.subscription_policies.location_placement_id if sub.subscription_policies else None,
                    "quotaId": sub.subscription_policies.quota_id if sub.subscription_policies else None,
                    "spendingLimit": sub.subscription_policies.spending_limit.value if sub.subscription_policies and sub.subscription_policies.spending_limit else None
                },
                "authorizationSource": sub.authorization_source,
                "managedByTenants": [t.tenant_id for t in sub.managed_by_tenants] if sub.managed_by_tenants else []
            }

            # Get resource count for this subscription
            if sub.state and sub.state.value == "Enabled":
                sub_data["resourceCount"] = self._get_resource_count(sub.subscription_id)

            subscriptions.append(sub_data)

        return subscriptions

    def _get_resource_count(self, subscription_id: str) -> int:
        """Get resource count for a subscription using Resource Graph."""
        try:
            request = QueryRequest(
                subscriptions=[subscription_id],
                query="resources | summarize count()"
            )
            response = self.resource_graph.resources(request)
            if response.data:
                return response.data[0].get('count_', 0)
        except Exception as e:
            logger.debug(f"Could not get resource count for {subscription_id}: {e}")
        return -1

    def get_subscription_mg_mapping(self, subscriptions: List[Dict]) -> Dict[str, str]:
        """Map subscriptions to their parent management groups."""
        mapping = {}

        try:
            request = QueryRequest(
                subscriptions=[s["subscriptionId"] for s in subscriptions if s.get("state") == "Enabled"],
                query="""
                resourcecontainers
                | where type == 'microsoft.resources/subscriptions'
                | extend mgParent = properties.managementGroupAncestorsChain
                | project subscriptionId, mgParent
                """
            )
            response = self.resource_graph.resources(request)

            for item in response.data or []:
                sub_id = item.get('subscriptionId')
                mg_chain = item.get('mgParent', [])
                if mg_chain:
                    mapping[sub_id] = {
                        "directParent": mg_chain[0].get('name') if mg_chain else None,
                        "ancestorChain": [mg.get('name') for mg in mg_chain]
                    }
        except Exception as e:
            logger.warning(f"Could not get MG mapping: {e}")

        return mapping

    def run_full_discovery(self) -> Dict[str, Any]:
        """Run complete tenant discovery and return structured results."""
        logger.info("Starting tenant discovery...")

        discovery_result = {
            "metadata": {
                "discoveryTimestamp": datetime.utcnow().isoformat() + "Z",
                "discoveryTool": "ALZ-SS-Audit-Tenant-Discovery-v1",
                "version": "1.0.0"
            },
            "tenantInfo": {},
            "managementGroups": [],
            "subscriptions": [],
            "subscriptionMgMapping": {},
            "summary": {}
        }

        # Step 1: Get tenant info
        logger.info("Discovering tenant information...")
        discovery_result["tenantInfo"] = self.get_tenant_info()

        is_multi_tenant = discovery_result["tenantInfo"]["discoveredTenants"] > 1
        logger.info(f"Tenant mode: {'MULTI-TENANT' if is_multi_tenant else 'SINGLE TENANT'}")

        # Step 2: Get management groups
        logger.info("Discovering management groups...")
        discovery_result["managementGroups"] = self.get_management_groups()
        logger.info(f"Found {len(discovery_result['managementGroups'])} management group(s)")

        # Step 3: Get subscriptions
        logger.info("Discovering subscriptions...")
        discovery_result["subscriptions"] = self.get_subscriptions()
        enabled_subs = [s for s in discovery_result["subscriptions"] if s.get("state") == "Enabled"]
        logger.info(f"Found {len(discovery_result['subscriptions'])} subscription(s) ({len(enabled_subs)} enabled)")

        # Step 4: Map subscriptions to MGs
        logger.info("Mapping subscriptions to management groups...")
        discovery_result["subscriptionMgMapping"] = self.get_subscription_mg_mapping(discovery_result["subscriptions"])

        # Step 5: Generate summary
        total_resources = sum(s.get("resourceCount", 0) for s in discovery_result["subscriptions"] if s.get("resourceCount", 0) > 0)

        discovery_result["summary"] = {
            "isMultiTenant": is_multi_tenant,
            "tenantCount": discovery_result["tenantInfo"]["discoveredTenants"],
            "managementGroupCount": len(discovery_result["managementGroups"]),
            "subscriptionCount": len(discovery_result["subscriptions"]),
            "enabledSubscriptionCount": len(enabled_subs),
            "totalResourceCount": total_resources,
            "subscriptionsByTenant": self._group_subs_by_tenant(discovery_result["subscriptions"])
        }

        return discovery_result

    def _group_subs_by_tenant(self, subscriptions: List[Dict]) -> Dict[str, int]:
        """Group subscription counts by tenant ID."""
        counts = {}
        for sub in subscriptions:
            tenant = sub.get("tenantId", "unknown")
            counts[tenant] = counts.get(tenant, 0) + 1
        return counts


def generate_architecture_diagram(discovery: Dict) -> str:
    """Generate Mermaid diagram of the tenant structure."""
    lines = ["```mermaid", "flowchart TB"]

    # Add tenants
    for i, tenant in enumerate(discovery["tenantInfo"]["tenants"]):
        tenant_id = tenant["tenantId"][:8]
        display = tenant.get("displayName") or tenant["tenantId"][:12]
        lines.append(f'    T{i}["{display}<br/>Tenant: {tenant_id}..."]')

    # Add management groups
    mg_map = {}
    for i, mg in enumerate(discovery["managementGroups"]):
        mg_id = f"MG{i}"
        mg_map[mg.get("id", mg.get("name"))] = mg_id
        display = mg.get("displayName") or mg.get("name")
        lines.append(f'    {mg_id}["{display}"]')

        # Connect to parent
        parent_id = mg.get("parentId")
        if parent_id and parent_id in mg_map:
            lines.append(f'    {mg_map[parent_id]} --> {mg_id}')
        elif not parent_id:
            lines.append(f'    T0 --> {mg_id}')

    # Add subscriptions (limit to 10 for readability)
    enabled_subs = [s for s in discovery["subscriptions"] if s.get("state") == "Enabled"][:10]
    for i, sub in enumerate(enabled_subs):
        sub_id = f"S{i}"
        display = sub.get("displayName", sub["subscriptionId"][:12])
        resources = sub.get("resourceCount", 0)
        lines.append(f'    {sub_id}("{display}<br/>{resources} resources")')

        # Connect to parent MG
        mapping = discovery["subscriptionMgMapping"].get(sub["subscriptionId"], {})
        parent = mapping.get("directParent")
        if parent:
            for mg_full_id, mg_short in mg_map.items():
                if parent in mg_full_id:
                    lines.append(f'    {mg_short} --> {sub_id}')
                    break

    if len(discovery["subscriptions"]) > 10:
        lines.append(f'    MORE["... and {len(discovery["subscriptions"]) - 10} more subscriptions"]')

    lines.append("```")
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(
        description="ALZ Tenant & Management Group Discovery",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )

    parser.add_argument(
        "--output", "-o",
        default="./tenant-discovery",
        help="Output directory (default: ./tenant-discovery)"
    )
    parser.add_argument(
        "--tenants", "-t",
        help="Comma-separated tenant IDs for multi-tenant discovery"
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Verbose logging"
    )

    args = parser.parse_args()

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    logger.info("=" * 60)
    logger.info("ALZ Tenant & Management Group Discovery")
    logger.info("=" * 60)

    # Create output directory
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)

    try:
        # Initialize and run discovery
        discovery = TenantDiscovery()
        result = discovery.run_full_discovery()

        # Save full discovery JSON
        discovery_file = output_dir / "tenant-discovery.json"
        with open(discovery_file, 'w') as f:
            json.dump(result, f, indent=2, default=str)
        logger.info(f"Full discovery saved to: {discovery_file}")

        # Save subscriptions list (for executor input)
        subs_file = output_dir / "subscriptions.json"
        with open(subs_file, 'w') as f:
            json.dump(result["subscriptions"], f, indent=2)
        logger.info(f"Subscriptions list saved to: {subs_file}")

        # Generate architecture diagram
        diagram = generate_architecture_diagram(result)
        diagram_file = output_dir / "tenant-architecture.md"
        with open(diagram_file, 'w') as f:
            f.write("# Tenant Architecture\n\n")
            f.write(f"Generated: {result['metadata']['discoveryTimestamp']}\n\n")
            f.write("## Summary\n\n")
            f.write(f"- **Tenant Mode**: {'Multi-Tenant' if result['summary']['isMultiTenant'] else 'Single Tenant'}\n")
            f.write(f"- **Tenants**: {result['summary']['tenantCount']}\n")
            f.write(f"- **Management Groups**: {result['summary']['managementGroupCount']}\n")
            f.write(f"- **Subscriptions**: {result['summary']['subscriptionCount']} ({result['summary']['enabledSubscriptionCount']} enabled)\n")
            f.write(f"- **Total Resources**: {result['summary']['totalResourceCount']}\n\n")
            f.write("## Architecture Diagram\n\n")
            f.write(diagram)
        logger.info(f"Architecture diagram saved to: {diagram_file}")

        # Print summary
        logger.info("=" * 60)
        logger.info("DISCOVERY SUMMARY")
        logger.info("=" * 60)
        logger.info(f"Tenant Mode: {'MULTI-TENANT' if result['summary']['isMultiTenant'] else 'SINGLE TENANT'}")
        logger.info(f"Tenants: {result['summary']['tenantCount']}")
        logger.info(f"Management Groups: {result['summary']['managementGroupCount']}")
        logger.info(f"Subscriptions: {result['summary']['enabledSubscriptionCount']} enabled / {result['summary']['subscriptionCount']} total")
        logger.info(f"Total Resources: {result['summary']['totalResourceCount']}")
        logger.info("")
        logger.info("Subscriptions by Tenant:")
        for tenant, count in result['summary']['subscriptionsByTenant'].items():
            logger.info(f"  {tenant[:12]}...: {count} subscription(s)")

        return 0

    except Exception as e:
        logger.error(f"Discovery failed: {e}")
        logger.error("Ensure you are logged in: az login")
        return 1


if __name__ == "__main__":
    sys.exit(main())
