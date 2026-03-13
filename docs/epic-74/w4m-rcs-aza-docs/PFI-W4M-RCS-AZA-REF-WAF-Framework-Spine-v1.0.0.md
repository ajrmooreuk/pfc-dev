# Azure WAF Framework Spine

> **Source:** Microsoft Azure Well-Architected Framework
> **Converted from:** `Azure-WAF-Framework-Spine.xlsx`
> **Purpose:** WAF pillar structure, assessment questions, and links informing the ALZ assessment process
> **Related:** PFI-W4M-RCS-AZA — ALZ + WAF Assessment Platform

---

## Table of Contents

1. [List](#list)
2. [Assessment](#assessment)

---

## List

| Section | Category | Ref | Section | Links |
| --- | --- | --- | --- | --- |
| WAF | Pillars |  |  | Microsoft Azure Well-Architected Framework pillars |
| WAF | Reliability |  | Pillar 1 | Reliability quick links - Microsoft Azure Well-Architected Framework |
| WAF | Reliability |  | Principles | Reliability design principles - Microsoft Azure Well-Architected Framework |
| WAF | Reliability |  | Checklist | Design review checklist for Reliability - Microsoft Azure Well-Architected Framework |
| WAF | Reliability |  | Tradeoffs | Reliability tradeoffs - Microsoft Azure Well-Architected Framework |
| WAF | Reliability |  | Maturity | https://learn.microsoft.com/en-us/azure/well-architected/reliability/maturity-model?tabs=level1 |
| WAF | Reliability |  | Design Patterns | Architecture design patterns that support reliability - Microsoft Azure Well-Architected Framework |
| WAF | Reliability | RE01 | RE01 Simplify | Architecture strategies for designing for simplicity and efficiency - Microsoft Azure Well-Architected Framework |
| WAF | Reliability | RE02 | RE02 Identity Flows | Architecture strategies for identifying and rating flows - Microsoft Azure Well-Architected Framework |
| WAF | Reliability | RE03 | RE03 Failure Mode Analysis | Architecture strategies for failure mode analysis - Microsoft Azure Well-Architected Frameworknalysis |
| WAF | Reliability | RE04 | RE04 Target Metrics | Architecture strategies for defining reliability targets - Microsoft Azure Well-Architected Framework |
| WAF | Reliability | RE05 | RE05 Redundancy | Architecture Strategies for Designing for Redundancy - Microsoft Azure Well-Architected Frameworkncy |
| WAF | Reliability | RE06 | RE06 Scaling | Architecture strategies for designing a reliable scaling strategy - Microsoft Azure Well-Architected Framework \| Microsoft Learn |
| WAF | Reliability | RE07 | RE07 Self Preservation | https://learn.microsoft.com/en-us/azure/well-architected/reliability/self-preservation |
| WAF | Reliability | RE08 | RE08 Testing Strategy | https://learn.microsoft.com/en-us/azure/well-architected/reliability/testing-strategy |
| WAF | Reliability | RE09 | RE09 DISASTER RECOVERY | https://learn.microsoft.com/en-us/azure/well-architected/reliability/disaster-recovery |
| WAF | Reliability | RE10 | RE10 Monitoring and Alerting | https://learn.microsoft.com/en-us/azure/well-architected/reliability/monitoring-alerting-strategy |
| WAF | Security | Overview Links |  | Security quick links - Microsoft Azure Well-Architected Framework |
| WAF | Security | Design Principles |  | https://learn.microsoft.com/en-us/azure/well-architected/security/principles |
| WAF | Security | Checklist |  | https://learn.microsoft.com/en-us/azure/well-architected/security/checklist |
| WAF | Security | Tradeoffs |  | https://learn.microsoft.com/en-us/azure/well-architected/security/tradeoffs |
| WAF | Security | Maturity |  | https://learn.microsoft.com/en-us/azure/well-architected/security/maturity-model?tabs=level1 |
| WAF | Security | Design patterns |  | https://learn.microsoft.com/en-us/azure/well-architected/security/design-patterns |
| WAF | Security | SE01 | SE01 Establish Baseline | https://learn.microsoft.com/en-us/azure/well-architected/security/establish-baseline |
| WAF | Security | SE02a | SE02 Secure Development Lifecycle | https://learn.microsoft.com/en-us/azure/well-architected/security/secure-development-lifecycle |
| WAF | Security | SE02b | SE02Threat Analysis | https://learn.microsoft.com/en-us/azure/well-architected/security/threat-model |
| WAF | Security | SE03 | SE03 Data Classification | https://learn.microsoft.com/en-us/azure/well-architected/security/data-classification |
| WAF | Security | SE04 | SE04 Segmentation Strategy | https://learn.microsoft.com/en-us/azure/well-architected/security/segmentation |
| WAF | Security | SE05 | SE05 Identity and Access Management | https://learn.microsoft.com/en-us/azure/well-architected/security/identity-access |
| WAF | Security | SE06 | SE06 Network Controls | https://learn.microsoft.com/en-us/azure/well-architected/security/networking |
| WAF | Security | SE07 | SE07 Encryption | https://learn.microsoft.com/en-us/azure/well-architected/security/encryption |
| WAF | Security | SE08 | SE08 Hardening Resources | https://learn.microsoft.com/en-us/azure/well-architected/security/harden-resources |
| WAF | Security | SE09 | SE09 Application Secrets | https://learn.microsoft.com/en-us/azure/well-architected/security/application-secrets |
| WAF | Security | SE10 | SE10 Monitoring and Threat Detection | https://learn.microsoft.com/en-us/azure/well-architected/security/monitor-threats |
| WAF | Security | SE11 | SE11 Testing and Validation | https://learn.microsoft.com/en-us/azure/well-architected/security/test |
| WAF | Security | SE12 | SE12 Incident Response | https://learn.microsoft.com/en-us/azure/well-architected/security/incident-response |
| WAF | Cost Optimization |  |  | Cost optimization quick links - Microsoft Azure Well-Architected Framework |
| WAF | Cost Optimization |  | Principles | https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/principles |
| WAF | Cost Optimization |  | Checklist | https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/checklist |
| WAF | Cost Optimization |  | Tradeoffs | https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/tradeoffs |
| WAF | Cost Optimization | CO | Maturity Model | https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/maturity-model?tabs=level1 |
| WAF | Cost Optimization | CO | Design Principles | https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/design-patterns |
| WAF | Cost Optimization | CO |  |  |
| WAF | Cost Optimization | CO:01 | Financial Responsibility | https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/create-culture-financial-responsibility |
| WAF | Cost Optimization | CO:02 | Cost Model | https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/cost-model |
| WAF | Cost Optimization | CO:03 | Cost Data and Reporting | https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/collect-review-cost-data |
| WAF | Cost Optimization | CO:04 | Spending Guardrails | https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/set-spending-guardrails |
| WAF | Cost Optimization | CO:05 | Rate Optimization | https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates |
| WAF | Cost Optimization | CO:06 | Usage and Billing Increments | https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/align-usage-to-billing-increments |
| WAF | Cost Optimization | CO:07 | Components Costs | https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/optimize-component-costs |
| WAF | Cost Optimization | CO:08 | Environment Costs | https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/optimize-environment-costs |
| WAF | Cost Optimization | CO:09 | Flow Costs | https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/optimize-flow-costs |
| WAF | Cost Optimization | CO:10 | Data Costs | https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/optimize-data-costs |
| WAF | Cost Optimization | CO:11 | Code Costs | https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/optimize-code-costs |
| WAF | Cost Optimization | CO:12 | Scaling Costs | https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/optimize-scaling-costs |
| WAF | Cost Optimization | CO:13 | Personnel Costs | https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/optimize-personnel-time |
| WAF | Cost Optimization | CO:14 | Consolidation | https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/consolidation |
| WAF | Operational Excellence | OE | OPERATIONAL EXCELLENCE | Operational excellence quick links - Microsoft Azure Well-Architected Framework |
| WAF | Operational Excellence | OE | Design principles | https://learn.microsoft.com/en-us/azure/well-architected/operational-excellence/principles |
| WAF | Operational Excellence | OE | Checklist | https://learn.microsoft.com/en-us/azure/well-architected/operational-excellence/checklist |
| WAF | Operational Excellence | OE | Tradeoffs | https://learn.microsoft.com/en-us/azure/well-architected/operational-excellence/tradeoffs |
| WAF | Operational Excellence | OE | Maturity Model | https://learn.microsoft.com/en-us/azure/well-architected/operational-excellence/maturity-model?tabs=ai-opportunities |
| WAF | Operational Excellence | OE | Design Patterns | https://learn.microsoft.com/en-us/azure/well-architected/operational-excellence/design-patterns |
| WAF | Operational Excellence | OE:01 | DevOps Culture | https://learn.microsoft.com/en-us/azure/well-architected/operational-excellence/devops-culture |
| WAF | Operational Excellence | OE:02 | Task Execution Process | https://learn.microsoft.com/en-us/azure/well-architected/operational-excellence/formalize-operations-tasks |
| WAF | Operational Excellence | OE:03 | Software Development Practices | https://learn.microsoft.com/en-us/azure/well-architected/operational-excellence/formalize-development-practices |
| WAF | Operational Excellence | OE:04 | Tools and Processes | https://learn.microsoft.com/en-us/azure/well-architected/operational-excellence/tools-processes |
| WAF | Operational Excellence | OE:05 | Infrastructure and Code | https://learn.microsoft.com/en-us/azure/well-architected/operational-excellence/infrastructure-as-code-design |
| WAF | Operational Excellence | OE:06 | Supply Chain for Workload Development | https://learn.microsoft.com/en-us/azure/well-architected/operational-excellence/workload-supply-chain |
| WAF | Operational Excellence | OE:07 | Monitoring System | https://learn.microsoft.com/en-us/azure/well-architected/operational-excellence/observability |
| WAF | Operational Excellence | OE:08 | Instrument an Application | https://learn.microsoft.com/en-us/azure/well-architected/operational-excellence/instrument-application |
| WAF | Operational Excellence | OE:09 | Incident Response | https://learn.microsoft.com/en-us/azure/well-architected/operational-excellence/incident-response |
| WAF | Operational Excellence | OE:10 | Task Automation | https://learn.microsoft.com/en-us/azure/well-architected/operational-excellence/automate-tasks |
| WAF | Operational Excellence | OE:11 | Automation Design | https://learn.microsoft.com/en-us/azure/well-architected/operational-excellence/enable-automation |
| WAF | Operational Excellence | OE:12 | Safe Deployment Practices | https://learn.microsoft.com/en-us/azure/well-architected/operational-excellence/safe-deployments |
| WAF | Performance Efficeincy | PE |  | Performance efficiency quick links - Microsoft Azure Well-Architected Framework |
| WAF | Performance Efficeincy | PE | Principles | https://learn.microsoft.com/en-us/azure/well-architected/performance-efficiency/principles |
| WAF | Performance Efficeincy | PE | Checklist | https://learn.microsoft.com/en-us/azure/well-architected/performance-efficiency/checklist |
| WAF | Performance Efficeincy | PE | Tradeoffs | https://learn.microsoft.com/en-us/azure/well-architected/performance-efficiency/tradeoffs |
| WAF | Performance Efficeincy | PE | Maturity Model | https://learn.microsoft.com/en-us/azure/well-architected/performance-efficiency/maturity-model?tabs=level1 |
| WAF | Performance Efficeincy | PE | Design Patterns | https://learn.microsoft.com/en-us/azure/well-architected/performance-efficiency/design-patterns |
| WAF | Performance Efficeincy | PE | Key Design Strategies | https://learn.microsoft.com/en-us/azure/well-architected/performance-efficiency/design-patterns |
| WAF | Performance Efficeincy | PE:01 | Performance Targets | https://learn.microsoft.com/en-us/azure/well-architected/performance-efficiency/performance-targets |
| WAF | Performance Efficeincy | PE:02 | Capacity Planning | https://learn.microsoft.com/en-us/azure/well-architected/performance-efficiency/capacity-planning |
| WAF | Performance Efficeincy | PE:03 | Selected Services | https://learn.microsoft.com/en-us/azure/well-architected/performance-efficiency/select-services |
| WAF | Performance Efficeincy | PE:04 | Metrics and Logs | https://learn.microsoft.com/en-us/azure/well-architected/performance-efficiency/collect-performance-data |
| WAF | Performance Efficeincy | PE:05 | Scaling and partioning | https://learn.microsoft.com/en-us/azure/well-architected/performance-efficiency/scale-partition |
| WAF | Performance Efficeincy | PE:06 | Performance Testing | https://learn.microsoft.com/en-us/azure/well-architected/performance-efficiency/performance-test |
| WAF | Performance Efficeincy | PE:07 | Code and Infrastructure | https://learn.microsoft.com/en-us/azure/well-architected/performance-efficiency/optimize-code-infrastructure |
| WAF | Performance Efficeincy | PE:08 | Data Performance | https://learn.microsoft.com/en-us/azure/well-architected/performance-efficiency/optimize-data-performance |
| WAF | Performance Efficeincy | PE:09 | Critical FLows | https://learn.microsoft.com/en-us/azure/well-architected/performance-efficiency/prioritize-critical-flows |
| WAF | Performance Efficeincy | PE:10 | Operational Tasks | https://learn.microsoft.com/en-us/azure/well-architected/performance-efficiency/optimize-operational-tasks |
| WAF | Performance Efficeincy | PE:11 | Live issues Responses | https://learn.microsoft.com/en-us/azure/well-architected/performance-efficiency/respond-live-performance-issues |
| WAF | Performance Efficeincy | PE:12 | Continuous Performance Integration | https://learn.microsoft.com/en-us/azure/well-architected/performance-efficiency/continuous-performance-optimize |
| WAF | DESIGN GUIDE |  | WAF Design Guides | https://learn.microsoft.com/en-us/azure/well-architected/design-guides/implementing-recommendations |
| WAF | Reliability |  | Reliability Qtns | Reliability |
| WAF | Reliability |  | Reliability Qtns | Optional question.How do you keep the workload simple and efficient? |
| WAF | Reliability |  | Reliability Qtns | Optional question.How do you identify and rate the workload's flows? |
| WAF | Reliability |  | Reliability Qtns | Optional question.How do you perform failure mode analysis? |
| WAF | Reliability |  | Reliability Qtns | Optional question.How do you define reliability targets? |
| WAF | Reliability |  | Reliability Qtns | Optional question.How do you implement redundancy? |
| WAF | Reliability |  | Reliability Qtns | Optional question.How do you define a scaling strategy? |
| WAF | Reliability |  | Reliability Qtns | Optional question.How do you implement self-preservation and self-healing measures? |
| WAF | Reliability |  | Reliability Qtns | Optional question.How do you test your resiliency and availability strategies? |
| WAF | Reliability |  | Reliability Qtns | Optional question.How do you plan for disaster scenarios? |
| WAF | Reliability |  | Reliability Qtns | Optional question.How do you monitor workload health? |
| WAF | Security |  | Security Qtns | Security |
| WAF | Security |  | Security Qtns | Optional question.Do you have a documented security baseline? |
| WAF | Security |  | Security Qtns | Optional question.How do you secure the application code, development environment, and software supply chain? |
| WAF | Security |  | Security Qtns | Optional question.Have you classified all data persisted by the workload? |
| WAF | Security |  | Security Qtns | Optional question.How do you segment your workload as a defense-in-depth measure? |
| WAF | Security |  | Security Qtns | Optional question.What identity and access controls do you use to secure your application? |
| WAF | Security |  | Security Qtns | Optional question.How do you secure connectivity for this workload? |
| WAF | Security |  | Security Qtns | Optional question.What are your plans and procedures for encrypting data? |
| WAF | Security |  | Security Qtns | Optional question.What measures do you take to continuously harden your workload against attack? |
| WAF | Security |  | Security Qtns | Optional question.How do you secure your secrets and the other credentials that your workload uses? |
| WAF | Security |  | Security Qtns | Optional question.How do you monitor the application and the infrastructure? |
| WAF | Security |  | Security Qtns | Optional question.How do you test your workload before and after it reaches production? |
| WAF | Security |  | Security Qtns | Optional question.How prepared are you to respond to incidents? |
| WAF | Costs |  | Cost Qtns | Cost Optimization |
| WAF | Costs |  | Cost Qtns | Optional question.How do you create a culture of financial responsibility? |
| WAF | Costs |  | Cost Qtns | Optional question.How do you perform cost modeling? |
| WAF | Costs |  | Cost Qtns | Optional question.How do you monitor costs? |
| WAF | Costs |  | Cost Qtns | Optional question.How do you govern your spending? |
| WAF | Costs |  | Cost Qtns | Optional question.How do you get the best rates from providers? |
| WAF | Costs |  | Cost Qtns | Optional question.How do you align resource usage to billing increments? |
| WAF | Costs |  | Cost Qtns | Optional question.How do you optimize workload component costs? |
| WAF | Costs |  | Cost Qtns | Optional question.How do you optimize the cost of each workload environment? |
| WAF | Costs |  | Cost Qtns | Optional question.How do you optimize flow costs? |
| WAF | Costs |  | Cost Qtns | Optional question.How do you optimize data costs? |
| WAF | Costs |  | Cost Qtns | Optional question.How do you optimize code costs? |
| WAF | Costs |  | Cost Qtns | Optional question.How do you optimize resource scaling costs? |
| WAF | Costs |  | Cost Qtns | Optional question.How do you optimize personnel time? |
| WAF | Costs |  | Cost Qtns | Optional question.How do you evaluate resource consolidation? |
| WAF | Ops |  | Ops Qtns | Operational Excellence |
| WAF | Ops |  | Ops Qtns | Optional question.How do you foster a DevOps culture? |
| WAF | Ops |  | Ops Qtns | Optional question.How do you formalize routine and nonroutine tasks? |
| WAF | Ops |  | Ops Qtns | Optional question.How do you formalize software ideation and planning process? |
| WAF | Ops |  | Ops Qtns | Optional question.How do you optimize software development and quality assurance processes? |
| WAF | Ops |  | Ops Qtns | Optional question.How do you use infrastructure as code (IaC)? |
| WAF | Ops |  | Ops Qtns | Optional question.How did you build your workload supply chain? |
| WAF | Ops |  | Ops Qtns | Optional question.How did you design your observability platform? |
| WAF | Ops |  | Ops Qtns | Optional question.How do you implement your incident management (IcM) process? |
| WAF | Ops |  | Ops Qtns | Optional question.How do you automate tasks that don't need human intervention? |
| WAF | Ops |  | Ops Qtns | Optional question.What is your approach to design the capability for automation into your workload? |
| WAF | Ops |  | Ops Qtns | Optional question.What safe deployment practices do you use? |
| WAF | PE |  | PE Qtns | Performance Efficiency |
| WAF | PE |  | PE Qtns | Optional question.How do you define performance targets? |
| WAF | PE |  | PE Qtns | Optional question.How do you conduct capacity planning? |
| WAF | PE |  | PE Qtns | Optional question.How do you select the right services? |
| WAF | PE |  | PE Qtns | Optional question.How do you collect performance data? |
| WAF | PE |  | PE Qtns | Optional question.How do you manage scalability and partitioning? |
| WAF | PE |  | PE Qtns | Optional question.How do you conduct performance testing? |
| WAF | PE |  | PE Qtns | Optional question.How do you optimize the performance of your code and infrastructure? |
| WAF | PE |  | PE Qtns | Optional question.How do you optimize data performance? |
| WAF | PE |  | PE Qtns | Optional question.How do you prioritize the performance of critical flows? |
| WAF | PE |  | PE Qtns | Optional question.How do you optimize your operational tasks? |
| WAF | PE |  | PE Qtns | Optional question.How do you respond to live performance issues? |
| WAF | PE |  | PE Qtns | Optional question.How do you enable continuous performance optimization? |

---

## Assessment

| Col 1 | Reliability Qtns | Reliability |
| --- | --- | --- |
|  | Reliability Qtns | Optional question.How do you keep the workload simple and efficient? |
|  | Reliability Qtns | Optional question.How do you identify and rate the workload's flows? |
|  | Reliability Qtns | Optional question.How do you perform failure mode analysis? |
|  | Reliability Qtns | Optional question.How do you define reliability targets? |
|  | Reliability Qtns | Optional question.How do you implement redundancy? |
|  | Reliability Qtns | Optional question.How do you define a scaling strategy? |
|  | Reliability Qtns | Optional question.How do you implement self-preservation and self-healing measures? |
|  | Reliability Qtns | Optional question.How do you test your resiliency and availability strategies? |
|  | Reliability Qtns | Optional question.How do you plan for disaster scenarios? |
|  | Reliability Qtns | Optional question.How do you monitor workload health? |
|  | Security Qtns | Security |
|  | Security Qtns | Optional question.Do you have a documented security baseline? |
|  | Security Qtns | Optional question.How do you secure the application code, development environment, and software supply chain? |
|  | Security Qtns | Optional question.Have you classified all data persisted by the workload? |
|  | Security Qtns | Optional question.How do you segment your workload as a defense-in-depth measure? |
|  | Security Qtns | Optional question.What identity and access controls do you use to secure your application? |
|  | Security Qtns | Optional question.How do you secure connectivity for this workload? |
|  | Security Qtns | Optional question.What are your plans and procedures for encrypting data? |
|  | Security Qtns | Optional question.What measures do you take to continuously harden your workload against attack? |
|  | Security Qtns | Optional question.How do you secure your secrets and the other credentials that your workload uses? |
|  | Security Qtns | Optional question.How do you monitor the application and the infrastructure? |
|  | Security Qtns | Optional question.How do you test your workload before and after it reaches production? |
|  | Security Qtns | Optional question.How prepared are you to respond to incidents? |
|  | Cost Qtns | Cost Optimization |
|  | Cost Qtns | Optional question.How do you create a culture of financial responsibility? |
|  | Cost Qtns | Optional question.How do you perform cost modeling? |
|  | Cost Qtns | Optional question.How do you monitor costs? |
|  | Cost Qtns | Optional question.How do you govern your spending? |
|  | Cost Qtns | Optional question.How do you get the best rates from providers? |
|  | Cost Qtns | Optional question.How do you align resource usage to billing increments? |
|  | Cost Qtns | Optional question.How do you optimize workload component costs? |
|  | Cost Qtns | Optional question.How do you optimize the cost of each workload environment? |
|  | Cost Qtns | Optional question.How do you optimize flow costs? |
|  | Cost Qtns | Optional question.How do you optimize data costs? |
|  | Cost Qtns | Optional question.How do you optimize code costs? |
|  | Cost Qtns | Optional question.How do you optimize resource scaling costs? |
|  | Cost Qtns | Optional question.How do you optimize personnel time? |
|  | Cost Qtns | Optional question.How do you evaluate resource consolidation? |
|  | Ops Qtns | Operational Excellence |
|  | Ops Qtns | Optional question.How do you foster a DevOps culture? |
|  | Ops Qtns | Optional question.How do you formalize routine and nonroutine tasks? |
|  | Ops Qtns | Optional question.How do you formalize software ideation and planning process? |
|  | Ops Qtns | Optional question.How do you optimize software development and quality assurance processes? |
|  | Ops Qtns | Optional question.How do you use infrastructure as code (IaC)? |
|  | Ops Qtns | Optional question.How did you build your workload supply chain? |
|  | Ops Qtns | Optional question.How did you design your observability platform? |
|  | Ops Qtns | Optional question.How do you implement your incident management (IcM) process? |
|  | Ops Qtns | Optional question.How do you automate tasks that don't need human intervention? |
|  | Ops Qtns | Optional question.What is your approach to design the capability for automation into your workload? |
|  | Ops Qtns | Optional question.What safe deployment practices do you use? |
|  | PE Qtns | Performance Efficiency |
|  | PE Qtns | Optional question.How do you define performance targets? |
|  | PE Qtns | Optional question.How do you conduct capacity planning? |
|  | PE Qtns | Optional question.How do you select the right services? |
|  | PE Qtns | Optional question.How do you collect performance data? |
|  | PE Qtns | Optional question.How do you manage scalability and partitioning? |
|  | PE Qtns | Optional question.How do you conduct performance testing? |
|  | PE Qtns | Optional question.How do you optimize the performance of your code and infrastructure? |
|  | PE Qtns | Optional question.How do you optimize data performance? |
|  | PE Qtns | Optional question.How do you prioritize the performance of critical flows? |
|  | PE Qtns | Optional question.How do you optimize your operational tasks? |
|  | PE Qtns | Optional question.How do you respond to live performance issues? |
|  | PE Qtns | Optional question.How do you enable continuous performance optimization? |
|  | Reliability | How do you keep the workload simple and efficient? |
|  |  | A key tenet of designing for reliability is to keep your workload simple and efficient. Focus your workload design on meeting business requirements to reduce the risk of unnecessary complexity or exce |
|  |  | We have a deliberate goal to keep our workload simple.Striving for reliability and maintainability, you keep the workload's general implementation guidelines concise and simple. |
|  |  | We utilize platform functionality where appropriate.You have assessed platform-provided offerings and features, so you can offload administration and management tasks to your cloud provider. |
|  |  | We clearly abstract domain logic implementation from infrastructure management.Abstracting infrastructure away from domain logic emphasizes the importance of separating core business-related code (dom |
|  |  | We offload cross-cutting services to separate services.Rather than duplicating code, you reuse existing services with well-defined interfaces that can easily be consumed by various components of your  |
|  |  | We implement essential capabilities in our workload for all coding efforts.You focus your coding efforts on functionalities that support or deliver primary business objectives for your workload. |
|  |  | None of the above.These strategies aren't used to design for simplicity and efficiency. |
|  |  | Manage cookies |
|  |  | AI Disclaimer |

---
