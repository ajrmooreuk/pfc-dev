# O365 Tenancy Snapshot Audit
## Operating & Deployment Guide

**Document Version:** 1.0.0
**Date:** February 2026
**Classification:** Vendor Operations Guide
**Audience:** Audit Delivery Team / Consultant

---

## Quick Start

```powershell
# 1. Connect to Microsoft Graph
Connect-MgGraph -Scopes "Directory.Read.All","Policy.Read.All","SecurityEvents.Read.All","Mail.Read","Sites.Read.All","TeamSettings.Read.All","User.Read.All","Group.Read.All","RoleManagement.Read.All","Reports.Read.All"

# 2. Connect to Exchange Online
Connect-ExchangeOnline -UserPrincipalName auditor@domain.com

# 3. Connect to Security & Compliance
Connect-IPPSSession -UserPrincipalName auditor@domain.com

# 4. Run discovery script
./04-O365-SS-Audit-Discovery-v1.ps1 -OutputPath ./o365-audit-$(Get-Date -Format yyyyMMdd)
```

---

## 1. Pre-Engagement Checklist

### 1.1 Client Information Required

| Item | Required | Notes |
|------|----------|-------|
| **Tenant ID** | ✅ | Entra ID tenant GUID |
| **Primary Domain** | ✅ | e.g., contoso.com |
| **All Verified Domains** | ✅ | For DKIM/DMARC/SPF checks |
| **Licensing Tier** | ✅ | E1/E3/E5/F1 mix |
| **Primary Contact** | ✅ | M365 administrator |
| **Security Contact** | ✅ | For access approvals |
| **User Count** | ✅ | Confirmed: ~800 |
| **Known Compliance Requirements** | ⚪ | FCA, PRA, GDPR |
| **Preferred Audit Window** | ✅ | Business hours |

### 1.2 Engagement Confirmation

```
□ Statement of Work (SoW) signed
□ NDA executed
□ Data Processing Agreement (if PII access)
□ Access request submitted (Global Reader)
□ Audit timeline confirmed (1 week)
□ Workshop date confirmed
□ Workshop attendees confirmed
```

### 1.3 Team Preparation

| Role | Responsibility |
|------|----------------|
| Lead Consultant | Client liaison, workshop facilitation, report delivery |
| M365 Specialist | Graph API/PowerShell execution, data collection |
| Compliance Analyst | Framework mapping, gap analysis |

---

## 2. Access & Permissions Setup

### 2.1 Required Permissions

#### Option A: Built-in Role (Recommended)

```
Role: Global Reader
Scope: Tenant
Duration: 1 week (audit window + buffer)
```

Global Reader provides read-only access to all M365 admin centres.

#### Option B: Granular Roles (Minimal Privilege)

```
Required Roles:
├── Security Reader               # Secure Score, Defender
├── Compliance Administrator      # DLP, retention (read)
├── Exchange Administrator        # Exchange settings (read)
├── SharePoint Administrator      # SharePoint settings (read)
├── Teams Administrator           # Teams settings (read)
├── Reports Reader                # Usage reports
└── Directory Reader              # Entra ID (read)
```

#### Option C: Graph API Application Permissions

For fully automated collection via app registration:

```json
{
  "requiredResourceAccess": [
    {
      "resourceAppId": "00000003-0000-0000-c000-000000000000",
      "resourceAccess": [
        {"id": "7ab1d382-f21e-4acd-a863-ba3e13f7da61", "type": "Role"},
        {"id": "246dd0d5-5bd0-4def-940b-0421030a5b68", "type": "Role"},
        {"id": "230c1aed-a721-4c5d-9cb4-a90514e508ef", "type": "Role"},
        {"id": "bf394140-e372-4bf9-a898-299cfc7564e5", "type": "Role"},
        {"id": "dc5007c0-2d7d-4c42-879c-2dab87571379", "type": "Role"}
      ]
    }
  ]
}
```

### 2.2 Access Request Template

```
Subject: M365 Global Reader Access - O365 Tenancy Snapshot Audit

We request the following access for the O365 tenancy snapshot audit:

Requestor Details:
- Name: [Auditor Name]
- Email: [Auditor Email]
- Company: [Vendor Company]
- Engagement Reference: [SoW Number]

Access Requirements:
- Scope: Tenant-wide
- Role: Global Reader
- Duration: [Start Date] to [End Date + 3 day buffer]
- Justification: Pre-engagement M365 security posture assessment

Access will be used to:
1. Review Entra ID configuration (MFA, CA, roles)
2. Assess Exchange Online security policies
3. Review SharePoint/OneDrive sharing settings
4. Evaluate Teams collaboration policies
5. Check DLP and sensitivity label configuration

No changes will be made to any configuration.
No email content or document content will be accessed.
Only configuration and policy data will be reviewed.

Please confirm when access is provisioned.
```

### 2.3 Access Verification

```powershell
# Verify Graph API access
Connect-MgGraph -Scopes "Directory.Read.All"
Get-MgOrganization | Select DisplayName, VerifiedDomains

# Verify Exchange Online access
Connect-ExchangeOnline
Get-OrganizationConfig | Select Name, IsDehydrated

# Verify user count
(Get-MgUser -All).Count
# Expected: ~800

# Verify tenant details
Get-MgOrganization | Format-List
```

---

## 3. Data Collection Procedures

### 3.1 Collection Schedule

| Phase | Activity | Duration | Output |
|-------|----------|----------|--------|
| **Phase 1** | Identity & Access | 1 hour | `identity-*.json` |
| **Phase 2** | Exchange Online | 1 hour | `exchange-*.json` |
| **Phase 3** | SharePoint/OneDrive | 45 mins | `sharepoint-*.json` |
| **Phase 4** | Teams | 30 mins | `teams-*.json` |
| **Phase 5** | Compliance & DLP | 45 mins | `compliance-*.json` |
| **Phase 6** | Defender/Security | 30 mins | `security-*.json` |

### 3.2 Phase 1: Identity & Access (Entra ID)

```powershell
# --- MFA Status ---
# Get authentication methods per user
$users = Get-MgUser -All -Property Id,DisplayName,UserPrincipalName,AccountEnabled
$mfaReport = foreach ($user in $users) {
    $methods = Get-MgUserAuthenticationMethod -UserId $user.Id
    [PSCustomObject]@{
        UserPrincipalName = $user.UserPrincipalName
        Enabled = $user.AccountEnabled
        MethodCount = $methods.Count
        Methods = ($methods | ForEach-Object { $_.AdditionalProperties.'@odata.type' }) -join ','
    }
}
$mfaReport | Export-Csv exports/identity-mfa-status.csv -NoTypeInformation

# --- Conditional Access Policies ---
Get-MgIdentityConditionalAccessPolicy -All |
    ConvertTo-Json -Depth 10 > exports/identity-conditional-access.json

# --- Directory Roles and Members ---
$roles = Get-MgDirectoryRole -All
$roleMembers = foreach ($role in $roles) {
    $members = Get-MgDirectoryRoleMember -DirectoryRoleId $role.Id
    [PSCustomObject]@{
        RoleName = $role.DisplayName
        RoleId = $role.Id
        MemberCount = $members.Count
        Members = ($members | ForEach-Object { $_.AdditionalProperties.userPrincipalName }) -join ','
    }
}
$roleMembers | Export-Csv exports/identity-role-assignments.csv -NoTypeInformation

# --- Global Admin Count (Critical Check) ---
$globalAdminRole = Get-MgDirectoryRole | Where-Object { $_.DisplayName -eq "Global Administrator" }
$globalAdmins = Get-MgDirectoryRoleMember -DirectoryRoleId $globalAdminRole.Id
Write-Host "Global Admins: $($globalAdmins.Count)" -ForegroundColor $(if($globalAdmins.Count -gt 5){"Red"}else{"Green"})

# --- Guest Users ---
Get-MgUser -All -Filter "userType eq 'Guest'" |
    Select DisplayName, UserPrincipalName, CreatedDateTime, AccountEnabled |
    Export-Csv exports/identity-guest-users.csv -NoTypeInformation

# --- PIM Status ---
try {
    Get-MgPrivilegedAccessResource -PrivilegedAccessId "aadRoles" -ErrorAction Stop |
        ConvertTo-Json > exports/identity-pim-status.json
    Write-Host "PIM: Enabled" -ForegroundColor Green
} catch {
    Write-Host "PIM: Not available (licensing)" -ForegroundColor Yellow
    "PIM not available" > exports/identity-pim-status.json
}

# --- Service Principals ---
Get-MgServicePrincipal -All |
    Select DisplayName, AppId, ServicePrincipalType, AccountEnabled |
    Export-Csv exports/identity-service-principals.csv -NoTypeInformation

# --- Password Policies ---
Get-MgOrganization | Select -ExpandProperty PasswordPolicies |
    ConvertTo-Json > exports/identity-password-policies.json

# --- Sign-in Risk Policies ---
Get-MgIdentityConditionalAccessPolicy -All |
    Where-Object { $_.Conditions.SignInRiskLevels -ne $null } |
    ConvertTo-Json -Depth 10 > exports/identity-risk-policies.json
```

### 3.3 Phase 2: Exchange Online

```powershell
# --- Transport / Mail Flow Rules ---
Get-TransportRule |
    Select Name, State, Priority, SentToScope, FromScope, Mode |
    Export-Csv exports/exchange-transport-rules.csv -NoTypeInformation

# --- Rules with External Forwarding (HIGH RISK) ---
Get-TransportRule | Where-Object {
    $_.RedirectMessageTo -ne $null -or
    $_.BlindCopyTo -ne $null -or
    $_.CopyTo -ne $null
} | Select Name, State, RedirectMessageTo, BlindCopyTo, CopyTo |
    Export-Csv exports/exchange-forwarding-rules.csv -NoTypeInformation

# --- Anti-Phishing Policies ---
Get-AntiPhishPolicy |
    Select Name, Enabled, PhishThresholdLevel, EnableMailboxIntelligenceProtection,
           EnableOrganizationDomainsProtection, EnableTargetedDomainsProtection |
    Export-Csv exports/exchange-antiphish-policies.csv -NoTypeInformation

# --- Anti-Spam Policies ---
Get-HostedContentFilterPolicy |
    Select Name, SpamAction, HighConfidenceSpamAction, BulkSpamAction |
    Export-Csv exports/exchange-antispam-policies.csv -NoTypeInformation

# --- DKIM Configuration ---
Get-DkimSigningConfig |
    Select Domain, Enabled, Status |
    Export-Csv exports/exchange-dkim-status.csv -NoTypeInformation

# --- Safe Attachments ---
try {
    Get-SafeAttachmentPolicy |
        Select Name, Enable, Action, ActionOnError |
        Export-Csv exports/exchange-safe-attachments.csv -NoTypeInformation
} catch {
    "Safe Attachments not available (licensing)" > exports/exchange-safe-attachments.csv
}

# --- Safe Links ---
try {
    Get-SafeLinksPolicy |
        Select Name, EnableSafeLinksForEmail, EnableSafeLinksForTeams,
               EnableSafeLinksForOffice, TrackClicks, AllowClickThrough |
        Export-Csv exports/exchange-safe-links.csv -NoTypeInformation
} catch {
    "Safe Links not available (licensing)" > exports/exchange-safe-links.csv
}

# --- Audit Log Configuration ---
Get-AdminAuditLogConfig |
    Select UnifiedAuditLogIngestionEnabled, AdminAuditLogEnabled |
    ConvertTo-Json > exports/exchange-audit-log-config.json

# --- Mailbox Forwarding (per-user check for external) ---
Get-Mailbox -ResultSize Unlimited |
    Where-Object { $_.ForwardingSmtpAddress -ne $null -or $_.ForwardingAddress -ne $null } |
    Select DisplayName, PrimarySmtpAddress, ForwardingSmtpAddress, ForwardingAddress |
    Export-Csv exports/exchange-mailbox-forwarding.csv -NoTypeInformation

# --- DMARC/SPF (DNS checks for verified domains) ---
$domains = Get-AcceptedDomain
$dnsChecks = foreach ($domain in $domains) {
    $spf = try { Resolve-DnsName -Name $domain.DomainName -Type TXT -ErrorAction Stop |
        Where-Object { $_.Strings -match "v=spf1" } } catch { $null }
    $dmarc = try { Resolve-DnsName -Name "_dmarc.$($domain.DomainName)" -Type TXT -ErrorAction Stop } catch { $null }
    [PSCustomObject]@{
        Domain = $domain.DomainName
        DomainType = $domain.DomainType
        SPFRecord = if($spf) { $spf.Strings -join '' } else { "MISSING" }
        DMARCRecord = if($dmarc) { $dmarc.Strings -join '' } else { "MISSING" }
    }
}
$dnsChecks | Export-Csv exports/exchange-dns-records.csv -NoTypeInformation
```

### 3.4 Phase 3: SharePoint / OneDrive

```powershell
# --- SharePoint Tenant Settings ---
# (Requires SharePoint Admin module)
Connect-SPOService -Url https://<tenant>-admin.sharepoint.com

Get-SPOTenant |
    Select SharingCapability, DefaultSharingLinkType, DefaultLinkPermission,
           RequireAcceptingAccountMatchInvitedAccount, ExternalUserExpirationRequired,
           ExternalUserExpireInDays, OneDriveSharingCapability |
    ConvertTo-Json > exports/sharepoint-tenant-settings.json

# --- Site Collection Inventory ---
Get-SPOSite -Limit All |
    Select Title, Url, Template, StorageQuota, StorageUsageCurrent,
           SharingCapability, Owner, LastContentModifiedDate |
    Export-Csv exports/sharepoint-sites.csv -NoTypeInformation

# --- External Sharing Summary ---
$sites = Get-SPOSite -Limit All
$sharingSummary = $sites | Group-Object SharingCapability |
    Select Name, Count | Sort-Object Count -Descending
$sharingSummary | Export-Csv exports/sharepoint-sharing-summary.csv -NoTypeInformation

# --- OneDrive Settings ---
Get-SPOTenant |
    Select OneDriveSharingCapability, OneDriveStorageQuota,
           OrphanedPersonalSitesRetentionPeriod |
    ConvertTo-Json > exports/onedrive-settings.json
```

### 3.5 Phase 4: Teams

```powershell
# --- Teams Policies (via Graph) ---
# External Access
Get-CsExternalAccessPolicy |
    Select Identity, EnableFederationAccess, EnableTeamsConsumerAccess |
    Export-Csv exports/teams-external-access.csv -NoTypeInformation

# Guest Access
Get-CsTeamsClientConfiguration |
    Select AllowGuestUser |
    ConvertTo-Json > exports/teams-guest-config.json

# Meeting Policies
Get-CsTeamsMeetingPolicy |
    Select Identity, AllowAnonymousUsersToJoinMeeting, AllowExternalParticipantGiveRequestControl,
           AutoAdmittedUsers, AllowCloudRecording |
    Export-Csv exports/teams-meeting-policies.csv -NoTypeInformation

# Messaging Policies
Get-CsTeamsMessagingPolicy |
    Select Identity, AllowUrlPreviews, AllowGiphy, AllowMemes,
           ReadReceiptsEnabledType, ChannelModerationEnabled |
    Export-Csv exports/teams-messaging-policies.csv -NoTypeInformation

# App Permission Policies
Get-CsTeamsAppPermissionPolicy |
    Select Identity, DefaultCatalogApps, GlobalCatalogApps, PrivateCatalogApps |
    Export-Csv exports/teams-app-policies.csv -NoTypeInformation
```

### 3.6 Phase 5: Compliance & DLP

```powershell
# --- DLP Policies ---
Get-DlpCompliancePolicy |
    Select Name, Mode, Enabled, Priority, Workload |
    Export-Csv exports/compliance-dlp-policies.csv -NoTypeInformation

# --- DLP Rules ---
Get-DlpComplianceRule |
    Select Name, Policy, Disabled, ContentContainsSensitiveInformation |
    Export-Csv exports/compliance-dlp-rules.csv -NoTypeInformation

# --- Sensitivity Labels ---
Get-Label |
    Select DisplayName, Name, Priority, ContentType, Enabled |
    Export-Csv exports/compliance-sensitivity-labels.csv -NoTypeInformation

# --- Retention Policies ---
Get-RetentionCompliancePolicy |
    Select Name, Enabled, Mode, Workload, RetentionDuration |
    Export-Csv exports/compliance-retention-policies.csv -NoTypeInformation

# --- Alert Policies ---
Get-ProtectionAlert |
    Select Name, Category, Severity, IsEnabled |
    Export-Csv exports/compliance-alert-policies.csv -NoTypeInformation
```

### 3.7 Phase 6: Security / Defender

```powershell
# --- Microsoft Secure Score ---
$secureScore = Get-MgSecuritySecureScore -Top 1
$secureScore | ConvertTo-Json -Depth 5 > exports/security-secure-score.json
Write-Host "Secure Score: $($secureScore.CurrentScore) / $($secureScore.MaxScore)"

# --- Secure Score Control Profiles ---
Get-MgSecuritySecureScoreControlProfile -All |
    Select Id, Title, ImplementationStatus, Score, MaxScore |
    Export-Csv exports/security-score-controls.csv -NoTypeInformation

# --- Defender Licence Check ---
Get-MgSubscribedSku |
    Select SkuPartNumber, CapabilityStatus, ConsumedUnits |
    Export-Csv exports/security-licensing.csv -NoTypeInformation
```

---

## 4. Data Collection Checklist

```
Phase 1 - Identity:
□ identity-mfa-status.csv
□ identity-conditional-access.json
□ identity-role-assignments.csv
□ identity-guest-users.csv
□ identity-pim-status.json
□ identity-service-principals.csv
□ identity-password-policies.json
□ identity-risk-policies.json

Phase 2 - Exchange:
□ exchange-transport-rules.csv
□ exchange-forwarding-rules.csv
□ exchange-antiphish-policies.csv
□ exchange-antispam-policies.csv
□ exchange-dkim-status.csv
□ exchange-safe-attachments.csv
□ exchange-safe-links.csv
□ exchange-audit-log-config.json
□ exchange-mailbox-forwarding.csv
□ exchange-dns-records.csv

Phase 3 - SharePoint/OneDrive:
□ sharepoint-tenant-settings.json
□ sharepoint-sites.csv
□ sharepoint-sharing-summary.csv
□ onedrive-settings.json

Phase 4 - Teams:
□ teams-external-access.csv
□ teams-guest-config.json
□ teams-meeting-policies.csv
□ teams-messaging-policies.csv
□ teams-app-policies.csv

Phase 5 - Compliance:
□ compliance-dlp-policies.csv
□ compliance-dlp-rules.csv
□ compliance-sensitivity-labels.csv
□ compliance-retention-policies.csv
□ compliance-alert-policies.csv

Phase 6 - Security:
□ security-secure-score.json
□ security-score-controls.csv
□ security-licensing.csv
```

---

## 5. Analysis & Scoring

### 5.1 Scoring Methodology

| Status | Definition | Score |
|--------|------------|-------|
| **Compliant** | Meets control requirement | 100% |
| **Partial** | Partially implemented | 50% |
| **Non-Compliant** | Does not meet requirement | 0% |
| **Not Applicable** | Feature not licensed | Excluded |

### 5.2 Risk Rating

| Rating | Description | Response |
|--------|-------------|----------|
| **Critical** | Immediate exposure (MFA gaps, external forwarding) | Immediate action |
| **High** | Significant gap (no CA policies, legacy auth) | Within 30 days |
| **Medium** | Notable gap (DLP gaps, sharing too open) | Within 90 days |
| **Low** | Best practice deviation | As convenient |

---

## 6. Deliverable Production

### 6.1 Deliverables

| # | Deliverable | Format |
|---|------------|--------|
| 1 | Identity Posture Report | PDF |
| 2 | Email Security Assessment | PDF |
| 3 | Data Protection Review | PDF |
| 4 | Collaboration Governance Report | PDF |
| 5 | Compliance Gap Analysis | Excel |
| 6 | Risk Register | Excel |
| 7 | Executive Summary | PDF (1-2 pages) |
| 8 | Action Plan (30/60/90) | PDF |
| 9 | Raw Data Exports | JSON/CSV |

### 6.2 Handover Package

```
O365-Audit-[ClientName]-[Date]/
├── 01-Executive/
│   └── Executive-Summary.pdf
├── 02-Identity/
│   ├── identity-posture-report.pdf
│   └── [identity exports]
├── 03-Email/
│   ├── email-security-report.pdf
│   └── [exchange exports]
├── 04-Data-Protection/
│   ├── data-protection-report.pdf
│   └── [sharepoint/compliance exports]
├── 05-Collaboration/
│   ├── collaboration-governance-report.pdf
│   └── [teams exports]
├── 06-Analysis/
│   ├── gap-analysis.xlsx
│   ├── risk-register.xlsx
│   └── action-plan.pdf
└── 07-Raw-Data/
    └── [all raw exports]
```

---

## 7. Post-Audit

### 7.1 Access Revocation

```
Subject: O365 Audit Complete - Access Revocation Request

The O365 tenancy snapshot audit is now complete.

Please revoke the following access:
- User: [Auditor Email]
- Role: Global Reader
- Scope: Tenant

All required data has been collected.
Deliverables have been transferred to [secure location].
```

### 7.2 Cleanup

```powershell
# Disconnect all sessions
Disconnect-MgGraph
Disconnect-ExchangeOnline -Confirm:$false
Disconnect-SPOService

# Remove local sensitive data (after handover confirmed)
Remove-Item ./exports/ -Recurse -Force
```

---

**Document Control**

| Version | Date | Author | Status | Changes |
|---------|------|--------|--------|---------|
| 1.0.0 | Feb 2026 | Advisory Team | Draft | Initial release |
