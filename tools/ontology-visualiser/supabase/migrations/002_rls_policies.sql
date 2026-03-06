-- ============================================================================
-- Migration 002: Row-Level Security Policies — Epic 10A (Security MVP)
-- VSOM: MVP-Security-VSOM-v1.1.0
-- Date: 2026-02-17
-- ============================================================================

-- ===== ONTOLOGIES ==========================================================

ALTER TABLE public.ontologies ENABLE ROW LEVEL SECURITY;

-- SELECT: user's PFI(s) + PF-CORE shared + pf-owner sees all
CREATE POLICY ont_read ON public.ontologies FOR SELECT USING (
  pfi_id IN (SELECT pfi_id FROM public.user_pfi_access WHERE user_id = auth.uid())
  OR pfi_id = (SELECT id FROM public.pfi_instances WHERE code = 'PF-CORE')
  OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'pf-owner')
);

-- INSERT: member+ in target PFI (pfi-member, pfi-admin, pf-owner)
CREATE POLICY ont_insert ON public.ontologies FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_pfi_access a ON a.user_id = p.id
    WHERE p.id = auth.uid()
    AND a.pfi_id = pfi_id
    AND p.role IN ('pf-owner', 'pfi-admin', 'pfi-member')
  )
);

-- UPDATE: member+ in target PFI
CREATE POLICY ont_update ON public.ontologies FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_pfi_access a ON a.user_id = p.id
    WHERE p.id = auth.uid()
    AND a.pfi_id = ontologies.pfi_id
    AND p.role IN ('pf-owner', 'pfi-admin', 'pfi-member')
  )
);

-- DELETE: admin+ only (pfi-admin, pf-owner)
CREATE POLICY ont_delete ON public.ontologies FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_pfi_access a ON a.user_id = p.id
    WHERE p.id = auth.uid()
    AND a.pfi_id = ontologies.pfi_id
    AND p.role IN ('pf-owner', 'pfi-admin')
  )
);

-- ===== AUDIT LOG ============================================================

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- INSERT: any authenticated user (application writes audit entries)
CREATE POLICY audit_insert ON public.audit_log FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
);

-- SELECT: pf-owner sees all, pfi-admin sees their PFI(s) only
CREATE POLICY audit_read ON public.audit_log FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'pf-owner')
  OR (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'pfi-admin')
    AND pfi_id IN (SELECT pfi_id FROM public.user_pfi_access WHERE user_id = auth.uid())
  )
);

-- No UPDATE or DELETE policies — combined with REVOKE, audit_log is immutable

-- ===== PROFILES =============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: own profile + profiles of users in shared PFI(s) + pf-owner sees all
CREATE POLICY profiles_read ON public.profiles FOR SELECT USING (
  id = auth.uid()
  OR id IN (
    SELECT a2.user_id FROM public.user_pfi_access a1
    JOIN public.user_pfi_access a2 ON a1.pfi_id = a2.pfi_id
    WHERE a1.user_id = auth.uid()
  )
  OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'pf-owner')
);

-- UPDATE: own profile only
CREATE POLICY profiles_update ON public.profiles FOR UPDATE USING (
  id = auth.uid()
);

-- ===== USER-PFI ACCESS ======================================================

ALTER TABLE public.user_pfi_access ENABLE ROW LEVEL SECURITY;

-- SELECT: users see memberships for their PFI(s) + pf-owner sees all
CREATE POLICY access_read ON public.user_pfi_access FOR SELECT USING (
  pfi_id IN (SELECT pfi_id FROM public.user_pfi_access WHERE user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'pf-owner')
);

-- INSERT: pf-owner anywhere, pfi-admin for their own PFI(s)
CREATE POLICY access_insert ON public.user_pfi_access FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'pf-owner')
  OR (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'pfi-admin')
    AND pfi_id IN (SELECT pfi_id FROM public.user_pfi_access WHERE user_id = auth.uid())
  )
);

-- DELETE: pf-owner anywhere, pfi-admin for their own PFI(s)
CREATE POLICY access_delete ON public.user_pfi_access FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'pf-owner')
  OR (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'pfi-admin')
    AND pfi_id IN (SELECT pfi_id FROM public.user_pfi_access WHERE user_id = auth.uid())
  )
);

-- ===== PFI INSTANCES ========================================================

ALTER TABLE public.pfi_instances ENABLE ROW LEVEL SECURITY;

-- SELECT: all authenticated users (reference data)
CREATE POLICY pfi_read ON public.pfi_instances FOR SELECT USING (
  auth.uid() IS NOT NULL
);

-- INSERT/UPDATE/DELETE: pf-owner only
CREATE POLICY pfi_manage ON public.pfi_instances FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'pf-owner')
);
