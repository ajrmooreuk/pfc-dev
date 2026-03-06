/**
 * Ontology format detection and parsing.
 * Converts various JSON ontology formats into a unified { nodes, edges } graph structure.
 */

export function detectFormat(data) {
  if (data.agents && Array.isArray(data.agents)) return 'agent-registry';
  if (data.registryEntry) return 'registry-entry';
  if (data.ontologyDefinition) return 'uni-registry';
  if (data.entities && Array.isArray(data.entities)) return 'pf-ontology';
  if (data.entities && typeof data.entities === 'object' && !Array.isArray(data.entities)) return 'pf-ontology-keyed';
  if (data.hasDefinedTerm && Array.isArray(data.hasDefinedTerm)) return 'jsonld-definedterm';
  // DS instance JSONLD: @graph array with ds: typed nodes
  if (data['@graph'] && Array.isArray(data['@graph']) &&
      data['@graph'].some(n => (n['@type'] || '').startsWith('ds:'))) return 'ds-instance';
  if (data.classes || data['@graph']) return 'jsonld';
  return 'generic';
}

export function parseOntology(data, source) {
  const nodes = [];
  const edges = [];
  const seen = new Set();
  const diagnostics = { format: '', stubNodes: [], orphanEdges: [] };

  function addNode(id, label, type, description, properties) {
    if (seen.has(id)) return;
    seen.add(id);
    nodes.push({ id, label: label || id, entityType: type || 'default', description: description || '', properties: properties || {} });
  }

  function addEdge(from, to, label, type) {
    edges.push({ from, to, label: label || '', edgeType: type || 'relationship' });
  }

  const format = detectFormat(data);
  diagnostics.format = format;

  if (format === 'agent-registry') {
    data.agents.forEach(agent => {
      addNode(agent.id, agent.name || agent.id, 'agent', agent.purpose || agent.description, agent);
      if (agent.dependencies) agent.dependencies.forEach(dep => addEdge(agent.id, dep, 'depends on', 'binding'));
      if (agent.layer) {
        const layerId = 'layer:' + agent.layer;
        addNode(layerId, agent.layer, 'layer', 'Agent layer');
        addEdge(agent.id, layerId, 'in layer', 'binding');
      }
    });
  }

  else if (format === 'registry-entry') {
    const re = data.registryEntry;
    const name = re.name || re.ontologyName || source;
    addNode('root', name, 'core', re.description || re.summary || '');
    if (re.summary && re.summary.entities) {
      re.summary.entities.forEach(ent => {
        const id = ent.id || ent.name;
        addNode(id, ent.name || id, ent.entityType || 'class', ent.description || '', ent);
        addEdge('root', id, 'contains', 'relationship');
      });
    }
    if (re.summary && re.summary.relationships) {
      re.summary.relationships.forEach(rel => {
        if (rel.source && rel.target) addEdge(rel.source, rel.target, rel.label || rel.name || '', 'relationship');
      });
    }
  }

  else if (format === 'uni-registry') {
    const od = data.ontologyDefinition;
    const ontName = (data.registryMetadata && data.registryMetadata.name) || od.name || source;
    const ontDesc = (data.registryMetadata && data.registryMetadata.description) || od.description || '';

    const graph = od['@graph'] || [];
    graph.forEach(cls => {
      const id = cls['@id'] || cls.id;
      const label = cls['rdfs:label'] || cls.name || cls.label || id;
      const desc = cls['rdfs:comment'] || cls.description || '';
      if (id) addNode(id, label, 'class', desc, cls);
      const parent = cls['rdfs:subClassOf'];
      if (parent) {
        const parentId = typeof parent === 'object' ? (parent['@id'] || parent.id) : parent;
        if (parentId) {
          if (!seen.has(parentId)) addNode(parentId, parentId.replace(/.*[:#]/, ''), 'external', 'schema.org / base type');
          addEdge(id, parentId, 'subClassOf', 'inheritance');
        }
      }
    });

    if (od.entities) {
      od.entities.forEach(ent => {
        const id = ent['@id'] || ent.id || ent.name;
        addNode(id, ent.name || ent['rdfs:label'] || id, ent.entityType || 'class', ent.description || '', ent);
      });
    }

    if (od.relationships) {
      od.relationships.forEach(rel => {
        const label = rel['rdfs:label'] || rel.name || rel.label || '';
        let domain = rel['rdfs:domain'] || rel.source;
        let range = rel['rdfs:range'] || rel.target;
        if (typeof domain !== 'string') domain = null;
        if (typeof range !== 'string') range = null;
        if (domain && range) {
          if (!seen.has(domain)) addNode(domain, domain.replace(/.*[:#]/, ''), 'external', '');
          if (!seen.has(range)) addNode(range, range.replace(/.*[:#]/, ''), 'external', '');
          addEdge(domain, range, label, 'relationship');
        }
        const domains = rel.domainIncludes || rel['oaa:domainIncludes'];
        const ranges = rel.rangeIncludes || rel['oaa:rangeIncludes'];
        if (domains && ranges) {
          (Array.isArray(domains) ? domains : [domains]).forEach(d => {
            (Array.isArray(ranges) ? ranges : [ranges]).forEach(r => {
              if (!seen.has(d)) addNode(d, d.replace(/.*[:#]/, ''), 'external', '');
              if (!seen.has(r)) addNode(r, r.replace(/.*[:#]/, ''), 'external', '');
              addEdge(d, r, label, 'relationship');
            });
          });
        }
      });
    }

    if (ontName && nodes.length > 0) {
      addNode(data['@id'] || 'ont:root', ontName, 'core', ontDesc);
    }
  }

  else if (format === 'pf-ontology') {
    const ontName = (data.metadata && data.metadata.name) || data.name || source;
    data.entities.forEach(ent => {
      const id = ent['@id'] || ent.id || ent.name;
      const label = ent.name || ent.label || ent['rdfs:label'] || id;
      const desc = ent.description || ent['rdfs:comment'] || '';
      const type = ent.entityType || (ent['@type'] || '').replace(/.*:/, '') || 'class';
      if (id) addNode(id, label, type.toLowerCase(), desc, ent);
      if (ent.schemaOrgBase) {
        addNode(ent.schemaOrgBase, ent.schemaOrgBase.replace('schema:', ''), 'external', 'schema.org type');
        addEdge(id, ent.schemaOrgBase, 'extends', 'inheritance');
      }
      const subClassOf = ent['rdfs:subClassOf'] || ent.subClassOf;
      if (subClassOf) {
        const parentId = typeof subClassOf === 'object' ? (subClassOf['@id'] || subClassOf.id) : subClassOf;
        if (parentId) {
          if (!seen.has(parentId)) addNode(parentId, parentId.replace(/.*[:#]/, ''), 'external', 'Parent class');
          addEdge(id, parentId, 'subClassOf', 'inheritance');
        }
      }
    });

    if (data.relationships && Array.isArray(data.relationships)) {
      data.relationships.forEach(rel => {
        const label = rel.name || rel.label || rel['@id'] || rel['rdfs:label'] || '';
        const domains = rel.domainIncludes || rel['oaa:domainIncludes'] || (rel.domain ? [rel.domain] : []);
        const ranges = rel.rangeIncludes || rel['oaa:rangeIncludes'] || (rel.range ? [rel.range] : []);
        (Array.isArray(domains) ? domains : [domains]).forEach(d => {
          (Array.isArray(ranges) ? ranges : [ranges]).forEach(r => {
            if (!seen.has(d)) addNode(d, d.replace(/.*:/, ''), 'external', '');
            if (!seen.has(r)) addNode(r, r.replace(/.*:/, ''), 'external', '');
            addEdge(d, r, label, rel.linkedOntology ? 'binding' : 'relationship');
          });
        });
      });
    }

    if (data.metadata && data.metadata.dependencies) {
      const rootId = data['@id'] || 'root';
      addNode(rootId, ontName, 'core', data.metadata.description || '');
      data.metadata.dependencies.forEach(dep => {
        addNode(dep, dep.replace(/.*:/, ''), 'external', 'Dependency');
        addEdge(rootId, dep, 'depends on', 'binding');
      });
    }
  }

  else if (format === 'pf-ontology-keyed') {
    // Object-keyed entities: { "Vision": { "@id": "pfc:Vision", ... }, "Strategy": {...} }
    // Used by OAA v6.2.0+ ontologies (e.g., KPI/Metrics)
    for (const [key, ent] of Object.entries(data.entities)) {
      const id = ent['@id'] || ent.id || key;
      const label = ent['rdfs:label'] || ent.name || ent.label || key;
      const desc = ent['rdfs:comment'] || ent.description || '';
      const type = ent.entityType || (ent['@type'] || '').replace(/.*:/, '') || 'class';
      if (id) addNode(id, label, type.toLowerCase(), desc, ent);

      const subClassOf = ent['rdfs:subClassOf'] || ent.subClassOf;
      if (subClassOf) {
        const parentId = typeof subClassOf === 'object' ? (subClassOf['@id'] || subClassOf.id) : subClassOf;
        if (parentId) {
          if (!seen.has(parentId)) addNode(parentId, parentId.replace(/.*[:#]/, ''), 'external', 'Parent class');
          addEdge(id, parentId, 'subClassOf', 'inheritance');
        }
      }
    }

    if (data.relationships && Array.isArray(data.relationships)) {
      data.relationships.forEach(rel => {
        const label = rel.name || rel.label || rel['@id'] || rel['rdfs:label'] || '';
        // Support sourceEntity/targetEntity (OAA v6.2.0) AND domainIncludes/rangeIncludes (OAA v5)
        const source = rel.sourceEntity || rel.source || rel.domain;
        const target = rel.targetEntity || rel.target || rel.range;
        if (source && target) {
          if (!seen.has(source)) addNode(source, source.replace(/.*[:#]/, ''), 'external', '');
          if (!seen.has(target)) addNode(target, target.replace(/.*[:#]/, ''), 'external', '');
          addEdge(source, target, label, rel.linkedOntology ? 'binding' : 'relationship');
        }
        // Also handle domainIncludes/rangeIncludes arrays
        const domains = rel.domainIncludes || rel['oaa:domainIncludes'];
        const ranges = rel.rangeIncludes || rel['oaa:rangeIncludes'];
        if (domains && ranges) {
          (Array.isArray(domains) ? domains : [domains]).forEach(d => {
            (Array.isArray(ranges) ? ranges : [ranges]).forEach(r => {
              if (!seen.has(d)) addNode(d, d.replace(/.*:/, ''), 'external', '');
              if (!seen.has(r)) addNode(r, r.replace(/.*:/, ''), 'external', '');
              addEdge(d, r, label, 'relationship');
            });
          });
        }
      });
    }
  }

  else if (format === 'jsonld-definedterm') {
    const ontName = data.name || data['rdfs:label'] || data['@id'] || source;
    const ontDesc = data.description || data['rdfs:comment'] || '';

    data.hasDefinedTerm.forEach(term => {
      const id = term['@id'] || term.name;
      const label = term.name || term['rdfs:label'] || id;
      const desc = term.description || term['rdfs:comment'] || '';
      const termType = term['@type'] || term.type || 'Class';
      const entityType = termType.toLowerCase().includes('property') ? 'supporting' : 'class';

      if (id) addNode(id, label, entityType, desc, term);

      const parent = term['rdfs:subClassOf'];
      if (parent) {
        const parentId = typeof parent === 'object' ? (parent['@id'] || parent.id) : parent;
        if (parentId) {
          if (!seen.has(parentId)) {
            addNode(parentId, parentId.replace(/.*[:#]/, ''), 'external', 'schema.org / base type');
          }
          addEdge(id, parentId, 'subClassOf', 'inheritance');
        }
      }

      const domains = term['schema:domainIncludes'] || term['oaa:domainIncludes'] || term.domainIncludes;
      const ranges = term['schema:rangeIncludes'] || term['oaa:rangeIncludes'] || term.rangeIncludes;
      if (domains || ranges) {
        const domainList = Array.isArray(domains) ? domains : (domains ? [domains] : []);
        const rangeList = Array.isArray(ranges) ? ranges : (ranges ? [ranges] : []);

        domainList.forEach(d => {
          const domainId = typeof d === 'object' ? (d['@id'] || d.id) : d;
          if (domainId) {
            if (!seen.has(domainId)) addNode(domainId, domainId.replace(/.*[:#]/, ''), 'external', '');
            addEdge(domainId, id, 'has property', 'relationship');
          }
        });

        rangeList.forEach(r => {
          const rangeId = typeof r === 'object' ? (r['@id'] || r.id) : r;
          if (rangeId) {
            if (!seen.has(rangeId)) addNode(rangeId, rangeId.replace(/.*[:#]/, ''), 'external', '');
            addEdge(id, rangeId, 'range', 'relationship');
          }
        });
      }
    });

    if (data.relationships && Array.isArray(data.relationships)) {
      data.relationships.forEach(rel => {
        const label = rel.name || rel['rdfs:label'] || rel['@id'] || '';
        const domains = rel.domainIncludes || rel['oaa:domainIncludes'] || (rel.domain ? [rel.domain] : []);
        const ranges = rel.rangeIncludes || rel['oaa:rangeIncludes'] || (rel.range ? [rel.range] : []);
        (Array.isArray(domains) ? domains : [domains]).forEach(d => {
          (Array.isArray(ranges) ? ranges : [ranges]).forEach(r => {
            if (d && r) {
              if (!seen.has(d)) addNode(d, d.replace(/.*[:#]/, ''), 'external', '');
              if (!seen.has(r)) addNode(r, r.replace(/.*[:#]/, ''), 'external', '');
              addEdge(d, r, label, 'relationship');
            }
          });
        });
      });
    }

    if (ontName && nodes.length > 0) {
      addNode(data['@id'] || 'ont:root', ontName.replace(/.*[:#]/, ''), 'core', ontDesc);
    }
  }

  else if (format === 'ds-instance') {
    // DS-ONT instance JSONLD — @graph with ds: typed nodes
    const graph = data['@graph'] || [];
    const tierOrder = { 'ds:DesignSystem': 0, 'ds:TokenCategory': 1, 'ds:PrimitiveToken': 2,
      'ds:SemanticToken': 3, 'ds:ComponentToken': 4, 'ds:BrandVariant': 5,
      'ds:FigmaSource': 6, 'ds:ThemeMode': 7, 'ds:DesignPattern': 8 };
    for (const node of graph) {
      const id = node['@id'];
      const type = node['@type'] || '';
      const label = node['ds:name'] || node['ds:tokenName'] || node['ds:categoryName'] || node['ds:modeName'] || id;
      const desc = node['ds:description'] || '';
      const entityType = type.replace('ds:', '').toLowerCase() || 'class';
      if (id) addNode(id, label, entityType, desc, node);
      // Token → category reference
      const catRef = node['ds:belongsToCategory'];
      if (catRef) {
        const catId = typeof catRef === 'object' ? catRef['@id'] : catRef;
        if (catId) addEdge(id, catId, 'belongsToCategory', 'binding');
      }
      // Semantic → primitive reference
      const primRef = node['ds:referencesToken'];
      if (primRef) {
        const primId = typeof primRef === 'object' ? primRef['@id'] : primRef;
        if (primId) addEdge(id, primId, 'referencesToken', 'relationship');
      }
      // DesignSystem → category references
      const cats = node['ds:hasTokenCategory'];
      if (Array.isArray(cats)) {
        for (const c of cats) {
          const cId = typeof c === 'object' ? c['@id'] : c;
          if (cId) addEdge(id, cId, 'hasTokenCategory', 'binding');
        }
      }
    }
  }

  else if (format === 'jsonld') {
    const classes = data.classes || data['@graph'] || [];
    (Array.isArray(classes) ? classes : []).forEach(cls => {
      const id = cls['@id'] || cls.id || cls.name;
      const label = cls['rdfs:label'] || cls.label || cls.name || id;
      const desc = cls['rdfs:comment'] || cls.description || '';
      const type = cls.entityType || cls.type || 'class';
      if (id) addNode(id, label, type, desc, cls.properties || cls);
      const parent = cls['rdfs:subClassOf'] || cls.subClassOf || cls.parentClass;
      if (parent) {
        const parentId = typeof parent === 'object' ? (parent['@id'] || parent.id) : parent;
        if (parentId) { addNode(parentId, parentId, 'class', ''); addEdge(id, parentId, 'subClassOf', 'inheritance'); }
      }
    });
    const rels = data.relationships || data.properties || [];
    (Array.isArray(rels) ? rels : []).forEach(rel => {
      const src = rel.source || rel.domain || rel.from;
      const tgt = rel.target || rel.range || rel.to;
      const label = rel.label || rel.name || rel['rdfs:label'] || '';
      if (src && tgt) addEdge(src, tgt, label, 'relationship');
    });
  }

  else {
    addNode('root', source, 'core', 'Root');
    for (const [key, val] of Object.entries(data)) {
      if (key.startsWith('@') || key.startsWith('$')) continue;
      if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
        addNode(key, val.name || val.label || key, val.entityType || val.type || 'concept', val.description || '');
        addEdge('root', key, 'contains', 'relationship');
        for (const [k2, v2] of Object.entries(val)) {
          if (typeof v2 === 'object' && v2 !== null && !Array.isArray(v2) && !k2.startsWith('@')) {
            const childId = key + '.' + k2;
            addNode(childId, v2.name || v2.label || k2, v2.entityType || 'supporting', v2.description || '');
            addEdge(key, childId, k2, 'relationship');
          }
        }
      } else if (Array.isArray(val)) {
        val.forEach((item, i) => {
          if (typeof item === 'object' && item !== null) {
            const id = item.id || item.name || key + '_' + i;
            addNode(id, item.name || item.label || id, item.entityType || item.type || 'class', item.description || '', item);
            addEdge('root', id, key, 'relationship');
          }
        });
      }
    }
  }

  // Edge validation — ensure all edge endpoints exist
  edges.forEach(e => {
    if (!seen.has(e.from)) {
      addNode(e.from, e.from.replace(/.*[:#]/, ''), 'external', 'Auto-created stub (missing reference)');
      diagnostics.stubNodes.push(e.from);
    }
    if (!seen.has(e.to)) {
      addNode(e.to, e.to.replace(/.*[:#]/, ''), 'external', 'Auto-created stub (missing reference)');
      diagnostics.stubNodes.push(e.to);
    }
  });

  return { nodes, edges, name: data.name || data.ontologyName || source, diagnostics };
}
