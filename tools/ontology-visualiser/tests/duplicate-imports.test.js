/**
 * duplicate-imports.test.js — Guard against duplicate named imports in app.js
 *
 * Background: commit 519b05a introduced a duplicate `generateWorkflowMermaid`
 * import from both skill-builder.js and ds-loader.js. This is a SyntaxError
 * that kills ALL JavaScript at parse time — no toolbar, no nav, no graph.
 * The test suite still passed because Vitest loads modules individually, not
 * through app.js's top-level import block. This guard test catches such
 * collisions at CI time by parsing the import statements directly.
 *
 * @see https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/TBD
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const JS_DIR = join(__dirname, '..', 'js');

/**
 * Extract all named imports from a JS source string.
 * Returns an array of { name, alias, fromModule, line }.
 */
function extractNamedImports(source) {
  const results = [];
  const lines = source.split('\n');

  // Accumulate multi-line import blocks
  let buffer = '';
  let startLine = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (buffer) {
      buffer += ' ' + line.trim();
      if (line.includes(';') || (line.includes('from') && line.includes("'"))) {
        parseImportBuffer(buffer, startLine, results);
        buffer = '';
      }
    } else if (line.trimStart().startsWith('import ') && line.includes('{')) {
      if (line.includes('from') && line.includes(';')) {
        // Single-line import
        parseImportBuffer(line, i + 1, results);
      } else {
        buffer = line.trim();
        startLine = i + 1;
      }
    }
  }

  return results;
}

function parseImportBuffer(text, line, results) {
  // Extract { ... } block
  const braceMatch = text.match(/\{([^}]+)\}/);
  if (!braceMatch) return;

  // Extract module path
  const fromMatch = text.match(/from\s+['"]([^'"]+)['"]/);
  if (!fromMatch) return;
  const fromModule = fromMatch[1];

  // Parse individual imports: name, or name as alias
  const specifiers = braceMatch[1].split(',').map(s => s.trim()).filter(Boolean);
  for (const spec of specifiers) {
    const parts = spec.split(/\s+as\s+/);
    const name = parts[0].trim();
    const alias = parts.length > 1 ? parts[1].trim() : name;
    if (name) {
      results.push({ name, alias, fromModule, line });
    }
  }
}

describe('Duplicate import guard', () => {
  it('app.js must not have duplicate named import identifiers', () => {
    const source = readFileSync(join(JS_DIR, 'app.js'), 'utf8');
    const imports = extractNamedImports(source);

    // Check for duplicate aliases (the identifier that enters scope)
    const seen = new Map();
    const duplicates = [];

    for (const imp of imports) {
      if (seen.has(imp.alias)) {
        const prev = seen.get(imp.alias);
        duplicates.push(
          `"${imp.alias}" imported from both "${prev.fromModule}" (line ~${prev.line}) ` +
          `and "${imp.fromModule}" (line ~${imp.line})`
        );
      } else {
        seen.set(imp.alias, imp);
      }
    }

    expect(duplicates, `Duplicate imports found:\n  ${duplicates.join('\n  ')}`).toHaveLength(0);
  });

  it('no JS module in js/ should have duplicate named import identifiers', () => {
    const { readdirSync } = require('fs');
    const files = readdirSync(JS_DIR).filter(f => f.endsWith('.js'));
    const allDuplicates = [];

    for (const file of files) {
      const source = readFileSync(join(JS_DIR, file), 'utf8');
      const imports = extractNamedImports(source);
      const seen = new Map();

      for (const imp of imports) {
        if (seen.has(imp.alias)) {
          const prev = seen.get(imp.alias);
          allDuplicates.push(
            `${file}: "${imp.alias}" from "${prev.fromModule}" (line ~${prev.line}) ` +
            `and "${imp.fromModule}" (line ~${imp.line})`
          );
        } else {
          seen.set(imp.alias, imp);
        }
      }
    }

    expect(allDuplicates, `Duplicate imports:\n  ${allDuplicates.join('\n  ')}`).toHaveLength(0);
  });

  it('all JS modules in js/ should pass syntax check', () => {
    const { readdirSync } = require('fs');
    const { execSync } = require('child_process');
    const files = readdirSync(JS_DIR).filter(f => f.endsWith('.js'));
    const failures = [];

    for (const file of files) {
      try {
        execSync(`node -c "${join(JS_DIR, file)}"`, { stdio: 'pipe' });
      } catch (err) {
        failures.push(`${file}: ${err.stderr?.toString().trim() || err.message}`);
      }
    }

    expect(failures, `Syntax errors:\n  ${failures.join('\n  ')}`).toHaveLength(0);
  });
});
