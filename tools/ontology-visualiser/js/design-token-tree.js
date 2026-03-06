/**
 * Design Token Tree — Admin panel module
 * Renders the DESIGN-TOKEN-MAP as an interactive, expandable tree UI.
 * Two views: By Zone (Z1–Z20+) and By Category.
 * LIVE RUNTIME: All tokenised values read from getComputedStyle() on every
 * render — the panel always reflects the current CSS state (including brand
 * overrides). Re-renders on every open and on DS brand apply/reset.
 *
 * Zone view reads from state.zoneRegistry (populated by app-skeleton-loader.js)
 * when available, falling back to FALLBACK_ZONE_TREE when the skeleton has not
 * loaded. Skeleton metadata (zone names, types, cascade tiers) enriches the
 * tree nodes; token data always comes from the fallback definitions.
 */

import { state } from './state.js';
import { resolveToken, invalidateCache } from './token-inheritance.js';

// ── Helper: read the live value of a CSS custom property ──
function liveValue(varName) {
  if (!varName || !varName.startsWith('--')) return null;
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || null;
}

function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// ── Token leaf data ──
// { label, cssVar?, hex, dsToken?, tier?, hardcoded? }
function tkn(label, cssVar, hex, dsToken, tier) {
  return { label, cssVar: cssVar || null, hex, dsToken: dsToken || null, tier: tier || null, hardcoded: !cssVar };
}

// ── ZONE TREE DATA (fallback when skeleton not loaded) ──
const FALLBACK_ZONE_TREE = [
  { id: 'Z1', label: 'Z1: Header', children: [
    { id: 'Z1-surface', label: 'Surface', tokens: [
      tkn('background', '--viz-surface-elevated', '#1a1d27', 'neutral.surface.subtle', 'semantic'),
    ]},
    { id: 'Z1-text', label: 'Text', tokens: [
      tkn('title (h1)', '--viz-accent', '#9dfff5', 'primary.text.default', 'semantic'),
      tkn('stats', '--viz-text-secondary', '#888888', 'neutral.text.subtitle', 'semantic'),
      tkn('file-name', null, '#666666', null, null),
      tkn('registry-version', null, '#888888', null, null),
    ]},
    { id: 'Z1-border', label: 'Border', tokens: [
      tkn('bottom', '--viz-border-default', '#2a2d37', 'neutral.border.default', 'semantic'),
    ]},
  ]},

  { id: 'Z2', label: 'Z2: Toolbar', children: [
    { id: 'Z2-surface', label: 'Surface', tokens: [
      tkn('background', '--viz-surface-elevated', '#1a1d27', 'neutral.surface.subtle', 'semantic'),
    ]},
    { id: 'Z2-buttons', label: 'Buttons', children: [
      { id: 'Z2-btn-default', label: 'Default', tokens: [
        tkn('background', '--viz-surface-subtle', '#2a2d37', null, 'semantic'),
        tkn('border', '--viz-border-subtle', '#3a3d47', 'neutral.border.subtle', 'semantic'),
        tkn('text', '--viz-text-primary', '#e0e0e0', 'neutral.text.body', 'semantic'),
      ]},
      { id: 'Z2-btn-hover', label: 'Hover', tokens: [
        tkn('background', '--viz-border-subtle', '#3a3d47', null, 'semantic'),
      ]},
      { id: 'Z2-btn-active', label: 'Active', tokens: [
        tkn('background', '--viz-accent-active', '#017c75', 'primary.surface.default', 'semantic'),
        tkn('text', null, '#ffffff', null, null),
      ]},
    ]},
    { id: 'Z2-border', label: 'Border', tokens: [
      tkn('bottom', '--viz-border-default', '#2a2d37', 'neutral.border.default', 'semantic'),
    ]},
    { id: 'Z2-series-dots', label: 'Series Toggle Dots', tokens: [
      tkn('VE-Series', null, '#cec528', 'series.ve.color', null),
      tkn('PE-Series', null, '#b87333', 'series.pe.color', null),
      tkn('Foundation', null, '#FF9800', 'series.foundation.color', null),
      tkn('RCSG-Series', null, '#9C27B0', 'series.rcsg.color', null),
      tkn('Orchestration', null, '#00BCD4', 'series.orchestration.color', null),
    ]},
  ]},

  { id: 'Z3', label: 'Z3: Context Identity Bar', children: [
    { id: 'Z3-surface', label: 'Surface', tokens: [
      tkn('background', '--viz-surface-elevated', '#1a1d27', 'neutral.surface.subtle', 'semantic'),
    ]},
    { id: 'Z3-accent', label: 'Accent', tokens: [
      tkn('left bar', '--viz-accent', '#9dfff5', 'primary.text.default', 'semantic'),
      tkn('brand text', '--viz-accent', '#9dfff5', 'primary.text.default', 'semantic'),
    ]},
    { id: 'Z3-text', label: 'Text', tokens: [
      tkn('label', '--viz-text-primary', '#e0e0e0', 'neutral.text.body', 'semantic'),
    ]},
  ]},

  { id: 'Z4', label: 'Z4: Authoring Toolbar', children: [
    { id: 'Z4-surface', label: 'Surface', tokens: [
      tkn('background', null, '#1a2a27', 'authoring.surface.default', null),
    ]},
    { id: 'Z4-border', label: 'Border', tokens: [
      tkn('bottom', null, '#1a4a3a', 'authoring.border.default', null),
    ]},
    { id: 'Z4-buttons', label: 'Buttons', tokens: [
      tkn('background', null, '#2a3d37', 'authoring.surface.interactive', null),
      tkn('border', null, '#3a5d47', 'authoring.border.interactive', null),
      tkn('text', '--viz-accent', '#9dfff5', 'primary.text.default', 'semantic'),
      tkn('hover bg', null, '#3a5d47', null, null),
    ]},
    { id: 'Z4-indicators', label: 'Indicators', tokens: [
      tkn('dirty dot', null, '#fca5a5', 'error.text.bright', null),
      tkn('label', '--viz-accent', '#9dfff5', 'primary.text.default', 'semantic'),
    ]},
  ]},

  { id: 'Z4b', label: 'Z4b: Selection Toolbar', children: [
    { id: 'Z4b-surface', label: 'Surface', tokens: [
      tkn('background', null, '#1a2027', 'selection.surface.default', null),
      tkn('border', null, '#2a3d57', 'selection.border.default', null),
    ]},
    { id: 'Z4b-buttons', label: 'Buttons', tokens: [
      tkn('background', null, '#2a2d47', 'selection.surface.interactive', null),
      tkn('border', null, '#3a3d67', 'selection.border.interactive', null),
      tkn('text', null, '#a0c0ff', 'selection.text.interactive', null),
    ]},
  ]},

  { id: 'Z5', label: 'Z5: Breadcrumb Bar', children: [
    { id: 'Z5-surface', label: 'Surface', tokens: [
      tkn('background', '--viz-surface-default', '#9BA7A8', 'neutral.surface.default', 'semantic'),
    ]},
  ]},

  { id: 'Z6', label: 'Z6: Graph Canvas', children: [
    { id: 'Z6-surface', label: 'Surface', tokens: [
      tkn('background', '--viz-container-surface', '#768181', 'container.surface.default', 'semantic'),
    ]},
    { id: 'Z6-nodes', label: 'Nodes (Archetype Colours)', tokens: [
      tkn('class', '--viz-archetype-class', '#4CAF50', 'archetype.class.surface', 'semantic'),
      tkn('core', '--viz-archetype-core', '#4CAF50', 'archetype.core.surface', 'semantic'),
      tkn('framework', '--viz-archetype-framework', '#2196F3', 'archetype.framework.surface', 'semantic'),
      tkn('supporting', '--viz-archetype-supporting', '#FF9800', 'archetype.supporting.surface', 'semantic'),
      tkn('agent', '--viz-archetype-agent', '#E91E63', 'archetype.agent.surface', 'semantic'),
      tkn('external', '--viz-archetype-external', '#9E9E9E', 'archetype.external.surface', 'semantic'),
      tkn('layer', '--viz-archetype-layer', '#00BCD4', 'archetype.layer.surface', 'semantic'),
      tkn('concept', '--viz-archetype-concept', '#AB47BC', 'archetype.concept.surface', 'semantic'),
      tkn('default', '--viz-archetype-default', '#017c75', 'archetype.default.surface', 'semantic'),
    ]},
    { id: 'Z6-edges', label: 'Edges (Relationship Colours)', tokens: [
      tkn('structural', '--viz-edge-structural', '#7E57C2', 'edge.structural.color', 'semantic'),
      tkn('taxonomy', '--viz-edge-taxonomy', '#888888', 'edge.taxonomy.color', 'semantic'),
      tkn('dependency', '--viz-edge-dependency', '#EF5350', 'edge.dependency.color', 'semantic'),
      tkn('informational', '--viz-edge-informational', '#42A5F5', 'edge.informational.color', 'semantic'),
      tkn('operational', '--viz-edge-operational', '#66BB6A', 'edge.operational.color', 'semantic'),
    ]},
    { id: 'Z6-glow', label: 'Brand Glow', tokens: [
      tkn('glow colour', '--viz-brand-glow-color', 'transparent', null, 'component'),
    ]},
  ]},

  { id: 'Z7', label: 'Z7: Legend (floating)', children: [
    { id: 'Z7-surface', label: 'Surface', tokens: [
      tkn('background', '--viz-surface-elevated', '#1a1d27', 'neutral.surface.subtle', 'semantic'),
      tkn('border', '--viz-border-default', '#2a2d37', 'neutral.border.default', 'semantic'),
    ]},
    { id: 'Z7-items', label: 'Items', tokens: [
      tkn('text', '--viz-text-primary', '#e0e0e0', 'neutral.text.body', 'semantic'),
      tkn('hover bg', '--viz-accent-subtle', 'rgba(157,255,245,0.05)', 'primary.surface.subtle', 'semantic'),
      tkn('active border', '--viz-accent', '#9dfff5', 'primary.text.default', 'semantic'),
    ]},
  ]},

  { id: 'Z8', label: 'Z8: Layer Panel (floating)', children: [
    { id: 'Z8-surface', label: 'Surface', tokens: [
      tkn('background', '--viz-surface-elevated', '#1a1d27', 'neutral.surface.subtle', 'semantic'),
      tkn('border', '--viz-border-default', '#2a2d37', 'neutral.border.default', 'semantic'),
    ]},
    { id: 'Z8-chips', label: 'Layer Chips', tokens: [
      tkn('hover bg', '--viz-accent-subtle', 'rgba(157,255,245,0.05)', 'primary.surface.subtle', 'semantic'),
      tkn('active bg', '--viz-surface-subtle', '#2a2d37', null, 'semantic'),
    ]},
    { id: 'Z8-mode', label: 'Mode Toggle', tokens: [
      tkn('active bg', '--viz-accent', '#9dfff5', 'primary.text.default', 'semantic'),
      tkn('active text', null, '#1a1d27', null, null),
    ]},
  ]},

  { id: 'Z9', label: 'Z9: Sidebar (details)', children: [
    { id: 'Z9-surface', label: 'Surface', tokens: [
      tkn('background', '--viz-surface-elevated', '#1a1d27', 'neutral.surface.subtle', 'semantic'),
      tkn('border-left', '--viz-border-default', '#2a2d37', 'neutral.border.default', 'semantic'),
    ]},
    { id: 'Z9-text', label: 'Text', tokens: [
      tkn('headings (h3)', '--viz-accent', '#9dfff5', 'primary.text.default', 'semantic'),
      tkn('field labels', '--viz-text-secondary', '#888888', 'neutral.text.subtitle', 'semantic'),
      tkn('field values', '--viz-text-primary', '#e0e0e0', 'neutral.text.body', 'semantic'),
    ]},
    { id: 'Z9-cards', label: 'Cards', tokens: [
      tkn('background', '--viz-surface-card', '#22252f', 'neutral.surface.default', 'semantic'),
      tkn('hover', '--viz-surface-subtle', '#2a2d37', null, 'semantic'),
    ]},
    { id: 'Z9-badges', label: 'Data Instance Badges', tokens: [
      tkn('typical bg', null, '#166534', 'success.surface.default', null),
      tkn('typical text', null, '#86efac', 'success.text.bright', null),
      tkn('edge bg', null, '#1e40af', 'information.surface.default', null),
      tkn('edge text', null, '#93c5fd', 'information.text.bright', null),
      tkn('boundary bg', null, '#854d0e', 'warning.surface.default', null),
      tkn('boundary text', null, '#fcd34d', 'warning.text.bright', null),
      tkn('invalid bg', null, '#7f1d1d', 'error.surface.default', null),
      tkn('invalid text', null, '#fca5a5', 'error.text.bright', null),
    ]},
    { id: 'Z9-density', label: 'Density Dots', tokens: [
      tkn('good', null, '#86efac', 'success.text.bright', null),
      tkn('medium', null, '#fcd34d', 'warning.text.bright', null),
      tkn('poor', null, '#fca5a5', 'error.text.bright', null),
    ]},
  ]},

  { id: 'Z10', label: 'Z10: Audit Panel', children: [
    { id: 'Z10-surface', label: 'Surface', tokens: [
      tkn('background', '--viz-surface-elevated', '#1a1d27', 'neutral.surface.subtle', 'semantic'),
      tkn('border-right', '--viz-border-default', '#2a2d37', 'neutral.border.default', 'semantic'),
    ]},
    { id: 'Z10-badges', label: 'Status Badges', tokens: [
      tkn('pass bg', null, '#166534', 'success.surface.default', null),
      tkn('pass border', null, '#15803d', 'success.border.default', null),
      tkn('pass text', null, '#86efac', 'success.text.bright', null),
      tkn('warn bg', null, '#553016', 'warning.surface.default', null),
      tkn('warn border', null, '#834a22', 'warning.border.default', null),
      tkn('warn text', null, '#ffb48e', 'warning.text.bright', null),
      tkn('fail bg', null, '#7f1d1d', 'error.surface.default', null),
      tkn('fail border', null, '#991b1b', 'error.border.default', null),
      tkn('fail text', null, '#fca5a5', 'error.text.bright', null),
    ]},
  ]},

  { id: 'Z11', label: 'Z11: Library Panel', children: [
    { id: 'Z11-surface', label: 'Surface', tokens: [
      tkn('background', '--viz-surface-elevated', '#1a1d27', 'neutral.surface.subtle', 'semantic'),
    ]},
    { id: 'Z11-items', label: 'Library Items', tokens: [
      tkn('card bg', '--viz-surface-card', '#22252f', 'neutral.surface.default', 'semantic'),
      tkn('hover bg', '--viz-surface-subtle', '#2a2d37', null, 'semantic'),
      tkn('loaded border', '--viz-accent-active', '#017c75', 'primary.surface.default', 'semantic'),
    ]},
    { id: 'Z11-badges', label: 'Compliance Badges', tokens: [
      tkn('compliant bg', null, '#166534', 'success.surface.default', null),
      tkn('compliant text', null, '#86efac', 'success.text.bright', null),
      tkn('placeholder bg', null, '#553922', 'warning.surface.default', null),
      tkn('placeholder text', null, '#FFB48E', 'warning.text.bright', null),
    ]},
  ]},

  { id: 'Z12', label: 'Z12: DS Panel', children: [
    { id: 'Z12-surface', label: 'Surface', tokens: [
      tkn('background', '--viz-surface-elevated', '#1a1d27', 'neutral.surface.subtle', 'semantic'),
    ]},
    { id: 'Z12-tokens', label: 'Token Items', tokens: [
      tkn('card bg', '--viz-surface-card', '#22252f', 'neutral.surface.default', 'semantic'),
      tkn('text', '--viz-text-primary', '#e0e0e0', 'neutral.text.body', 'semantic'),
    ]},
    { id: 'Z12-tiers', label: 'Tier Badges', tokens: [
      tkn('primitive bg', null, '#166534', null, 'primitive'),
      tkn('primitive text', null, '#86efac', null, 'primitive'),
      tkn('semantic bg', null, '#1e40af', null, 'semantic'),
      tkn('semantic text', null, '#93c5fd', null, 'semantic'),
      tkn('component bg', null, '#854d0e', null, 'component'),
      tkn('component text', null, '#fcd34d', null, 'component'),
    ]},
  ]},

  { id: 'Z13', label: 'Z13: Backlog Panel', children: [
    { id: 'Z13-surface', label: 'Surface', tokens: [
      tkn('background', '--viz-surface-elevated', '#1a1d27', 'neutral.surface.subtle', 'semantic'),
    ]},
    { id: 'Z13-cards', label: 'Feature Cards', tokens: [
      tkn('card bg', '--viz-surface-card', '#22252f', 'neutral.surface.default', 'semantic'),
      tkn('in-progress border', '--viz-info', '#2196F3', 'information.text.default', 'semantic'),
      tkn('done border', '--viz-success', '#4CAF50', 'success.text.default', 'semantic'),
      tkn('blocked border', '--viz-error', '#cf057d', 'error.text.default', 'semantic'),
      tkn('prioritised border', '--viz-warning', '#FF9800', 'warning.text.default', 'semantic'),
    ]},
    { id: 'Z13-status', label: 'Status Badges', tokens: [
      tkn('pending-review bg', null, '#713f12', 'status.pendingReview.surface', null),
      tkn('pending-review text', null, '#fcd34d', 'status.pendingReview.text', null),
      tkn('approved bg', null, '#134e4a', 'status.approved.surface', null),
      tkn('approved text', null, '#5eead4', 'status.approved.text', null),
      tkn('in-progress bg', null, '#1e40af', 'status.inProgress.surface', null),
      tkn('in-progress text', null, '#93c5fd', 'status.inProgress.text', null),
      tkn('done bg', null, '#166534', 'success.surface.default', null),
      tkn('done text', null, '#86efac', 'success.text.bright', null),
    ]},
    { id: 'Z13-priority', label: 'Priority Badges', tokens: [
      tkn('low bg', null, '#1a2a1a', 'priority.low.surface', null),
      tkn('low text', null, '#86efac', 'priority.low.text', null),
      tkn('medium bg', null, '#2a2a1a', 'priority.medium.surface', null),
      tkn('medium text', null, '#fcd34d', 'priority.medium.text', null),
      tkn('high bg', null, '#3a2a1a', 'priority.high.surface', null),
      tkn('high text', null, '#ffb48e', 'priority.high.text', null),
      tkn('very-high bg', null, '#3a1a1a', 'priority.veryHigh.surface', null),
      tkn('very-high text', null, '#fca5a5', 'priority.veryHigh.text', null),
      tkn('critical bg', null, '#4a1a1a', 'priority.critical.surface', null),
      tkn('critical text', null, '#f87171', 'priority.critical.text', null),
    ]},
  ]},

  { id: 'Z14', label: 'Z14: Mermaid Editor', children: [
    { id: 'Z14-surface', label: 'Surface', tokens: [
      tkn('background', '--viz-surface-elevated', '#1a1d27', 'neutral.surface.subtle', 'semantic'),
    ]},
    { id: 'Z14-editor', label: 'Textarea', tokens: [
      tkn('background', '--viz-surface-default', '#9BA7A8', 'neutral.surface.default', 'semantic'),
      tkn('border', '--viz-border-subtle', '#3a3d47', 'neutral.border.subtle', 'semantic'),
      tkn('focus border', '--viz-accent-active', '#017c75', 'primary.surface.default', 'semantic'),
      tkn('text', '--viz-text-primary', '#e0e0e0', 'neutral.text.body', 'semantic'),
    ]},
    { id: 'Z14-error', label: 'Error Display', tokens: [
      tkn('background', null, 'rgba(207,5,125,0.1)', null, null),
      tkn('border', '--viz-error', '#cf057d', 'error.text.default', 'semantic'),
      tkn('text', '--viz-error', '#cf057d', 'error.text.default', 'semantic'),
    ]},
    { id: 'Z14-mermaid', label: 'Mermaid Primary', tokens: [
      tkn('primary colour', null, '#017c75', null, null),
    ]},
  ]},

  { id: 'Z15', label: 'Z15: Mindmap Properties', children: [
    { id: 'Z15-surface', label: 'Surface', tokens: [
      tkn('background', '--viz-surface-elevated', '#1a1d27', 'neutral.surface.subtle', 'semantic'),
    ]},
  ]},

  { id: 'Z16', label: 'Z16: Context Drawer', children: [
    { id: 'Z16-surface', label: 'Surface', tokens: [
      tkn('background', '--viz-surface-elevated', '#1a1d27', 'neutral.surface.subtle', 'semantic'),
    ]},
  ]},

  { id: 'Z17', label: 'Z17: Category Panel', children: [
    { id: 'Z17-surface', label: 'Surface', tokens: [
      tkn('background', '--viz-surface-elevated', '#1a1d27', 'neutral.surface.subtle', 'semantic'),
    ]},
  ]},

  { id: 'Z18', label: 'Z18: Modal / Dialog', children: [
    { id: 'Z18-overlay', label: 'Overlay', tokens: [
      tkn('backdrop', null, 'rgba(0,0,0,0.6)', null, null),
    ]},
    { id: 'Z18-surface', label: 'Surface', tokens: [
      tkn('background', '--viz-surface-elevated', '#1a1d27', 'neutral.surface.subtle', 'semantic'),
      tkn('border', '--viz-border-default', '#2a2d37', 'neutral.border.default', 'semantic'),
    ]},
  ]},

  { id: 'Z19', label: 'Z19: Tooltip / Hover Card', children: [
    { id: 'Z19-surface', label: 'Surface', tokens: [
      tkn('background', '--viz-surface-elevated', '#1a1d27', 'neutral.surface.subtle', 'semantic'),
    ]},
  ]},

  { id: 'Z20', label: 'Z20: Drop Zone', children: [
    { id: 'Z20-surface', label: 'Surface', tokens: [
      tkn('border (dashed)', '--viz-border-subtle', '#3a3d47', 'neutral.border.subtle', 'semantic'),
      tkn('text', '--viz-text-muted', '#666666', 'neutral.text.caption', 'semantic'),
    ]},
  ]},
  { id: 'Z22', label: 'Z22: Skeleton Inspector', children: [
    { id: 'Z22-surface', label: 'Surface', tokens: [
      tkn('background', '--viz-surface-elevated', '#1a1d27', 'neutral.surface.subtle', 'semantic'),
      tkn('border-right', '--viz-border-default', '#2a2d37', 'neutral.border.default', 'semantic'),
    ]},
    { id: 'Z22-diagram', label: 'Spatial Diagram', tokens: [
      tkn('grid bg', '--viz-surface-default', '#9BA7A8', 'neutral.surface.default', 'semantic'),
      tkn('block border', '--viz-border-subtle', '#3a3d47', 'neutral.border.subtle', 'semantic'),
    ]},
    { id: 'Z22-cards', label: 'Zone Cards', tokens: [
      tkn('card bg', '--viz-surface-card', '#22252f', 'neutral.surface.default', 'semantic'),
      tkn('field label', '--viz-text-secondary', '#888888', 'neutral.text.subtitle', 'semantic'),
    ]},
  ]},
];

// ── CATEGORY TREE DATA ──
const CATEGORY_TREE = [
  { id: 'cat-surfaces', label: 'Surfaces', count: 5, tokens: [
    tkn('default', '--viz-surface-default', '#9BA7A8', 'neutral.surface.default', 'semantic'),
    tkn('elevated', '--viz-surface-elevated', '#1a1d27', 'neutral.surface.subtle', 'semantic'),
    tkn('card', '--viz-surface-card', '#22252f', 'neutral.surface.default', 'semantic'),
    tkn('subtle', '--viz-surface-subtle', '#2a2d37', null, 'semantic'),
    tkn('container', '--viz-container-surface', '#768181', 'container.surface.default', 'semantic'),
  ]},
  { id: 'cat-text', label: 'Text', count: 3, tokens: [
    tkn('primary', '--viz-text-primary', '#e0e0e0', 'neutral.text.body', 'semantic'),
    tkn('secondary', '--viz-text-secondary', '#888888', 'neutral.text.subtitle', 'semantic'),
    tkn('muted', '--viz-text-muted', '#666666', 'neutral.text.caption', 'semantic'),
  ]},
  { id: 'cat-accent', label: 'Accent / Interactive', count: 4, tokens: [
    tkn('accent', '--viz-accent', '#9dfff5', 'primary.text.default', 'semantic'),
    tkn('active', '--viz-accent-active', '#017c75', 'primary.surface.default', 'semantic'),
    tkn('subtle', '--viz-accent-subtle', 'rgba(157,255,245,0.05)', 'primary.surface.subtle', 'semantic'),
    tkn('border', '--viz-accent-border', '#017c75', 'primary.border.default', 'semantic'),
  ]},
  { id: 'cat-status', label: 'Status / Semantic', count: 4, tokens: [
    tkn('error', '--viz-error', '#cf057d', 'error.text.default', 'semantic'),
    tkn('warning', '--viz-warning', '#FF9800', 'warning.text.default', 'semantic'),
    tkn('success', '--viz-success', '#4CAF50', 'success.text.default', 'semantic'),
    tkn('info', '--viz-info', '#2196F3', 'information.text.default', 'semantic'),
  ]},
  { id: 'cat-borders', label: 'Borders', count: 2, tokens: [
    tkn('default', '--viz-border-default', '#2a2d37', 'neutral.border.default', 'semantic'),
    tkn('subtle', '--viz-border-subtle', '#3a3d47', 'neutral.border.subtle', 'semantic'),
  ]},
  { id: 'cat-archetype', label: 'Archetype Colours (Graph Nodes)', count: 9, tokens: [
    tkn('class', '--viz-archetype-class', '#4CAF50', 'archetype.class.surface', 'semantic'),
    tkn('core', '--viz-archetype-core', '#4CAF50', 'archetype.core.surface', 'semantic'),
    tkn('framework', '--viz-archetype-framework', '#2196F3', 'archetype.framework.surface', 'semantic'),
    tkn('supporting', '--viz-archetype-supporting', '#FF9800', 'archetype.supporting.surface', 'semantic'),
    tkn('agent', '--viz-archetype-agent', '#E91E63', 'archetype.agent.surface', 'semantic'),
    tkn('external', '--viz-archetype-external', '#9E9E9E', 'archetype.external.surface', 'semantic'),
    tkn('layer', '--viz-archetype-layer', '#00BCD4', 'archetype.layer.surface', 'semantic'),
    tkn('concept', '--viz-archetype-concept', '#AB47BC', 'archetype.concept.surface', 'semantic'),
    tkn('default', '--viz-archetype-default', '#017c75', 'archetype.default.surface', 'semantic'),
  ]},
  { id: 'cat-edge', label: 'Edge Colours (Relationships)', count: 5, tokens: [
    tkn('structural', '--viz-edge-structural', '#7E57C2', 'edge.structural.color', 'semantic'),
    tkn('taxonomy', '--viz-edge-taxonomy', '#888888', 'edge.taxonomy.color', 'semantic'),
    tkn('dependency', '--viz-edge-dependency', '#EF5350', 'edge.dependency.color', 'semantic'),
    tkn('informational', '--viz-edge-informational', '#42A5F5', 'edge.informational.color', 'semantic'),
    tkn('operational', '--viz-edge-operational', '#66BB6A', 'edge.operational.color', 'semantic'),
  ]},
  { id: 'cat-typography', label: 'Typography (immutable)', count: 0, children: [
    { id: 'cat-typo-family', label: 'Font Family', tokens: [
      { label: 'heading', cssVar: null, hex: 'Jura', dsToken: 'font.family.heading', tier: 'primitive', hardcoded: true },
      { label: 'body', cssVar: null, hex: 'Jura', dsToken: 'font.family.body', tier: 'primitive', hardcoded: true },
      { label: 'mono', cssVar: null, hex: 'JetBrains Mono', dsToken: 'font.family.mono', tier: 'primitive', hardcoded: true },
    ]},
    { id: 'cat-typo-size', label: 'Font Size', tokens: [
      { label: 'xs', cssVar: null, hex: '11px', dsToken: 'font.size.xs', tier: 'primitive', hardcoded: false },
      { label: 'sm', cssVar: null, hex: '13px', dsToken: 'font.size.sm', tier: 'primitive', hardcoded: false },
      { label: 'md', cssVar: null, hex: '14px', dsToken: 'font.size.md', tier: 'primitive', hardcoded: false },
      { label: 'lg', cssVar: null, hex: '16px', dsToken: 'font.size.lg', tier: 'primitive', hardcoded: false },
    ]},
    { id: 'cat-typo-weight', label: 'Font Weight', tokens: [
      { label: 'regular', cssVar: null, hex: '400', dsToken: 'font.weight.regular', tier: 'primitive', hardcoded: false },
      { label: 'semibold', cssVar: null, hex: '600', dsToken: 'font.weight.semibold', tier: 'primitive', hardcoded: false },
      { label: 'bold', cssVar: null, hex: '700', dsToken: 'font.weight.bold', tier: 'primitive', hardcoded: false },
    ]},
  ]},
  { id: 'cat-spacing', label: 'Spacing & Radius (immutable)', count: 0, children: [
    { id: 'cat-spacing-vals', label: 'Spacing', tokens: [
      { label: 'xs', cssVar: null, hex: '4px', dsToken: 'spacing.xs', tier: 'primitive', hardcoded: false },
      { label: 'sm', cssVar: null, hex: '8px', dsToken: 'spacing.sm', tier: 'primitive', hardcoded: false },
      { label: 'md', cssVar: null, hex: '16px', dsToken: 'spacing.md', tier: 'primitive', hardcoded: false },
      { label: 'lg', cssVar: null, hex: '24px', dsToken: 'spacing.lg', tier: 'primitive', hardcoded: false },
      { label: 'xl', cssVar: null, hex: '32px', dsToken: 'spacing.xl', tier: 'primitive', hardcoded: false },
    ]},
    { id: 'cat-radius-vals', label: 'Radius', tokens: [
      { label: 'none', cssVar: null, hex: '0', dsToken: 'radius.none', tier: 'primitive', hardcoded: false },
      { label: 'sm', cssVar: null, hex: '4px', dsToken: 'radius.sm', tier: 'primitive', hardcoded: false },
      { label: 'md', cssVar: null, hex: '8px', dsToken: 'radius.md', tier: 'primitive', hardcoded: false },
      { label: 'lg', cssVar: null, hex: '12px', dsToken: 'radius.lg', tier: 'primitive', hardcoded: false },
      { label: 'xl', cssVar: null, hex: '16px', dsToken: 'radius.xl', tier: 'primitive', hardcoded: false },
      { label: 'full', cssVar: null, hex: '9999px', dsToken: 'radius.full', tier: 'primitive', hardcoded: false },
    ]},
  ]},
  { id: 'cat-hardcoded', label: 'Hardcoded Values (not tokenised)', count: 48, children: [
    { id: 'cat-hc-status', label: 'Status Badge Colours (12)', tokens: [
      tkn('pass bg', null, '#166534', 'success.surface.default', null),
      tkn('pass border', null, '#15803d', 'success.border.default', null),
      tkn('pass text', null, '#86efac', 'success.text.bright', null),
      tkn('warn bg', null, '#553016', 'warning.surface.default', null),
      tkn('warn border', null, '#834a22', 'warning.border.default', null),
      tkn('warn text', null, '#ffb48e', 'warning.text.bright', null),
      tkn('fail bg', null, '#7f1d1d', 'error.surface.default', null),
      tkn('fail border', null, '#991b1b', 'error.border.default', null),
      tkn('fail text', null, '#fca5a5', 'error.text.bright', null),
      tkn('info bg', null, '#1e40af', 'information.surface.default', null),
      tkn('info text', null, '#93c5fd', 'information.text.bright', null),
      tkn('info alt text', null, '#fcd34d', null, null),
    ]},
    { id: 'cat-hc-series', label: 'Series Dots (5)', tokens: [
      tkn('VE-Series', null, '#cec528', 'series.ve.color', null),
      tkn('PE-Series', null, '#b87333', 'series.pe.color', null),
      tkn('Foundation', null, '#FF9800', 'series.foundation.color', null),
      tkn('RCSG-Series', null, '#9C27B0', 'series.rcsg.color', null),
      tkn('Orchestration', null, '#00BCD4', 'series.orchestration.color', null),
    ]},
    { id: 'cat-hc-priority', label: 'Priority Badges (10)', tokens: [
      tkn('low bg', null, '#1a2a1a', 'priority.low.surface', null),
      tkn('low text', null, '#86efac', 'priority.low.text', null),
      tkn('medium bg', null, '#2a2a1a', 'priority.medium.surface', null),
      tkn('medium text', null, '#fcd34d', 'priority.medium.text', null),
      tkn('high bg', null, '#3a2a1a', 'priority.high.surface', null),
      tkn('high text', null, '#ffb48e', 'priority.high.text', null),
      tkn('very-high bg', null, '#3a1a1a', 'priority.veryHigh.surface', null),
      tkn('very-high text', null, '#fca5a5', 'priority.veryHigh.text', null),
      tkn('critical bg', null, '#4a1a1a', 'priority.critical.surface', null),
      tkn('critical text', null, '#f87171', 'priority.critical.text', null),
    ]},
    { id: 'cat-hc-authoring', label: 'Authoring Toolbar (5)', tokens: [
      tkn('background', null, '#1a2a27', 'authoring.surface.default', null),
      tkn('border', null, '#1a4a3a', 'authoring.border.default', null),
      tkn('button bg', null, '#2a3d37', 'authoring.surface.interactive', null),
      tkn('button border', null, '#3a5d47', 'authoring.border.interactive', null),
      tkn('dirty dot', null, '#fca5a5', 'error.text.bright', null),
    ]},
    { id: 'cat-hc-selection', label: 'Selection Toolbar (5)', tokens: [
      tkn('background', null, '#1a2027', 'selection.surface.default', null),
      tkn('border', null, '#2a3d57', 'selection.border.default', null),
      tkn('button bg', null, '#2a2d47', 'selection.surface.interactive', null),
      tkn('button border', null, '#3a3d67', 'selection.border.interactive', null),
      tkn('button text', null, '#a0c0ff', 'selection.text.interactive', null),
    ]},
  ]},
];

// ── COMPONENT REGISTRY (F40.7 — pfc.viz.{zone}.{subcomponent}) ──
const COMPONENT_REGISTRY = new Map([
  // Z1: Header
  ['Z1',             'pfc.viz.header'],
  ['Z1-surface',     'pfc.viz.header.surface'],
  ['Z1-text',        'pfc.viz.header.text'],
  ['Z1-border',      'pfc.viz.header.border'],
  // Z2: Toolbar
  ['Z2',             'pfc.viz.toolbar'],
  ['Z2-surface',     'pfc.viz.toolbar.surface'],
  ['Z2-buttons',     'pfc.viz.toolbar.buttons'],
  ['Z2-btn-default', 'pfc.viz.toolbar.btn-default'],
  ['Z2-btn-hover',   'pfc.viz.toolbar.btn-hover'],
  ['Z2-btn-active',  'pfc.viz.toolbar.btn-active'],
  ['Z2-border',      'pfc.viz.toolbar.border'],
  ['Z2-series-dots', 'pfc.viz.toolbar.series-dots'],
  // Z3: Context Identity Bar
  ['Z3',             'pfc.viz.context-bar'],
  ['Z3-surface',     'pfc.viz.context-bar.surface'],
  ['Z3-accent',      'pfc.viz.context-bar.accent'],
  ['Z3-text',        'pfc.viz.context-bar.text'],
  // Z4: Authoring Toolbar
  ['Z4',             'pfc.viz.authoring-toolbar'],
  ['Z4-surface',     'pfc.viz.authoring-toolbar.surface'],
  ['Z4-border',      'pfc.viz.authoring-toolbar.border'],
  ['Z4-buttons',     'pfc.viz.authoring-toolbar.buttons'],
  ['Z4-indicators',  'pfc.viz.authoring-toolbar.indicators'],
  // Z4b: Selection Toolbar
  ['Z4b',            'pfc.viz.selection-toolbar'],
  ['Z4b-surface',    'pfc.viz.selection-toolbar.surface'],
  ['Z4b-buttons',    'pfc.viz.selection-toolbar.buttons'],
  // Z5: Breadcrumb Bar
  ['Z5',             'pfc.viz.breadcrumb-bar'],
  ['Z5-surface',     'pfc.viz.breadcrumb-bar.surface'],
  // Z6: Graph Canvas
  ['Z6',             'pfc.viz.graph-canvas'],
  ['Z6-surface',     'pfc.viz.graph-canvas.surface'],
  ['Z6-nodes',       'pfc.viz.graph-canvas.nodes'],
  ['Z6-edges',       'pfc.viz.graph-canvas.edges'],
  ['Z6-glow',        'pfc.viz.graph-canvas.glow'],
  // Z7: Legend (floating)
  ['Z7',             'pfc.viz.legend'],
  ['Z7-surface',     'pfc.viz.legend.surface'],
  ['Z7-items',       'pfc.viz.legend.items'],
  // Z8: Layer Panel (floating)
  ['Z8',             'pfc.viz.layer-panel'],
  ['Z8-surface',     'pfc.viz.layer-panel.surface'],
  ['Z8-chips',       'pfc.viz.layer-panel.chips'],
  ['Z8-mode',        'pfc.viz.layer-panel.mode'],
  // Z9: Sidebar (details)
  ['Z9',             'pfc.viz.sidebar'],
  ['Z9-surface',     'pfc.viz.sidebar.surface'],
  ['Z9-text',        'pfc.viz.sidebar.text'],
  ['Z9-cards',       'pfc.viz.sidebar.cards'],
  ['Z9-badges',      'pfc.viz.sidebar.badges'],
  ['Z9-density',     'pfc.viz.sidebar.density'],
  // Z10: Audit Panel
  ['Z10',            'pfc.viz.audit-panel'],
  ['Z10-surface',    'pfc.viz.audit-panel.surface'],
  ['Z10-badges',     'pfc.viz.audit-panel.badges'],
  // Z11: Library Panel
  ['Z11',            'pfc.viz.library-panel'],
  ['Z11-surface',    'pfc.viz.library-panel.surface'],
  ['Z11-items',      'pfc.viz.library-panel.items'],
  ['Z11-badges',     'pfc.viz.library-panel.badges'],
  // Z12: DS Panel
  ['Z12',            'pfc.viz.ds-panel'],
  ['Z12-surface',    'pfc.viz.ds-panel.surface'],
  ['Z12-tokens',     'pfc.viz.ds-panel.tokens'],
  ['Z12-tiers',      'pfc.viz.ds-panel.tiers'],
  // Z13: Backlog Panel
  ['Z13',            'pfc.viz.backlog-panel'],
  ['Z13-surface',    'pfc.viz.backlog-panel.surface'],
  ['Z13-cards',      'pfc.viz.backlog-panel.cards'],
  ['Z13-status',     'pfc.viz.backlog-panel.status'],
  ['Z13-priority',   'pfc.viz.backlog-panel.priority'],
  // Z14: Mermaid Editor
  ['Z14',            'pfc.viz.mermaid-editor'],
  ['Z14-surface',    'pfc.viz.mermaid-editor.surface'],
  ['Z14-editor',     'pfc.viz.mermaid-editor.editor'],
  ['Z14-error',      'pfc.viz.mermaid-editor.error'],
  ['Z14-mermaid',    'pfc.viz.mermaid-editor.mermaid'],
  // Z15: Mindmap Properties
  ['Z15',            'pfc.viz.mindmap-props'],
  ['Z15-surface',    'pfc.viz.mindmap-props.surface'],
  // Z16: Context Drawer
  ['Z16',            'pfc.viz.context-drawer'],
  ['Z16-surface',    'pfc.viz.context-drawer.surface'],
  // Z17: Category Panel
  ['Z17',            'pfc.viz.category-panel'],
  ['Z17-surface',    'pfc.viz.category-panel.surface'],
  // Z18: Modal / Dialog
  ['Z18',            'pfc.viz.modal'],
  ['Z18-overlay',    'pfc.viz.modal.overlay'],
  ['Z18-surface',    'pfc.viz.modal.surface'],
  // Z19: Tooltip / Hover Card
  ['Z19',            'pfc.viz.tooltip'],
  ['Z19-surface',    'pfc.viz.tooltip.surface'],
  // Z20: Drop Zone
  ['Z20',            'pfc.viz.drop-zone'],
  ['Z20-surface',    'pfc.viz.drop-zone.surface'],
  // Z22: Skeleton Inspector
  ['Z22',            'pfc.viz.skeleton-panel'],
  ['Z22-surface',    'pfc.viz.skeleton-panel.surface'],
  ['Z22-diagram',    'pfc.viz.skeleton-panel.diagram'],
  ['Z22-cards',      'pfc.viz.skeleton-panel.cards'],
]);

// Zone-to-DOM selectors now read from state.zoneDomSelectors (DS-ONT v3.0.0 ontology data).
// The manual ZONE_DOM_SELECTORS map was removed in Phase 4 (F40.20).

/**
 * Return the component registry as a structured array for downstream consumers.
 * @returns {Array<{id: string, componentName: string, zone: string, depth: number}>}
 */
export function getComponentRegistry() {
  return [...COMPONENT_REGISTRY.entries()].map(([id, name]) => ({
    id,
    componentName: name,
    zone: id.match(/^Z\d+[a-z]?/)?.[0] || id,
    depth: name.split('.').length - 3,  // 0=zone, 1=sub-group, 2=nested
  }));
}

// ── F40.11: Global Component Library (Quasi-OO) ──

const GLOBAL_COMPONENT_LIBRARY = [
  { id: 'interactive-base', componentName: 'ds.global.interactive.base', extends: null,
    atomicLevel: 'Atom', category: 'Interactive',
    tokens: [
      tkn('background', '--viz-surface-subtle', '#2a2d37', 'neutral.surface.subtle', 'semantic'),
      tkn('border', '--viz-border-subtle', '#3a3d47', 'neutral.border.subtle', 'semantic'),
      tkn('text', '--viz-text-primary', '#e0e0e0', 'neutral.text.body', 'semantic'),
    ]},
  { id: 'button-primary', componentName: 'ds.global.button.primary', extends: 'ds.global.interactive.base',
    atomicLevel: 'Atom', category: 'Interactive',
    tokens: [
      tkn('background', '--viz-accent', '#9dfff5', 'primary.surface.default', 'semantic'),
      tkn('text', '--viz-surface-default', '#0f1117', 'neutral.surface.dark', 'semantic'),
    ]},
  { id: 'button-secondary', componentName: 'ds.global.button.secondary', extends: 'ds.global.interactive.base',
    atomicLevel: 'Atom', category: 'Interactive', tokens: [] },
  { id: 'card', componentName: 'ds.global.card', extends: null,
    atomicLevel: 'Molecule', category: 'Layout',
    tokens: [
      tkn('background', '--viz-surface-elevated', '#1a1d27', 'neutral.surface.subtle', 'semantic'),
      tkn('border', '--viz-border-default', '#2a2d37', 'neutral.border.default', 'semantic'),
    ]},
  { id: 'badge', componentName: 'ds.global.badge', extends: null,
    atomicLevel: 'Atom', category: 'Feedback',
    tokens: [
      tkn('background', null, '#4CAF50', 'status.success.surface', null),
      tkn('text', null, '#1b5e20', 'status.success.text', null),
    ]},
  { id: 'input', componentName: 'ds.global.input', extends: 'ds.global.interactive.base',
    atomicLevel: 'Atom', category: 'Form',
    tokens: [
      tkn('border', '--viz-border-default', '#2a2d37', 'neutral.border.default', 'semantic'),
      tkn('focus ring', '--viz-accent', '#9dfff5', 'primary.surface.default', 'semantic'),
    ]},
  { id: 'panel-base', componentName: 'ds.global.panel', extends: null,
    atomicLevel: 'Organism', category: 'Layout',
    tokens: [
      tkn('background', '--viz-surface-elevated', '#1a1d27', 'neutral.surface.subtle', 'semantic'),
      tkn('border', '--viz-border-default', '#2a2d37', 'neutral.border.default', 'semantic'),
    ]},
  { id: 'collapsible', componentName: 'ds.global.collapsible', extends: 'ds.global.panel',
    atomicLevel: 'Molecule', category: 'Layout', tokens: [] },
  { id: 'tab', componentName: 'ds.global.tab', extends: 'ds.global.interactive.base',
    atomicLevel: 'Atom', category: 'Navigation', tokens: [] },
  { id: 'field-label', componentName: 'ds.global.field-label', extends: null,
    atomicLevel: 'Atom', category: 'Form',
    tokens: [
      tkn('text', '--viz-text-secondary', '#888', 'neutral.text.secondary', 'semantic'),
    ]},
];

/** Return the global component library for testing. */
export function getGlobalComponentLibrary() {
  return GLOBAL_COMPONENT_LIBRARY;
}

/** Maps app-specific components to the global base they extend. */
const COMPONENT_EXTENDS = new Map([
  ['pfc.viz.toolbar.btn-default', 'ds.global.button.secondary'],
  ['pfc.viz.toolbar.btn-hover',   'ds.global.button.secondary'],
  ['pfc.viz.toolbar.btn-active',  'ds.global.button.primary'],
  ['pfc.viz.header',              'ds.global.panel'],
  ['pfc.viz.sidebar-left',        'ds.global.panel'],
  ['pfc.viz.sidebar-right',       'ds.global.panel'],
  ['pfc.viz.detail-panel',        'ds.global.panel'],
  ['pfc.viz.ds-panel',            'ds.global.panel'],
  ['pfc.viz.token-map',           'ds.global.panel'],
  ['pfc.viz.filter-select',       'ds.global.input'],
  ['pfc.viz.authoring-bar',       'ds.global.panel'],
  ['pfc.viz.status-bar',          'ds.global.badge'],
]);

/**
 * Resolve the full inheritance chain for a component.
 * Returns array from most specific (self) to most generic (root base).
 * Example: ['pfc.viz.toolbar.btn-active', 'ds.global.button.primary', 'ds.global.interactive.base']
 */
export function resolveInheritanceChain(componentName) {
  const chain = [componentName];
  let current = componentName;
  const maxDepth = 10;

  for (let i = 0; i < maxDepth; i++) {
    // First check app→global mapping
    let parent = COMPONENT_EXTENDS.get(current);
    if (!parent) {
      // Then check within global library
      const globalEntry = GLOBAL_COMPONENT_LIBRARY.find(g => g.componentName === current);
      parent = globalEntry?.extends || null;
    }
    if (!parent || chain.includes(parent)) break; // Stop at root or circular ref
    chain.push(parent);
    current = parent;
  }

  return chain;
}

/**
 * Resolve the effective tokens for a component by walking the inheritance chain.
 * "Closest override wins": child tokens take priority over parent tokens with the same label.
 */
export function resolveInheritedTokens(componentName, ownTokens) {
  const chain = resolveInheritanceChain(componentName);
  if (chain.length <= 1) return ownTokens || [];

  // Build merged token map: start from root, overlay each descendant
  const tokenMap = new Map();

  // Walk from root (last) to most specific (first)
  for (let i = chain.length - 1; i >= 0; i--) {
    const name = chain[i];
    let tokens;
    if (i === 0) {
      // The component itself — use its own tokens
      tokens = ownTokens || [];
    } else {
      // A global library entry
      const entry = GLOBAL_COMPONENT_LIBRARY.find(g => g.componentName === name);
      tokens = entry?.tokens || [];
    }
    for (const t of tokens) {
      tokenMap.set(t.label, t);
    }
  }

  return [...tokenMap.values()];
}

// ── Zone ID sort: natural numeric order with alpha suffixes (Z1, Z2, ..., Z4, Z4b, Z5, ..., Z20) ──
function zoneIdSort(a, b) {
  const parseZone = (id) => {
    const match = id.match(/^Z(\d+)([a-z]?)$/);
    if (!match) return [999, id];
    return [parseInt(match[1], 10), match[2] || ''];
  };
  const [numA, suffA] = parseZone(a);
  const [numB, suffB] = parseZone(b);
  if (numA !== numB) return numA - numB;
  return suffA.localeCompare(suffB);
}

// ── Build zone tree from state.zoneRegistry (falls back to hardcoded data) ──
export function buildZoneTree() {
  if (!state.zoneRegistry || state.zoneRegistry.size === 0) {
    return FALLBACK_ZONE_TREE;
  }

  const fallbackMap = new Map(FALLBACK_ZONE_TREE.map(z => [z.id, z]));
  const tree = [];
  const sortedZoneIds = [...state.zoneRegistry.keys()].sort(zoneIdSort);

  for (const zoneId of sortedZoneIds) {
    const entry = state.zoneRegistry.get(zoneId);
    const zone = entry.zone;
    const zoneName = zone['ds:zoneName'] || zoneId;
    const cascadeTier = zone['ds:cascadeTier'] || 'PFC';
    const zoneType = zone['ds:zoneType'] || 'Fixed';
    const fallback = fallbackMap.get(zoneId);

    if (fallback) {
      tree.push({
        ...fallback,
        label: `${zoneId}: ${zoneName}`,
        cascadeTier,
        zoneType,
      });
    } else {
      tree.push({
        id: zoneId,
        label: `${zoneId}: ${zoneName}`,
        cascadeTier,
        zoneType,
        children: [
          { id: `${zoneId}-surface`, label: 'Surface', tokens: [
            tkn('(no token mapping yet)', null, '--', null, null),
          ]},
        ],
      });
    }
  }

  return tree;
}

// ── Count helpers ──
function countTokens(node) {
  let c = 0;
  if (node.tokens) c += node.tokens.length;
  if (node.children) node.children.forEach(ch => { c += countTokens(ch); });
  return c;
}

function countHardcoded(node) {
  let c = 0;
  if (node.tokens) c += node.tokens.filter(t => t.hardcoded).length;
  if (node.children) node.children.forEach(ch => { c += countHardcoded(ch); });
  return c;
}

// ── Component category inference (F40.9) ──
const ZONE_CATEGORY = {
  Z1: 'Navigation', Z2: 'Navigation', Z3: 'Navigation',
  Z4: 'Navigation', Z4b: 'Navigation', Z5: 'Navigation',
  Z6: 'Data', Z7: 'Feedback', Z8: 'Feedback',
  Z9: 'Layout', Z10: 'Layout', Z11: 'Layout',
  Z12: 'Layout', Z13: 'Layout', Z14: 'Form',
  Z15: 'Form', Z16: 'Layout', Z17: 'Layout',
  Z18: 'Feedback', Z19: 'Feedback', Z20: 'Form',
};

function inferCategory(zoneId) {
  return ZONE_CATEGORY[zoneId] || 'Layout';
}

// ── Token stats helpers (F40.9) ──
function computeTokenStats(node) {
  const stats = { total: 0, inherited: 0, overridden: 0, locked: 0, hardcoded: 0 };
  function walk(n) {
    if (n.tokens) {
      for (const t of n.tokens) {
        stats.total++;
        if (t.hardcoded) stats.hardcoded++;
        const res = resolveToken(t.cssVar || null, t.dsToken || null, t.hex);
        if (res.locked) stats.locked++;
        else if (res.source === 'BRAND' || res.source === 'INHERITED' || res.source === 'LOCAL') stats.overridden++;
        else if (res.source === 'CORE' && t.cssVar) stats.inherited++;
      }
    }
    if (n.children) n.children.forEach(walk);
  }
  walk(node);
  return stats;
}

// ── Design Rules helpers (F40.10) ──

/** Return all design rules from the active DS instance, or [] if none loaded. */
export function getDesignRules() {
  if (!state.activeDSBrand || !state.dsInstances) return [];
  const parsed = state.dsInstances.get(state.activeDSBrand);
  if (!parsed) return [];
  return parsed.designRules || [];
}

/**
 * Check whether a design rule applies to a given pfc.viz.* component name.
 * Adapts the matching logic from ds-authoring.js renderDSComponentRules()
 * to work with pfc.viz.* component names and ZONE_CATEGORY lookup.
 */
export function matchesComponentScope(rule, componentName) {
  const scope = rule['ds:scope'] || 'GlobalSystem';

  if (scope === 'GlobalSystem') return true;

  if (scope === 'BrandVariant') return !!state.activeDSBrand;

  if (scope === 'ComponentDefinition' || scope === 'ComponentInstance') {
    // Extract zone ID from component name via reverse lookup
    let zoneId = null;
    for (const [id, name] of COMPONENT_REGISTRY.entries()) {
      if (name === componentName) { zoneId = id; break; }
    }
    const zoneBase = zoneId ? (zoneId.match(/^Z\d+[a-z]?/)?.[0] || zoneId) : null;
    const category = zoneBase ? inferCategory(zoneBase) : null;

    if (rule['@type'] === 'ds:ComponentDesignRule') {
      // Match by target component name (exact or glob)
      const target = rule['ds:targetComponent'];
      if (target) {
        const targetStr = typeof target === 'string' ? target : (target['@id'] || '');
        if (targetStr === componentName) return true;
        // Simple glob: trailing * matches any suffix
        if (targetStr.endsWith('*') && componentName.startsWith(targetStr.slice(0, -1))) return true;
      }
      // Match by target category (maps to ZONE_CATEGORY)
      if (rule['ds:targetCategory'] && category) {
        // Map DS-ONT atomic design levels to ZONE_CATEGORY values
        const catMap = { Atom: 'Form', Molecule: 'Layout', Organism: 'Navigation', Template: 'Layout', Page: 'Layout' };
        const mappedCat = catMap[rule['ds:targetCategory']];
        if (mappedCat === category) return true;
      }
      // Category-level rules with no specific target apply to all components in that scope
      if (!target && rule['ds:targetCategory']) return true;
      return false;
    }

    // Non-component DesignRule with ComponentDefinition scope → applies to all
    if (scope === 'ComponentDefinition') return true;
    return false;
  }

  if (scope === 'TokenTier') return true; // Token-tier rules apply at token resolution level

  return false;
}

/**
 * Get all rules applicable to a component, split by type and sorted by priority.
 */
export function getRulesForComponent(componentName) {
  const allRules = getDesignRules();
  const system = [];
  const component = [];

  for (const rule of allRules) {
    if (!matchesComponentScope(rule, componentName)) continue;
    if (rule['@type'] === 'ds:ComponentDesignRule') {
      component.push(rule);
    } else {
      system.push(rule);
    }
  }

  const byPriority = (a, b) => (a['ds:priority'] || 5) - (b['ds:priority'] || 5);
  system.sort(byPriority);
  component.sort(byPriority);

  return { system, component };
}

/** Hex colour string to relative luminance (WCAG 2.1). */
function hexToLuminance(hex) {
  if (!hex || !hex.startsWith('#')) return null;
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const toLinear = (c) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/**
 * Validate a ComponentDesignRule constraint against live token values.
 * System-level DesignRules have textual conditions — returns 'info' status.
 */
export function validateRuleConstraint(rule, componentName, tokens) {
  if (rule['@type'] !== 'ds:ComponentDesignRule') {
    return { status: 'info', message: 'System rule — manual check' };
  }

  const constraintType = rule['ds:constraintType'] || '';
  const constraintTarget = rule['ds:constraintTarget'] || '';
  const constraintValue = rule['ds:constraintValue'] || '';

  // Find token(s) matching the constraint target in this component's tokens
  const targetTokens = (tokens || []).filter(t => {
    const label = (t.label || '').toLowerCase();
    const target = constraintTarget.toLowerCase();
    return label.includes(target) || (t.cssVar || '').toLowerCase().includes(target);
  });

  switch (constraintType) {
    case 'ContrastRatio': {
      if (targetTokens.length === 0) return { status: 'info', message: 'No matching token found' };
      const bgToken = targetTokens[0];
      const bgVal = bgToken.cssVar ? liveValue(bgToken.cssVar) : bgToken.hex;
      if (!bgVal || !bgVal.startsWith('#')) return { status: 'info', message: 'Cannot read live value' };
      // Find a text token in the same component for contrast check
      const textTokens = (tokens || []).filter(t => (t.label || '').toLowerCase().includes('text'));
      const textVal = textTokens.length > 0 ? (textTokens[0].cssVar ? liveValue(textTokens[0].cssVar) : textTokens[0].hex) : null;
      if (!textVal || !textVal.startsWith('#')) return { status: 'info', message: 'No text token for contrast' };
      const bgL = hexToLuminance(bgVal);
      const txtL = hexToLuminance(textVal);
      if (bgL === null || txtL === null) return { status: 'info', message: 'Cannot compute luminance' };
      const ratio = (Math.max(bgL, txtL) + 0.05) / (Math.min(bgL, txtL) + 0.05);
      const required = parseFloat(constraintValue) || 4.5;
      return ratio >= required
        ? { status: 'pass', message: `Contrast ${ratio.toFixed(1)}:1 >= ${required}:1` }
        : { status: 'fail', message: `Contrast ${ratio.toFixed(1)}:1 < ${required}:1` };
    }

    case 'AllowedValues': {
      if (targetTokens.length === 0) return { status: 'info', message: 'No matching token found' };
      const val = targetTokens[0].cssVar ? liveValue(targetTokens[0].cssVar) : targetTokens[0].hex;
      const allowed = constraintValue.split(',').map(v => v.trim());
      return allowed.includes(val)
        ? { status: 'pass', message: `Value "${val}" is allowed` }
        : { status: 'fail', message: `Value "${val}" not in [${constraintValue}]` };
    }

    case 'Immutable': {
      if (targetTokens.length === 0) return { status: 'info', message: 'No matching token found' };
      const res = resolveToken(targetTokens[0].cssVar || null, targetTokens[0].dsToken || null, targetTokens[0].hex);
      return res.locked
        ? { status: 'pass', message: 'Token is locked (immutable)' }
        : { status: 'fail', message: 'Token is not locked' };
    }

    case 'MustReference': {
      if (targetTokens.length === 0) return { status: 'info', message: 'No matching token found' };
      return targetTokens[0].cssVar
        ? { status: 'pass', message: 'Token references CSS variable' }
        : { status: 'fail', message: 'Token is hardcoded (no CSS variable)' };
    }

    default:
      return { status: 'info', message: 'Manual check required' };
  }
}

/**
 * Compute rule stats for a component: run validation on ComponentDesignRules,
 * count system rules by severity.
 */
function computeRuleStats(rules, componentName, tokens) {
  const stats = { total: 0, errors: 0, warnings: 0, info: 0, pass: 0, fail: 0, warn: 0 };
  const allRules = [...(rules.system || []), ...(rules.component || [])];
  stats.total = allRules.length;

  for (const rule of allRules) {
    const sev = rule['ds:severity'] || 'info';
    if (sev === 'error') stats.errors++;
    else if (sev === 'warning') stats.warnings++;
    else stats.info++;

    // Validate ComponentDesignRules
    if (rule['@type'] === 'ds:ComponentDesignRule') {
      const result = validateRuleConstraint(rule, componentName, tokens);
      if (result.status === 'pass') stats.pass++;
      else if (result.status === 'fail') stats.fail++;
      else if (result.status === 'warn') stats.warn++;
    }
  }

  return stats;
}

/** Return design rules with their matching status for testing. */
export function getDesignRulesForTree() {
  return getDesignRules();
}

// ── Build component tree (F40.9) ──
export function buildComponentTree() {
  const zoneTree = buildZoneTree();
  const components = [];

  function transformNode(node) {
    const componentName = COMPONENT_REGISTRY.get(node.id) || node.id;
    const result = {
      id: node.id,
      componentName,
      label: componentName,
      tokenStats: null,
      rules: { system: [], component: [] },
      ruleStats: { total: 0, errors: 0, warnings: 0, info: 0, pass: 0, fail: 0, warn: 0 },
    };
    if (node.tokens) result.tokens = node.tokens;
    if (node.children) result.children = node.children.map(transformNode);
    result.tokenStats = computeTokenStats(result);
    // F40.10: attach applicable design rules
    const rules = getRulesForComponent(componentName);
    result.rules = rules;
    // Collect all tokens from this node's subtree for validation
    const allTokens = [];
    function collectTokens(n) {
      if (n.tokens) allTokens.push(...n.tokens);
      if (n.children) n.children.forEach(collectTokens);
    }
    collectTokens(result);
    result.ruleStats = computeRuleStats(rules, componentName, allTokens);
    // F40.11: attach inheritance metadata
    result.extends = COMPONENT_EXTENDS.get(componentName) || null;
    result.inheritanceChain = resolveInheritanceChain(componentName);
    result.inheritedTokens = resolveInheritedTokens(componentName, result.tokens || []);
    return result;
  }

  for (const zone of zoneTree) {
    components.push(transformNode(zone));
  }

  return components;
}

// ── Render component token leaf with inheritance state (F40.9) ──
function renderComponentTokenLeaf(t, componentName) {
  const resolution = resolveToken(t.cssVar || null, t.dsToken || null, t.hex);
  let stateClass = '';
  if (resolution.locked) {
    stateClass = ' admin-token-locked';
  } else if (resolution.source === 'BRAND' || resolution.source === 'INHERITED' || resolution.source === 'LOCAL') {
    stateClass = ' admin-token-overridden';
  } else if (resolution.source === 'CORE' && t.cssVar) {
    stateClass = ' admin-token-inherited';
  }

  const live = t.cssVar ? liveValue(t.cssVar) : null;
  const displayHex = live || t.hex;
  const isColour = displayHex.startsWith('#') || displayHex.startsWith('rgb') || displayHex === 'transparent';
  const swatchStyle = isColour ? `background:${displayHex}` : 'background:transparent;border-style:dashed';
  const tooltip = buildResolutionTooltip(resolution);
  const sourceBadge = renderSourceBadge(resolution);
  const compStr = componentName || '';

  let tierBadge = '';
  if (t.tier) tierBadge = `<span class="ds-tier-badge ${esc(t.tier)}">${esc(t.tier)}</span>`;
  let flag = '';
  if (t.hardcoded) flag = '<span class="admin-hardcoded-flag">HARDCODED</span>';

  return `<div class="admin-token-leaf${stateClass}" data-search="${esc((t.label + ' ' + (t.cssVar||'') + ' ' + t.hex + ' ' + (t.dsToken||'') + ' ' + compStr).toLowerCase())}" data-component="${esc(compStr)}" title="${esc(tooltip)}">
    <span class="ds-token-swatch" style="${swatchStyle}"></span>
    <span class="admin-token-label">${esc(t.label)}</span>
    <span class="admin-token-var">${t.cssVar ? esc(t.cssVar) : ''}</span>
    <span class="admin-token-hex">${esc(displayHex)}</span>
    ${t.dsToken ? `<span class="admin-token-ds">${esc(t.dsToken)}</span>` : ''}
    ${tierBadge}${flag}${sourceBadge}
  </div>`;
}

// ── Render design rule item (F40.10) ──
function renderRuleItem(rule, componentName, tokens) {
  const sev = rule['ds:severity'] || 'info';
  const sevColor = { error: '#FF6B6B', warning: '#FFB84D', info: '#2196F3' };
  const sevIcon = { error: '!', warning: '~', info: 'i' };
  const color = sevColor[sev] || '#666';
  const icon = sevIcon[sev] || 'i';
  const ruleId = esc(rule['ds:ruleId'] || rule['@id'] || '');
  const ruleName = esc(rule['ds:ruleName'] || '');
  const isCompRule = rule['@type'] === 'ds:ComponentDesignRule';

  let constraintHTML = '';
  if (isCompRule && rule['ds:constraintType']) {
    constraintHTML = `<div class="admin-rule-constraint">${esc(rule['ds:constraintType'])}(${esc(rule['ds:constraintTarget'] || '')}) = ${esc(rule['ds:constraintValue'] || '')}</div>`;
  }

  let statusHTML = '';
  if (isCompRule) {
    const result = validateRuleConstraint(rule, componentName, tokens);
    const statusClass = result.status;
    const statusIcon = { pass: '\u2713', fail: '\u2717', warn: '~', info: 'i' };
    statusHTML = `<span class="admin-rule-status ${statusClass}" title="${esc(result.message)}">${statusIcon[statusClass] || 'i'}</span>`;
  }

  return `<div class="admin-rule-item">
    <span class="admin-rule-severity" style="color:${color}; border-color:${color};">[${icon}]</span>
    <span class="admin-rule-id" style="color:${color};">${ruleId}</span>
    <span style="color:var(--viz-text-secondary, #888);">${ruleName}</span>
    ${statusHTML}
  </div>${constraintHTML}`;
}

// ── Render component branch (F40.9 + F40.10) ──
function renderComponentBranch(node, depth) {
  const s = node.tokenStats || computeTokenStats(node);
  const statsHTML = s.total > 0
    ? `<span class="admin-component-stats">${s.inherited > 0 ? `<span class="stat-inherited">${s.inherited} inherited</span>` : ''}${s.overridden > 0 ? `<span class="stat-overridden">${s.overridden} overridden</span>` : ''}${s.locked > 0 ? `<span class="stat-locked">${s.locked} locked</span>` : ''}</span>`
    : '';
  const countLabel = s.total > 0 ? `<span class="admin-count">${s.total}</span>` : '';

  // F40.10: Rule badge + violations
  const rs = node.ruleStats || { total: 0, errors: 0, warnings: 0, info: 0, fail: 0, warn: 0 };
  let ruleBadge = '';
  if (rs.total > 0) {
    const badgeClass = rs.errors > 0 ? 'has-errors' : (rs.warnings > 0 ? 'has-warnings' : 'info-only');
    ruleBadge = `<span class="admin-rule-badge ${badgeClass}">[${rs.total} rule${rs.total > 1 ? 's' : ''}]</span>`;
  }
  let violationsHTML = '';
  if (rs.fail > 0 || rs.warn > 0) {
    const parts = [];
    if (rs.fail > 0) parts.push(`<span style="color:#FF6B6B;">${rs.fail} fail</span>`);
    if (rs.warn > 0) parts.push(`<span style="color:#FFB84D;">${rs.warn} warn</span>`);
    violationsHTML = `<span class="admin-rule-violations">${parts.join(' | ')}</span>`;
  }

  // Collect all tokens from this node's subtree for rule validation
  const allTokens = [];
  function collectTokens(n) {
    if (n.tokens) allTokens.push(...n.tokens);
    if (n.children) n.children.forEach(collectTokens);
  }
  collectTokens(node);

  let childrenHTML = '';
  if (node.tokens) {
    childrenHTML += node.tokens.map(t => renderComponentTokenLeaf(t, node.componentName)).join('');
  }
  if (node.children) {
    childrenHTML += node.children.map(ch => renderComponentBranch(ch, depth + 1)).join('');
  }

  // F40.10: Rules list section
  const allRules = [...(node.rules?.system || []), ...(node.rules?.component || [])];
  if (allRules.length > 0) {
    childrenHTML += `<div class="admin-rules-list">`;
    childrenHTML += allRules.map(r => renderRuleItem(r, node.componentName, allTokens)).join('');
    childrenHTML += `</div>`;
  }

  // F40.11: Extends badge + base-inherited count
  let extendsBadge = '';
  if (node.extends) {
    extendsBadge = `<span class="admin-extends-badge">extends ${esc(node.extends)}</span>`;
  }
  const baseTokenCount = (node.inheritedTokens || []).length - (node.tokens || []).length;
  const baseInheritedHTML = baseTokenCount > 0
    ? `<span class="stat-base-inherited">${baseTokenCount} from base</span>`
    : '';

  const depthClass = depth === 0 ? 'admin-zone-node' : 'admin-category-node';

  return `<div class="${depthClass} collapsed" id="admin-node-${esc(node.id)}">
    <div class="admin-node-header" data-toggle="${esc(node.id)}">
      <span class="admin-chevron">&#x25BC;</span>
      <span class="admin-node-label">${esc(node.componentName)}</span>
      ${extendsBadge}${countLabel}${statsHTML}${baseInheritedHTML}${ruleBadge}${violationsHTML}
    </div>
    <div class="admin-node-body">
      ${childrenHTML}
    </div>
  </div>`;
}

// ── Export component config as DS-ONT JSON-LD (F40.9 — S43.3.5) ──
export function buildComponentConfigJSON() {
  const tree = buildComponentTree();
  const graph = [];

  function sanitize(s) { return s.replace(/[^a-zA-Z0-9_-]/g, '_'); }

  function walkExport(node) {
    const zoneId = node.id.match(/^Z\d+[a-z]?/)?.[0] || node.id;
    graph.push({
      '@id': `pfc-viz:comp-${sanitize(node.id)}`,
      '@type': 'ds:DesignComponent',
      'ds:componentName': node.componentName,
      'ds:category': inferCategory(zoneId),
      'ds:baseComponent': COMPONENT_EXTENDS.get(node.componentName) || null,
      'ds:allowsOverrides': !(node.tokenStats && node.tokenStats.locked === node.tokenStats.total),
      'ds:consumesTokens': (node.tokens || []).map(t => ({
        '@id': `pfc-viz:token-${sanitize(node.id)}-${sanitize(t.label)}`
      }))
    });

    if (node.tokens) {
      for (const t of node.tokens) {
        const res = resolveToken(t.cssVar || null, t.dsToken || null, t.hex);
        graph.push({
          '@id': `pfc-viz:token-${sanitize(node.id)}-${sanitize(t.label)}`,
          '@type': 'ds:ComponentToken',
          'ds:tokenName': t.dsToken || t.cssVar || t.label,
          'ds:componentName': node.componentName,
          'ds:partOrState': t.label,
          'ds:mutabilityTier': res.locked ? 'PF-Core' : 'PF-Instance'
        });
      }
    }

    if (node.children) node.children.forEach(walkExport);
  }

  tree.forEach(walkExport);

  return {
    '@context': {
      'ds': 'https://platformcore.io/ontology/ds/',
      'pfc-viz': 'https://platformcore.io/visualiser/components/'
    },
    '@graph': graph
  };
}

function exportComponentConfigJSON() {
  const jsonld = buildComponentConfigJSON();
  const blob = new Blob([JSON.stringify(jsonld, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'pfc-viz-component-config.json';
  a.click();
  URL.revokeObjectURL(url);
}

// ── F40.11: Global Component Library JSON-LD export ──
export function buildGlobalComponentLibraryJSON() {
  const graph = [];
  function sanitize(s) { return s.replace(/[^a-zA-Z0-9_-]/g, '_'); }

  for (const comp of GLOBAL_COMPONENT_LIBRARY) {
    graph.push({
      '@id': `ds-global:comp-${sanitize(comp.id)}`,
      '@type': 'ds:DesignComponent',
      'ds:componentName': comp.componentName,
      'ds:atomicDesignLevel': comp.atomicLevel,
      'ds:category': comp.category,
      'ds:extendsComponent': comp.extends || null,
      'ds:allowsOverrides': true,
      'ds:consumesTokens': (comp.tokens || []).map(t => ({
        '@id': `ds-global:token-${sanitize(comp.id)}-${sanitize(t.label)}`
      }))
    });

    for (const t of (comp.tokens || [])) {
      graph.push({
        '@id': `ds-global:token-${sanitize(comp.id)}-${sanitize(t.label)}`,
        '@type': 'ds:ComponentToken',
        'ds:tokenName': t.dsToken || t.cssVar || t.label,
        'ds:componentName': comp.componentName,
        'ds:partOrState': t.label,
        'ds:mutabilityTier': t.hardcoded ? 'PF-Instance' : 'PF-Core'
      });
    }
  }

  return {
    '@context': {
      'ds': 'https://platformcore.io/ontology/ds/',
      'ds-global': 'https://platformcore.io/ds/global/components/'
    },
    '@graph': graph
  };
}

// ── Source badge rendering (F40.8 — Token Inheritance Engine) ──
function renderSourceBadge(resolution) {
  if (!resolution) return '';
  const badgeMap = {
    'CORE':      'admin-source-core',
    'INHERITED': 'admin-source-inherited',
    'BRAND':     'admin-source-brand',
    'LOCAL':     'admin-source-local',
  };
  const cls = badgeMap[resolution.source];
  if (!cls) return '';
  const lockIcon = resolution.locked ? ' <span class="admin-lock-icon">L</span>' : '';
  return `<span class="${cls}">${esc(resolution.source)}${lockIcon}</span>`;
}

// ── Build tooltip from resolution chain (F40.8) ──
function buildResolutionTooltip(resolution) {
  if (!resolution || !resolution.chain) return '';
  const parts = resolution.chain.map(c =>
    `${c.tier}: ${c.value}${c.origin ? ' (' + c.origin + ')' : ''}`
  );
  let tip = parts.join(' \u2192 ');
  if (resolution.locked) tip += ' [LOCKED \u2014 PF-Core immutable]';
  return tip;
}

// ── Render a single token leaf ──
function renderTokenLeaf(t, componentName) {
  const live = t.cssVar ? liveValue(t.cssVar) : null;
  const displayHex = live || t.hex;
  const isColour = displayHex.startsWith('#') || displayHex.startsWith('rgb') || displayHex === 'transparent';
  const swatchStyle = isColour ? `background:${displayHex}` : 'background:transparent;border-style:dashed';
  const overridden = live && live !== t.hex;

  // F40.8: Resolve inheritance chain
  const resolution = resolveToken(t.cssVar || null, t.dsToken || null, t.hex);
  const tooltip = buildResolutionTooltip(resolution);

  let tierBadge = '';
  if (t.tier) {
    tierBadge = `<span class="ds-tier-badge ${esc(t.tier)}">${esc(t.tier)}</span>`;
  }

  let flag = '';
  if (t.hardcoded) {
    flag = '<span class="admin-hardcoded-flag">HARDCODED</span>';
  }

  let overrideBadge = '';
  if (overridden) {
    overrideBadge = `<span class="admin-override-badge">OVERRIDE</span>`;
  }

  const sourceBadge = renderSourceBadge(resolution);
  const compStr = componentName || '';

  return `<div class="admin-token-leaf" data-search="${esc((t.label + ' ' + (t.cssVar||'') + ' ' + t.hex + ' ' + (t.dsToken||'') + ' ' + compStr).toLowerCase())}" data-component="${esc(compStr)}" title="${esc(tooltip)}">
    <span class="ds-token-swatch" style="${swatchStyle}"></span>
    <span class="admin-token-label">${esc(t.label)}</span>
    <span class="admin-token-var">${t.cssVar ? esc(t.cssVar) : ''}</span>
    <span class="admin-token-hex">${esc(displayHex)}</span>
    ${t.dsToken ? `<span class="admin-token-ds">${esc(t.dsToken)}</span>` : ''}
    ${tierBadge}${flag}${overrideBadge}${sourceBadge}
  </div>`;
}

// ── Render a branch node (zone or category with children/tokens) ──
function renderBranch(node, depth) {
  const total = countTokens(node);
  const hc = countHardcoded(node);
  const countLabel = total > 0 ? `<span class="admin-count">${total}</span>` : '';
  const hcLabel = hc > 0 ? `<span class="admin-hardcoded-count">${hc} hardcoded</span>` : '';

  // F40.7: Component naming convention
  const componentName = COMPONENT_REGISTRY.get(node.id) || null;

  let childrenHTML = '';
  if (node.tokens) {
    childrenHTML += node.tokens.map(t => renderTokenLeaf(t, componentName)).join('');
  }
  if (node.children) {
    childrenHTML += node.children.map(ch => renderBranch(ch, depth + 1)).join('');
  }

  const depthClass = depth === 0 ? 'admin-zone-node' : 'admin-category-node';
  const collapsed = ' collapsed';
  const tierBadge = (depth === 0 && node.cascadeTier)
    ? `<span class="admin-tier-badge ${esc(node.cascadeTier.toLowerCase())}">${esc(node.cascadeTier)}</span>`
    : '';
  const compLabel = componentName
    ? `<span class="admin-component-name">${esc(componentName)}</span>`
    : '';
  const locateBtn = depth === 0
    ? `<button class="admin-zone-locate-btn${state.activeZoneOverlays.has(node.id) ? ' active' : ''}" data-zone-locate="${esc(node.id)}" title="Highlight zone on page">&#x25CE;</button>`
    : '';

  return `<div class="${depthClass}${collapsed}" id="admin-node-${esc(node.id)}">
    <div class="admin-node-header" data-toggle="${esc(node.id)}">
      <span class="admin-chevron">&#x25BC;</span>
      <span class="admin-node-label">${esc(node.label)}</span>
      ${tierBadge}${compLabel}${countLabel}${hcLabel}${locateBtn}
    </div>
    <div class="admin-node-body">
      ${childrenHTML}
    </div>
  </div>`;
}

// ── Main render ──
let _currentView = 'zone';

export function renderAdminPanel(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const tree = _currentView === 'zone' ? buildZoneTree()
             : _currentView === 'component' ? buildComponentTree()
             : CATEGORY_TREE;

  // Summary stats
  let totalTokens = 0, totalHC = 0;
  tree.forEach(n => { totalTokens += countTokens(n); totalHC += countHardcoded(n); });

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Count overridden tokens (live value differs from default)
  let overrideCount = 0;
  function walkOverrides(nodes) {
    for (const n of nodes) {
      if (n.tokens) {
        for (const t of n.tokens) {
          if (t.cssVar) {
            const lv = liveValue(t.cssVar);
            if (lv && lv !== t.hex) overrideCount++;
          }
        }
      }
      if (n.children) walkOverrides(n.children);
    }
  }
  walkOverrides(tree);

  container.innerHTML = `
    <div class="admin-live-bar">
      <span class="admin-live-dot"></span>
      <span class="admin-live-label">LIVE</span>
      <span class="admin-live-time">Refreshed ${esc(timeStr)}</span>
      ${overrideCount > 0 ? `<span class="admin-override-count">${overrideCount} override${overrideCount > 1 ? 's' : ''}</span>` : ''}
      ${(state.zoneRegistry && state.zoneRegistry.size > 0)
        ? `<span class="admin-skeleton-badge">Skeleton: ${state.zoneRegistry.size} zones</span>`
        : `<span class="admin-skeleton-badge fallback">Fallback: ${FALLBACK_ZONE_TREE.length} zones</span>`}
      <button class="admin-refresh-btn" id="admin-refresh-btn" title="Re-read all CSS values">&#x21BB;</button>
    </div>
    <div class="admin-summary-row">
      <div class="ds-summary-card">
        <div class="ds-summary-label">Tokens</div>
        <div class="ds-summary-value">${totalTokens}</div>
      </div>
      <div class="ds-summary-card">
        <div class="ds-summary-label">Tokenised</div>
        <div class="ds-summary-value accent">${totalTokens - totalHC}</div>
      </div>
      <div class="ds-summary-card">
        <div class="ds-summary-label">Hardcoded</div>
        <div class="ds-summary-value" style="color:var(--viz-warning)">${totalHC}</div>
      </div>
      <div class="ds-summary-card">
        <div class="ds-summary-label">Coverage</div>
        <div class="ds-summary-value accent">${totalTokens ? Math.round(((totalTokens - totalHC) / totalTokens) * 100) : 0}%</div>
      </div>
    </div>
    <div class="admin-view-tabs">
      <button class="admin-view-tab ${_currentView === 'zone' ? 'active' : ''}" data-view="zone">By Zone</button>
      <button class="admin-view-tab ${_currentView === 'category' ? 'active' : ''}" data-view="category">By Category</button>
      <button class="admin-view-tab ${_currentView === 'component' ? 'active' : ''}" data-view="component">Component</button>
    </div>
    <div class="admin-toolbar-row">
      <input type="text" class="admin-search" id="admin-search" placeholder="Filter tokens...">
      <button class="admin-expand-btn" id="admin-expand-all" title="Expand all">&#x25BC; All</button>
      <button class="admin-expand-btn" id="admin-collapse-all" title="Collapse all">&#x25B6; All</button>
      ${_currentView === 'component' ? '<button class="admin-export-btn" id="admin-export-component-json" title="Export component config as DS-ONT JSON">Export JSON</button>' : ''}
    </div>
    <div class="admin-tree" id="admin-tree">
      ${_currentView === 'component'
        ? tree.map(n => renderComponentBranch(n, 0)).join('')
        : tree.map(n => renderBranch(n, 0)).join('')}
    </div>
  `;
}

// ── Global event delegation (attached once at module load, guarded for non-browser) ──
if (typeof document !== 'undefined') document.addEventListener('click', (e) => {
  // Zone boundary overlay dismiss button (can be outside admin panel)
  const dismissBtn = e.target.closest('.zone-boundary-dismiss');
  if (dismissBtn) {
    const overlay = dismissBtn.closest('.zone-boundary-overlay');
    if (overlay) {
      const zoneId = overlay.dataset.zoneId;
      removeZoneOverlay(zoneId);
      _updateZoneNodeActiveState(zoneId);
    }
    return;
  }

  // Only handle remaining clicks inside the admin panel
  if (!e.target.closest('#admin-panel')) return;

  // Zone locate button
  const locateBtn = e.target.closest('.admin-zone-locate-btn[data-zone-locate]');
  if (locateBtn) {
    e.stopPropagation();
    toggleZoneOverlay(locateBtn.dataset.zoneLocate);
    return;
  }

  // Tree node expand/collapse
  const header = e.target.closest('.admin-node-header[data-toggle]');
  if (header) {
    header.parentElement.classList.toggle('collapsed');
    return;
  }
  // View tabs
  const tab = e.target.closest('.admin-view-tab[data-view]');
  if (tab) {
    _currentView = tab.dataset.view;
    renderAdminPanel('admin-panel-content');
    return;
  }
  // Expand / Collapse all
  if (e.target.closest('#admin-expand-all')) { expandAll(); return; }
  if (e.target.closest('#admin-collapse-all')) { collapseAll(); return; }
  // Manual refresh
  if (e.target.closest('#admin-refresh-btn')) { renderAdminPanel('admin-panel-content'); return; }
  // F40.9: Export component config JSON
  if (e.target.closest('#admin-export-component-json')) { exportComponentConfigJSON(); return; }
});

if (typeof document !== 'undefined') document.addEventListener('input', (e) => {
  if (e.target.id === 'admin-search') filterAdminTree(e.target.value);
});

// ── View switching ──
export function switchAdminView(view) {
  _currentView = view;
  renderAdminPanel('admin-panel-content');
}

// ── Expand / Collapse all ──
export function expandAll() {
  document.querySelectorAll('.admin-zone-node, .admin-category-node').forEach(n => n.classList.remove('collapsed'));
}

export function collapseAll() {
  document.querySelectorAll('.admin-zone-node, .admin-category-node').forEach(n => n.classList.add('collapsed'));
}

// ── Search / filter ──
export function filterAdminTree(query) {
  const q = query.toLowerCase().trim();
  const leaves = document.querySelectorAll('.admin-token-leaf');
  const branches = document.querySelectorAll('.admin-zone-node, .admin-category-node');

  if (!q) {
    leaves.forEach(l => l.style.display = '');
    branches.forEach(b => {
      b.style.display = '';
      b.classList.add('collapsed');
    });
    return;
  }

  // Hide non-matching leaves
  leaves.forEach(l => {
    const match = l.dataset.search.includes(q);
    l.style.display = match ? '' : 'none';
  });

  // Show branches that have visible children, expand them
  branches.forEach(b => {
    const visibleLeaves = b.querySelectorAll('.admin-token-leaf:not([style*="display: none"])');
    if (visibleLeaves.length > 0) {
      b.style.display = '';
      b.classList.remove('collapsed');
    } else {
      b.style.display = 'none';
    }
  });
}

// ── Toggle panel ──
export function toggleAdminPanel() {
  const panel = document.getElementById('admin-panel');
  if (!panel) return;
  const opening = !panel.classList.contains('open');
  panel.classList.toggle('open');
  // Always re-render on open — reads live CSS values via getComputedStyle()
  if (opening) {
    renderAdminPanel('admin-panel-content');
  }
}

// ── Refresh (call after DS brand applied/reset, or manual) ──
export function refreshAdminPanel() {
  const panel = document.getElementById('admin-panel');
  if (panel && panel.classList.contains('open')) {
    invalidateCache();  // F40.8: clear resolution cache before re-render
    renderAdminPanel('admin-panel-content');
  }
}

// ========================================
// ZONE BOUNDARY OVERLAY (Token Map — Visual Zone Highlight)
// ========================================

/**
 * Resolve a zone ID to its DOM element via ontology-driven zone selectors.
 * Reads from state.zoneDomSelectors (built by buildSkeletonRegistries in app-skeleton-loader.js).
 * @param {string} zoneId — e.g. 'Z1', 'Z6'
 * @returns {HTMLElement|null}
 */
function getZoneDOMElement(zoneId) {
  const selector = state.zoneDomSelectors?.get(zoneId);
  if (!selector) return null;
  return document.querySelector(selector);
}

/**
 * Toggle the zone boundary overlay for a given zone.
 * Click once to show, click again to hide.
 */
export function toggleZoneOverlay(zoneId) {
  if (state.activeZoneOverlays.has(zoneId)) {
    removeZoneOverlay(zoneId);
  } else {
    createZoneOverlay(zoneId);
  }
  _updateZoneNodeActiveState(zoneId);
}

/**
 * Create and position an overlay for a zone.
 * Hidden/absent zones show a muted centred indicator.
 */
function createZoneOverlay(zoneId) {
  const el = getZoneDOMElement(zoneId);
  const zoneLabel = FALLBACK_ZONE_TREE.find(z => z.id === zoneId)?.label || zoneId;

  const overlay = document.createElement('div');
  overlay.className = 'zone-boundary-overlay';
  overlay.dataset.zoneId = zoneId;

  const isHidden = !el || el.offsetParent === null || getComputedStyle(el).display === 'none';

  if (isHidden) {
    overlay.classList.add('zone-boundary-overlay--hidden');
    overlay.innerHTML = `
      <span class="zone-boundary-label">${esc(zoneId)}: ${esc(zoneLabel)}</span>
      <span class="zone-boundary-hidden-note">Hidden</span>
      <button class="zone-boundary-dismiss" title="Dismiss">&times;</button>
    `;
    overlay.style.position = 'fixed';
    overlay.style.top = '50%';
    overlay.style.left = '50%';
    overlay.style.transform = 'translate(-50%, -50%)';
  } else {
    const rect = el.getBoundingClientRect();
    overlay.style.position = 'fixed';
    overlay.style.top = rect.top + 'px';
    overlay.style.left = rect.left + 'px';
    overlay.style.width = rect.width + 'px';
    overlay.style.height = rect.height + 'px';
    overlay.innerHTML = `
      <span class="zone-boundary-label">${esc(zoneId)}: ${esc(zoneLabel)}</span>
      <button class="zone-boundary-dismiss" title="Dismiss">&times;</button>
    `;
  }

  document.body.appendChild(overlay);
  state.activeZoneOverlays.add(zoneId);
}

/**
 * Remove a specific zone overlay.
 */
function removeZoneOverlay(zoneId) {
  const overlay = document.querySelector(`.zone-boundary-overlay[data-zone-id="${zoneId}"]`);
  if (overlay) overlay.remove();
  state.activeZoneOverlays.delete(zoneId);
}

/**
 * Remove all active zone overlays and reset admin tree state.
 */
export function clearAllZoneOverlays() {
  document.querySelectorAll('.zone-boundary-overlay').forEach(el => el.remove());
  const prevIds = [...state.activeZoneOverlays];
  state.activeZoneOverlays.clear();
  prevIds.forEach(id => _updateZoneNodeActiveState(id));
}

/**
 * Reposition all active overlays to match current element positions.
 * Called on scroll/resize.
 */
function repositionAllZoneOverlays() {
  for (const zoneId of state.activeZoneOverlays) {
    const overlay = document.querySelector(`.zone-boundary-overlay[data-zone-id="${zoneId}"]`);
    if (!overlay || overlay.classList.contains('zone-boundary-overlay--hidden')) continue;

    const el = getZoneDOMElement(zoneId);
    if (!el) continue;

    const rect = el.getBoundingClientRect();
    overlay.style.top = rect.top + 'px';
    overlay.style.left = rect.left + 'px';
    overlay.style.width = rect.width + 'px';
    overlay.style.height = rect.height + 'px';
  }
}

/**
 * Update the active state indicator on a zone row in the admin tree.
 */
function _updateZoneNodeActiveState(zoneId) {
  const nodeEl = document.getElementById(`admin-node-${zoneId}`);
  if (!nodeEl) return;
  if (state.activeZoneOverlays.has(zoneId)) {
    nodeEl.classList.add('zone-overlay-active');
  } else {
    nodeEl.classList.remove('zone-overlay-active');
  }
}

// ── Zone overlay event listeners (module level, guarded for non-browser) ──
if (typeof document !== 'undefined') {
  // Escape key clears all overlays
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.activeZoneOverlays.size > 0) {
      clearAllZoneOverlays();
    }
  });

  // Reposition on scroll/resize
  window.addEventListener('scroll', repositionAllZoneOverlays, { passive: true });
  window.addEventListener('resize', repositionAllZoneOverlays, { passive: true });
}
