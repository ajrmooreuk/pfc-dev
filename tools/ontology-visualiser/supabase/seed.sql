-- ============================================================================
-- Seed Data — Epic 10A (Security MVP)
-- Run after migrations 001 + 002
-- ============================================================================

-- ---------------------------------------------------------------------------
-- PFI Instances
-- ---------------------------------------------------------------------------
INSERT INTO public.pfi_instances (code, name) VALUES
  ('PF-CORE',  'Platform Foundation Core'),
  ('BAIV-AIV', 'Be AI Visible'),
  ('AIRL-AIR', 'AI Readiness Lab');
