# pfc-hcr-verify — Independent Verification & Assurance

**Skill ID:** pfc-hcr-verify
**Version:** v0.1.0 (scaffold)
**Type:** AGENT_SUPERVISED
**Feature:** F74.25c
**Epic:** [Epic 74 (#1074)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1074)

---

## Purpose

Provide independent verification and assurance for the Health Check Report — evidence integrity checking, methodology audit, sample re-execution for consistency, and formal attestation. Ensures the report is auditable, defensible, and suitable for regulatory and insurance evidence.

Assumes overarching RMF framework (ISO 27005) and provides independent verification separate from the assessment team.

## Inputs

- Complete `hcr:Evidence` set from assessment skills (KQL results, policy exports, config snapshots)
- Scoring methodology documentation (three-state model, weighting factors)
- pfc-hcr-analyse correlation outputs (for consistency checking)
- RMF-IS27005 risk assessment data (for methodology audit)
- Previous verification results (if re-assessment)

## Verification Process

```text
1. EVIDENCE INTEGRITY
   ├── Verify hash chain for all evidence items
   ├── Confirm timestamps are within assessment window
   ├── Validate source attribution (which azure-skill MCP call)
   └── Flag any evidence gaps or inconsistencies

2. METHODOLOGY AUDIT
   ├── Scoring model calibration check (weights sum to 1.0)
   ├── Three-state gap calculation consistency
   ├── RMF risk scoring consistency (impact × likelihood)
   ├── VE priority weighting validation
   └── Cross-framework correlation logic review

3. SAMPLE RE-EXECUTION (10% of MCP calls)
   ├── Select random sample of azure-skill calls
   ├── Re-execute and compare results
   ├── Flag variance > threshold (environment drift vs. error)
   └── Document any discrepancies with explanation

4. CROSS-REFERENCE VALIDATION
   ├── Findings consistent across frameworks
   ├── Risk scores proportionate to finding severity
   ├── Recommendations proportionate to risk
   └── Financial estimates within reasonable bounds

5. ATTESTATION
   ├── Scope statement (what was verified, what was excluded)
   ├── Methodology statement (how verification was conducted)
   ├── Findings (any verification issues)
   └── Attestation statement (pass / conditional pass / fail)
```

## Outputs

- Evidence integrity report (hash verification results)
- Methodology audit findings
- Re-execution consistency report
- Verification findings log
- `hcr:VerificationAttestation` entity (scope, methodology, status)
- Formal attestation statement (for report Part IV)

## Ontology Surface

- HCR-ONT v1.0.0 (`hcr:Evidence`, `hcr:VerificationAttestation`)
- RMF-IS27005-ONT v1.0.0 (methodology framework)

## Human Checkpoint

Verification Review — independent reviewer (not the assessment author) reviews verification findings and signs attestation.
