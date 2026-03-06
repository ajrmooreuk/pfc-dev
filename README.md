# PFC-DEV — PF-Core Development

PF-Core **development** tier — Amanda's workspace for ontologies, visualiser, agents, and skills.

| Field | Value |
|---|---|
| **Tier** | dev (solo mode — direct push OK) |
| **Triad** | [pfc-dev](https://github.com/ajrmooreuk/pfc-dev) · [pfc-test](https://github.com/ajrmooreuk/pfc-test) · [pfc-prod](https://github.com/ajrmooreuk/pfc-prod) |
| **Architecture** | Hub-and-Spoke (ARCH-CICD-001) |
| **Epic** | [Epic 58 (#837)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/837) |
| **VSOM Master** | [Epic 60 (#859)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/859) |
| **Briefing** | [PFC Triad Separation Strategy](https://github.com/ajrmooreuk/Azlan-EA-AAA/blob/main/PBS/STRATEGY/BRIEFING-Epic58-PFC-Core-Triad-Separation-Strategy.md) |

## Directory Structure

```
pfc-dev/
  ontology-library/         # Working ontology library (52 ontologies, 5 series)
  tools/ontology-visualiser/ # Visualiser source (34 ES modules, vitest 2081 tests)
  agents/                   # Agent prompts and configs
  sealed-skills/            # Sealed skill manifest and binaries
  promotion/                # promotion.env targeting pfc-test
  .github/workflows/        # promote.yml (dev→test), guard-core.yml template
```

## Promotion

```bash
# Promote to pfc-test (validation gate)
gh workflow run promote.yml --repo ajrmooreuk/pfc-dev -f direction=dev-to-test

# Then from pfc-test to pfc-prod (SME approval required)
gh workflow run promote.yml --repo ajrmooreuk/pfc-test -f direction=test-to-prod -f bump=minor
```

## Tests

```bash
cd tools/ontology-visualiser
npm install
npx vitest run  # 2081 tests
```
