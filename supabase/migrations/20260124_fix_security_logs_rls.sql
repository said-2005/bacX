-- Migration: Fix Security Logs RLS
-- Security Requirement: Only Service Role can insert logs. Public inserts are blocked.

-- 1. Drop existing dangerous policy (if it matches the one we found)
DROP POLICY IF EXISTS "Enable insert for everyone" ON public.security_logs;
DROP POLICY IF EXISTS "Enable select for admins only" ON public.security_logs;

-- 2. Create STRICT Insert Policy
-- Only service_role can insert.
-- Note: 'service_role' is a role in the auth system, accessed via `auth.role()`.
CREATE POLICY "Service Role Only Insert" ON public.security_logs 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

-- 3. Create Admin Select Policy (unchanged mostly, but explicit)
CREATE POLICY "Admin Select Only" ON public.security_logs 
FOR SELECT 
USING (
  exists (
    select 1 from public.profiles 
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

-- 4. Enable RLS (Ensure it's enabled)
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;
