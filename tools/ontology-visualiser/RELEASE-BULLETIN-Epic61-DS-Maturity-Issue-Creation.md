# Release Bulletin: Epic 61 — Design System Maturity Issue Creation

**Date:** 2026-03-06
**Priority:** P1 High
**Epic:** 61 (#876) — Design System Maturity: Token Gap Remediation, Auto-Fill Rules & Slide Deck Generation
**Parent:** Epic 34 (#518) — PF-Core Graph-Based Agentic Platform Strategy
**Affects:** Design System (DS-ONT), all 5 brand instances, VSOM-SC slide generation, Epic 8 backlog

---

## Summary

Epic 61 strategy brief approved and all GitHub issues created. This epic consolidates three workstreams: (1) closing the 60% token gap across 5 brands using design-rule-driven auto-fill, (2) rolling forward 8 blocked stories from Epic 8, and (3) enabling token-branded slide deck generation from VSOM strategy data via pptxgenjs.

## What Changed

### Issue Creation

| Category | Count | Issue Numbers |
| -------- | ----- | ------------- |
| Epic (existing, updated) | 1 | #876 |
| Feature issues (new) | 8 | #933-#940 |
| Story issues (new) | 38 | #891-#898, #900-#907, #908-#919, #920-#932 |
| Rolled-forward stories (re-titled) | 8 | #110-#113, #122-#125 |
| **Total issues touched** | **55** | |

### Features Created

| Feature | Issue | Phase | Status |
| ------- | ----- | ----- | ------ |
| F61.1: Token Gap Analysis Engine & Auto-Fill Rules | #933 | 1 (P0) | Ready |
| F61.2: Auto-Fill Execution & HITL Approval | #934 | 1 (P0) | Ready |
| F61.3: Component Tier Population | #935 | 2 (P1) | Ready |
| F61.4: Cross-Brand Standardisation | #936 | 2 (P1) | Ready |
| F61.5: Token Storage & Resolution (ex-F8.2) | #937 | 3 (P1) | Blocked by Epic 59 |
| F61.6: Agentic Design Workflow (ex-F8.5) | #938 | 3 (P1) | Blocked by Epic 59 |
| F61.7: Token-Branded PPTX Slide Engine | #939 | 4 (P1) | Ready |
| F61.8: AI-Assisted Slide Content Generation | #940 | 4 (P1) | Ready |

### Rolled-Forward Stories from Epic 8

| Original | New Title | Issue |
| -------- | --------- | ----- |
| S8.2.1 | S61.5.1: Supabase JSONB storage (ex-S8.2.1) | #110 |
| S8.2.2 | S61.5.2: resolve_token() SQL cascade (ex-S8.2.2) | #111 |
| S8.2.3 | S61.5.3: Runtime brand switching (ex-S8.2.3) | #112 |
| S8.2.4 | S61.5.4: Token version history and rollback (ex-S8.2.4) | #113 |
| S8.5.1 | S61.6.1: Agent skill — Figma MCP extraction (ex-S8.5.1) | #122 |
| S8.5.2 | S61.6.2: Agent skill — layout management (ex-S8.5.2) | #123 |
| S8.5.3 | S61.6.3: Agent skill — React/CSS codegen (ex-S8.5.3) | #124 |
| S8.5.4 | S61.6.4: Agent workflows via PE process definitions (ex-S8.5.4) | #125 |

### Documentation Updated

| File | Change |
| ---- | ------ |
| `ARCHITECTURE.md` | v5.7.0 → v5.8.0 — added Epic 61 DS Maturity section with auto-fill engine architecture, 9 DR-* rules table, PPTX slide pipeline diagram, and issue map |
| `OPERATING-GUIDE.md` | v5.9.0 → v5.10.0 — added Workflows 20-22 (Token Gap Analysis, Auto-Fill & HITL, Slide Deck Generation) |
| `RELEASE-BULLETIN-Epic61-DS-Maturity-Issue-Creation.md` | New — this file |
| `PBS/STRATEGY/BRIEFING-Epic61-*.md` | Existing — approved, no changes |

### Cross-References

- **Epic 8 (#80):** Roll-forward comment added documenting F8.2 + F8.5 transfer to Epic 61
- **Epic 44 (#631):** WWG token re-extraction is complementary (extracts from Figma); Epic 61 auto-fills remaining gaps. Cross-ref noted on S61.2.3 (#902)
- **Epic 59 (#840):** F61.5 and F61.6 remain blocked until DB layer is operational

## Key Design Decisions

- **D-E61-001:** Auto-fill targets ~80% automation via design rules; ~20% requires HITL Design Director judgement
- **D-E61-002:** BAIV is the template brand — rules are iterated on BAIV first, then applied to all 5 brands
- **D-E61-003:** Rolled-forward stories transfer as-is with existing Epic 59 cross-references — no scope changes
- **D-E61-004:** pptxgenjs ^4.0.1 (already installed) is the PPTX rendering engine; Google Slides is deferred to Horizon 2

## Verification

- [x] 8 feature issues created with correct labels (`type:feature`, `visualiser`, `phase:N`)
- [x] 38 new story issues created with correct labels (`type:story`, `visualiser`, `phase:N`)
- [x] 8 rolled-forward stories re-titled and re-labelled
- [x] Epic 61 (#876) body updated with all issue numbers and linked checklists
- [x] Roll-forward comment posted on Epic 8 (#80)
- [x] No duplicate issues found (S8.5.4 #125 discovered and re-titled instead of duplicated)
- [x] ARCHITECTURE.md updated to v5.8.0
- [x] OPERATING-GUIDE.md updated to v5.10.0

## Deployment & Configuration Requirements

**None** — documentation-only changes. Pull latest main.
