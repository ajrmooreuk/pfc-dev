# GRC-02-RISK — Feature Candidates

This directory holds **future feature candidates** for the GRC Risk domain that are
in research/ideation phase and not yet scheduled into the active sprint backlog.

Documents here are reference material for upcoming epics and features. They do NOT
represent committed ontology content and should not be treated as production schemas.

## Purpose

- Keep candidate designs and briefing notebooks accessible without cluttering
  active ontology directories (ERM-ONT, RMF-IS27005-ONT, etc.)
- Provide source material for epic/feature planning sessions
- Maintain traceability from ideation through to implementation

## Contents

| Document | Description | Target Epic |
|----------|-------------|-------------|
| `THREAT-MODELLING-BRIEFING-NOTEBOOK.md` | Full briefing on AI-enhanced threat modelling capability | Epic 34 |
| `THREAT-MODELLING-SOURCE-FRAMEWORK-v2.0.md` | Source framework: ISO 27005 + MITRE ATLAS + OWASP AI coverage audit | Epic 34 |

## Lifecycle

When a candidate progresses to implementation:
1. The relevant epic/feature issues are created on the project board
2. The ontology directory is created (e.g., `GRC-02-RISK/THREAT-MODEL-ONT/`)
3. The candidate doc remains here as historical reference
4. A link is added from the new ontology's CHANGELOG back to this candidate doc
