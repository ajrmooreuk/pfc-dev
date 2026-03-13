# pfc-grc-mcsb-benchmark — MCSB Compliance Benchmarking Skill

**Skill ID:** pfc-grc-mcsb-benchmark
**Version:** v0.1.0 (scaffold)
**Type:** AGENT_SUPERVISED
**Feature:** F74.20b
**Epic:** [Epic 74 (#1074)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1074)

---

## Purpose

Benchmark customer MCSB compliance posture using three-state DMAIC backcasting: **Best Practice** (100% per domain), **Current State** (from pfc-grc-mcsb-assess), and **Desired Destination** (customer-defined targets). Optionally compares to peer cohort benchmarks from historical Supabase data.

## Three-State Gap Analysis

```text
Best Practice ─────── 100% per domain (MCSB-ONT defined)
        ↕ gap₁
Desired Destination ── Customer target per domain (VE-driven)
        ↕ gap₂
Current State ──────── Live compliance score (pfc-grc-mcsb-assess)
```

- **gap₁** = Best Practice – Desired Destination (acceptable risk, VE-justified)
- **gap₂** = Desired Destination – Current State (remediation required)
- Backcasting works from Desired Destination backwards to generate phased roadmap

## Inputs

- pfc-grc-mcsb-assess output (current state scores per domain)
- Customer desired targets per domain (from VE Value Discovery)
- Peer cohort identifier (optional — industry vertical for benchmarking)

## Outputs

- Three-state gap matrix (12 domains + AI)
- Gap magnitude and remediation effort per domain
- Peer comparison radar chart data (if cohort available)
- Backcasted roadmap milestones (from desired destination)
- VE-prioritised remediation sequence

## Dependencies

- pfc-grc-mcsb-assess (upstream — must run first)
- Supabase historical data (optional — for peer cohort)
- VE Value Discovery output (customer priorities)
