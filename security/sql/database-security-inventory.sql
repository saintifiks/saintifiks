-- Saintifiks Database Security Inventory Script (Read-Only)
-- Execute in Supabase SQL Editor or psql to produce security baseline evidence.

-- 1. Row Level Security (RLS) State
SELECT
  n.nspname AS schema_name,
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled,
  c.relforcerowsecurity AS force_rls
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'r'
  AND n.nspname IN ('public', 'storage')
ORDER BY 1, 2;

-- 2. Active Row Level Security Policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname IN ('public', 'storage')
ORDER BY schemaname, tablename, policyname;

-- 3. Table Level Role Grants
SELECT
  grantee,
  table_schema,
  table_name,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_schema IN ('public', 'storage')
ORDER BY table_schema, table_name, grantee, privilege_type;

-- 4. Routine / Stored Procedure Grants
SELECT
  grantee,
  routine_schema,
  routine_name,
  privilege_type
FROM information_schema.role_routine_grants
WHERE routine_schema = 'public'
ORDER BY routine_name, grantee;

-- 5. PostgreSQL Roles & Global Bypass Flags
SELECT
  rolname,
  rolsuper,
  rolcreaterole,
  rolcreatedb,
  rolcanlogin,
  rolreplication,
  rolbypassrls
FROM pg_roles
ORDER BY rolname;

-- 6. SECURITY DEFINER Functions & search_path Settings
SELECT
  n.nspname AS schema_name,
  p.proname AS function_name,
  pg_get_function_identity_arguments(p.oid) AS arguments,
  pg_get_userbyid(p.proowner) AS owner,
  p.prosecdef AS security_definer,
  p.proconfig AS function_config
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
ORDER BY p.proname;
