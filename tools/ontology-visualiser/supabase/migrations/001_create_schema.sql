-- ============================================================================
-- Migration 001: Core Schema — Epic 10A (Security MVP)
-- VSOM: MVP-Security-VSOM-v1.1.0
-- Date: 2026-02-17
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Table: pfi_instances
-- The product/brand boundary. Every ontology belongs to exactly one PFI.
-- ---------------------------------------------------------------------------
CREATE TABLE public.pfi_instances (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT UNIQUE NOT NULL,   -- 'BAIV-AIV', 'AIRL-AIR', 'PF-CORE'
  name        TEXT NOT NULL,
  brand_config JSONB,                 -- DS token overrides per PFI (future S2)
  created_at  TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.pfi_instances IS 'PFI boundary registry — each instance is a product/brand boundary';
COMMENT ON COLUMN public.pfi_instances.code IS 'Unique short code: PF-CORE, BAIV-AIV, AIRL-AIR';
COMMENT ON COLUMN public.pfi_instances.brand_config IS 'Design system token overrides per PFI (S2 future use)';

-- ---------------------------------------------------------------------------
-- Table: profiles
-- User identity with platform-level role. Auto-created on signup via trigger.
-- ---------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'viewer'
              CHECK (role IN ('pf-owner', 'pfi-admin', 'pfi-member', 'viewer')),
  created_at  TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'User identity with platform role — auto-created on auth signup';
COMMENT ON COLUMN public.profiles.role IS 'Platform role: pf-owner | pfi-admin | pfi-member | viewer';

-- ---------------------------------------------------------------------------
-- Table: user_pfi_access
-- Many-to-many user-to-PFI membership. A user may access multiple PFIs.
-- ---------------------------------------------------------------------------
CREATE TABLE public.user_pfi_access (
  user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  pfi_id      UUID REFERENCES public.pfi_instances(id) ON DELETE CASCADE,
  granted_at  TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, pfi_id)
);

COMMENT ON TABLE public.user_pfi_access IS 'Junction table — users can belong to 1..N PFIs simultaneously';

-- ---------------------------------------------------------------------------
-- Table: ontologies
-- PFI-scoped JSONB ontology storage. Replaces IndexedDB.
-- ---------------------------------------------------------------------------
CREATE TABLE public.ontologies (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pfi_id      UUID NOT NULL REFERENCES public.pfi_instances(id),
  name        TEXT NOT NULL,
  version     TEXT,
  ont_type    TEXT,             -- 'pfc' (shared) or 'pfi' (instance-specific)
  data        JSONB NOT NULL,
  created_by  UUID REFERENCES public.profiles(id),
  updated_by  UUID REFERENCES public.profiles(id),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.ontologies IS 'PFI-scoped ontology storage — JSONB payloads, RLS-filtered';
COMMENT ON COLUMN public.ontologies.ont_type IS 'pfc = shared PF-CORE ontology, pfi = instance-specific';

-- Auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ontologies_updated_at
  BEFORE UPDATE ON public.ontologies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Table: audit_log
-- Append-only event log. The non-negotiable compliance foundation.
-- ---------------------------------------------------------------------------
CREATE TABLE public.audit_log (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID REFERENCES public.profiles(id),
  pfi_id      UUID REFERENCES public.pfi_instances(id),
  action      TEXT NOT NULL,
  resource    TEXT,
  detail      JSONB,
  created_at  TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.audit_log IS 'Append-only audit trail — immutable by design (REVOKE + RLS)';

-- Database-level append-only enforcement (belt AND braces with RLS)
REVOKE UPDATE, DELETE ON public.audit_log FROM authenticated, anon;

-- ---------------------------------------------------------------------------
-- Trigger: auto-create profile on auth signup
-- New users get 'viewer' role by default, no PFI access until admin assigns.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, role)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data ->> 'display_name',
      SPLIT_PART(NEW.email, '@', 1)
    ),
    'viewer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
