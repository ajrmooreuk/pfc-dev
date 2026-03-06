#!/usr/bin/env bash
# pre-commit-v7-check.sh — validates v7 metadata on staged ontology JSON files
#
# Install: cp scripts/pre-commit-v7-check.sh ../../.git/hooks/pre-commit
#   or: ln -sf ../../PBS/TOOLS/ontology-visualiser/scripts/pre-commit-v7-check.sh .git/hooks/pre-commit
#
# F42.1 / S42.1.3 / Epic 42 (#608)

set -euo pipefail

# Only check staged ontology JSON files in the library (not registry, reports, orphans)
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E 'PBS/ONTOLOGIES/ontology-library/.*\.json(ld)?$' | grep -v 'ont-registry-index' | grep -v 'validation-reports' | grep -v '_orphans' | grep -v '_sketches' || true)

if [ -z "$STAGED_FILES" ]; then
  exit 0
fi

ERRORS=0

for FILE in $STAGED_FILES; do
  # Only check files that look like ontology artifacts (have entities key)
  HAS_ENTITIES=$(node -e "try { const d=require('./$FILE'); process.exit(d.entities ? 0 : 1) } catch(e) { process.exit(1) }" 2>/dev/null && echo "yes" || echo "no")

  if [ "$HAS_ENTITIES" = "yes" ]; then
    SCHEMA=$(node -e "const d=require('./$FILE'); console.log(d['oaa:schemaVersion'] || '')")
    ONT_ID=$(node -e "const d=require('./$FILE'); console.log(d['oaa:ontologyId'] || '')")
    SERIES=$(node -e "const d=require('./$FILE'); console.log(d['oaa:series'] || '')")

    if [ -z "$SCHEMA" ] || [ -z "$ONT_ID" ] || [ -z "$SERIES" ]; then
      echo "ERROR: $FILE missing v7 fields (schemaVersion=$SCHEMA, ontologyId=$ONT_ID, series=$SERIES)"
      echo "  Run: node scripts/migrate-v7.mjs --apply"
      ERRORS=$((ERRORS + 1))
    fi
  fi
done

if [ "$ERRORS" -gt 0 ]; then
  echo ""
  echo "$ERRORS ontology file(s) missing OAA v7 mandatory fields."
  echo "Run 'node PBS/TOOLS/ontology-visualiser/scripts/migrate-v7.mjs --apply' to fix."
  exit 1
fi
