# Enterprise Architecture Ontology for Azure & Microsoft Cloud

A comprehensive, Schema.org-based ontology for enterprise architecture management covering TOGAF, ArchiMate concepts, and Azure-specific domains.

## Overview

This ontology provides a semantic foundation for enterprise architecture practices with deep integration into the Microsoft Azure ecosystem. It follows TOGAF ADM methodology while incorporating modern cloud-native concepts including AI/ML architecture patterns.

## Ontology Structure

```
enterprise-architecture-ontology/
├── ea-azure-ontology.json          # Core EA ontology with Azure resources
├── togaf-adm-extension.json        # TOGAF ADM phases and artifacts
├── azure-waf-extension.json        # Azure Well-Architected Framework
├── azure-caf-extension.json        # Cloud Adoption Framework
├── azure-ai-extension.json         # AI/ML architecture patterns
├── sample-instance.json            # Example instantiation
└── README.md                       # This documentation
```

## Namespace Prefixes

| Prefix | URI | Description |
|--------|-----|-------------|
| `ea` | `https://ontology.enterprise-architecture.io/azure/` | Core EA classes and properties |
| `azure` | `https://ontology.enterprise-architecture.io/azure/cloud/` | Azure resource types |
| `togaf` | `https://ontology.enterprise-architecture.io/togaf/` | TOGAF ADM concepts |
| `waf` | `https://ontology.enterprise-architecture.io/azure/waf/` | Well-Architected Framework |
| `caf` | `https://ontology.enterprise-architecture.io/azure/caf/` | Cloud Adoption Framework |
| `ai` | `https://ontology.enterprise-architecture.io/azure/ai/` | AI/ML architecture |
| `vsem` | `https://wings4mind.ai/ontology/vsem/` | Strategic alignment (VSOM/VSEM) |

## Architecture Domains

### Business Architecture (`ea:BusinessArchitecture`)
- **Business Capability** - Organizational abilities
- **Business Process** - Value-creating activities
- **Business Service** - Customer-facing services
- **Value Stream** - End-to-end value delivery
- **Organizational Unit** - Structural elements
- **Actor** - People, teams, systems

### Data Architecture (`ea:DataArchitecture`)
- **Data Entity** - Core business data objects
- **Data Domain** - Logical data groupings
- **Data Product** - Self-contained data assets
- **Data Pipeline** - Data processing flows
- **Data Governance Policy** - Management rules

### Application Architecture (`ea:ApplicationArchitecture`)
- **Application** - Software systems
- **Application Component** - Modular parts
- **Application Service** - Exposed services
- **API** - Integration interfaces
- **Microservice** - Independently deployable units

### Technology Architecture (`ea:TechnologyArchitecture`)
- **Technology Platform** - Foundation layers
- **Infrastructure Component** - Physical/virtual resources
- **Technology Service** - Infrastructure services
- **Network** - Communication infrastructure

### Security Architecture (`ea:SecurityArchitecture`)
- **Identity Provider** - Authentication services
- **Access Policy** - Authorization rules
- **Security Control** - Safeguards
- **Compliance Requirement** - Regulatory obligations

### Integration Architecture (`ea:IntegrationArchitecture`)
- **Integration Pattern** - Reusable solutions
- **Event Stream** - Event flows
- **Data Flow** - Data movement

## Azure Resource Types

The ontology includes 50+ Azure service types organized by category:

### Compute
- `azure:VirtualMachine`
- `azure:AppService`
- `azure:FunctionApp`
- `azure:ContainerApp`
- `azure:KubernetesService`

### Data & Storage
- `azure:SQLDatabase`
- `azure:CosmosDB`
- `azure:StorageAccount`
- `azure:DataLake`
- `azure:Synapse`
- `azure:Databricks`
- `azure:Fabric`

### Integration
- `azure:EventHub`
- `azure:ServiceBus`
- `azure:EventGrid`
- `azure:LogicApps`
- `azure:APIManagement`
- `azure:DataFactory`

### AI & ML
- `azure:CognitiveServices`
- `azure:OpenAIService`
- `azure:MachineLearning`
- `azure:AIFoundry`
- `azure:AISearch`
- `azure:CopilotStudio`

### Security & Identity
- `azure:EntraID`
- `azure:KeyVault`
- `azure:Defender`
- `azure:Sentinel`
- `azure:Policy`

### Governance
- `azure:ManagementGroup`
- `azure:Subscription`
- `azure:ResourceGroup`
- `azure:LandingZone`
- `azure:Blueprint`
- `azure:Purview`

### Productivity
- `azure:M365`
- `azure:Teams`
- `azure:SharePoint`
- `azure:Dynamics365`
- `azure:PowerPlatform`

## Key Relationships

| Property | Domain | Range | Description |
|----------|--------|-------|-------------|
| `ea:composedOf` | EAEntity | EAEntity | Composition |
| `ea:dependsOn` | EAEntity | EAEntity | Dependency |
| `ea:realizes` | Application | BusinessCapability | Capability realization |
| `ea:supports` | EAEntity | EAEntity | Support relationship |
| `ea:hostedOn` | Application | Technology | Hosting |
| `ea:governs` | Principle | EAEntity | Governance |
| `ea:implements` | EAEntity | Pattern | Pattern implementation |
| `ea:integratesWith` | EAEntity | EAEntity | Integration |
| `ea:securedBy` | EAEntity | SecurityControl | Security |
| `ea:managedBy` | EAEntity | OrganizationalUnit | Management |
| `ea:alignsTo` | EAEntity | StrategicObjective | Strategic alignment |

## TOGAF ADM Integration

The `togaf-adm-extension.json` maps all ADM phases:

1. **Preliminary Phase** - Framework and principles
2. **Phase A** - Architecture Vision
3. **Phase B** - Business Architecture
4. **Phase C** - Information Systems Architecture
5. **Phase D** - Technology Architecture
6. **Phase E** - Opportunities and Solutions
7. **Phase F** - Migration Planning
8. **Phase G** - Implementation Governance
9. **Phase H** - Architecture Change Management

Each phase includes:
- Key activities
- Standard outputs
- Artifact types (Catalogs, Matrices, Diagrams)

## Well-Architected Framework Integration

The `azure-waf-extension.json` covers all five pillars:

| Pillar | Description | Key Metrics |
|--------|-------------|-------------|
| Reliability | Failure recovery | RTO, RPO, MTTR, Uptime SLA |
| Security | Threat protection | Secure Score, Compliance Score |
| Cost Optimization | Value maximization | Cost Variance, Utilization |
| Operational Excellence | Production operations | Deployment Frequency, Lead Time |
| Performance Efficiency | Load adaptation | P95 Latency, Throughput |

## AI Architecture Patterns

The `azure-ai-extension.json` includes modern AI/ML patterns:

### RAG Patterns
- **Basic RAG** - Standard retrieval-augmented generation
- **Advanced RAG** - Query rewriting, reranking, multi-step

### Agent Patterns
- **Single Agent** - Autonomous tool-using agent
- **Multi-Agent** - Collaborative specialized agents
- **Copilot** - Embedded AI assistant

### MLOps Stages
1. Data Preparation
2. Model Development
3. Model Validation
4. Model Deployment
5. Model Monitoring

### Responsible AI Controls
- Content Safety
- Groundedness Check
- Jailbreak Protection
- PII Redaction
- Model Transparency

## Usage Examples

### Instantiate a Business Capability
```json
{
  "@type": ["Action", "ea:BusinessCapability"],
  "@id": "ea:cap-customer-management",
  "name": "Customer Relationship Management",
  "description": "Manage customer interactions and data",
  "ea:maturityLevel": 3,
  "ea:businessCriticality": "High"
}
```

### Link Application to Capability
```json
{
  "@type": ["SoftwareApplication", "ea:Application"],
  "@id": "ea:app-dynamics-crm",
  "name": "Dynamics 365 Sales",
  "ea:realizes": {"@id": "ea:cap-customer-management"},
  "ea:hostedOn": {"@id": "azure:dynamics365-prod"}
}
```

### Define Azure Resource
```json
{
  "@type": "azure:OpenAIService",
  "@id": "azure:openai-prod-uk",
  "name": "Production OpenAI UK South",
  "azure:resourceId": "/subscriptions/.../Microsoft.CognitiveServices/accounts/openai-prod",
  "azure:region": "uksouth",
  "azure:skuTier": "S0"
}
```

### Define AI Agent Architecture
```json
{
  "@type": "ai:AIAgent",
  "@id": "ai:customer-service-agent",
  "name": "Customer Service Agent",
  "ai:usesModel": {"@id": "azure:gpt4-deployment"},
  "ai:hasTools": [
    {"@id": "ai:tool-crm-lookup"},
    {"@id": "ai:tool-order-status"},
    {"@id": "ai:tool-knowledge-search"}
  ]
}
```

## Integration with VSOM/VSEM

This ontology integrates with the PFC-VSOM-VSEM skill for strategic alignment:

```json
{
  "@type": "ea:Application",
  "@id": "ea:app-pricing-engine",
  "name": "AI Pricing Engine",
  "ea:alignsTo": {"@id": "vsem:objective-revenue-optimization"},
  "ea:supports": {"@id": "vsem:strategy-ai-first"}
}
```

## Schema.org Foundation

All classes extend Schema.org types where applicable:

| EA Class | Schema.org Parent |
|----------|-------------------|
| BusinessCapability | Action |
| BusinessProcess | HowTo |
| BusinessService | Service |
| Application | SoftwareApplication |
| DataEntity | Dataset |
| API | WebAPI |
| ArchitectureRoadmap | Plan |

## Validation

Use JSON-LD validators to verify ontology instances:
- [JSON-LD Playground](https://json-ld.org/playground/)
- [RDF Validator](https://www.w3.org/RDF/Validator/)

## License

This ontology is provided for enterprise architecture practice. Extend and customize for your organization's needs.

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0-pre-oaav5 | 2026-01-29 | Comprehensive TOGAF ADM graph with 400+ edges, full artifact lineage, pre-OAA v5 alignment |
| 1.0.0 | 2026-01-26 | Initial release with full Azure coverage |
