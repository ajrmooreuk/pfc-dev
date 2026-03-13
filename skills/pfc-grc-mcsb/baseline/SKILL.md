# pfc-grc-baseline — Compliance Baseline & SPC Control Limits Skill

**Skill ID:** pfc-grc-baseline
**Version:** v0.1.0 (scaffold)
**Type:** AGENT_AUTONOMOUS
**Feature:** F74.20
**Epic:** [Epic 74 (#1074)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1074)

---

## Purpose

Establish a compliance baseline from assessment data and calculate Statistical Process Control (SPC) control limits for ongoing compliance monitoring. Enables drift detection by defining what "normal" looks like.

## Inputs

- pfc-grc-mcsb-assess output (domain scores, historical if available)
- Minimum 3 assessment data points for SPC calculation (ideal: 10+)
- Target compliance levels per domain

## Process

1. Record current assessment scores to Supabase historical store
2. Calculate mean and standard deviation per domain
3. Set UCL/LCL (Upper/Lower Control Limits) at ±2σ
4. Define target line per domain (from VE desired destination)
5. Identify domains with high variance (unstable compliance)

## Outputs

- Baseline record (stored in Supabase)
- SPC control chart data per domain
- UCL/LCL values per domain
- Stability assessment (stable/unstable per domain)
- Trend direction (improving/degrading/stable)

## Downstream Consumers

- pfc-grc-drift (uses baseline for drift detection)
- pfc-grc-mcsb-report (trend reporting)
