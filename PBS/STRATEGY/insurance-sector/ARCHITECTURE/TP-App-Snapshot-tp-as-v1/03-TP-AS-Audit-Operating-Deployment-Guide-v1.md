# Third-Party Application Snapshot Audit
## Operating & Deployment Guide

**Document Version:** 1.0.0
**Date:** February 2026
**Classification:** Vendor Operations Guide
**Audience:** Audit Delivery Team / Consultant

---

## Quick Start

```powershell
# 1. Connect to Microsoft Graph
Connect-MgGraph -Scopes "Application.Read.All","Directory.Read.All","AuditLog.Read.All","Policy.Read.All"

# 2. Connect to Azure (for Key Vault, APIM, linked services)
Connect-AzAccount -Tenant <tenant-id>

# 3. Run discovery
./04-TP-AS-Audit-Discovery-v1.ps1 -OutputPath ./tp-audit-$(Get-Date -Format yyyyMMdd)
```

---

## 1. Pre-Engagement Checklist

### 1.1 Client Information Required

| Item | Required | Notes |
|------|----------|-------|
| **Tenant ID** | ✅ | Entra ID tenant GUID |
| **IT / Security Contact** | ✅ | For access approvals |
| **Acturis System Owner** | ✅ | Integration knowledge holder |
| **Procurement / Vendor Manager** | ✅ | Contract and vendor context |
| **Acturis Integration Docs** | ✅ | API specs, data flows, SSO config |
| **Third-Party Application Register** | ⚪ | If available |
| **Key Vault Names / Subscriptions** | ✅ | For credential audit |
| **APIM Instance (if any)** | ⚪ | API Management details |
| **Vendor Contracts (critical vendors)** | ⚪ | DPAs, SLAs for Acturis + key vendors |

### 1.2 Engagement Confirmation

```
□ SoW signed, NDA executed
□ Access requests submitted (Global Reader + Key Vault Reader)
□ Acturis integration documentation requested
□ Vendor contract access confirmed (Acturis DPA, SLA)
□ Audit timeline confirmed (1 week)
□ Workshop date + attendees confirmed
□ Client questionnaire sent
```

### 1.3 Team Preparation

| Role | Responsibility |
|------|----------------|
| Lead Consultant | Client liaison, workshop facilitation, report delivery |
| Identity Specialist | Graph API discovery, OAuth analysis, SSO review |
| Security Analyst | Credential audit, integration security, vendor risk scoring |
| Compliance Analyst | GDPR/FCA/PRA mapping, regulatory gap analysis |

---

## 2. Access & Permissions

### 2.1 Microsoft Graph (Entra ID)

```
Role: Global Reader (recommended)
  OR: Application Administrator (read) + Cloud Application Administrator (read)

Graph API Scopes:
├── Application.Read.All         # App registrations + enterprise apps
├── Directory.Read.All           # Directory objects
├── AuditLog.Read.All            # Sign-in logs for stale app detection
├── Policy.Read.All              # Consent policies
└── DelegatedPermissionGrant.ReadWrite.All  # OAuth consent grants (read)
```

### 2.2 Azure Resources

```
Scope: Subscription(s) containing Key Vault, APIM, Synapse
Roles:
├── Reader                       # Resource inventory
├── Key Vault Reader             # Key Vault metadata (not secrets)
├── API Management Service Reader # APIM configuration
└── Synapse Contributor (read)   # Linked services
```

### 2.3 Access Verification

```powershell
# Verify Graph API access
Connect-MgGraph -Scopes "Application.Read.All","Directory.Read.All"
Get-MgOrganization | Select DisplayName, VerifiedDomains

# Count enterprise applications
(Get-MgServicePrincipal -All -Filter "tags/any(t: t eq 'WindowsAzureActiveDirectoryIntegratedApp')").Count

# Verify Azure access
az account show --query "{name:name, id:id}"

# Check Key Vault access
az keyvault list --query "[].name" -o tsv
```

### 2.4 Access Request Template

```
Subject: Third-Party Application Audit - Access Request

We request the following access for the third-party application snapshot audit:

Requestor Details:
- Name: [Auditor Name]
- Email: [Auditor Email]
- Company: [Vendor Company]
- Engagement Reference: [SoW Number]

Access Requirements:
1. Entra ID: Global Reader (1 week)
2. Azure: Reader + Key Vault Reader on relevant subscriptions
3. APIM: API Management Service Reader (if deployed)

Access will be used to:
1. Inventory enterprise applications and app registrations
2. Review OAuth consent grants and permission levels
3. Assess Key Vault credential management
4. Review API Management configuration
5. Map third-party integration architecture

No changes will be made to any configuration.
No application secrets or Key Vault values will be accessed.
Only metadata, permissions, and configuration will be reviewed.

Please confirm when access is provisioned.
```

---

## 3. Data Collection

### 3.1 Collection Schedule

| Phase | Activity | Duration | Output |
|-------|----------|----------|--------|
| **Phase 1** | Enterprise Application Inventory | 1 hour | `apps-*.csv/json` |
| **Phase 2** | OAuth & Permission Analysis | 45 mins | `oauth-*.csv` |
| **Phase 3** | App Registration Audit | 45 mins | `appreg-*.csv` |
| **Phase 4** | Credential & Key Vault Audit | 30 mins | `creds-*.csv/json` |
| **Phase 5** | Integration Discovery (APIM, linked services) | 30 mins | `integration-*.json` |
| **Phase 6** | Acturis-Specific Discovery | 30 mins | `acturis-*.json` |

### 3.2 Phase 1: Enterprise Application Inventory

```powershell
# --- Enterprise Application Inventory ---
$enterpriseApps = Get-MgServicePrincipal -All -Filter "tags/any(t: t eq 'WindowsAzureActiveDirectoryIntegratedApp')"

$appReport = foreach ($app in $enterpriseApps) {
    [PSCustomObject]@{
        DisplayName = $app.DisplayName
        AppId = $app.AppId
        ObjectId = $app.Id
        ServicePrincipalType = $app.ServicePrincipalType
        AccountEnabled = $app.AccountEnabled
        SignInAudience = $app.SignInAudience
        PublisherName = $app.PublisherName
        VerifiedPublisher = $app.VerifiedPublisher.DisplayName
        Homepage = $app.Homepage
        ReplyUrls = ($app.ReplyUrls -join '; ')
        CreatedDateTime = $app.AdditionalProperties.createdDateTime
        Tags = ($app.Tags -join '; ')
    }
}
$appReport | Export-Csv exports/apps-enterprise-inventory.csv -NoTypeInformation
Write-Host "Enterprise Applications: $($enterpriseApps.Count)"

# --- Categorise by Type ---
$appsByType = $enterpriseApps | Group-Object ServicePrincipalType | Select Name, Count
$appsByType | Export-Csv exports/apps-by-type.csv -NoTypeInformation

# --- Multi-Tenant vs Single-Tenant ---
$multiTenant = $enterpriseApps | Where-Object { $_.SignInAudience -match 'AzureADMultipleOrgs|AzureADandPersonalMicrosoftAccount' }
Write-Host "Multi-tenant apps: $($multiTenant.Count) / $($enterpriseApps.Count)"

# --- Publisher Verification Status ---
$unverified = $enterpriseApps | Where-Object {
    $_.VerifiedPublisher.DisplayName -eq $null -and
    $_.ServicePrincipalType -eq 'Application' -and
    $_.PublisherName -ne 'Microsoft'
}
$unverified | Select DisplayName, AppId, PublisherName |
    Export-Csv exports/apps-unverified-publishers.csv -NoTypeInformation
Write-Host "Unverified non-Microsoft apps: $($unverified.Count)" -ForegroundColor $(if($unverified.Count -gt 10){'Yellow'}else{'Green'})
```

### 3.3 Phase 2: OAuth & Permission Analysis

```powershell
# --- Application Permissions (App Roles) ---
$appPermissions = foreach ($app in $enterpriseApps) {
    $roles = Get-MgServicePrincipalAppRoleAssignment -ServicePrincipalId $app.Id -ErrorAction SilentlyContinue
    foreach ($role in $roles) {
        [PSCustomObject]@{
            AppName = $app.DisplayName
            AppId = $app.AppId
            ResourceDisplayName = $role.ResourceDisplayName
            AppRoleId = $role.AppRoleId
            PrincipalType = $role.PrincipalType
            CreatedDateTime = $role.CreatedDateTime
        }
    }
}
$appPermissions | Export-Csv exports/oauth-app-permissions.csv -NoTypeInformation
Write-Host "Application permission grants: $($appPermissions.Count)"

# --- HIGH RISK: Apps with directory-wide permissions ---
$highRiskPerms = $appPermissions | Where-Object {
    $_.ResourceDisplayName -eq 'Microsoft Graph' -and
    $_.AppRoleId -in @(
        '7ab1d382-f21e-4acd-a863-ba3e13f7da61',  # Directory.Read.All
        '19dbc75e-c2e2-444c-a770-ec596d67b8c6',  # Directory.ReadWrite.All
        '62a82d76-70ea-41e2-9197-370581804d09',  # Group.ReadWrite.All
        '06b708a9-e830-4db3-a914-8e69da51d44f',  # AppRoleAssignment.ReadWrite.All
        '9e3f62cf-ca93-4989-b6ce-bf83c28f9fe8'   # RoleManagement.ReadWrite.Directory
    )
}
$highRiskPerms | Export-Csv exports/oauth-high-risk-permissions.csv -NoTypeInformation
if ($highRiskPerms.Count -gt 0) {
    Write-Host "HIGH RISK: $($highRiskPerms.Count) high-privilege application permissions found" -ForegroundColor Red
}

# --- OAuth2 Consent Grants (Delegated) ---
$oauthGrants = Get-MgOauth2PermissionGrant -All
$grantReport = foreach ($grant in $oauthGrants) {
    $clientApp = Get-MgServicePrincipal -ServicePrincipalId $grant.ClientId -ErrorAction SilentlyContinue
    [PSCustomObject]@{
        ClientApp = $clientApp.DisplayName
        ClientId = $grant.ClientId
        ConsentType = $grant.ConsentType
        Scope = $grant.Scope
        PrincipalId = $grant.PrincipalId
        ResourceId = $grant.ResourceId
    }
}
$grantReport | Export-Csv exports/oauth-consent-grants.csv -NoTypeInformation

# --- Admin Consent vs User Consent ---
$adminConsent = $grantReport | Where-Object { $_.ConsentType -eq 'AllPrincipals' }
$userConsent = $grantReport | Where-Object { $_.ConsentType -eq 'Principal' }
Write-Host "Admin consent grants: $($adminConsent.Count)"
Write-Host "User consent grants: $($userConsent.Count)" -ForegroundColor $(if($userConsent.Count -gt 50){'Yellow'}else{'Green'})
```

### 3.4 Phase 3: App Registration Audit

```powershell
# --- App Registration Inventory ---
$appRegistrations = Get-MgApplication -All

$appRegReport = foreach ($app in $appRegistrations) {
    [PSCustomObject]@{
        DisplayName = $app.DisplayName
        AppId = $app.AppId
        ObjectId = $app.Id
        SignInAudience = $app.SignInAudience
        CreatedDateTime = $app.CreatedDateTime
        PasswordCredentialCount = $app.PasswordCredentials.Count
        KeyCredentialCount = $app.KeyCredentials.Count
        RedirectUris = ($app.Web.RedirectUris -join '; ')
        IdentifierUris = ($app.IdentifierUris -join '; ')
    }
}
$appRegReport | Export-Csv exports/appreg-inventory.csv -NoTypeInformation
Write-Host "App Registrations: $($appRegistrations.Count)"

# --- Credential Expiry Check ---
$credentialReport = foreach ($app in $appRegistrations) {
    foreach ($pwd in $app.PasswordCredentials) {
        [PSCustomObject]@{
            AppName = $app.DisplayName
            AppId = $app.AppId
            CredentialType = 'ClientSecret'
            DisplayName = $pwd.DisplayName
            StartDateTime = $pwd.StartDateTime
            EndDateTime = $pwd.EndDateTime
            DaysUntilExpiry = [math]::Round(($pwd.EndDateTime - (Get-Date)).TotalDays)
            Status = if ($pwd.EndDateTime -lt (Get-Date)) { 'EXPIRED' }
                     elseif ($pwd.EndDateTime -lt (Get-Date).AddDays(30)) { 'EXPIRING_SOON' }
                     else { 'Valid' }
        }
    }
    foreach ($cert in $app.KeyCredentials) {
        [PSCustomObject]@{
            AppName = $app.DisplayName
            AppId = $app.AppId
            CredentialType = 'Certificate'
            DisplayName = $cert.DisplayName
            StartDateTime = $cert.StartDateTime
            EndDateTime = $cert.EndDateTime
            DaysUntilExpiry = [math]::Round(($cert.EndDateTime - (Get-Date)).TotalDays)
            Status = if ($cert.EndDateTime -lt (Get-Date)) { 'EXPIRED' }
                     elseif ($cert.EndDateTime -lt (Get-Date).AddDays(30)) { 'EXPIRING_SOON' }
                     else { 'Valid' }
        }
    }
}
$credentialReport | Export-Csv exports/appreg-credential-expiry.csv -NoTypeInformation

$expired = $credentialReport | Where-Object { $_.Status -eq 'EXPIRED' }
$expiringSoon = $credentialReport | Where-Object { $_.Status -eq 'EXPIRING_SOON' }
Write-Host "Expired credentials: $($expired.Count)" -ForegroundColor $(if($expired.Count -gt 0){'Red'}else{'Green'})
Write-Host "Expiring within 30 days: $($expiringSoon.Count)" -ForegroundColor $(if($expiringSoon.Count -gt 0){'Yellow'}else{'Green'})

# --- Insecure Redirect URIs ---
$insecureRedirects = foreach ($app in $appRegistrations) {
    $httpUris = $app.Web.RedirectUris | Where-Object { $_ -match '^http://' -and $_ -notmatch 'localhost' }
    if ($httpUris) {
        [PSCustomObject]@{
            AppName = $app.DisplayName
            AppId = $app.AppId
            InsecureUris = ($httpUris -join '; ')
        }
    }
}
$insecureRedirects | Export-Csv exports/appreg-insecure-redirects.csv -NoTypeInformation
if ($insecureRedirects.Count -gt 0) {
    Write-Host "WARNING: $($insecureRedirects.Count) apps with HTTP redirect URIs" -ForegroundColor Red
}

# --- App Registrations Without Owners ---
$noOwner = foreach ($app in $appRegistrations) {
    $owners = Get-MgApplicationOwner -ApplicationId $app.Id -ErrorAction SilentlyContinue
    if ($owners.Count -eq 0) {
        [PSCustomObject]@{
            AppName = $app.DisplayName
            AppId = $app.AppId
            Created = $app.CreatedDateTime
        }
    }
}
$noOwner | Export-Csv exports/appreg-no-owner.csv -NoTypeInformation
Write-Host "App registrations without owners: $($noOwner.Count)"
```

### 3.5 Phase 4: Credential & Key Vault Audit

```powershell
# --- Key Vault Inventory ---
$keyVaults = az keyvault list --output json | ConvertFrom-Json
$keyVaults | Select name, resourceGroup, location,
    @{N='SoftDelete';E={$_.properties.enableSoftDelete}},
    @{N='PurgeProtection';E={$_.properties.enablePurgeProtection}},
    @{N='RBACAuth';E={$_.properties.enableRbacAuthorization}} |
    Export-Csv exports/creds-keyvault-inventory.csv -NoTypeInformation
Write-Host "Key Vaults: $($keyVaults.Count)"

# --- Key Vault Secrets Metadata (not values) ---
foreach ($kv in $keyVaults) {
    $secrets = az keyvault secret list --vault-name $kv.name --output json | ConvertFrom-Json
    foreach ($secret in $secrets) {
        [PSCustomObject]@{
            VaultName = $kv.name
            SecretName = $secret.name
            Enabled = $secret.attributes.enabled
            Created = $secret.attributes.created
            Updated = $secret.attributes.updated
            Expires = $secret.attributes.expires
            ContentType = $secret.contentType
        }
    }
} | Export-Csv exports/creds-keyvault-secrets-metadata.csv -NoTypeInformation

# --- Key Vault Access Policies ---
foreach ($kv in $keyVaults) {
    az keyvault show --name $kv.name --query "properties.accessPolicies" --output json >> exports/creds-keyvault-access-policies.json
}

# --- Service Account Inventory ---
# Service accounts typically have specific naming patterns
$serviceAccounts = Get-MgUser -All -Filter "accountEnabled eq true" |
    Where-Object { $_.UserPrincipalName -match 'svc|service|api|integration|bot|noreply|system|admin@' }
$serviceAccounts | Select DisplayName, UserPrincipalName, AccountEnabled, CreatedDateTime |
    Export-Csv exports/creds-service-accounts.csv -NoTypeInformation
Write-Host "Potential service accounts: $($serviceAccounts.Count)"
```

### 3.6 Phase 5: Integration Discovery

```powershell
# --- API Management (if deployed) ---
$apimInstances = az apim list --output json 2>/dev/null | ConvertFrom-Json
if ($apimInstances) {
    $apimInstances | Select name, resourceGroup, location, sku |
        Export-Csv exports/integration-apim-instances.csv -NoTypeInformation

    foreach ($apim in $apimInstances) {
        # API inventory
        az apim api list --resource-group $apim.resourceGroup --service-name $apim.name --output json >> exports/integration-apim-apis.json

        # Subscription keys
        az apim subscription list --resource-group $apim.resourceGroup --service-name $apim.name --output json >> exports/integration-apim-subscriptions.json
    }
    Write-Host "APIM instances: $($apimInstances.Count)"
} else {
    Write-Host "No API Management instances found" -ForegroundColor Yellow
}

# --- Logic Apps ---
$logicApps = az resource list --resource-type "Microsoft.Logic/workflows" --output json | ConvertFrom-Json
$logicApps | Select name, resourceGroup, location |
    Export-Csv exports/integration-logic-apps.csv -NoTypeInformation
Write-Host "Logic Apps: $($logicApps.Count)"

# --- Azure Functions ---
$functionApps = az functionapp list --output json | ConvertFrom-Json
$functionApps | Select name, resourceGroup, defaultHostName, state |
    Export-Csv exports/integration-function-apps.csv -NoTypeInformation
Write-Host "Function Apps: $($functionApps.Count)"

# --- Synapse Linked Services (third-party connections) ---
$synapseWorkspaces = az synapse workspace list --output json 2>/dev/null | ConvertFrom-Json
if ($synapseWorkspaces) {
    foreach ($ws in $synapseWorkspaces) {
        az synapse linked-service list --workspace-name $ws.name --output json >> exports/integration-synapse-linked-services.json
    }
}

# --- Data Factory (if deployed) ---
$adfInstances = az resource list --resource-type "Microsoft.DataFactory/factories" --output json | ConvertFrom-Json
if ($adfInstances) {
    foreach ($adf in $adfInstances) {
        az datafactory linked-service list --factory-name $adf.name --resource-group $adf.resourceGroup --output json >> exports/integration-adf-linked-services.json
    }
    Write-Host "Data Factory instances: $($adfInstances.Count)"
}
```

### 3.7 Phase 6: Acturis-Specific Discovery

```powershell
# --- Acturis App Registration in Entra ID ---
$acturisApp = Get-MgServicePrincipal -All | Where-Object { $_.DisplayName -match 'Acturis|acturis' }
if ($acturisApp) {
    Write-Host "Acturis app registration found: $($acturisApp.DisplayName)" -ForegroundColor Green
    $acturisApp | ConvertTo-Json -Depth 5 > exports/acturis-app-config.json

    # Permissions
    Get-MgServicePrincipalAppRoleAssignment -ServicePrincipalId $acturisApp.Id |
        ConvertTo-Json > exports/acturis-app-permissions.json

    # Sign-in activity (last 30 days)
    try {
        $signIns = Get-MgAuditLogSignIn -Filter "appId eq '$($acturisApp.AppId)'" -Top 100
        $signIns | Select CreatedDateTime, UserDisplayName, Status, IpAddress, Location |
            Export-Csv exports/acturis-sign-ins.csv -NoTypeInformation
        Write-Host "Acturis sign-ins (last 30 days): $($signIns.Count)"
    } catch {
        Write-Host "Sign-in log access not available" -ForegroundColor Yellow
    }
} else {
    Write-Host "Acturis app registration NOT found in Entra ID" -ForegroundColor Yellow
    Write-Host "Check for: direct API integration, IP whitelisting, or separate SSO provider" -ForegroundColor Yellow
    @{Status='NotFound';Notes='Check for direct API/IP-based integration'} |
        ConvertTo-Json > exports/acturis-app-config.json
}

# --- Acturis-Related Key Vault Secrets ---
foreach ($kv in $keyVaults) {
    $acturisSecrets = az keyvault secret list --vault-name $kv.name --output json | ConvertFrom-Json |
        Where-Object { $_.name -match 'acturis|act-|broking' }
    if ($acturisSecrets) {
        Write-Host "Acturis-related secrets in $($kv.name): $($acturisSecrets.Count)" -ForegroundColor Green
        $acturisSecrets | Select name, @{N='Vault';E={$kv.name}}, contentType,
            @{N='Expires';E={$_.attributes.expires}} |
            Export-Csv exports/acturis-keyvault-secrets.csv -NoTypeInformation -Append
    }
}

# --- Insurance Vendor Detection ---
# Search for common insurance vendor app registrations
$insuranceVendors = @('Acturis','SSP','Applied','OpenGI','Guidewire','Lloyds','Aviva','AXA','Allianz','RSA','Zurich','Mimecast','Proofpoint')
$vendorApps = foreach ($vendor in $insuranceVendors) {
    $found = Get-MgServicePrincipal -All | Where-Object { $_.DisplayName -match $vendor }
    foreach ($app in $found) {
        [PSCustomObject]@{
            VendorSearch = $vendor
            AppDisplayName = $app.DisplayName
            AppId = $app.AppId
            Enabled = $app.AccountEnabled
            Type = $app.ServicePrincipalType
        }
    }
}
$vendorApps | Export-Csv exports/acturis-insurance-vendor-apps.csv -NoTypeInformation
Write-Host "Insurance vendor apps found: $($vendorApps.Count)"
```

---

## 4. Data Collection Checklist

```
Phase 1 - Enterprise Applications:
□ apps-enterprise-inventory.csv
□ apps-by-type.csv
□ apps-unverified-publishers.csv

Phase 2 - OAuth & Permissions:
□ oauth-app-permissions.csv
□ oauth-high-risk-permissions.csv
□ oauth-consent-grants.csv

Phase 3 - App Registrations:
□ appreg-inventory.csv
□ appreg-credential-expiry.csv
□ appreg-insecure-redirects.csv
□ appreg-no-owner.csv

Phase 4 - Credentials:
□ creds-keyvault-inventory.csv
□ creds-keyvault-secrets-metadata.csv
□ creds-keyvault-access-policies.json
□ creds-service-accounts.csv

Phase 5 - Integration:
□ integration-apim-instances.csv
□ integration-apim-apis.json
□ integration-logic-apps.csv
□ integration-function-apps.csv
□ integration-synapse-linked-services.json
□ integration-adf-linked-services.json

Phase 6 - Acturis:
□ acturis-app-config.json
□ acturis-app-permissions.json
□ acturis-sign-ins.csv
□ acturis-keyvault-secrets.csv
□ acturis-insurance-vendor-apps.csv
```

---

## 5. Analysis & Scoring

### 5.1 Risk Rating

| Rating | Description | Examples |
|--------|-------------|---------|
| **Critical** | Immediate exposure | Over-permissioned apps, hard-coded credentials, no DPA for data processor |
| **High** | Significant gap | Expired credentials, no exit strategy, DR misalignment |
| **Medium** | Notable gap | Unverified publishers, stale apps, missing vendor reviews |
| **Low** | Best practice | No vendor register, missing insurance certifications |

### 5.2 Scoring by Domain

| Domain | Weight | Areas |
|--------|--------|-------|
| Integration Security | 30% | Credential management, API security, encryption |
| Application Portfolio | 25% | Permissions, consent, stale apps |
| Vendor Risk (Acturis) | 25% | DPA, DR, exit strategy, data flows |
| Compliance | 20% | GDPR, FCA, PRA, DORA alignment |

### 5.3 Vendor Criticality Matrix

| Criticality | Criteria | Assessment Depth |
|-------------|----------|-----------------|
| **Critical** | Core business process dependency (Acturis) | Full deep-dive: DPA, DR, exit, sub-processors |
| **High** | Holds/processes PII or financial data | Contract review: DPA, data residency, certification |
| **Medium** | Business productivity tool with tenant access | Permission review, consent audit |
| **Low** | Limited access, non-sensitive data | Inventory only |

---

## 6. Deliverable Production

### 6.1 Handover Package

```
TP-Audit-[ClientName]-[Date]/
├── 01-Executive/
│   └── Executive-Summary.pdf
├── 02-Application-Portfolio/
│   ├── app-portfolio-report.pdf
│   ├── permission-analysis.pdf
│   └── [app/oauth/appreg exports]
├── 03-Acturis-Integration/
│   ├── acturis-integration-assessment.pdf
│   ├── data-flow-diagrams.md
│   └── [acturis exports]
├── 04-Vendor-Risk/
│   ├── vendor-risk-matrix.xlsx
│   ├── vendor-compliance-checklist.pdf
│   └── [vendor documentation]
├── 05-Analysis/
│   ├── gap-analysis.xlsx
│   ├── risk-register.xlsx
│   └── action-plan.pdf
└── 06-Raw-Data/
    └── [all raw exports]
```

---

## 7. Post-Audit

### 7.1 Access Revocation

```
Subject: Third-Party Application Audit Complete - Access Revocation

The third-party application snapshot audit is now complete.

Please revoke the following access:
- User: [Auditor Email]
- Entra ID Role: Global Reader
- Azure Role: Reader + Key Vault Reader on [subscriptions]

All required data has been collected.
Deliverables have been transferred to [secure location].
```

### 7.2 Cleanup

```powershell
# Disconnect all sessions
Disconnect-MgGraph
Disconnect-AzAccount

# Remove local sensitive data (after handover confirmed)
Remove-Item ./exports/ -Recurse -Force
```

---

**Document Control**

| Version | Date | Author | Status | Changes |
|---------|------|--------|--------|---------|
| 1.0.0 | Feb 2026 | Advisory Team | Draft | Initial release |
