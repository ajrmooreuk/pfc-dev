# Cybersecurity & Information Security Standards Reference
## For AI-Augmented CI/CD Pipeline Design & Implementation

**Document Classification:** PF-CORE Security Architecture Input  
**Version:** 1.0.0  
**Date:** 2025-02-14  
**Scope:** UK, EU, USA & International Standards Bodies and Standards  
**Purpose:** Comprehensive input catalogue for security analysis, design, and implementation of AI-augmented CI/CD pipelines across the Platform Foundation Core (PF-Core) ecosystem

---

## 1. Standards Bodies — Regulatory & Advisory

### 1.1 United Kingdom

| Body | Full Name | Role | Key Outputs |
|------|-----------|------|-------------|
| **NCSC** | National Cyber Security Centre | UK's technical authority for cyber threats | CAF v4.0, Cyber Essentials, 10 Steps to Cyber Security |
| **ICO** | Information Commissioner's Office | Data protection regulator (UK GDPR, DPA 2018) | Enforcement, guidance, NIS competent authority for RDSPs |
| **DSIT** | Dept for Science, Innovation & Technology | Cyber policy lead, AI regulation strategy | Cyber Security & Resilience Bill, AI White Paper |
| **FCA** | Financial Conduct Authority | Financial services operational resilience | Operational Resilience Framework (aligned to DORA-equivalent) |
| **PRA** | Prudential Regulation Authority | Prudential supervision of financial firms | SS1/21 Operational Resilience |
| **BSI (British Standards)** | British Standards Institution | National standards body (ISO member) | BS 10012 (PIMS), sector-specific guidance |
| **IASME** | IASME Consortium | Cyber Essentials certification partner | Cyber Essentials, Cyber Essentials Plus delivery |
| **NHS England Digital** | NHS cyber security authority | Health sector cyber governance | DSPT (Data Security and Protection Toolkit) |

### 1.2 European Union

| Body | Full Name | Role | Key Outputs |
|------|-----------|------|-------------|
| **ENISA** | EU Agency for Cybersecurity | EU cyber security centre of expertise | Threat landscape reports, certification schemes, NIS2 guidance |
| **EDPB** | European Data Protection Board | EU data protection coordination | GDPR guidelines, binding decisions |
| **EC DG CNECT** | European Commission DG Connect | Digital Single Market policy | EU AI Act, NIS2, CRA, DORA, Digital Omnibus |
| **ESAs** | European Supervisory Authorities (EBA/EIOPA/ESMA) | Financial sector oversight | DORA technical standards, CTPP designation |
| **CEN/CENELEC** | European Committee for Standardization | European standards development | Harmonised standards under EU AI Act |

### 1.3 United States

| Body | Full Name | Role | Key Outputs |
|------|-----------|------|-------------|
| **NIST** | National Institute of Standards & Technology | Federal cybersecurity standards | CSF 2.0, SP 800-53, SP 800-218 (SSDF), AI RMF, Cyber AI Profile |
| **CISA** | Cybersecurity & Infrastructure Security Agency | Federal cyber defence coordination | BOD 20-01, Secure by Design, SBOM guidance |
| **FTC** | Federal Trade Commission | Consumer protection & data practices | AI enforcement guidance, deceptive practices |
| **SEC** | Securities and Exchange Commission | Public company cyber disclosure | Cyber Incident Disclosure Rule (2023) |
| **NYDFS** | NY Dept of Financial Services | State-level financial cyber regulation | 23 NYCRR 500 Cybersecurity Regulation |
| **DoD** | Department of Defense | Military/defence cyber standards | CMMC 2.0, DFARS |
| **OMB** | Office of Management & Budget | Federal IT policy | M-24-04 (AI governance), FedRAMP |

### 1.4 International

| Body | Full Name | Role | Key Outputs |
|------|-----------|------|-------------|
| **ISO/IEC** | International Organization for Standardization / IEC | Global standards development | ISO 27000 family, ISO 42001, ISO 31000 |
| **OWASP** | Open Worldwide Application Security Project | Application security community | Top 10 (2025), Top 10 for LLMs (2025), SAMM, ASVS |
| **CSA** | Cloud Security Alliance | Cloud security best practice | CCM, STAR, AI Safety Initiative |
| **IETF** | Internet Engineering Task Force | Internet protocol standards | TLS, OAuth, SCIM |
| **IEEE** | Institute of Electrical & Electronics Engineers | Technical standards | IEEE 7000 (ethical AI), IEEE 2841 (AI governance) |
| **MITRE** | MITRE Corporation | Threat intelligence & frameworks | ATT&CK, ATLAS (adversarial ML), CWE, CVE |
| **OpenSSF** | Open Source Security Foundation | Open source software security | SLSA, Scorecard, Sigstore |
| **FIRST** | Forum of Incident Response & Security Teams | Incident response coordination | CVSS, TLP, PSIRT framework |

---

## 2. Legislation & Regulation

### 2.1 UK Legislation

| Legislation | Status | Relevance to AI CI/CD |
|------------|--------|----------------------|
| **Cyber Security & Resilience Bill** | Introduced Parliament Nov 2025; 2nd reading Jan 2026 | Expands NIS Regulations to MSPs, data centres; 24hr/72hr incident reporting; £100k/day fines; NCSC CAF alignment |
| **UK GDPR / Data Protection Act 2018** | Active | Personal data in training sets, model outputs, logs; DPIAs for AI processing; data minimisation in pipelines |
| **NIS Regulations 2018** | Active (being amended by CS&R Bill) | Essential services & digital service providers; risk management; incident notification |
| **PSTI Act 2022** | Active (from Apr 2024) | IoT/connected product security; default passwords; vulnerability disclosure; relevant for edge AI |
| **Online Safety Act 2023** | Active | Content moderation AI; illegal content duties; algorithmic transparency |
| **Computer Misuse Act 1990** | Active | Unauthorised access; AI-assisted attacks; penetration testing scope |
| **Investigatory Powers Act 2016** | Active | Lawful interception; data retention; encryption capabilities |

### 2.2 EU Legislation

| Legislation | Status | Relevance to AI CI/CD |
|------------|--------|----------------------|
| **EU AI Act (Reg 2024/1689)** | In force; obligations phasing 2024–2027 | Risk classification (unacceptable/high/limited/minimal); conformity assessment; FRIA; transparency; AI system registries; high-risk CI/CD controls |
| **NIS2 Directive (2022/2555)** | Transposition deadline Oct 2024; Digital Omnibus amendments proposed Nov 2025 | Broader scope (essential + important entities); supply chain security; incident reporting (24hr/72hr); €10M+ fines or 2% revenue |
| **GDPR (Reg 2016/679)** | Active; Digital Omnibus amendments proposed Nov 2025 | Data protection by design/default; DPIA; automated decision-making (Art 22); breach notification (96hr under Omnibus) |
| **DORA (Reg 2022/2554)** | Applied from Jan 2025 | Financial sector ICT resilience; third-party risk management; CTPP oversight; penetration testing; 2% global turnover fines |
| **Cyber Resilience Act (CRA)** | In force Dec 2024; obligations apply Dec 2027 | Products with digital elements; secure-by-design; vulnerability handling; SBOM requirements; CE marking |
| **ePrivacy Directive** | Active (being amended via Omnibus) | Cookie/tracking consent; communications privacy; transitioning into GDPR |
| **Digital Omnibus (proposed Nov 2025)** | Proposed; legislative proceedings 2026+ | Streamlines GDPR + NIS2 + DORA + eIDAS + CER; single incident reporting portal via ENISA; AI Act delays for some high-risk systems |

### 2.3 US Federal Requirements

| Requirement | Relevance to AI CI/CD |
|------------|----------------------|
| **Executive Order 14028 (2021)** | Secure software development; SBOM requirements; zero trust; SSDF attestation for federal suppliers |
| **EO 14110 (2023) — Safe, Secure AI** | AI system reporting; red-teaming; watermarking; safety testing (partially revoked, but NIST work continues) |
| **FedRAMP** | Cloud service authorisation for federal use; continuous monitoring |
| **CMMC 2.0** | Defence contractor cybersecurity maturity; CUI protection |
| **HIPAA** | Health data protection; relevant for AI in healthcare |
| **SOX (Sarbanes-Oxley)** | Financial reporting integrity; CI/CD audit trails; build integrity |
| **PCI DSS v4.0** | Payment data; supply chain integrity; build pipeline controls |
| **SEC Cybersecurity Rule** | Material incident disclosure within 4 business days |

---

## 3. ISO/IEC Standards — Complete Reference

### 3.1 ISO 27000 Family (Information Security)

| Standard | Title | CI/CD Relevance |
|----------|-------|-----------------|
| **ISO/IEC 27001:2022** | ISMS Requirements | **Foundation standard** — certifiable ISMS; risk assessment; Annex A controls; mandatory for enterprise trust |
| **ISO/IEC 27002:2022** | Information security controls | 93 controls in 4 domains; implementation guidance for 27001 Annex A |
| **ISO/IEC 27003** | ISMS implementation guidance | Building ISMS for CI/CD environments |
| **ISO/IEC 27004** | ISMS monitoring, measurement, analysis | Security metrics for pipeline health dashboards |
| **ISO/IEC 27005** | Information security risk management | Risk assessment methodology for AI pipeline threats |
| **ISO/IEC 27006-1** | ISMS audit & certification requirements | Auditor standards for ISMS certification |
| **ISO/IEC 27006-2** | PIMS audit & certification | Privacy audit standards |
| **ISO/IEC 27007** | ISMS auditing guidelines | Internal audit procedures for CI/CD security |
| **ISO/IEC TS 27008** | Assessment of information security controls | Technical control verification |
| **ISO/IEC 27009** | Sector-specific application of 27001 | Industry adaptation guidance |
| **ISO/IEC 27010** | Inter-organization information sharing | Cross-tenant/cross-venture security data exchange |
| **ISO/IEC 27011** | Telecommunications ISMS | Relevant for communications infrastructure |
| **ISO/IEC 27013** | Integrated 27001 + 20000-1 implementation | ISMS + IT service management integration |
| **ISO/IEC 27014** | Information security governance | Board-level cyber governance frameworks |
| **ISO/IEC TR 27016** | Organisational economics | Cost-benefit of security controls |
| **ISO/IEC 27017:2015** | Cloud security controls | **Critical** — cloud-specific controls for Supabase, Vercel, CI runners |
| **ISO/IEC 27018:2019** | PII protection in public cloud | PII handling for cloud-processed AI training/inference data |
| **ISO/IEC 27019** | Energy sector ISMS | Reference for critical infrastructure clients |
| **ISO/IEC 27701:2019** | Privacy Information Management System | **Critical** — PIMS extension to 27001; GDPR/CCPA mapping; PII controller/processor guidance |
| **ISO 27799** | Health sector ISMS | Healthcare client deployments |

### 3.2 ISO/IEC 42000 Family (Artificial Intelligence)

| Standard | Title | CI/CD Relevance |
|----------|-------|-----------------|
| **ISO/IEC 42001:2023** | AI Management System (AIMS) | **Critical** — certifiable AI governance; risk assessment; lifecycle controls; Annex A controls for fairness, transparency, adversarial resilience |
| **ISO/IEC 42005:2025** | AI system impact assessment | AIMS impact assessment process |
| **ISO/IEC 23894** | AI risk management | AI-specific risk assessment methodology |
| **ISO/IEC 22989** | AI concepts and terminology | Shared vocabulary for AI governance |
| **ISO/IEC 23053** | Framework for AI systems using ML | ML pipeline architecture reference |
| **ISO/IEC TR 24027** | Bias in AI systems | Fairness testing in CI/CD quality gates |
| **ISO/IEC TR 24028** | Trustworthiness in AI | Trust requirements for AI deployment |
| **ISO/IEC TR 24029** | Assessment of robustness of neural networks | Model robustness testing standards |
| **ISO/IEC 24668** | AI process management framework | AI development lifecycle governance |
| **ISO/IEC 5338** | AI system lifecycle processes | Development and deployment stages |
| **ISO/IEC 5339** | AI use case guidance | Use case categorisation and risk |

### 3.3 Other Relevant ISO Standards

| Standard | Title | CI/CD Relevance |
|----------|-------|-----------------|
| **ISO 31000:2018** | Risk management | Enterprise risk management foundation |
| **ISO/IEC 27034** | Application security | Secure SDLC for AI applications |
| **ISO/IEC 27035** | Incident management | Security incident handling in CI/CD |
| **ISO/IEC 27036** | Supplier relationship security | Third-party/supply chain controls for AI models |
| **ISO/IEC 27037** | Digital evidence identification | Forensic readiness in pipelines |
| **ISO/IEC 27040** | Storage security | Data-at-rest for model weights, training data |
| **ISO/IEC 27050** | Electronic discovery | Legal hold and data preservation |
| **ISO 22301** | Business continuity management | Pipeline resilience and recovery |
| **ISO 9001** | Quality management | Quality gates in CI/CD |

---

## 4. NIST Publications — Complete Reference

### 4.1 Core Frameworks

| Publication | Title | CI/CD Relevance |
|-------------|-------|-----------------|
| **NIST CSF 2.0** | Cybersecurity Framework 2.0 (Feb 2024) | **Foundation** — 6 functions (GOVERN, IDENTIFY, PROTECT, DETECT, RESPOND, RECOVER); profiles; tiers; risk-based |
| **NIST AI RMF 1.0** | AI Risk Management Framework (Jan 2023) | 4 functions (GOVERN, MAP, MEASURE, MANAGE); trustworthy AI characteristics; voluntary but increasingly referenced |
| **NIST IR 8596 (Draft)** | Cyber AI Profile | **Critical emerging** — maps AI-specific risks onto CSF 2.0; 3 focus areas: securing AI components, AI-enabled defence, AI-related workforce |

### 4.2 Special Publications (SP)

| Publication | Title | CI/CD Relevance |
|-------------|-------|-----------------|
| **SP 800-53 Rev 5** | Security & Privacy Controls | **Comprehensive control catalogue**; 20 control families; federal baseline |
| **SP 800-53A** | Assessing Security & Privacy Controls | Control assessment procedures |
| **SP 800-53B** | Control Baselines | Low/Moderate/High baselines |
| **SP 800-218 v1.1** | Secure Software Development Framework (SSDF) | **Critical for CI/CD** — 4 practice groups (Prepare, Protect Software, Produce Well-Secured Software, Respond); federal attestation requirement |
| **SP 800-218A** | SSDF for Generative AI & Dual-Use Foundation Models | **Critical emerging** — AI model development security; training data governance; model integrity |
| **SP 800-161 Rev 1** | Supply Chain Risk Management | C-SCRM practices for AI model and component supply chains |
| **SP 800-190** | Application Container Security Guide | Docker/container security in CI/CD |
| **SP 800-204** | Security Strategies for Microservices | API-first architecture security |
| **SP 800-207** | Zero Trust Architecture | Pipeline identity & access; network segmentation |
| **SP 800-63** | Digital Identity Guidelines | Authentication for CI/CD systems |
| **SP 800-86** | Guide to Integrating Forensic Techniques | Incident forensics for pipeline breaches |
| **SP 800-92** | Guide to Security Log Management | Pipeline audit log architecture |
| **SP 800-95** | Guide to Secure Web Services | API security for agent orchestration |
| **SP 800-123** | Guide to Server Security | Build server hardening |
| **SP 800-137** | Continuous Monitoring | Pipeline security monitoring |
| **SP 800-160** | Systems Security Engineering | Security-by-design for AI platforms |
| **SP 800-171 Rev 3** | Protecting CUI | Controlled Unclassified Information for government clients |

### 4.3 COSAiS (Control Overlays for Securing AI Systems)

| Item | Status | Relevance |
|------|--------|-----------|
| **COSAiS** | Under development | SP 800-53 control overlays tailored for AI use cases: generative AI, predictive AI, agentic AI |

---

## 5. UK-Specific Schemes & Frameworks

### 5.1 NCSC Frameworks

| Framework | Description | CI/CD Relevance |
|-----------|-------------|-----------------|
| **Cyber Assessment Framework (CAF) v4.0** | Outcome-based assessment; 4 objectives, 14 principles | CNI and essential services assessment; DSPT-aligned; GovAssure basis |
| **Cyber Essentials** | 5 technical controls self-assessment (certified) | Baseline hygiene: firewalls, secure config, access control, malware protection, patching |
| **Cyber Essentials Plus** | Hands-on technical verification | Independent vulnerability scanning + testing of Cyber Essentials controls |
| **10 Steps to Cyber Security** | Executive-level guidance | Risk management regime, secure configuration, network security, managing user privileges, user education, incident management, malware prevention, monitoring, removable media, home/mobile working |
| **Cloud Security Principles** | 14 cloud security principles | Cloud-hosted CI/CD environments |
| **Secure by Default** | Vendor security principles | Secure product development |
| **Active Cyber Defence (ACD)** | Protective services | Mail Check, Web Check, PDNS, Exercise in a Box |

### 5.2 Healthcare (NHS)

| Framework | Description | Relevance |
|-----------|-------------|-----------|
| **DSPT (Data Security & Protection Toolkit)** | Annual self-assessment against NDG 10 Data Security Standards / CAF | Mandatory for NHS data access; 42–179 evidence items depending on category |
| **NHS Cyber Security Strategy to 2030** | 5-pillar strategy for health & social care | Strategic roadmap for healthcare AI deployments |
| **DCB 0129 / DCB 0160** | Clinical risk management for health IT | Safety case requirements for AI-enabled clinical systems |

### 5.3 Government

| Framework | Description | Relevance |
|-----------|-------------|-----------|
| **GovAssure** | CAF-based assessment for critical government systems | Government client requirements |
| **Cyber Governance Code of Practice** | Board-level cyber responsibilities | Client governance alignment |
| **Minimum Cyber Security Standard (MCSS)** | Baseline for government organisations | Government procurement requirements |

---

## 6. Application & Development Security Standards

### 6.1 OWASP Projects (2025 Editions)

| Project | Description | CI/CD Integration Points |
|---------|-------------|-------------------------|
| **OWASP Top 10:2025** | Web application risks | A01: Broken Access Control, A02: Security Misconfiguration, **A03: Software Supply Chain Failures (NEW #3)**, A08: Software & Data Integrity Failures, A10: Mishandling of Exceptional Conditions (NEW) |
| **OWASP Top 10 for LLMs 2025** | LLM application risks | **LLM01: Prompt Injection**, LLM02: Sensitive Information Disclosure, **LLM03: Supply Chain**, LLM04: Data & Model Poisoning, LLM05: Improper Output Handling, LLM06: Excessive Agency, LLM07: System Prompt Leakage, LLM08: Vector/Embedding Weaknesses, LLM09: Misinformation, LLM10: Unbounded Consumption |
| **OWASP API Security Top 10** | API-specific risks | Agent API security; inter-agent communication |
| **OWASP ASVS** | Application Security Verification Standard | Security requirements for AI platform components |
| **OWASP SAMM** | Software Assurance Maturity Model | Development practice maturity assessment |
| **OWASP DSOMM** | DevSecOps Maturity Model | CI/CD security maturity |
| **OWASP CycloneDX** | SBOM standard | Software & ML model bill of materials |
| **OWASP ML Security Top 10** | Machine learning security | ML pipeline security controls |
| **OWASP AI Security & Privacy Guide** | AI-specific security guidance | Comprehensive AI security reference |

### 6.2 Supply Chain Security Standards

| Standard | Authority | CI/CD Integration |
|----------|-----------|-------------------|
| **SLSA (Supply-chain Levels for Software Artifacts)** | OpenSSF | Build provenance, artifact signing, build integrity levels (1–4) |
| **SBOM (Software Bill of Materials)** | NTIA/CISA/CycloneDX/SPDX | Dependency tracking; AI model component inventory; transitive dependency management |
| **Sigstore** | OpenSSF | Keyless code signing for artifacts and container images |
| **in-toto** | NYU/CNCF | Supply chain layout verification and attestation |
| **Scorecard** | OpenSSF | Automated security health checks for open source projects |
| **NIST SP 800-161r1** | NIST | Comprehensive C-SCRM practices |
| **ISO/IEC 27036** | ISO | Supplier relationship security |

### 6.3 CI/CD Pipeline Security Specifics

| Standard/Guide | Source | Focus |
|----------------|--------|-------|
| **NIST SP 800-218 (SSDF)** | NIST | Prepare → Protect → Produce → Respond lifecycle |
| **CIS Software Supply Chain Security Guide** | CIS | Source code, build pipelines, dependencies, artifacts, deployment |
| **SAFECode Practices** | SAFECode | Fundamental secure development practices |
| **BSIMM** | Synopsis | Building Security In Maturity Model |
| **Microsoft SDL** | Microsoft | Security Development Lifecycle |
| **Google SLSA** | Google/OpenSSF | Build integrity framework |
| **CNCF Supply Chain Best Practices** | CNCF | Cloud-native supply chain security |

---

## 7. Operational & Compliance Frameworks

### 7.1 Attestation & Audit Standards

| Standard | Description | CI/CD Relevance |
|----------|-------------|-----------------|
| **SOC 2 Type II** | Trust services criteria (Security, Availability, Processing Integrity, Confidentiality, Privacy) | SaaS platform assurance; CI/CD evidence collection; continuous control monitoring |
| **SOC for Supply Chain** | Supply chain risk management attestation | AI model and component supply chain assurance |
| **PCI DSS v4.0** | Payment card data security | If processing payments; build pipeline integrity; dependency provenance |
| **HITRUST CSF** | Health sector comprehensive framework | Healthcare AI deployments; maps to HIPAA + NIST + ISO |
| **HITRUST AI Assurance** | AI-specific assurance | Healthcare AI governance |
| **CSA STAR** | Cloud Security Alliance STAR | Cloud service security assessment |

### 7.2 Resilience & Continuity

| Framework | Description | CI/CD Relevance |
|-----------|-------------|-----------------|
| **ISO 22301** | Business continuity management | Pipeline disaster recovery |
| **DORA (EU)** | Digital operational resilience | ICT risk management; resilience testing; third-party oversight |
| **FCA/PRA Operational Resilience** | UK financial operational resilience | Important business services; impact tolerances |
| **BCI Good Practice Guidelines** | Business continuity best practice | Recovery time objectives for CI/CD |

### 7.3 Governance & Risk Frameworks

| Framework | Description | CI/CD Relevance |
|-----------|-------------|-----------------|
| **CIS Controls v8** | 18 prioritised security controls | Implementation groups (IG1/IG2/IG3); mapped to NIST CSF |
| **COBIT 2019** | IT governance framework | Governance & management objectives for AI platforms |
| **ITIL 4** | IT service management | Change management; incident management; release management |
| **FAIR** | Factor Analysis of Information Risk | Quantitative risk assessment for AI threats |
| **NIST RMF** | Risk Management Framework | Categorize → Select → Implement → Assess → Authorize → Monitor |
| **MITRE ATT&CK** | Adversarial tactics and techniques | Threat modelling for CI/CD attack vectors |
| **MITRE ATLAS** | Adversarial Threat Landscape for AI Systems | AI-specific attack taxonomy; model evasion, poisoning, extraction |

---

## 8. AI-Specific Security Considerations for CI/CD

### 8.1 Threat Modelling Frameworks for AI

| Framework | Source | Application |
|-----------|--------|-------------|
| **STRIDE** | Microsoft | Spoofing, Tampering, Repudiation, Info Disclosure, DoS, Elevation — applied to AI components |
| **DREAD** | Microsoft | Damage, Reproducibility, Exploitability, Affected Users, Discoverability scoring |
| **PASTA** | Risk Centric | Process for Attack Simulation & Threat Analysis |
| **LINDDUN** | KU Leuven | Privacy threat modelling for AI data flows |
| **OWASP ML Top 10** | OWASP | ML-specific threat categories |
| **MITRE ATLAS** | MITRE | Adversarial ML attack techniques and mitigations |
| **Adversarial Robustness Toolbox (ART)** | IBM | Adversarial attack/defence tooling |

### 8.2 CI/CD Pipeline Security Controls Mapped to Standards

| Control Domain | Standards Mapping | Implementation |
|---------------|-------------------|----------------|
| **Source Code Security** | SSDF PO.1, CIS SSC-1, OWASP A03 | Branch protection, signed commits, code review, SAST |
| **Build Integrity** | SLSA L2+, SSDF PW.4, OWASP A08 | Reproducible builds, build provenance, hermetic builds |
| **Dependency Management** | SSDF PW.4, OWASP A03, SP 800-161 | SCA, pinned versions, SBOM generation, vulnerability scanning |
| **Secret Management** | CIS v8 #3, SP 800-53 IA, OWASP A02 | Vault integration, rotation, environment scoping, no hardcoding |
| **Container Security** | SP 800-190, CIS Docker, OWASP A02 | Minimal base images, vulnerability scanning, runtime protection |
| **Artifact Signing** | SLSA L3, Sigstore, SSDF PW.4 | Code signing, image signing, hash verification, provenance |
| **Access Control** | SP 800-53 AC, ISO 27001 A.5-A.8, CIS #5-6 | RBAC, MFA, least privilege, separation of duties |
| **Pipeline Monitoring** | NIST CSF DE, SP 800-137, CIS #8 | Tamper-evident logs, anomaly detection, SIEM integration |
| **Incident Response** | SP 800-61, ISO 27035, NIST CSF RS/RC | Playbooks, notification timelines, forensic readiness |
| **AI Model Security** | OWASP LLM Top 10, ATLAS, ISO 42001 | Model provenance, integrity checks, poisoning detection, prompt injection defence |
| **Data Pipeline Security** | GDPR, ISO 27701, SP 800-218A | Training data governance, PII handling, data lineage, consent management |
| **Agent Orchestration Security** | NIST Cyber AI Profile, ISO 42001 | Agent permission boundaries, tool use validation, output sanitisation, human oversight |

---

## 9. Compliance Mapping Matrix — Priority for PF-Core

### 9.1 Tier 1: Must-Have (Day 1 — MVP to PMF)

| Standard/Framework | Justification |
|-------------------|---------------|
| **UK GDPR + DPA 2018** | Legal obligation for UK data processing |
| **ISO/IEC 27001:2022** | Market trust baseline; maps to most other frameworks |
| **OWASP Top 10:2025** | Application security baseline |
| **OWASP Top 10 for LLMs 2025** | AI-specific application security |
| **NIST SSDF (SP 800-218)** | Secure development lifecycle for CI/CD |
| **Cyber Essentials Plus** | UK market baseline; NHS supplier requirement |
| **SLSA Level 2+** | Build integrity and provenance |
| **SBOM (CycloneDX/SPDX)** | Supply chain transparency |

### 9.2 Tier 2: Should-Have (Scaling — 100 Clients)

| Standard/Framework | Justification |
|-------------------|---------------|
| **SOC 2 Type II** | Enterprise buyer assurance; B2B trust |
| **ISO/IEC 42001** | AI governance certification; EU AI Act alignment |
| **NIST CSF 2.0 Profile** | Risk management maturity |
| **NIST AI RMF** | AI risk management (voluntary, increasingly expected) |
| **ISO/IEC 27017 + 27018** | Cloud security for Supabase/Vercel |
| **ISO/IEC 27701** | Privacy management system (PIMS) |
| **CIS Controls v8 (IG2)** | Prioritised security controls |
| **DSPT** | Required for NHS-touching clients |

### 9.3 Tier 3: Differentiator (Enterprise & Sector-Specific)

| Standard/Framework | Justification |
|-------------------|---------------|
| **NIS2 / UK CS&R Bill compliance** | Regulated infrastructure clients |
| **DORA alignment** | Financial services clients |
| **NIST Cyber AI Profile** | Emerging AI cybersecurity benchmark |
| **PCI DSS v4.0** | Payment processing clients |
| **HITRUST CSF + AI** | Healthcare sector |
| **CMMC 2.0** | US defense clients |
| **FedRAMP** | US federal cloud services |
| **CSA STAR** | Cloud security attestation |

---

## 10. Emerging Standards & Horizon Scanning

| Item | Timeline | Impact |
|------|----------|--------|
| **NIST Cyber AI Profile (final)** | Expected 2026 | De facto AI cybersecurity benchmark; CSF 2.0 overlay |
| **NIST COSAiS** | Under development | SP 800-53 overlays for generative, predictive, and agentic AI |
| **NIST SP 800-218A (final)** | Expected 2025-2026 | SSDF community profile for AI model development |
| **EU AI Act full enforcement** | Phased through Aug 2027 | High-risk AI system requirements; conformity assessment |
| **UK CS&R Bill enactment** | Expected 2026 | Expanded NIS scope; enhanced incident reporting |
| **EU Digital Omnibus** | Legislative proceedings 2026+ | Streamlined GDPR/NIS2/DORA; single incident portal |
| **EU CRA full application** | Dec 2027 | Product security; SBOM; vulnerability handling |
| **ISO/IEC 42001 revisions** | Ongoing | AI management system maturation |
| **NIST Agentic AI security guidance** | RFI issued; guidance expected 2026 | Specific controls for autonomous agent systems |
| **OWASP Top 10 for Agentic AI** | Under development | Agent-specific security risks |

---

## 11. Key Cross-Mapping Relationships

```
                    ┌─────────────────────────────────────┐
                    │        GOVERNANCE LAYER              │
                    │  ISO 42001 │ NIST AI RMF │ EU AI Act │
                    │  ISO 27014 │ COBIT 2019  │ CIS v8    │
                    └──────────────────┬──────────────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    │     MANAGEMENT SYSTEM LAYER          │
                    │  ISO 27001 │ ISO 27701 │ SOC 2      │
                    │  NIST CSF 2.0 │ NIST RMF │ DORA     │
                    └──────────────────┬──────────────────┘
                                       │
          ┌────────────────────────────┼────────────────────────────┐
          │                            │                            │
┌─────────┴──────────┐   ┌────────────┴───────────┐   ┌───────────┴──────────┐
│  DEVELOPMENT        │   │  OPERATIONS             │   │  SUPPLY CHAIN        │
│  NIST SSDF          │   │  NCSC CAF               │   │  SLSA / SBOM         │
│  OWASP Top 10       │   │  Cyber Essentials       │   │  SP 800-161          │
│  OWASP LLM Top 10   │   │  CIS Controls           │   │  OWASP A03:2025      │
│  SP 800-218A (AI)   │   │  SP 800-53              │   │  Sigstore            │
│  ISO 27034          │   │  SP 800-137             │   │  ISO 27036           │
│  MITRE ATLAS        │   │  ISO 27035              │   │  CRA (EU)            │
└────────────────────┘   └────────────────────────┘   └──────────────────────┘
          │                            │                            │
          └────────────────────────────┼────────────────────────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    │     COMPLIANCE & ASSURANCE LAYER     │
                    │  UK GDPR │ NIS2 │ CS&R Bill │ DORA  │
                    │  SOC 2 │ PCI DSS │ DSPT │ HITRUST  │
                    └─────────────────────────────────────┘
```

---

## 12. References & Source URLs

### Standards Bodies
- NCSC: https://www.ncsc.gov.uk
- ISO: https://www.iso.org
- NIST: https://www.nist.gov/cyberframework
- OWASP: https://owasp.org
- ENISA: https://www.enisa.europa.eu
- CISA: https://www.cisa.gov
- OpenSSF: https://openssf.org
- MITRE ATLAS: https://atlas.mitre.org
- CSA: https://cloudsecurityalliance.org

### Key Legislation
- UK CS&R Bill: https://bills.parliament.uk/bills/4035
- EU AI Act: https://eur-lex.europa.eu/eli/reg/2024/1689
- NIS2 Directive: https://www.nis-2-directive.com
- DORA: https://www.digital-operational-resilience-act.com
- EU Digital Omnibus: https://www.whitecase.com/insight-alert/eu-digital-omnibus-what-changes-lie-ahead-data-act-gdpr-and-ai-act

### Key NIST Publications
- NIST CSF 2.0: https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf
- NIST Cyber AI Profile (draft): https://nvlpubs.nist.gov/nistpubs/ir/2025/NIST.IR.8596.iprd.pdf
- NIST SSDF: https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-218A.pdf
- NIST AI RMF Crosswalk to ISO 42001: https://airc.nist.gov/docs/NIST_AI_RMF_to_ISO_IEC_42001_Crosswalk.pdf

---

**Document Control:**  
- **Author:** PF-Core Security Architecture  
- **Review Cycle:** Quarterly (standards landscape evolving rapidly)  
- **Next Review:** May 2025  
- **Change Trigger:** Any new legislation enactment, major standard revision, or new NIST/ISO publication  
- **Distribution:** All PF-Core ventures (BAIV, AIR, W4M)
