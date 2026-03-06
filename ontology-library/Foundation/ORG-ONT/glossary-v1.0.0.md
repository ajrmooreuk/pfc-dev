# Organization Ontology Glossary v1.0.0

**Ontology:** Organization Ontology  
**Version:** 1.0.0  
**Date:** 2026-01-20  
**Term Count:** 12

---

## Entity Terms

### Organization
**Term ID:** TERM-ORG-001  
**Definition:** Core organization entity representing any business, company, or entity within the platform ecosystem  
**Schema.org Mapping:** `schema:Organization`  
**Data Type:** Object  
**Required:** Yes  
**Constraints:** Must have unique organizationId  
**Example:** Foot Scientific, LLC  
**Related Terms:** OrganizationContext, platformRelationships  
**Synonyms:** Company, Business, Entity  
**Notes:** Foundation entity referenced by all other organization-related ontologies

---

## Property Terms

### organizationId
**Term ID:** TERM-ORG-002  
**Definition:** Unique identifier for an organization within the platform, following the pattern org:[a-z0-9-]+  
**Schema.org Mapping:** `schema:identifier`  
**Data Type:** Text  
**Required:** Yes  
**Constraints:** Pattern: `org:[a-z0-9-]+`, must be unique across all organizations  
**Example:** `org:foot-scientific`  
**Related Terms:** Organization  
**Synonyms:** orgId, organizationIdentifier  
**Notes:** Used as primary key for organization lookups

### platformRelationships
**Term ID:** TERM-ORG-003  
**Definition:** Array of relationships an organization has with the platform, allowing multiple simultaneous relationship types  
**Schema.org Mapping:** None (custom property)  
**Rationale:** No schema.org equivalent for multi-relationship platform membership  
**Data Type:** ItemList  
**Required:** Yes  
**Constraints:** Must contain at least one relationship object  
**Example:** `[{"type": "client", "tier": "direct", "status": "active"}]`  
**Related Terms:** Organization, relationshipType, tier  
**Synonyms:** platformMembership, platformRoles  
**Notes:** Enables organizations to be both client AND affiliate simultaneously

### type
**Term ID:** TERM-ORG-004  
**Definition:** Primary classification of an organization's role in the platform ecosystem  
**Schema.org Mapping:** None (custom enumeration)  
**Rationale:** Custom enumeration specific to platform organization types  
**Data Type:** Text  
**Required:** Yes  
**Constraints:** Enum: `PFI`, `Agency`, `Client`, `Affiliate`, `Partner`, `Competitor`  
**Example:** Client  
**Related Terms:** Organization, platformRelationships  
**Synonyms:** organizationType, orgType  
**Notes:** Determines base permissions and visibility rules

### tier
**Term ID:** TERM-ORG-007  
**Definition:** Method by which a client organization accesses the platform - either directly or through an agency  
**Schema.org Mapping:** None (custom property)  
**Rationale:** Platform-specific access method classification  
**Data Type:** Text  
**Required:** No (only for clients)  
**Constraints:** Enum: `direct`, `agency_managed`. Only applicable when type=client  
**Example:** direct  
**Related Terms:** platformRelationships, Agency, managedBy  
**Synonyms:** accessMethod, clientTier  
**Notes:** agency_managed requires managedBy to specify the managing agency

### industry
**Term ID:** TERM-ORG-009  
**Definition:** Primary industry sector in which the organization operates  
**Schema.org Mapping:** `schema:industry`  
**Data Type:** Text  
**Required:** Yes  
**Constraints:** Free text, should align with standard industry classifications  
**Example:** Healthcare  
**Related Terms:** Organization, marketSegments  
**Synonyms:** sector, vertical  
**Notes:** Used for industry-specific recommendations and benchmarking

### size
**Term ID:** TERM-ORG-010  
**Definition:** Classification of organization size based on employee count  
**Schema.org Mapping:** None (custom enumeration)  
**Rationale:** Custom enumeration with specific ranges for platform segmentation  
**Data Type:** Text  
**Required:** Yes  
**Constraints:** Enum: `Startup (1-50)`, `SME (51-250)`, `Mid-Market (251-1000)`, `Enterprise (1000+)`  
**Example:** SME (51-250)  
**Related Terms:** Organization, sizeMaturity  
**Synonyms:** companySize, organizationSize  
**Notes:** Affects pricing tier and feature availability

---

## Relationship Terms

### managedBy
**Term ID:** TERM-ORG-008  
**Definition:** Reference to the agency organization that manages this client organization  
**Schema.org Mapping:** None (custom relationship)  
**Rationale:** Platform-specific relationship with no direct schema.org equivalent  
**Data Type:** Reference  
**Required:** No (required when tier=agency_managed)  
**Constraints:** Must reference valid Agency organization  
**Example:** `org:marketing-agency-xyz`  
**Related Terms:** tier, Agency, platformRelationships  
**Synonyms:** parentAgency, managingOrganization  
**Notes:** Creates parent-child relationship for data access

---

## Enumeration Values

### PFI (Platform Framework Instance)
**Term ID:** TERM-ORG-005  
**Definition:** The organization that operates the platform (e.g., BAIV)  
**Data Type:** Text (enum value)  
**Constraints:** Only one PFI per platform instance  
**Example:** BAIV is the PFI for the AI Visibility platform  
**Related Terms:** type, Organization  
**Synonyms:** Platform Owner, Platform Operator  
**Antonyms:** Client, Agency  
**Notes:** Has highest level of access and administrative privileges

### Agency
**Term ID:** TERM-ORG-006  
**Definition:** Organization that manages multiple client organizations on behalf of those clients  
**Data Type:** Text (enum value)  
**Constraints:** Can manage multiple clients, may also be a client themselves  
**Example:** Marketing Agency XYZ manages 10 client accounts  
**Related Terms:** type, Client, managedBy  
**Synonyms:** Reseller, Partner Agency  
**Antonyms:** Direct Client  
**Notes:** Agency users can access all their managed client data

### Affiliate
**Term ID:** TERM-ORG-011  
**Definition:** Organization or individual that refers new clients to the platform in exchange for compensation  
**Data Type:** Text (enum value)  
**Constraints:** Can be combined with other relationship types (e.g., client + affiliate)  
**Example:** Foot Scientific is both a client and an affiliate  
**Related Terms:** type, platformRelationships  
**Synonyms:** Referral Partner, Ambassador  
**Notes:** Tracked via referralCode in platformRelationships

### Competitor
**Term ID:** TERM-ORG-012  
**Definition:** Organization identified as competing with another organization in the same market  
**Data Type:** Text (enum value)  
**Constraints:** Can exist at platform level, client level, or client's client level  
**Example:** Superfeet is a competitor of Foot Scientific  
**Related Terms:** type, CompetitiveLandscape  
**Synonyms:** Rival, Competition  
**Antonyms:** Partner  
**Notes:** Competitors are tracked for citation monitoring and ranking comparison

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2026-01-20 | Initial release | BAIV Platform Team |
