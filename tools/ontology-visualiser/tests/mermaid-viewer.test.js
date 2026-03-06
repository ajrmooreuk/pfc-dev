/**
 * Unit tests for mermaid-viewer.js — Mermaid diagram parsing, rendering, mode switching.
 * Epic 9F Phase 1 — F9F.1 + F9F.2 tests.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock state.js
vi.mock('../js/state.js', () => ({
  state: {
    viewMode: 'single',
    activeView: 'graph',
    mermaidMode: false,
    mermaidSource: null,
    mermaidFileName: null,
    mermaidDiagrams: [],
    mermaidActiveDiagram: 0,
    mermaidEditorOpen: false,
    mermaidRelatedPanelOpen: false,
    mermaidNodeMap: null,
    mermaidLastIdMap: null,
    mermaidLibrary: [],
    mermaidOrigin: null,
  },
}));

// Mock DOM
const mockElements = {};
vi.stubGlobal('document', {
  getElementById: vi.fn((id) => {
    if (!mockElements[id]) {
      mockElements[id] = {
        style: {},
        innerHTML: '',
        textContent: '',
        classList: {
          _classes: new Set(),
          add(c) { this._classes.add(c); },
          remove(c) { this._classes.delete(c); },
          contains(c) { return this._classes.has(c); },
          toggle(c, force) {
            if (force !== undefined) {
              if (force) this._classes.add(c); else this._classes.delete(c);
            } else {
              if (this._classes.has(c)) this._classes.delete(c); else this._classes.add(c);
            }
          },
        },
        querySelectorAll: vi.fn(() => []),
        addEventListener: vi.fn(),
      };
    }
    return mockElements[id];
  }),
});

import { state } from '../js/state.js';
import {
  detectDiagramType,
  parseMermaidFile,
  renderDiagramTabs,
  switchToMermaidMode,
  switchToOntologyMode,
} from '../js/mermaid-viewer.js';

// --- Reset state between tests ---
beforeEach(() => {
  state.viewMode = 'single';
  state.activeView = 'graph';
  state.mermaidMode = false;
  state.mermaidSource = null;
  state.mermaidFileName = null;
  state.mermaidDiagrams = [];
  state.mermaidActiveDiagram = 0;
  state.mermaidEditorOpen = false;
  state.mermaidOrigin = null;
  // Reset mock elements
  for (const key of Object.keys(mockElements)) {
    delete mockElements[key];
  }
});

// ============================================================
// S9F.1.1 — detectDiagramType
// ============================================================

describe('detectDiagramType', () => {
  it('detects flowchart (flowchart keyword)', () => {
    expect(detectDiagramType('flowchart LR\n  A --> B')).toBe('flowchart');
  });

  it('detects flowchart (graph keyword)', () => {
    expect(detectDiagramType('graph TD\n  A --> B')).toBe('flowchart');
  });

  it('detects sequence diagram', () => {
    expect(detectDiagramType('sequenceDiagram\n  A->>B: hello')).toBe('sequence');
  });

  it('detects state diagram', () => {
    expect(detectDiagramType('stateDiagram-v2\n  [*] --> Idle')).toBe('state');
  });

  it('detects gantt chart', () => {
    expect(detectDiagramType('gantt\n  title Project\n  section A')).toBe('gantt');
  });

  it('detects class diagram', () => {
    expect(detectDiagramType('classDiagram\n  class Foo')).toBe('classDiagram');
  });

  it('detects pie chart', () => {
    expect(detectDiagramType('pie\n  "A": 40')).toBe('pie');
  });

  it('detects ER diagram', () => {
    expect(detectDiagramType('erDiagram\n  A ||--o{ B : has')).toBe('er');
  });

  it('detects journey', () => {
    expect(detectDiagramType('journey\n  title My Journey')).toBe('journey');
  });

  it('detects gitgraph', () => {
    expect(detectDiagramType('gitgraph\n  commit')).toBe('gitgraph');
  });

  it('returns unknown for unrecognized type', () => {
    expect(detectDiagramType('some random text\n  not a diagram')).toBe('unknown');
  });

  it('handles case insensitivity', () => {
    expect(detectDiagramType('FlowChart LR\n  A --> B')).toBe('flowchart');
    expect(detectDiagramType('GANTT\n  title A')).toBe('gantt');
  });

  it('trims whitespace on first line', () => {
    expect(detectDiagramType('  sequenceDiagram\n  A->>B: msg')).toBe('sequence');
  });
});

// ============================================================
// S9F.1.3 — parseMermaidFile (multi-diagram + single)
// ============================================================

describe('parseMermaidFile', () => {
  it('returns empty array for null/empty input', () => {
    expect(parseMermaidFile(null)).toEqual([]);
    expect(parseMermaidFile('')).toEqual([]);
    expect(parseMermaidFile('   ')).toEqual([]);
  });

  it('parses single raw diagram (no fences)', () => {
    const source = 'flowchart LR\n    A --> B';
    const result = parseMermaidFile(source);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Diagram');
    expect(result[0].type).toBe('flowchart');
    expect(result[0].source).toBe(source);
  });

  it('parses single fenced diagram', () => {
    const text = '# My Diagram\n\n```mermaid\nflowchart LR\n    A --> B\n```';
    const result = parseMermaidFile(text);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('My Diagram');
    expect(result[0].type).toBe('flowchart');
    expect(result[0].source).toBe('flowchart LR\n    A --> B');
  });

  it('parses multi-diagram file with headings', () => {
    const text = [
      '# Architecture',
      '',
      '## Component Overview',
      '',
      '```mermaid',
      'flowchart LR',
      '    A --> B',
      '```',
      '',
      '## Sequence Flow',
      '',
      '```mermaid',
      'sequenceDiagram',
      '    A->>B: request',
      '```',
      '',
      '## State Machine',
      '',
      '```mermaid',
      'stateDiagram-v2',
      '    [*] --> Idle',
      '```',
    ].join('\n');

    const result = parseMermaidFile(text);
    expect(result).toHaveLength(3);

    expect(result[0].title).toBe('Component Overview');
    expect(result[0].type).toBe('flowchart');

    expect(result[1].title).toBe('Sequence Flow');
    expect(result[1].type).toBe('sequence');

    expect(result[2].title).toBe('State Machine');
    expect(result[2].type).toBe('state');
  });

  it('assigns default titles for fences without headings', () => {
    const text = '```mermaid\nflowchart LR\n    A --> B\n```\n\n```mermaid\ngantt\n    title Plan\n```';
    const result = parseMermaidFile(text);
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('Diagram 1');
    expect(result[1].title).toBe('Diagram 2');
  });

  it('uses the closest heading before each fence', () => {
    const text = [
      '# Top Level',
      '',
      '## Section A',
      '',
      'Some text...',
      '',
      '### Detail A.1',
      '',
      '```mermaid',
      'flowchart LR',
      '    X --> Y',
      '```',
    ].join('\n');
    const result = parseMermaidFile(text);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Detail A.1');
  });

  it('handles empty fenced blocks gracefully', () => {
    const text = '# Empty\n\n```mermaid\n\n```';
    const result = parseMermaidFile(text);
    expect(result).toHaveLength(1);
    expect(result[0].source).toBe('');
    expect(result[0].type).toBe('unknown');
  });

  it('ignores non-mermaid fenced blocks', () => {
    const text = '```javascript\nconst x = 1;\n```\n\n```mermaid\nflowchart LR\n    A --> B\n```';
    const result = parseMermaidFile(text);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('flowchart');
  });
});

// ============================================================
// S9F.1.4 — Tab rendering
// ============================================================

describe('renderDiagramTabs', () => {
  it('hides tab container when only one diagram', () => {
    const diagrams = [{ title: 'Only', type: 'flowchart', source: '' }];
    renderDiagramTabs(diagrams, 0, null);
    const tabContainer = mockElements['mermaid-diagram-tabs'];
    expect(tabContainer.style.display).toBe('none');
  });

  it('shows tab container with multiple diagrams', () => {
    const diagrams = [
      { title: 'Diagram A', type: 'flowchart', source: '' },
      { title: 'Diagram B', type: 'sequence', source: '' },
    ];
    renderDiagramTabs(diagrams, 0, null);
    const tabContainer = mockElements['mermaid-diagram-tabs'];
    expect(tabContainer.style.display).toBe('flex');
  });

  it('generates correct HTML for tabs', () => {
    const diagrams = [
      { title: 'Overview', type: 'flowchart', source: '' },
      { title: 'Flow', type: 'sequence', source: '' },
    ];
    renderDiagramTabs(diagrams, 1, null);
    const tabContainer = mockElements['mermaid-diagram-tabs'];
    expect(tabContainer.innerHTML).toContain('Overview');
    expect(tabContainer.innerHTML).toContain('Flow');
    expect(tabContainer.innerHTML).toContain('data-index="0"');
    expect(tabContainer.innerHTML).toContain('data-index="1"');
  });

  it('marks the active tab', () => {
    const diagrams = [
      { title: 'A', type: 'flowchart', source: '' },
      { title: 'B', type: 'state', source: '' },
    ];
    renderDiagramTabs(diagrams, 1, null);
    const tabContainer = mockElements['mermaid-diagram-tabs'];
    // First tab should not have active class, second should
    expect(tabContainer.innerHTML).toContain('class="mermaid-tab" data-index="0"');
    expect(tabContainer.innerHTML).toContain('class="mermaid-tab active" data-index="1"');
  });

  it('includes type labels for known types', () => {
    const diagrams = [
      { title: 'A', type: 'flowchart', source: '' },
      { title: 'B', type: 'unknown', source: '' },
    ];
    renderDiagramTabs(diagrams, 0, null);
    const tabContainer = mockElements['mermaid-diagram-tabs'];
    expect(tabContainer.innerHTML).toContain('(flowchart)');
    // unknown type should not show a label
    expect(tabContainer.innerHTML).not.toContain('(unknown)');
  });

  it('escapes HTML in diagram titles', () => {
    const diagrams = [
      { title: '<script>alert("xss")</script>', type: 'flowchart', source: '' },
      { title: 'Normal', type: 'state', source: '' },
    ];
    renderDiagramTabs(diagrams, 0, null);
    const tabContainer = mockElements['mermaid-diagram-tabs'];
    expect(tabContainer.innerHTML).not.toContain('<script>');
    expect(tabContainer.innerHTML).toContain('&lt;script&gt;');
  });
});

// ============================================================
// S9F.3.1 / S9F.3.2 — Mode switching
// ============================================================

describe('switchToMermaidMode', () => {
  it('sets mermaid mode state', () => {
    switchToMermaidMode();
    expect(state.mermaidMode).toBe(true);
    expect(state.activeView).toBe('mermaid');
  });

  it('hides network and shows mermaid container', () => {
    switchToMermaidMode();
    const network = mockElements['network'];
    const mermaidContainer = mockElements['mermaid-container'];
    const dropZone = mockElements['drop-zone'];
    expect(network.style.display).toBe('none');
    expect(mermaidContainer.style.display).toBe('flex');
    expect(dropZone.style.display).toBe('none');
  });

  it('does not overwrite viewMode (single/multi is preserved)', () => {
    state.viewMode = 'multi';
    switchToMermaidMode();
    expect(state.viewMode).toBe('multi');
    expect(state.activeView).toBe('mermaid');
  });
});

describe('switchToOntologyMode', () => {
  it('restores ontology mode state', () => {
    state.mermaidMode = true;
    state.activeView = 'mermaid';
    switchToOntologyMode();
    expect(state.mermaidMode).toBe(false);
    expect(state.activeView).toBe('graph');
  });

  it('shows network and hides mermaid container', () => {
    switchToOntologyMode();
    const network = mockElements['network'];
    const mermaidContainer = mockElements['mermaid-container'];
    expect(network.style.display).toBe('block');
    expect(mermaidContainer.style.display).toBe('none');
  });

  it('closes editor panel if open', () => {
    const panel = mockElements['mermaid-editor-panel'];
    if (!panel) document.getElementById('mermaid-editor-panel');
    const editorPanel = mockElements['mermaid-editor-panel'];
    editorPanel.classList.add('open');
    state.mermaidEditorOpen = true;

    switchToOntologyMode();
    expect(editorPanel.classList.contains('open')).toBe(false);
    expect(state.mermaidEditorOpen).toBe(false);
  });

  it('does not overwrite viewMode (single/multi is preserved)', () => {
    state.viewMode = 'multi';
    state.mermaidMode = true;
    state.activeView = 'mermaid';
    switchToOntologyMode();
    expect(state.viewMode).toBe('multi');
    expect(state.activeView).toBe('graph');
  });
});

// ============================================================
// Drop-zone visibility
// ============================================================

describe('switchToMermaidMode drop-zone visibility', () => {
  it('shows drop-zone when no diagrams are loaded', () => {
    state.mermaidDiagrams = [];
    switchToMermaidMode();
    const dz = mockElements['mermaid-drop-zone'];
    expect(dz.classList.contains('hidden')).toBe(false);
  });

  it('hides drop-zone when diagrams are loaded', () => {
    state.mermaidDiagrams = [{ title: 'Test', type: 'flowchart', source: 'flowchart LR\n  A-->B' }];
    switchToMermaidMode();
    const dz = mockElements['mermaid-drop-zone'];
    expect(dz.classList.contains('hidden')).toBe(true);
  });
});

// ============================================================
// Integration-style: detectDiagramType edge cases
// ============================================================

describe('detectDiagramType edge cases', () => {
  it('handles empty string', () => {
    expect(detectDiagramType('')).toBe('unknown');
  });

  it('handles multiline first line with trailing content', () => {
    expect(detectDiagramType('flowchart TB\n  A --> B\n  B --> C')).toBe('flowchart');
  });

  it('handles stateDiagram without version suffix', () => {
    expect(detectDiagramType('stateDiagram\n  [*] --> Active')).toBe('state');
  });
});

// ============================================================
// parseMermaidFile edge cases
// ============================================================

describe('parseMermaidFile edge cases', () => {
  it('handles file with only headings and no diagrams', () => {
    const text = '# Title\n\n## Section\n\nSome text but no mermaid.';
    const result = parseMermaidFile(text);
    // No fences found, treats entire text as single raw diagram
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('unknown');
  });

  it('handles deeply nested headings', () => {
    const text = '# H1\n## H2\n### H3\n\n```mermaid\ngantt\n    title Test\n```';
    const result = parseMermaidFile(text);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('H3');
    expect(result[0].type).toBe('gantt');
  });

  it('handles many diagrams', () => {
    let text = '';
    for (let i = 0; i < 10; i++) {
      text += `## Diagram ${i}\n\n\`\`\`mermaid\nflowchart LR\n    A${i} --> B${i}\n\`\`\`\n\n`;
    }
    const result = parseMermaidFile(text);
    expect(result).toHaveLength(10);
    expect(result[9].title).toBe('Diagram 9');
  });
});
