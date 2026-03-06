# Update Bulletin: Audit Panel Buttons Regression Fix

**Date:** 2026-02-27
**Priority:** P1
**Commit:** 149c99b
**Epic:** 40 (#577) | **Caused by:** F40.20 Phase 4 (commit 732decb)
**Affects:** All users — OAA upgrade, save-to-library, and export buttons missing from audit panel

---

## Summary

Three action buttons in the OAA audit panel were accidentally deleted during F40.20 Phase 4 when the static toolbar HTML was removed (commit 732decb). The JavaScript in `compliance-reporter.js` guards with `if (upgradeBtn)` so the missing DOM elements failed silently — no error, no button, no indication anything was wrong.

## Root Cause

F40.20 Phase 4 ("Prove and Replace") deleted the entire `<div class="toolbar">` block from `browser-viewer.html` (lines 24-91). The `btn-run-oaa`, `btn-save-library`, and `btn-export-audit` buttons were located inside that toolbar block. They should not have been deleted because they serve a **different purpose** from the dynamic nav toolbar equivalent:

| System | Button | Visible When | Purpose |
| ------ | ------ | ------------ | ------- |
| **Audit panel** (compliance-reporter.js) | Upgrade with OAA v7 | Validation is warn or fail | Context-sensitive action inside audit report |
| **Audit panel** (compliance-reporter.js) | Save to Library | Validation is pass | Context-sensitive action inside audit report |
| **Audit panel** (compliance-reporter.js) | Export Report | Always after validation | Export audit as JSON |
| **Dynamic nav** (L3-admin) | Upgrade OAA | Authoring mode only | Toolbar shortcut |

The audit panel buttons and the dynamic nav button are **two separate systems** that must coexist.

## What Changed

| File | Change |
| ---- | ------ |
| `browser-viewer.html` | Restored 3 buttons inside `#audit-panel` div, after `#oaa-compliance-content` |
| `ARCH-NAVIGATION.md` | Added Section 12 documenting audit panel buttons as separate system + regression note |
| `OPERATING-GUIDE.md` | Added implementation note warning against deleting audit panel buttons during toolbar refactors |

## Cross-Check Table

The parity audit file (`AUDIT-dynamic-nav-actions.md`) correctly lists "Upgrade OAA" at L3-admin line 80 as a dynamic nav item. However, it does not separately catalogue the audit panel buttons because they are not part of the skeleton navigation system. This bulletin and the new ARCH-NAVIGATION.md Section 12 now close that documentation gap.

## Lesson Learned

**Do not delete static HTML elements until their dynamic equivalents are confirmed working AND all other consumers of those DOM IDs have been audited.** The `btn-run-oaa` element was consumed by two independent systems:

1. The static toolbar (replaced by dynamic nav — correct to remove)
2. `compliance-reporter.js` `renderOAACompliancePanel()` (still needed — should not have been removed)

A `grep` for each button ID across all JS files before deletion would have caught this.

## Verification

- Buttons now appear in audit panel when loading any ontology
- `btn-run-oaa` shows when validation is warn/fail, hidden when pass
- `btn-save-library` shows when validation is pass, hidden otherwise
- `btn-export-audit` shows always after first validation
- Dynamic nav L3-admin "Upgrade OAA" continues to work independently in authoring mode

## Action Required

**None** — fix is included in commit 149c99b. Pull latest main to get the restored buttons.
