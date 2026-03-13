# Azure MCSB — Microsoft Cloud Security Benchmarks v2

> **Source:** Microsoft Cloud Security Benchmark (MCSB) v1 & v2
> **Converted from:** `Azure-MCSB-Sec-Benchmarks-v2.xlsx`
> **Purpose:** Reference security benchmark controls for Azure Landing Zone assessments
> **Related:** PFI-W4M-RCS-AZA — ALZ + WAF Assessment Platform

---

## Table of Contents

1. [MCSB v1](#mcsb-v1)
2. [MCSB v2](#mcsb-v2)
3. [MCSBV2 Details](#mcsbv2-details)

---

## MCSB v1

| Control Domains | MCSB v1 | Responsibility | Col 4 | Description |
| --- | --- | --- | --- | --- |
| Network security (NS) | MCSB v1 | Client/ Sol Provider | Component Notes | Network Security covers controls to secure and protect networks, including securing virtual networks, establishing private connections, preventing, and mitigating external attacks, and securing DNS. |
| (NS) 1 NW Segmentation | MCSB v1 | Client | Azure Environment Assumed | NS-1: Establish network segmentation boundaries |
| (NS) 2 Secure Cloud with NW Controls | MCSB v1 | Client | Azure Environment Assumed | NS-2: Secure cloud native services with network controls |
| (NS) 3 Edge of Ent NW Firewall | MCSB v1 | Client | Azure Environment Assumed | NS-3: Deploy firewall at the edge of enterprise network |
| (NS) 4 Intrustion Detection and Prevention | MCSB v1 | Client | Azure Environment Assumed | NS-4: Deploy intrusion detection/intrusion prevention systems (IDS/IPS) |
| (NS) 5 DDOS | MCSB v1 | Client | Azure Environment Assumed | NS-5: Deploy DDOS protection |
| (NS) 6 WAF | MCSB v1 | Client | Azure Environment Assumed | NS-6: Deploy web application firewall |
| (NS) 7 Simplify NW Config | MCSB v1 | Joint | Azure Environment Assumed | NS-7: Simplify network security configuration |
| (NS) 8 Services and Protocols | MCSB v1 | Client | Azure Environment Assumed | NS-8: Detect and disable insecure services and protocols |
| (NS) 9 Connect on Prem and Cloud Privatly | MCSB v1 | Client | Azure Environment Assumed | NS-9: Connect on-premises or cloud network privately |
| (NS) 10 | MCSB v1 | Client | Azure Environment Assumed | NS-10: Ensure Domain Name System (DNS) security |
| Identity Management (IM) | MCSB v1 | Client/ Sol Provider | Client Controlled | Identity Management covers controls to establish a secure identity and access controls using identity and access management systems, including the use of single sign-on, strong authentications, manage |
| (IM) 1 ID and Authentication | MCSB v1 | Joint | Azure Environment Assumed | IM-1: Use centralized identity and authentication system |
| (IM) 2 Protect ID and Authentication | MCSB v1 | Joint | Azure Environment Assumed | IM-2: Protect identity and authentication systems |
| (IM) 3 Manage App IDS | MCSB v1 | Joint | Azure Environment Assumed | IM-3: Manage application identities securely and automatically |
| (IM) 4 Authentication Server | MCSB v1 | Joint | Azure Environment Assumed | IM-4: Authenticate server and services |
| (IM) 5 Use SSO for App Access | MCSB v1 | Joint | Azure Environment Assumed | IM-5: Use single sign-on (SSO) for application access |
| (IM) 6 Use Strong Authentication Controls | MCSB v1 | Joint | Azure Environment Assumed | IM-6: Use strong authentication controls |
| (IM) 7 Restrict resource access | MCSB v1 | Joint | Azure Environment Assumed | IM-7: Restrict resource access based on conditions |
| (IM) 8 Restrict creds exposure | MCSB v1 | Joint | Azure Environment Assumed | IM-8: Restrict the exposure of credentials and secrets |
| (IM) 9 Secure User App Access | MCSB v1 | Joint | Azure Environment Assumed | IM-9: Secure user access to existing applications |
| Privileged Access (PA) | MCSB v1 | Client/ Sol Provider | Client Controlled | Privileged Access covers controls to protect privileged access to your tenant and resources, including a range of controls to protect your administrative model, administrative accounts, and privileged |
| (PA) 1 Separate and Highly Priv and Admin Users | MCSB v1 | Joint | Azure Environment Assumed | PA-1: Separate and limit highly privileged/administrative users |
| (PA) 2 Avoid Standing Access | MCSB v1 | Client | Azure Environment Assumed | PA-2: Avoid standing access for user accounts and permissions |
| (PA) 3 Manage Lifecycle of identities and entitlements | MCSB v1 | Client | Azure Environment Assumed | PA-3: Manage lifecycle of identities and entitlements |
| (PA) 4 Review and Reconcile users | MCSB v1 | Joint | Azure Environment Assumed | PA-4: Review and reconcile user access regularly |
| (PA) 5 Set-Up Emergency Access | MCSB v1 | Client | Azure Environment Assumed | PA-5: Set up emergency access |
| (PA) 6 Use Priv Access WS where possible | MCSB v1 | Client | Azure Environment Assumed | PA-6: Use privileged access workstations |
| (PA) 7 Least Privs Policy | MCSB v1 | Joint | Azure Environment Assumed | PA-7: Follow just enough administration (least privilege) principle |
| (PA) 8 Determine access process for cloud provider | MCSB v1 | Client | Azure Environment Assumed | PA-8 Determine access process for cloud provider support |
| Data Protection (DP) | MCSB v1 | Client/ Sol Provider | Client Controlled | Data Protection covers control of data protection at rest, in transit, and via authorized access mechanisms, including discover, classify, protect, and monitor sensitive data assets using access contr |
| (DP) 1 Discover classify and Label | MCSB v1 | Joint | Azure /Purview MCSB | DP-1: Discover, classify, and label sensitive data |
| (DP) 2 Monitoring Sensitive Data | MCSB v1 | Joint | Azure /Purview MCSB | DP-2: Monitor anomalies and threats targeting sensitive data |
| (DP) 3 Encrypt Data In Transit | MCSB v1 | Joint | Azure MCSB | DP-3: Encrypt sensitive data in transit |
| (DP) 4 Encrypt Data at Rest | MCSB v1 | Joint | Azure MCSB | DP-4: Enable data at rest encryption by default |
| (DP) 5 Customer Managed or Azure keys? | MCSB v1 | Joint | Azure MCSB | DP-5: Use customer-managed key option in data at rest encryption when required |
| (DP) 6 Secure Key Process | MCSB v1 | Client | Azure MCSB | DP-6: Use a secure key management process |
| (DP) 7 Cert Management | MCSB v1 | Joint | Azure MCSB | DP-7: Use a secure certificate management process |
| (DP) 8 Cert Repository | MCSB v1 | Client | Azure MCSB | DP-8: Ensure security of key and certificate repository |
| Asset Management (AM) | MCSB v1 | Client/ Sol Provider | Assets protected in Azure or Cloud Platforms Approved | Asset Management covers controls to ensure security visibility and governance over your resources, including recommendations on permissions for security personnel, security access to asset inventory,  |
| (AM) 1 Track assets | MCSB v1 | Client | Azure MCSB | AM-1: Track asset inventory and their risks |
| (AM) 2 approved asset Services | MCSB v1 | Joint | Approved Architecture and design | AM-2: Use only approved services |
| (AM) 3 asset secure lifecycle | MCSB v1 | Joint | Azure Environment | AM-3: Ensure security of asset lifecycle management |
| (AM) 4 Asset access restricted | MCSB v1 | Client | Azure Environment | AM-4: Limit access to asset management |
| (AM) 5 Asset Approved Apps on VMs | MCSB v1 | Joint | Approved Architecture and design | AM-5: Use only approved applications in virtual machine |
| Logging and Threat Detection (LT) | MCSB v1 | Client/ Sol Provider | Largely client controlled, logs augmented where data and applications required No Personal Data in Logs | Logging and Threat Detection covers controls for detecting threats on cloud, and enabling, collecting, and storing audit logs for cloud services, including enabling detection, investigation, and remed |
| (LT) 1 Enable Threat Detection | MCSB v1 | Client | Azure Environment | LT-1: Enable threat detection capabilities |
| (LT) 2 Threat Detection ID and Access | MCSB v1 | Joint | Azure Environment | LT-2: Enable threat detection for identity and access management |
| (LT) 3 Enable Logging for Security Investigation | MCSB v1 | Joint | Azure Environment | LT-3: Enable logging for security investigation |
| (LT) 4 Enable NW Logging for Investigation | MCSB v1 | Client | Azure Environment | LT-4: Enable network logging for security investigation |
| (LT) 5 | MCSB v1 | Client | Azure Environment | LT-5: Centralize security log management and analysis |
| (LT) 6 | MCSB v1 | Client | Azure Environment | LT-6: Configure log storage retention |
| (LT) 7 | MCSB v1 | Joint | Azure Environment | LT-7: Use approved time synchronization sources |
| Incident Response (IR) | MCSB v1 | Client/ Sol Provider | Client drives Incident Response Plan | Incident Response covers controls in incident response life cycle - preparation, detection and analysis, containment, and post-incident activities, including using Azure services (such as Microsoft De |
| (IR) 1 Plan | MCSB v1 | Client | Azure Environment | IR-1: Preparation - update incident response plan and handling process |
| (IR) 2 Notifications | MCSB v1 | Client | Azure Environment | IR-2: Preparation - setup incident notification |
| (IR) 3 Alerts and Tracking | MCSB v1 | Client | Azure Environment | IR-3: Detection and analysis - create incidents based on high-quality alerts |
| (IR) 4 Incident Investigations | MCSB v1 | Joint | Azure Environment | IR-4: Detection and analysis - investigate an incident |
| (IR) 5 Prioritise Incidents | MCSB v1 | Client | Azure Environment | IR-5: Detection and analysis - prioritize incidents |
| (IR) 6 Contain eradicate and recover | MCSB v1 | Joint | Azure Environment | IR-6: Containment, eradication and recovery - automate the incident handling |
| (IR) 7 LFE and Evidence Storage | MCSB v1 | Joint | Azure Environment | IR-7: Post-incident activity - conduct lessons learned and retain evidence |
| Posture and Vulnerability Management (PV) | MCSB v1 | Client/ Sol Provider | Client Controlled | Posture and Vulnerability Management focuses on controls for assessing and improving cloud security posture, including vulnerability scanning, penetration testing and remediation, as well as security  |
| (PV) 1 Secure config | MCSB v1 | Joint | Azure Environment | PV-1: Define and establish secure configurations |
| (PV) 2 Audit and enforce secure config | MCSB v1 | Client | Azure Environment | PV-2: Audit and enforce secure configurations |
| (PV) 3 Secure Config Compute Resources | MCSB v1 | Joint | Azure Environment | PV-3: Define and establish secure configurations for compute resources |
| (PV) 4 Audit and enforce secure Compute | MCSB v1 | Joint | Azure Environment | PV-4: Audit and enforce secure configurations for compute resources |
| (PV) 5 Vulnerability Assessments | MCSB v1 | Joint *TBC | Azure Environment | PV-5: Perform vulnerability assessments |
| (PV) 6 Remediate Vulnerabilities | MCSB v1 | Joint *TBC | Azure Environment | PV-6: Rapidly and automatically remediate vulnerabilities |
| (PV) 7 Conduct Red Team Ops | MCSB v1 | Client | Azure Environment | PV-7: Conduct regular red team operations |
| Endpoint Security (ES) | MCSB v1 | Client/ Sol Provider | Client controlled | Endpoint Security covers controls in endpoint detection and response, including use of endpoint detection and response (EDR) and anti-malware service for endpoints in cloud environments. |
| (ES) 1 EP EDR | MCSB v1 | Joint | Azure Environment | ES-1: Use Endpoint Detection and Response (EDR) |
| (ES) 2 Antimalware | MCSB v1 | Joint | Azure Environment | ES-2: Use modern anti-malware software |
| (ES) 3 Antimalware updates | MCSB v1 | Client | Azure Environment | ES-3: Ensure anti-malware software and signatures are updated |
| Backup and Recovery (BR) | MCSB v1 | Client/ Sol Provider |  | Backup and Recovery covers controls to ensure that data and configuration backups at the different service tiers are performed, validated, and protected. |
| (BR) 1 Auto Backups | MCSB v1 | Client | Azure MCSB | BR-1: Ensure regular automated backups |
| (BR) 2 Protect Backups | MCSB v1 | Client | Azure MCSB | BR-2: Protect backup and recovery data |
| (BR) 3 Monitor Backups | MCSB v1 | Client | Azure MCSB | BR-3: Monitor backups |
| (BR) 4 Test Backups | MCSB v1 | Joint | Azure MCSB | BR-4: Regularly test backup |
| DevOps Security (DS) | MCSB v1 | Client/ Sol Provider | Client Controlled | DevOps Security covers the controls related to the security engineering and operations in the DevOps processes, including deployment of critical security checks (such as static application security te |
| (DS) 1 Threat Modelling | MCSB v1 | Joint | Azure Environment MCSB Cntrols | DS-1: Conduct threat modeling |
| (DS) 2 Supply Chain Security Secured | MCSB v1 | Joint | Azure Environment Approved Design MCSB Cntrols | DS-2: Ensure software supply chain security |
| (DS) 3 Secure DevOps | MCSB v1 | Client | Azure Environment Approved Design MCSB Cntrols | DS-3: Secure DevOps infrastructure |
| (DS) 4 Static testing | MCSB v1 | Joint | Azure Environment Approved Design MCSB Cntrols | DS-4: Integrate static application security testing into DevOps pipeline |
| (DS) 5 Dynamic Testing | MCSB v1 | Joint *TBC | Azure Environment Approved Design MCSB Cntrols | DS-5: Integrate dynamic application security testing into DevOps pipeline |
| (DS) 6  Workload Security | MCSB v1 | Client | Azure Environment Approved Design MCSB Cntrols | DS-6: Enforce security of workload throughout DevOps lifecycle |
| (DS) 7 Logging and Monitoring Enabled | MCSB v1 | Client | Azure Environment Approved Design MCSB Cntrols | DS-7: Enable logging and monitoring in DevOps |
| Governance and Strategy (GS) | MCSB v1 | Client/ Sol Provider | Client Controlled | Governance and Strategy provides guidance for ensuring a coherent security strategy and documented governance approach to guide and sustain security assurance, including establishing roles and respons |
| (GS) 1 RACI | MCSB v1 | Client | Azure Environment Approved Design MCSB Cntrols | GS-1: Align organization roles, responsibilities and accountabilities |
| (GS) 2 Enterprise Segmentation and sep of duties | MCSB v1 | Client | Azure Environment Approved Design MCSB Cntrols | GS-2: Define and implement enterprise segmentation/separation of duties strategy |
| (GS) 3 Data Protection Strategy | MCSB v1 | Client | Azure Environment Approved Design MCSB Cntrols | GS-3: Define and implement data protection strategy |
| (GS) 4 NW Security Strategy | MCSB v1 | Client | Azure Environment Approved Design MCSB Cntrols | GS-4: Define and implement network security strategy |
| (GS) 5 Security Posture Management Strategy | MCSB v1 | Client | Azure Environment Approved Design MCSB Cntrols | GS-5: Define and implement security posture management strategy |
| (GS) 6 ID and Priv Access Strategy | MCSB v1 | Client | Azure Environment Approved Design MCSB Cntrols | GS-6: Define and implement identity and privileged access strategy |
| (GS) 7 LT and IR Strategy | MCSB v1 | Client | Azure Environment Approved Design MCSB Cntrols | GS-7: Define and implement logging, threat detection and incident response strategy |
| (GS) 8 Backup and Recovery Strategy | MCSB v1 | Client | Azure Environment Approved Design MCSB Cntrols | GS-8: Define and implement backup and recovery strategy |
| (GS) 9 Endpoint Security Strategy | MCSB v1 | Client | Azure Environment Approved Design MCSB Cntrols | GS-9: Define and implement endpoint security strategy |
| (GS) 10 DevSecOps Security Strategy | MCSB v1 | Client | Azure Environment Approved Design MCSB Cntrols | GS-10: Define and implement DevOps security strategy |
| (GS) 11 Multi-Cloud Security Strategy | MCSB v1 | Client | Azure Environment Approved Design MCSB Cntrols | GS-11: Define and implement multi-cloud security strategy |

---

## MCSB v2

| Security domain | Description |
| --- | --- |
| Network security (NS) | Network Security covers controls to secure and protect networks, including securing virtual networks, establishing private connections, preventing and mitigating external attacks, and securing DNS. |
| Identity Management (IM) | Identity Management covers controls to establish a secure identity and access controls by using identity and access management systems, including the use of single sign-on, strong authentications, man |
| Privileged Access (PA) | Privileged Access covers controls to protect privileged access to your tenant and resources, including a range of controls to protect your administrative model, administrative accounts, and privileged |
| Data Protection (DP) | Data Protection covers control of data protection at rest, in transit, and via authorized access mechanisms, including discover, classify, protect, and monitor sensitive data assets by using access co |
| Asset Management (AM) | Asset Management covers controls to ensure security visibility and governance over your resources, including recommendations on permissions for security personnel, security access to asset inventory,  |
| Logging and Threat Detection (LT) | Logging and Threat Detection covers controls for detecting threats on cloud, and enabling, collecting, and storing audit logs for cloud services, including enabling detection, investigation, and remed |
| Incident Response (IR) | Incident Response covers controls in incident response life cycle - preparation, detection and analysis, containment, and post-incident activities, including using Azure services (such as Microsoft De |
| Posture and Vulnerability Management (PV) | Posture and Vulnerability Management focuses on controls for assessing and improving cloud security posture, including vulnerability scanning, penetration testing and remediation, as well as security  |
| Endpoint Security (ES) | Endpoint Security covers controls in endpoint detection and response, including use of endpoint detection and response (EDR) and anti-malware service for endpoints in cloud environments. |
| Backup and Recovery (BR) | Backup and Recovery covers controls to ensure that data and configuration backups at the different service tiers are performed, validated, and protected. |
| DevOps Security (DS) | DevOps Security covers the controls related to the security engineering and operations in the DevOps processes, including deployment of critical security checks (such as static application security te |
| Artificial Intelligence Security (AI) | Artificial Intelligence Security covers controls to ensure the secure development, deployment, and operation of AI models and services, including AI platform security, AI application security and AI s |

---

## MCSBV2 Details

| Col 1 | MCSB V2 | Col 3 |
| --- | --- | --- |
| AI | NS-1: Establish network segmentation boundaries |  |
|  | NS-2: Secure cloud native services with network controls |  |
|  | NS-3: Deploy firewall at the edge of enterprise network |  |
|  | NS-4: Deploy intrusion detection/intrusion prevention systems (IDS/IPS) |  |
|  | NS-5: Deploy DDOS protection |  |
|  | NS-6: Deploy web application firewall |  |
| 7.0 | NS-7 MANAGING NS | https://learn.microsoft.com/en-us/security/benchmark/azure/mcsb-v2-network-security#ns-7 |
|  | NS-8: Detect and disable insecure services and protocols |  |
|  | NS-9: Connect on-premises or cloud network privately |  |
|  | NS-10: Ensure Domain Name System (DNS) security |  |
|  | IDENTITY MANAGEMENT |  |
|  | IM-1: Centralize identity and authentication while ensuring isolation |  |
|  | IM-2: Protect identity and authentication systems |  |
|  | IM-3: Manage application identities securely and automatically |  |
|  | IM-4: Authenticate server and services |  |
|  | IM-5: Use single sign-on (SSO) for application access |  |
|  | IM-6: Use strong authentication controls |  |
|  | IM-7: Restrict resource access based on conditions |  |
|  | Identity Management |  |
|  | IM-8: Restrict the exposure of credentials and secrets |  |
|  | Privileged Access |  |
|  | Data Protection |  |
|  | Asset Management |  |
|  | Logging and Threat Detection |  |
|  | Incident Response |  |
|  | Posture and Vulnerability Management |  |
|  | Endpoint Security |  |
|  | Backup and Recovery |  |
|  | DevOps Security |  |
|  | DS-1: Conduct threat modeling |  |
|  | DS-2: Secure the software supply chain |  |
|  | DS-3: Secure the DevOps infrastructure |  |
|  | DS-4: Integrate Static Application Security Testing (SAST) |  |
|  | DS-5: Integrate Dynamic Application Security Testing (DAST) |  |
|  | DS-6: Secure the workload lifecycle |  |
|  | DS-7: Implement DevOps logging and monitoring |  |
|  | Artificial Intelligence Security |  |
|  | AI-1: Ensure use of approved models |  |
|  | AI-2: Implement multi-layered content filtering |  |
|  | AI-3: Adopt safety meta-prompts |  |
|  | AI-4: Apply least privilege for agent functions |  |
|  | AI-5: Ensure human-in-the-loop |  |
|  | AI-6: Establish monitoring and detection |  |
|  | AI-7: Perform continuous AI Red Teaming |  |
|  | Controls to Azure Policy mapping |  |

---
