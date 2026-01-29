-- PART 1: FIX SCHEMA RELATIONSHIPS
-- Add branch_id only if it doesn't exist, and ensure it links to branches(id)

-- 1. Create branches table if it doesn't exist (safety check)
CREATE TABLE IF NOT EXISTS public.branches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add branch_id to profiles if missing and link it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'branch_id') THEN
        ALTER TABLE public.profiles ADD COLUMN branch_id UUID REFERENCES public.branches(id);
    ELSE
        -- If column exists but no FK, add it (try/catch block implicitly handled by separate statement if using tool, but here we assume clean run)
        -- For safety, we can drop and re-add constraint if unsure, but let's just add if not exists
        NULL; -- Placeholder
    END IF;
END $$;

-- Ensure the constraint exists (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_branch_id_fkey') THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_branch_id_fkey 
        FOREIGN KEY (branch_id) REFERENCES public.branches(id);
    END IF;
END $$;


-- PART 2: DATA CLEANUP (SUBJECTS)
-- 1. Delete invalid legacy subjects
DELETE FROM public.subjects 
WHERE id IN ('math', 'physics', 'science', 'tech', 'gest', 'letter', 'lang');

-- 2. Insert correct subjects with UUIDs
INSERT INTO public.subjects (id, name, icon, branch_id)
VALUES 
  (gen_random_uuid(), 'Mathematics', 'Calculator', NULL), -- Update branch_id if specific subjects belong to branches
  (gen_random_uuid(), 'Physics', 'Atom', NULL),
  (gen_random_uuid(), 'Natural Sciences', 'Dna', NULL),
  (gen_random_uuid(), 'Literature', 'Book', NULL),
  (gen_random_uuid(), 'English', 'Languages', NULL)
ON CONFLICT (name) DO NOTHING;
-- Note: 'icon' column name is assumed based on common schemas, adjust if 'image_url' or similar. 
-- If 'branch_id' column exists in subjects, update it properly.


-- PART 3: REPAIR PROFILES (Optional: Map existing major_id to new branch_id if needed)
-- UPDATE public.profiles SET branch_id = CAST(major_id AS UUID) WHERE major_id IS NOT NULL AND branch_id IS NULL; -- Only if major_id was holding valid UUIDs
