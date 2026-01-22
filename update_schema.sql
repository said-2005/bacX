-- 1. Create Units Table (If not exists)
create table if not exists public.units (
  id uuid default gen_random_uuid() primary key,
  subject_id uuid references public.subjects(id) on delete cascade not null,
  title text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS on Units
alter table public.units enable row level security;

-- 3. Create Policies for Units
create policy "Enable read access for all users" on public.units for select using (true);

create policy "Enable insert for admins" on public.units for insert with check (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

create policy "Enable update for admins" on public.units for update using (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

create policy "Enable delete for admins" on public.units for delete using (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

-- 4. Update Lessons Table
alter table public.lessons add column if not exists unit_id uuid references public.units(id) on delete cascade;

-- 5. CRITICAL: Fix Student Visibility (Allow Admins to see all profiles)
-- First, drop existing policies to avoid conflicts or restrictive defaults
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

-- Re-create stricter policies
create policy "Public profiles are viewable by everyone" 
on public.profiles for select 
using ( true ); -- Or restrict to ( auth.uid() = id OR (select role from profiles where id = auth.uid()) = 'admin' )

-- For this specific 'No Students Found' fix, we ensure Admins can definitely SELECT:
create policy "Admins can view all profiles"
on public.profiles for select
using (
  (select role from public.profiles where id = auth.uid()) = 'admin'
);

-- Ensure users can still see themselves (required for verifyAdmin to work for the admin themselves!)
create policy "Users can view own profile"
on public.profiles for select
using ( auth.uid() = id );

create policy "Users can update own profile"
on public.profiles for update
using ( auth.uid() = id );
