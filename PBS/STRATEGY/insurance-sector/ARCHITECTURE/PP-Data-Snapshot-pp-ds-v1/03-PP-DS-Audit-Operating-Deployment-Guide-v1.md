# Power Platform & Data Layer Snapshot Audit
## Operating & Deployment Guide

**Document Version:** 1.0.0
**Date:** February 2026
**Classification:** Vendor Operations Guide

---

## Quick Start

```powershell
# 1. Connect to Power Platform Admin
Install-Module -Name Microsoft.PowerApps.Administration.PowerShell
Add-PowerAppsAccount

# 2. Connect to Microsoft Graph (for Entra app registrations)
Connect-MgGraph -Scopes "Application.Read.All","Directory.Read.All"

# 3. Connect to Power BI
Install-Module -Name MicrosoftPowerBIMgmt
Connect-PowerBIServiceAccount

# 4. Connect to Azure (for Synapse/SQL/Fabric resources)
Connect-AzAccount -Tenant <tenant-id>

# 5. Run discovery
./04-PP-DS-Audit-Discovery-v1.ps1 -OutputPath ./pp-audit-$(Get-Date -Format yyyyMMdd)
```

---

## 1. Pre-Engagement Checklist

### 1.1 Client Information Required

| Item | Required | Notes |
|------|----------|-------|
| **Tenant ID** | ✅ | Entra ID tenant GUID |
| **PP Admin Contact** | ✅ | Power Platform administrator |
| **Data/BI Lead** | ✅ | Data architecture contact |
| **Acturis System Owner** | ✅ | Integration knowledge |
| **PP Licensing** | ✅ | Per-user/per-app, premium |
| **Fabric Capacity (if any)** | ✅ | F-SKU, trial, or none |
| **Synapse/SQL Resources** | ✅ | Instance names, subscriptions |
| **Acturis Integration Docs** | ⚪ | API specs, data flows |

### 1.2 Engagement Confirmation

```
□ SoW signed, NDA executed
□ Access requests submitted (PP Admin, Fabric Admin, SQL Reader)
□ Acturis integration documentation requested
□ Audit timeline confirmed (1 week)
□ Workshop date + attendees confirmed
```

---

## 2. Access & Permissions

### 2.1 Power Platform

```
Role: Power Platform Administrator (or delegated admin)
  OR: Environment Admin (per environment)
  + Service Admin (for tenant-level settings)
```

### 2.2 Fabric / Power BI

```
Role: Fabric Administrator (for capacity/workspace discovery)
  OR: Workspace Admin/Member (per workspace)
  + Power BI Admin (for tenant settings)
```

### 2.3 Azure Data Resources

```
Scope: Subscription(s) containing Synapse/SQL/Storage
Roles:
├── Reader                    # Resource inventory
├── SQL DB Contributor        # SQL metadata (read)
├── Synapse Contributor       # Synapse workspace (read)
└── Storage Blob Data Reader  # OneLake/blob access
```

### 2.4 Access Verification

```powershell
# Power Platform
Get-AdminPowerAppEnvironment | Select DisplayName, EnvironmentName

# Power BI
Get-PowerBIWorkspace -Scope Organization -First 5

# Azure
az graph query -q "resources | where type contains 'synapse' or type contains 'sql' | summarize count() by type"

# Fabric (REST)
Invoke-RestMethod -Uri "https://api.fabric.microsoft.com/v1/admin/capacities" -Headers @{Authorization="Bearer $token"}
```

---

## 3. Data Collection

### 3.1 Phase 1: Power Platform Environments & DLP

```powershell
# --- Environment Inventory ---
$environments = Get-AdminPowerAppEnvironment
$environments | Select DisplayName, EnvironmentName, Location, EnvironmentType,
    @{N='SecurityGroup';E={$_.SecurityGroupId}},
    @{N='Created';E={$_.CreatedTime}} |
    Export-Csv exports/pp-environments.csv -NoTypeInformation

Write-Host "Environments found: $($environments.Count)"

# --- DLP Policies ---
$dlpPolicies = Get-DlpPolicy
$dlpPolicies | ConvertTo-Json -Depth 10 > exports/pp-dlp-policies.json

# DLP Summary
$dlpSummary = foreach ($policy in $dlpPolicies) {
    [PSCustomObject]@{
        PolicyName = $policy.displayName
        Scope = $policy.environments.Count
        BusinessConnectors = ($policy.connectorGroups | Where-Object classification -eq 'Business').connectors.Count
        BlockedConnectors = ($policy.connectorGroups | Where-Object classification -eq 'Blocked').connectors.Count
    }
}
$dlpSummary | Export-Csv exports/pp-dlp-summary.csv -NoTypeInformation

# --- DLP Coverage Gap ---
$envWithDlp = ($dlpPolicies | ForEach-Object { $_.environments.name }) | Select -Unique
$envWithoutDlp = $environments | Where-Object { $_.EnvironmentName -notin $envWithDlp }
$envWithoutDlp | Select DisplayName, EnvironmentName, EnvironmentType |
    Export-Csv exports/pp-dlp-gaps.csv -NoTypeInformation

if ($envWithoutDlp.Count -gt 0) {
    Write-Host "WARNING: $($envWithoutDlp.Count) environments without DLP" -ForegroundColor Red
}

# --- Tenant Settings ---
# (Requires admin portal review — capture as screenshots or API where available)
```

### 3.2 Phase 2: Power Apps & Power Automate

```powershell
# --- Power Apps Inventory ---
$apps = Get-AdminPowerApp
$appReport = foreach ($app in $apps) {
    [PSCustomObject]@{
        DisplayName = $app.DisplayName
        AppType = $app.Internal.appType
        Owner = $app.Owner.displayName
        OwnerEmail = $app.Owner.email
        Environment = $app.EnvironmentName
        Created = $app.CreatedTime
        LastModified = $app.LastModifiedTime
        SharedWith = ($app.Internal.sharedWith | Measure-Object).Count
        Connectors = ($app.Internal.connectionReferences | ForEach-Object { $_.displayName }) -join '; '
    }
}
$appReport | Export-Csv exports/pp-power-apps.csv -NoTypeInformation
Write-Host "Power Apps found: $($apps.Count)"

# --- Apps with Acturis/External Connectors (flag) ---
$externalApps = $appReport | Where-Object {
    $_.Connectors -match 'HTTP|SQL|Custom|Acturis|SFTP|FTP'
}
$externalApps | Export-Csv exports/pp-apps-external-connectors.csv -NoTypeInformation

# --- Power Automate Flow Inventory ---
$flows = Get-AdminFlow
$flowReport = foreach ($flow in $flows) {
    [PSCustomObject]@{
        DisplayName = $flow.DisplayName
        State = $flow.Internal.properties.state
        Owner = $flow.Internal.properties.creator.userPrincipalName
        Environment = $flow.EnvironmentName
        Created = $flow.CreatedTime
        Triggers = ($flow.Internal.properties.definitionSummary.triggers | ForEach-Object { $_.type }) -join '; '
        Actions = ($flow.Internal.properties.definitionSummary.actions | ForEach-Object { $_.type }) -join '; '
    }
}
$flowReport | Export-Csv exports/pp-power-automate-flows.csv -NoTypeInformation
Write-Host "Flows found: $($flows.Count)"

# --- Flows with HTTP/External Actions ---
$externalFlows = $flowReport | Where-Object {
    $_.Actions -match 'Http|SQL|Custom|SFTP|FTP' -or
    $_.Triggers -match 'Http|Webhook'
}
$externalFlows | Export-Csv exports/pp-flows-external-actions.csv -NoTypeInformation

# --- Custom Connectors ---
$customConnectors = Get-AdminPowerAppConnector -ApiIdFilter 'shared_'
$customConnectors | Select DisplayName, ConnectorId, CreatedBy, EnvironmentName |
    Export-Csv exports/pp-custom-connectors.csv -NoTypeInformation

# --- Connection References ---
Get-AdminPowerAppConnection |
    Select DisplayName, ConnectorName, EnvironmentName, CreatedBy, Statuses |
    Export-Csv exports/pp-connections.csv -NoTypeInformation
```

### 3.3 Phase 3: Power BI

```powershell
# --- Workspace Inventory ---
$workspaces = Get-PowerBIWorkspace -Scope Organization -All
$workspaces | Select Name, Id, Type, State, IsOnDedicatedCapacity, CapacityId |
    Export-Csv exports/pbi-workspaces.csv -NoTypeInformation
Write-Host "Power BI Workspaces: $($workspaces.Count)"

# --- Workspace Users ---
$workspaceAccess = foreach ($ws in $workspaces) {
    $users = Get-PowerBIWorkspace -Scope Organization -Id $ws.Id | Select -ExpandProperty Users
    foreach ($user in $users) {
        [PSCustomObject]@{
            Workspace = $ws.Name
            UserPrincipalName = $user.UserPrincipalName
            AccessRight = $user.AccessRight
            Identifier = $user.Identifier
        }
    }
}
$workspaceAccess | Export-Csv exports/pbi-workspace-access.csv -NoTypeInformation

# --- Datasets / Semantic Models ---
$datasets = foreach ($ws in $workspaces) {
    try {
        $ds = Get-PowerBIDataset -Scope Organization -WorkspaceId $ws.Id
        foreach ($d in $ds) {
            [PSCustomObject]@{
                Workspace = $ws.Name
                DatasetName = $d.Name
                DatasetId = $d.Id
                ConfiguredBy = $d.ConfiguredBy
                IsRefreshable = $d.IsRefreshable
                IsEffectiveIdentityRequired = $d.IsEffectiveIdentityRequired
            }
        }
    } catch {}
}
$datasets | Export-Csv exports/pbi-datasets.csv -NoTypeInformation

# --- Tenant Settings (Admin API) ---
# Requires Power BI Admin API call
$pbiTenantSettings = Invoke-PowerBIRestMethod -Url "admin/tenantsettings" -Method Get
$pbiTenantSettings | ConvertTo-Json -Depth 5 > exports/pbi-tenant-settings.json

# --- Gateway Inventory ---
$gateways = Invoke-PowerBIRestMethod -Url "gateways" -Method Get
$gateways | ConvertTo-Json -Depth 5 > exports/pbi-gateways.json
```

### 3.4 Phase 4: Fabric / OneLake

```powershell
# --- Fabric Capacities ---
$token = (Get-AzAccessToken -ResourceUrl "https://api.fabric.microsoft.com").Token
$headers = @{ Authorization = "Bearer $token" }

$capacities = Invoke-RestMethod -Uri "https://api.fabric.microsoft.com/v1/admin/capacities" -Headers $headers
$capacities | ConvertTo-Json -Depth 5 > exports/fabric-capacities.json

# --- Fabric Workspaces ---
$fabricWorkspaces = Invoke-RestMethod -Uri "https://api.fabric.microsoft.com/v1/admin/workspaces" -Headers $headers
$fabricWorkspaces | ConvertTo-Json -Depth 5 > exports/fabric-workspaces.json

# --- Fabric Items (Lakehouses, Warehouses, Pipelines, Notebooks) ---
foreach ($ws in $fabricWorkspaces.value) {
    $items = Invoke-RestMethod -Uri "https://api.fabric.microsoft.com/v1/workspaces/$($ws.id)/items" -Headers $headers
    $items | ConvertTo-Json -Depth 5 >> exports/fabric-items.json
}

# --- Domains ---
$domains = Invoke-RestMethod -Uri "https://api.fabric.microsoft.com/v1/admin/domains" -Headers $headers
$domains | ConvertTo-Json -Depth 5 > exports/fabric-domains.json
```

### 3.5 Phase 5: Synapse / Data Warehouse

```powershell
# --- Synapse Workspace Inventory ---
az graph query -q "
resources
| where type == 'microsoft.synapse/workspaces'
| project name, resourceGroup, subscriptionId, location,
    managedVirtualNetwork = properties.managedVirtualNetwork,
    publicNetworkAccess = properties.publicNetworkAccess,
    managedResourceGroupName = properties.managedResourceGroupName
" --output json > exports/synapse-workspaces.json

# --- Synapse SQL Pools ---
az graph query -q "
resources
| where type == 'microsoft.synapse/workspaces/sqlpools'
| project name, resourceGroup, subscriptionId,
    sku = sku.name,
    status = properties.status
" --output json > exports/synapse-sql-pools.json

# --- Azure SQL Databases ---
az graph query -q "
resources
| where type == 'microsoft.sql/servers/databases'
| project name, resourceGroup, subscriptionId, location,
    sku = sku.name,
    tier = sku.tier,
    status = properties.status,
    maxSizeBytes = properties.maxSizeBytes,
    zoneRedundant = properties.zoneRedundant
" --output json > exports/sql-databases.json

# --- Azure SQL Servers ---
az graph query -q "
resources
| where type == 'microsoft.sql/servers'
| project name, resourceGroup, subscriptionId, location,
    adminLogin = properties.administratorLogin,
    publicNetworkAccess = properties.publicNetworkAccess,
    minimalTlsVersion = properties.minimalTlsVersion
" --output json > exports/sql-servers.json

# --- SQL Firewall Rules ---
az graph query -q "
resources
| where type == 'microsoft.sql/servers/firewallrules'
| project name, resourceGroup,
    startIpAddress = properties.startIpAddress,
    endIpAddress = properties.endIpAddress
" --output json > exports/sql-firewall-rules.json

# --- SQL Audit Settings ---
for server in $(az sql server list --query "[].name" -o tsv); do
    az sql server audit-policy show --name $server --resource-group $(az sql server show --name $server --query resourceGroup -o tsv) --output json >> exports/sql-audit-settings.json
done

# --- SQL TDE Status ---
for server in $(az sql server list --query "[].name" -o tsv); do
    for db in $(az sql db list --server $server --query "[].name" -o tsv); do
        az sql db tde show --server $server --database $db --resource-group $(az sql server show --name $server --query resourceGroup -o tsv) --output json >> exports/sql-tde-status.json
    done
done
```

### 3.6 Phase 6: Third-Party Applications & Acturis

```powershell
# --- Entra ID Enterprise Applications ---
$apps = Get-MgServicePrincipal -All -Filter "tags/any(t: t eq 'WindowsAzureActiveDirectoryIntegratedApp')"
$apps | Select DisplayName, AppId, ServicePrincipalType, AccountEnabled,
    @{N='SignInAudience';E={$_.SignInAudience}},
    @{N='AppRoleAssignments';E={(Get-MgServicePrincipalAppRoleAssignment -ServicePrincipalId $_.Id).Count}} |
    Export-Csv exports/thirdparty-enterprise-apps.csv -NoTypeInformation

# --- Applications with Application Permissions (high risk) ---
$appPermissions = foreach ($app in $apps) {
    $roles = Get-MgServicePrincipalAppRoleAssignment -ServicePrincipalId $app.Id
    foreach ($role in $roles) {
        [PSCustomObject]@{
            AppName = $app.DisplayName
            AppId = $app.AppId
            ResourceDisplayName = $role.ResourceDisplayName
            AppRoleId = $role.AppRoleId
            CreatedDateTime = $role.CreatedDateTime
        }
    }
}
$appPermissions | Export-Csv exports/thirdparty-app-permissions.csv -NoTypeInformation

# --- OAuth Consent Grants ---
$oauthGrants = Get-MgOauth2PermissionGrant -All
$oauthGrants | Select ClientId, ConsentType, PrincipalId, ResourceId, Scope |
    Export-Csv exports/thirdparty-oauth-grants.csv -NoTypeInformation

# --- Acturis Identification ---
$acturisApp = $apps | Where-Object { $_.DisplayName -match 'Acturis|acturis' }
if ($acturisApp) {
    Write-Host "Acturis app registration found: $($acturisApp.DisplayName)" -ForegroundColor Green
    $acturisApp | ConvertTo-Json -Depth 5 > exports/thirdparty-acturis-config.json
    Get-MgServicePrincipalAppRoleAssignment -ServicePrincipalId $acturisApp.Id |
        ConvertTo-Json > exports/thirdparty-acturis-permissions.json
} else {
    Write-Host "Acturis app registration not found in Entra ID — check for direct API integration" -ForegroundColor Yellow
}

# --- Synapse / DW Linked Services (data connections) ---
# For each Synapse workspace, extract linked services
$synapseWorkspaces = az synapse workspace list --output json | ConvertFrom-Json
foreach ($ws in $synapseWorkspaces) {
    az synapse linked-service list --workspace-name $ws.name --output json >> exports/synapse-linked-services.json
}
```

---

## 4. Data Collection Checklist

```
Phase 1 - PP Environments & DLP:
□ pp-environments.csv
□ pp-dlp-policies.json
□ pp-dlp-summary.csv
□ pp-dlp-gaps.csv

Phase 2 - Apps & Flows:
□ pp-power-apps.csv
□ pp-apps-external-connectors.csv
□ pp-power-automate-flows.csv
□ pp-flows-external-actions.csv
□ pp-custom-connectors.csv
□ pp-connections.csv

Phase 3 - Power BI:
□ pbi-workspaces.csv
□ pbi-workspace-access.csv
□ pbi-datasets.csv
□ pbi-tenant-settings.json
□ pbi-gateways.json

Phase 4 - Fabric / OneLake:
□ fabric-capacities.json
□ fabric-workspaces.json
□ fabric-items.json
□ fabric-domains.json

Phase 5 - Synapse / Data Warehouse:
□ synapse-workspaces.json
□ synapse-sql-pools.json
□ sql-databases.json
□ sql-servers.json
□ sql-firewall-rules.json
□ sql-audit-settings.json
□ sql-tde-status.json

Phase 6 - Third-Party / Acturis:
□ thirdparty-enterprise-apps.csv
□ thirdparty-app-permissions.csv
□ thirdparty-oauth-grants.csv
□ thirdparty-acturis-config.json
□ thirdparty-acturis-permissions.json
□ synapse-linked-services.json
```

---

## 5. Analysis & Scoring

### 5.1 Risk Rating

| Rating | Description | Examples |
|--------|-------------|---------|
| **Critical** | Immediate exposure | DLP gaps, unencrypted DW, exposed API keys |
| **High** | Significant gap | Broad OneLake access, no Acturis exit plan |
| **Medium** | Notable gap | Missing sensitivity labels, orphaned apps |
| **Low** | Best practice | Missing endorsements, no data domains |

### 5.2 Scoring by Domain

| Domain | Weight | Areas |
|--------|--------|-------|
| PP Governance | 25% | DLP, environments, controls |
| Data Security | 30% | Encryption, access, classification |
| Integration Risk | 25% | Acturis, APIs, credentials |
| Compliance | 20% | GDPR, FCA, regulatory alignment |

---

## 6. Deliverable Production

### 6.1 Handover Package

```
PP-Data-Audit-[ClientName]-[Date]/
├── 01-Executive/
│   └── Executive-Summary.pdf
├── 02-Power-Platform/
│   ├── pp-governance-report.pdf
│   └── [PP exports]
├── 03-Data-Layer/
│   ├── data-architecture-report.pdf
│   ├── data-flow-diagrams.md
│   └── [Fabric/Synapse/SQL exports]
├── 04-Third-Party/
│   ├── third-party-portfolio.pdf
│   ├── acturis-integration-assessment.pdf
│   └── [third-party exports]
├── 05-Analysis/
│   ├── gap-analysis.xlsx
│   ├── risk-register.xlsx
│   └── action-plan.pdf
└── 06-Raw-Data/
    └── [all raw exports]
```

---

## 7. Post-Audit Cleanup

```powershell
# Disconnect all sessions
Remove-PowerAppsAccount
Disconnect-MgGraph
Disconnect-PowerBIServiceAccount
Disconnect-AzAccount

# Remove local data (after handover)
Remove-Item ./exports/ -Recurse -Force
```

---

**Document Control**

| Version | Date | Author | Status | Changes |
|---------|------|--------|--------|---------|
| 1.0.0 | Feb 2026 | Advisory Team | Draft | Initial release |
