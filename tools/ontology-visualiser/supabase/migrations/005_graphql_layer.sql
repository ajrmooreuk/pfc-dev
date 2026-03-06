-- ============================================================================
-- Migration 005: GraphQL Layer — pg_graphql + Computed Columns + Graph Functions
-- Aligned to: Epic 34 (S1 Graph-First), Supabase Secure Connections Proposal
-- Depends on: 001 (schema), 002 (RLS), 003 (api_keys), 004 (pfc_registry)
-- Date: 2026-02-26
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Enable pg_graphql extension
-- Supabase auto-exposes /graphql/v1 once this is active.
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pg_graphql;

-- ---------------------------------------------------------------------------
-- 2. Add structured columns to ontologies table
-- The core `data` JSONB blob is opaque to pg_graphql. These columns give
-- GraphQL typed access to the most-queried fields WITHOUT normalising
-- entities/relationships into separate tables (that's premature for MVP).
-- ---------------------------------------------------------------------------

ALTER TABLE public.ontologies
  ADD COLUMN IF NOT EXISTS prefix       TEXT,          -- 'vp:', 'rrr:', 'emc:'
  ADD COLUMN IF NOT EXISTS series       TEXT,          -- 'VE-Series', 'PE-Series'
  ADD COLUMN IF NOT EXISTS status       TEXT DEFAULT 'active',  -- 'active', 'deprecated', 'superseded'
  ADD COLUMN IF NOT EXISTS oaa_version  TEXT,          -- OAA schema version '7.0.0'
  ADD COLUMN IF NOT EXISTS entity_count INT DEFAULT 0, -- materialised count for quick stats
  ADD COLUMN IF NOT EXISTS rel_count    INT DEFAULT 0, -- materialised count for quick stats
  ADD COLUMN IF NOT EXISTS rule_count   INT DEFAULT 0; -- materialised count for quick stats

COMMENT ON COLUMN public.ontologies.prefix IS 'Namespace prefix (vp:, rrr:, emc:) — extracted from @context on ingest';
COMMENT ON COLUMN public.ontologies.series IS 'Parent series (VE-Series, PE-Series, Foundation, etc.)';
COMMENT ON COLUMN public.ontologies.status IS 'Lifecycle status: active | deprecated | superseded';

-- Index for common filter patterns
CREATE INDEX IF NOT EXISTS idx_ontologies_prefix ON public.ontologies (prefix);
CREATE INDEX IF NOT EXISTS idx_ontologies_series ON public.ontologies (series);
CREATE INDEX IF NOT EXISTS idx_ontologies_pfi_status ON public.ontologies (pfi_id, status);

-- GIN index for JSONB containment queries (entity search, relationship traversal)
CREATE INDEX IF NOT EXISTS idx_ontologies_data ON public.ontologies USING GIN (data);

-- ---------------------------------------------------------------------------
-- 3. Ontology graph views — JSONB → relational projections for GraphQL
-- These views let pg_graphql expose typed entity/relationship/rule objects
-- while keeping the source of truth as whole JSONB documents.
-- ---------------------------------------------------------------------------

-- 3a. Entities view — flattens ontology entities for GraphQL queries
CREATE OR REPLACE VIEW public.ontology_entities AS
SELECT
  o.id AS ontology_id,
  o.pfi_id,
  o.name AS ontology_name,
  o.prefix,
  o.series,
  e.value ->> '@id'          AS entity_id,
  e.value ->> '@type'        AS entity_type,
  e.value ->> 'name'         AS entity_name,
  e.value ->> 'description'  AS description,
  e.value -> 'oaa:properties' AS properties,
  e.value ->> 'newInVersion' AS new_in_version,
  e.value                     AS raw
FROM public.ontologies o,
     jsonb_array_elements(o.data -> 'entities') WITH ORDINALITY AS e(value, idx)
WHERE o.status = 'active';

COMMENT ON VIEW public.ontology_entities IS 'Flattened entity view — JSONB entities projected as typed rows for GraphQL';

-- 3b. Relationships view — flattens ontology relationships
CREATE OR REPLACE VIEW public.ontology_relationships AS
SELECT
  o.id AS ontology_id,
  o.pfi_id,
  o.prefix,
  r.value ->> '@id'               AS rel_id,
  r.value ->> '@type'             AS rel_type,
  r.value ->> 'name'              AS rel_name,
  r.value ->> 'description'       AS description,
  r.value -> 'domainIncludes'     AS domain_includes,
  r.value -> 'rangeIncludes'      AS range_includes,
  r.value ->> 'oaa:cardinality'   AS cardinality,
  r.value ->> 'oaa:crossOntologyRef' AS cross_ontology_ref,
  CASE
    WHEN r.value ->> 'oaa:crossOntologyRef' IS NOT NULL THEN true
    ELSE false
  END AS is_cross_ontology,
  r.value                          AS raw
FROM public.ontologies o,
     jsonb_array_elements(o.data -> 'relationships') WITH ORDINALITY AS r(value, idx)
WHERE o.status = 'active';

COMMENT ON VIEW public.ontology_relationships IS 'Flattened relationship view — edges projected as typed rows for GraphQL';

-- 3c. Business rules view
CREATE OR REPLACE VIEW public.ontology_rules AS
SELECT
  o.id AS ontology_id,
  o.pfi_id,
  o.prefix,
  br.value ->> 'ruleId'    AS rule_id,
  br.value ->> 'name'      AS rule_name,
  br.value ->> 'condition'  AS condition,
  br.value ->> 'action'     AS action,
  br.value ->> 'severity'   AS severity,
  br.value                   AS raw
FROM public.ontologies o,
     jsonb_array_elements(o.data -> 'businessRules') WITH ORDINALITY AS br(value, idx)
WHERE o.status = 'active';

COMMENT ON VIEW public.ontology_rules IS 'Flattened business rules view for GraphQL queries';

-- ---------------------------------------------------------------------------
-- 4. Graph composition table — materialised composed graphs
-- Instead of computing graphs on every request, store composed snapshots.
-- EMC composition logic runs in Edge Functions (or client) and persists here.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.composed_graphs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pfi_id        UUID NOT NULL REFERENCES public.pfi_instances(id),
  composition_id TEXT NOT NULL,           -- 'comp-MULTI-PFI-<timestamp>'
  categories    TEXT[] NOT NULL,           -- ['PRODUCT', 'FULFILMENT']
  context_level TEXT NOT NULL DEFAULT 'PFI' CHECK (context_level IN ('PFC', 'PFI')),
  product_code  TEXT,                      -- 'WWG', 'BAIV'
  maturity_level INT DEFAULT 5 CHECK (maturity_level BETWEEN 1 AND 5),

  -- The composed graph payload
  nodes         JSONB NOT NULL DEFAULT '[]',  -- [{id, originalId, sourceNamespace, sourceName, series, ...}]
  edges         JSONB NOT NULL DEFAULT '[]',  -- [{from, to, isCrossOntology, label, ...}]
  metadata      JSONB NOT NULL DEFAULT '{}',  -- {totalNodes, totalEdges, visibleCount, ghostCount, ...}

  -- Ontology versions at composition time (reproducibility)
  ontology_versions JSONB NOT NULL DEFAULT '{}',  -- {"VP-ONT": "1.2.3", "RRR-ONT": "2.1.0"}

  -- Lifecycle
  is_canonical  BOOLEAN DEFAULT false,    -- true = frozen snapshot, false = working draft
  created_by    UUID REFERENCES public.profiles(id),
  created_at    TIMESTAMPTZ DEFAULT now(),
  expires_at    TIMESTAMPTZ              -- null = permanent, else auto-cleanup
);

COMMENT ON TABLE public.composed_graphs IS 'Materialised graph compositions — cached outputs of EMC composition logic';
COMMENT ON COLUMN public.composed_graphs.is_canonical IS 'true = frozen CanonicalSnapshot; false = ephemeral working composition';

CREATE INDEX idx_composed_graphs_pfi ON public.composed_graphs (pfi_id, is_canonical);
CREATE INDEX idx_composed_graphs_categories ON public.composed_graphs USING GIN (categories);
CREATE INDEX idx_composed_graphs_nodes ON public.composed_graphs USING GIN (nodes);
CREATE INDEX idx_composed_graphs_edges ON public.composed_graphs USING GIN (edges);

-- RLS: same pattern as ontologies
ALTER TABLE public.composed_graphs ENABLE ROW LEVEL SECURITY;

CREATE POLICY cg_read ON public.composed_graphs FOR SELECT USING (
  pfi_id IN (SELECT pfi_id FROM public.user_pfi_access WHERE user_id = auth.uid())
  OR pfi_id = (SELECT id FROM public.pfi_instances WHERE code = 'PF-CORE')
  OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'pf-owner')
);

CREATE POLICY cg_insert ON public.composed_graphs FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_pfi_access a ON a.user_id = p.id
    WHERE p.id = auth.uid()
    AND a.pfi_id = pfi_id
    AND p.role IN ('pf-owner', 'pfi-admin', 'pfi-member')
  )
);

CREATE POLICY cg_delete ON public.composed_graphs FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_pfi_access a ON a.user_id = p.id
    WHERE p.id = auth.uid()
    AND a.pfi_id = composed_graphs.pfi_id
    AND p.role IN ('pf-owner', 'pfi-admin')
  )
);

-- ---------------------------------------------------------------------------
-- 5. Graph composition functions — server-side EMC logic
-- These are the heavy-lifting functions that pg_graphql exposes as queries.
-- ---------------------------------------------------------------------------

-- 5a. Resolve composed graph for a PFI instance + category set
-- This is the MVP server-side composition: it reads ontologies for the PFI,
-- extracts entities/relationships, and returns a composed node/edge graph.
CREATE OR REPLACE FUNCTION public.resolve_composed_graph(
  p_pfi_code    TEXT,
  p_categories  TEXT[] DEFAULT ARRAY['PRODUCT'],
  p_include_ghosts BOOLEAN DEFAULT true
)
RETURNS JSONB
LANGUAGE plpgsql STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_pfi_id UUID;
  v_nodes JSONB := '[]'::jsonb;
  v_edges JSONB := '[]'::jsonb;
  v_ont RECORD;
  v_entity JSONB;
  v_rel JSONB;
  v_node_count INT := 0;
  v_edge_count INT := 0;
BEGIN
  -- Resolve PFI UUID from code
  SELECT id INTO v_pfi_id
  FROM public.pfi_instances WHERE code = p_pfi_code;

  IF v_pfi_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', format('PFI instance %s not found', p_pfi_code)
    );
  END IF;

  -- Iterate loaded ontologies for this PFI (+ PF-CORE shared)
  FOR v_ont IN
    SELECT o.id, o.name, o.prefix, o.series, o.data
    FROM public.ontologies o
    WHERE o.status = 'active'
      AND (
        o.pfi_id = v_pfi_id
        OR o.pfi_id = (SELECT id FROM public.pfi_instances WHERE code = 'PF-CORE')
      )
    ORDER BY o.series, o.name
  LOOP
    -- Extract entities as graph nodes
    FOR v_entity IN
      SELECT value FROM jsonb_array_elements(v_ont.data -> 'entities')
    LOOP
      v_nodes := v_nodes || jsonb_build_object(
        'id', format('%s::%s', replace(v_ont.prefix, ':', ''), v_entity ->> 'name'),
        'originalId', v_entity ->> 'name',
        'entityId', v_entity ->> '@id',
        'entityType', v_entity ->> '@type',
        'label', v_entity ->> 'name',
        'description', v_entity ->> 'description',
        'sourceNamespace', v_ont.prefix,
        'sourceName', v_ont.name,
        'series', v_ont.series,
        'propertyCount', jsonb_array_length(COALESCE(v_entity -> 'oaa:properties', '[]'::jsonb))
      );
      v_node_count := v_node_count + 1;
    END LOOP;

    -- Extract relationships as graph edges
    FOR v_rel IN
      SELECT value FROM jsonb_array_elements(v_ont.data -> 'relationships')
    LOOP
      v_edges := v_edges || jsonb_build_object(
        'id', v_rel ->> '@id',
        'from', v_rel -> 'domainIncludes',
        'to', v_rel -> 'rangeIncludes',
        'label', v_rel ->> 'name',
        'cardinality', COALESCE(v_rel ->> 'oaa:cardinality', v_rel ->> 'cardinality'),
        'isCrossOntology', (v_rel ->> 'oaa:crossOntologyRef') IS NOT NULL,
        'crossRef', v_rel ->> 'oaa:crossOntologyRef',
        'sourceNamespace', v_ont.prefix
      );
      v_edge_count := v_edge_count + 1;
    END LOOP;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'nodes', v_nodes,
    'edges', v_edges,
    'metadata', jsonb_build_object(
      'pfiCode', p_pfi_code,
      'categories', to_jsonb(p_categories),
      'contextLevel', 'PFI',
      'totalNodes', v_node_count,
      'totalEdges', v_edge_count,
      'composedAt', now()
    )
  );
END;
$$;

COMMENT ON FUNCTION public.resolve_composed_graph IS
  'Server-side graph composition — returns nodes/edges for a PFI instance from stored JSONB ontologies';

-- 5b. Search entities across ontologies by name/type/namespace
CREATE OR REPLACE FUNCTION public.search_entities(
  p_pfi_code    TEXT DEFAULT NULL,
  p_query       TEXT DEFAULT NULL,
  p_namespace   TEXT DEFAULT NULL,
  p_entity_type TEXT DEFAULT NULL,
  p_limit       INT DEFAULT 50
)
RETURNS JSONB
LANGUAGE plpgsql STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_results JSONB := '[]'::jsonb;
  v_entity JSONB;
  v_ont RECORD;
BEGIN
  FOR v_ont IN
    SELECT o.id, o.name, o.prefix, o.series, o.data, o.pfi_id
    FROM public.ontologies o
    WHERE o.status = 'active'
      AND (p_pfi_code IS NULL OR o.pfi_id IN (
        SELECT id FROM public.pfi_instances WHERE code = p_pfi_code
        UNION
        SELECT id FROM public.pfi_instances WHERE code = 'PF-CORE'
      ))
      AND (p_namespace IS NULL OR o.prefix = p_namespace)
  LOOP
    FOR v_entity IN
      SELECT value FROM jsonb_array_elements(v_ont.data -> 'entities')
      WHERE (p_query IS NULL OR
             (value ->> 'name') ILIKE '%' || p_query || '%' OR
             (value ->> 'description') ILIKE '%' || p_query || '%')
        AND (p_entity_type IS NULL OR (value ->> '@type') = p_entity_type)
      LIMIT p_limit
    LOOP
      v_results := v_results || jsonb_build_object(
        'entityId', v_entity ->> '@id',
        'name', v_entity ->> 'name',
        'type', v_entity ->> '@type',
        'description', v_entity ->> 'description',
        'namespace', v_ont.prefix,
        'ontology', v_ont.name,
        'series', v_ont.series
      );
    END LOOP;
  END LOOP;

  RETURN jsonb_build_object(
    'results', v_results,
    'count', jsonb_array_length(v_results)
  );
END;
$$;

COMMENT ON FUNCTION public.search_entities IS
  'Cross-ontology entity search — query by name, namespace, or type across PFI-scoped ontologies';

-- 5c. Get ontology dependency graph (which ontologies import which)
CREATE OR REPLACE FUNCTION public.get_ontology_dependency_graph(
  p_pfi_code TEXT DEFAULT 'PF-CORE'
)
RETURNS JSONB
LANGUAGE plpgsql STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_nodes JSONB := '[]'::jsonb;
  v_edges JSONB := '[]'::jsonb;
  v_ont RECORD;
  v_import JSONB;
BEGIN
  FOR v_ont IN
    SELECT o.name, o.prefix, o.series, o.version, o.data
    FROM public.ontologies o
    WHERE o.status = 'active'
      AND o.pfi_id IN (
        SELECT id FROM public.pfi_instances WHERE code = p_pfi_code
        UNION
        SELECT id FROM public.pfi_instances WHERE code = 'PF-CORE'
      )
  LOOP
    -- Add ontology as node
    v_nodes := v_nodes || jsonb_build_object(
      'id', v_ont.prefix,
      'label', v_ont.name,
      'series', v_ont.series,
      'version', v_ont.version,
      'entityCount', jsonb_array_length(COALESCE(v_ont.data -> 'entities', '[]'::jsonb)),
      'relCount', jsonb_array_length(COALESCE(v_ont.data -> 'relationships', '[]'::jsonb))
    );

    -- Add imports as edges
    FOR v_import IN
      SELECT value FROM jsonb_array_elements(COALESCE(v_ont.data -> 'oaa:imports', '[]'::jsonb))
    LOOP
      v_edges := v_edges || jsonb_build_object(
        'from', v_ont.prefix,
        'to', v_import ->> 'name',
        'importedEntities', v_import -> 'importedEntities',
        'importedRelationships', v_import -> 'importedRelationships'
      );
    END LOOP;
  END LOOP;

  RETURN jsonb_build_object(
    'nodes', v_nodes,
    'edges', v_edges,
    'ontologyCount', jsonb_array_length(v_nodes)
  );
END;
$$;

COMMENT ON FUNCTION public.get_ontology_dependency_graph IS
  'Returns the inter-ontology dependency graph based on oaa:imports declarations';

-- ---------------------------------------------------------------------------
-- 6. Computed columns for pg_graphql — expose JSONB summaries as typed fields
-- pg_graphql auto-detects functions named <table>_<column> as computed columns.
-- ---------------------------------------------------------------------------

-- Expose entity names as a text array for quick listing
CREATE OR REPLACE FUNCTION public.ontologies_entity_names(ont public.ontologies)
RETURNS TEXT[]
LANGUAGE sql STABLE
AS $$
  SELECT COALESCE(
    array_agg(e.value ->> 'name' ORDER BY e.value ->> 'name'),
    ARRAY[]::TEXT[]
  )
  FROM jsonb_array_elements(ont.data -> 'entities') AS e(value);
$$;

-- Expose relationship names as a text array
CREATE OR REPLACE FUNCTION public.ontologies_relationship_names(ont public.ontologies)
RETURNS TEXT[]
LANGUAGE sql STABLE
AS $$
  SELECT COALESCE(
    array_agg(r.value ->> 'name' ORDER BY r.value ->> 'name'),
    ARRAY[]::TEXT[]
  )
  FROM jsonb_array_elements(ont.data -> 'relationships') AS r(value);
$$;

-- Expose cross-ontology references as text array
CREATE OR REPLACE FUNCTION public.ontologies_cross_references(ont public.ontologies)
RETURNS TEXT[]
LANGUAGE sql STABLE
AS $$
  SELECT COALESCE(
    array_agg(DISTINCT r.value ->> 'oaa:crossOntologyRef'),
    ARRAY[]::TEXT[]
  )
  FROM jsonb_array_elements(ont.data -> 'relationships') AS r(value)
  WHERE r.value ->> 'oaa:crossOntologyRef' IS NOT NULL;
$$;

-- Expose import list as text array of ontology names
CREATE OR REPLACE FUNCTION public.ontologies_imports(ont public.ontologies)
RETURNS TEXT[]
LANGUAGE sql STABLE
AS $$
  SELECT COALESCE(
    array_agg(i.value ->> 'name'),
    ARRAY[]::TEXT[]
  )
  FROM jsonb_array_elements(COALESCE(ont.data -> 'oaa:imports', '[]'::jsonb)) AS i(value);
$$;

-- ---------------------------------------------------------------------------
-- 7. Auto-populate structured columns on INSERT/UPDATE
-- Keeps prefix, series, counts in sync with JSONB data blob.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.sync_ontology_metadata()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Extract prefix from @context (first key that ends with ':')
  -- Fallback: use the name-based prefix mapping
  NEW.entity_count := jsonb_array_length(COALESCE(NEW.data -> 'entities', '[]'::jsonb));
  NEW.rel_count    := jsonb_array_length(COALESCE(NEW.data -> 'relationships', '[]'::jsonb));
  NEW.rule_count   := jsonb_array_length(COALESCE(NEW.data -> 'businessRules', '[]'::jsonb));
  NEW.oaa_version  := COALESCE(NEW.data ->> 'oaa:schemaVersion', NEW.oaa_version);

  -- Only set version from data if not already provided
  IF NEW.version IS NULL THEN
    NEW.version := COALESCE(
      NEW.data ->> 'oaa:moduleVersion',
      NEW.data ->> 'version'
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER sync_ontology_metadata_trigger
  BEFORE INSERT OR UPDATE OF data ON public.ontologies
  FOR EACH ROW EXECUTE FUNCTION public.sync_ontology_metadata();

-- ---------------------------------------------------------------------------
-- 8. Utility: Ingest ontology from JSON-LD
-- Convenience function for Edge Functions / sync pipelines.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.ingest_ontology(
  p_pfi_code  TEXT,
  p_name      TEXT,
  p_prefix    TEXT,
  p_series    TEXT,
  p_version   TEXT,
  p_ont_type  TEXT DEFAULT 'pfc',
  p_data      JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_pfi_id UUID;
  v_id UUID;
BEGIN
  SELECT id INTO v_pfi_id FROM public.pfi_instances WHERE code = p_pfi_code;
  IF v_pfi_id IS NULL THEN
    RAISE EXCEPTION 'PFI instance % not found', p_pfi_code;
  END IF;

  -- Upsert: update if same name+version+pfi exists, else insert
  INSERT INTO public.ontologies (pfi_id, name, prefix, series, version, ont_type, data)
  VALUES (v_pfi_id, p_name, p_prefix, p_series, p_version, p_ont_type, p_data)
  ON CONFLICT ON CONSTRAINT ontologies_unique_version
    DO UPDATE SET
      data = EXCLUDED.data,
      updated_at = now()
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- Unique constraint for upsert (prevents duplicate name+version per PFI)
ALTER TABLE public.ontologies
  ADD CONSTRAINT ontologies_unique_version UNIQUE (pfi_id, name, version);

COMMENT ON FUNCTION public.ingest_ontology IS
  'Upsert ontology from JSON-LD data — used by sync pipeline and Edge Functions';

-- ---------------------------------------------------------------------------
-- 9. pg_graphql configuration — expose functions as root query fields
-- By default pg_graphql exposes tables/views. Functions returning JSONB
-- are also exposed when they have the right signature.
-- ---------------------------------------------------------------------------

-- Grant access so pg_graphql can call these functions
GRANT EXECUTE ON FUNCTION public.resolve_composed_graph TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.search_entities TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_ontology_dependency_graph TO authenticated, anon;

-- Grant SELECT on views for pg_graphql
GRANT SELECT ON public.ontology_entities TO authenticated, anon;
GRANT SELECT ON public.ontology_relationships TO authenticated, anon;
GRANT SELECT ON public.ontology_rules TO authenticated, anon;

-- Enable RLS on composed_graphs (already done above) — pg_graphql respects RLS

-- ---------------------------------------------------------------------------
-- 10. Comment-based pg_graphql directives
-- pg_graphql reads COMMENT ON to customise the GraphQL schema.
-- ---------------------------------------------------------------------------

COMMENT ON TABLE public.ontologies IS
  E'@graphql({"totalCount": {"enabled": true}})';

COMMENT ON TABLE public.composed_graphs IS
  E'@graphql({"totalCount": {"enabled": true}})';
