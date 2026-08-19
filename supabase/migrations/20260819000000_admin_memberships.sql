-- Migration: 20260819000000_admin_memberships.sql
-- Purpose: Additive administrator membership model replacing hardcoded email checks
-- Security: Explicit application authorization with default-deny RLS

CREATE TABLE IF NOT EXISTS public.admin_memberships (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'publisher', 'moderator', 'security_admin')),
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NULL REFERENCES auth.users(id)
);

-- RLS Enablement & Enforcement
ALTER TABLE public.admin_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_memberships FORCE ROW LEVEL SECURITY;

-- Grant minimal permissions
GRANT SELECT ON public.admin_memberships TO authenticated;
GRANT ALL ON public.admin_memberships TO service_role;

-- Users can inspect only their own active membership
CREATE POLICY "Users can read own admin membership"
  ON public.admin_memberships
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Postcondition verification:
-- SELECT tablename, policyname, permissive, roles, cmd FROM pg_policies WHERE tablename = 'admin_memberships';
