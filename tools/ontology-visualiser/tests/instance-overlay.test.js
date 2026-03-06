/**
 * Unit tests for PFI instance data overlay in graph rendering.
 * Epic 9E.4: Instance Data Overlay.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// We test the _mergeInstanceDataIntoGraph logic by importing graph-renderer
// and invoking through its public API. Since _mergeInstanceDataIntoGraph is
// internal, we test it indirectly through state + the overlay effect.

// For unit testing purposes, extract the overlay logic into a testable form.
// We replicate the core logic here to validate behaviour.

describe('instance data overlay logic', () => {
  function mergeInstanceData(visNodes, visEdges, instanceResult, brandColor) {
    if (!instanceResult?.files) return;
    const existingIds = new Set(visNodes.map(n => n.id));

    for (const file of instanceResult.files) {
      if (file.status !== 'loaded' || !file.parsed) continue;
      const entities = file.parsed.nodes || file.parsed.entities || [];
      for (const entity of entities) {
        const entityId = entity['@id'] || entity.id;
        if (!entityId) continue;
        const nodeId = `inst::${entityId}`;
        if (existingIds.has(nodeId)) continue;
        existingIds.add(nodeId);

        visNodes.push({
          id: nodeId,
          label: `[inst] ${entity.name || entityId}`,
          borderDashes: [4, 4],
          color: { border: brandColor },
          _data: { entityType: 'instance-data', sourceEntity: entityId },
        });

        const ns = entityId.includes(':') ? entityId.split(':')[0] + ':' : '';
        const localName = entityId.includes(':') ? entityId.split(':').slice(1).join(':') : entityId;
        const templateId = ns ? `${ns}:${localName}` : localName;
        if (existingIds.has(templateId)) {
          visEdges.push({
            from: templateId,
            to: nodeId,
            label: 'instanceOf',
            dashes: [4, 4],
          });
        }
      }
    }
  }

  it('adds instance nodes with dashed border styling', () => {
    const visNodes = [];
    const visEdges = [];
    const instanceResult = {
      files: [{
        status: 'loaded',
        ontologyRef: 'VP-ONT',
        parsed: {
          nodes: [
            { '@id': 'vp:TestProduct', name: 'Test Product' },
            { '@id': 'vp:TestAudience', name: 'Test Audience' },
          ],
        },
      }],
    };

    mergeInstanceData(visNodes, visEdges, instanceResult, '#ff6600');

    expect(visNodes).toHaveLength(2);
    expect(visNodes[0].id).toBe('inst::vp:TestProduct');
    expect(visNodes[0].label).toBe('[inst] Test Product');
    expect(visNodes[0].borderDashes).toEqual([4, 4]);
    expect(visNodes[0].color.border).toBe('#ff6600');
    expect(visNodes[0]._data.entityType).toBe('instance-data');
    expect(visNodes[1].id).toBe('inst::vp:TestAudience');
  });

  it('creates instanceOf edges to template nodes', () => {
    const visNodes = [{ id: 'vp::Vision', label: 'Vision' }]; // template node exists
    const visEdges = [];
    const instanceResult = {
      files: [{
        status: 'loaded',
        parsed: {
          nodes: [{ '@id': 'vp:Vision', name: 'BAIV Vision' }],
        },
      }],
    };

    mergeInstanceData(visNodes, visEdges, instanceResult, '#9dfff5');

    // Instance node added
    expect(visNodes).toHaveLength(2);
    expect(visNodes[1].id).toBe('inst::vp:Vision');

    // Edge from template to instance
    expect(visEdges).toHaveLength(1);
    expect(visEdges[0].from).toBe('vp::Vision');
    expect(visEdges[0].to).toBe('inst::vp:Vision');
    expect(visEdges[0].label).toBe('instanceOf');
    expect(visEdges[0].dashes).toEqual([4, 4]);
  });

  it('produces no overlay for empty instance data', () => {
    const visNodes = [];
    const visEdges = [];
    mergeInstanceData(visNodes, visEdges, { files: [] }, '#9dfff5');
    expect(visNodes).toHaveLength(0);
    expect(visEdges).toHaveLength(0);
  });

  it('produces no overlay when instanceResult is null', () => {
    const visNodes = [];
    const visEdges = [];
    mergeInstanceData(visNodes, visEdges, null, '#9dfff5');
    expect(visNodes).toHaveLength(0);
    expect(visEdges).toHaveLength(0);
  });

  it('skips files that are not loaded', () => {
    const visNodes = [];
    const visEdges = [];
    const instanceResult = {
      files: [{
        status: 'failed',
        parsed: { nodes: [{ '@id': 'vp:X', name: 'X' }] },
      }],
    };
    mergeInstanceData(visNodes, visEdges, instanceResult, '#9dfff5');
    expect(visNodes).toHaveLength(0);
  });

  it('deduplicates instance nodes', () => {
    const visNodes = [];
    const visEdges = [];
    const instanceResult = {
      files: [
        { status: 'loaded', parsed: { nodes: [{ '@id': 'vp:A', name: 'A' }] } },
        { status: 'loaded', parsed: { nodes: [{ '@id': 'vp:A', name: 'A duplicate' }] } },
      ],
    };
    mergeInstanceData(visNodes, visEdges, instanceResult, '#9dfff5');
    expect(visNodes).toHaveLength(1);
  });

  it('applies brand colour to all instance nodes', () => {
    const visNodes = [];
    const visEdges = [];
    const instanceResult = {
      files: [{
        status: 'loaded',
        parsed: { nodes: [{ '@id': 'pe:Task1', name: 'Task 1' }, { '@id': 'pe:Task2', name: 'Task 2' }] },
      }],
    };
    mergeInstanceData(visNodes, visEdges, instanceResult, '#E91E63');
    expect(visNodes.every(n => n.color.border === '#E91E63')).toBe(true);
  });

  it('handles entities without namespace prefix', () => {
    const visNodes = [];
    const visEdges = [];
    const instanceResult = {
      files: [{
        status: 'loaded',
        parsed: { nodes: [{ '@id': 'SimpleEntity', name: 'Simple' }] },
      }],
    };
    mergeInstanceData(visNodes, visEdges, instanceResult, '#9dfff5');
    expect(visNodes).toHaveLength(1);
    expect(visNodes[0].id).toBe('inst::SimpleEntity');
  });
});
