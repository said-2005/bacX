-- =========================================
-- PROFILES TABLE RLS POLICY FIX
-- Run this in Supabase SQL Editor
-- =========================================

-- 1. Drop all old/conflicting policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Allow individual read access" ON public.profiles;
DROP POLICY IF EXISTS "Allow individual update access" ON public.profiles;

-- 2. Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create clean, non-conflicting policies

-- SELECT: User can only read their own profile
CREATE POLICY "Fix_Select_Own_Profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- UPDATE: User can only update their own profile
CREATE POLICY "Fix_Update_Own_Profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- INSERT: User can only insert their own profile
CREATE POLICY "Fix_Insert_Own_Profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);
