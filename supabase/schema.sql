-- ============================================================================
-- IDEA CIRCLES - DATABASE SCHEMA & ROW LEVEL SECURITY
-- Idempotent script: Safe to run multiple times without duplicate errors
-- ============================================================================

-- 1. PROFILES TABLE
-- Mirrors Supabase auth.users for display names and user metadata
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  created_at timestamptz default now() not null
);

-- Automatically create a profile row whenever a new user signs up via Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- 2. IDEAS TABLE
-- Captures individual ideas with 5 allowed lifecycle statuses
create table if not exists public.ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text default '' not null,
  status text not null check (status in ('spark', 'exploring', 'building', 'shipped', 'parked')) default 'spark',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);


-- 3. CIRCLES TABLE
-- Private groups identified by a random, unguessable invite code (8 chars alphanumeric)
create table if not exists public.circles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text default '',
  invite_code text not null unique default upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 8)),
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now() not null
);


-- 4. CIRCLE_MEMBERS TABLE
-- Junction table mapping users to circles they have joined
create table if not exists public.circle_members (
  circle_id uuid not null references public.circles(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz default now() not null,
  primary key (circle_id, user_id)
);

-- When a user creates a circle, automatically add them as the first member
create or replace function public.handle_circle_created()
returns trigger as $$
begin
  insert into public.circle_members (circle_id, user_id)
  values (new.id, new.created_by)
  on conflict do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_circle_created on public.circles;
create trigger on_circle_created
  after insert on public.circles
  for each row execute function public.handle_circle_created();


-- 5. IDEA_SHARES TABLE
-- Junction table allowing an idea to be shared into one or more circles
create table if not exists public.idea_shares (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null references public.ideas(id) on delete cascade,
  circle_id uuid not null references public.circles(id) on delete cascade,
  shared_at timestamptz default now() not null,
  unique (idea_id, circle_id)
);


-- 6. IDEA_UPDATES TABLE (Progress Notes)
-- Dated notes posted by the idea owner to log milestones and progress
create table if not exists public.idea_updates (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null references public.ideas(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  note text not null,
  created_at timestamptz default now() not null
);


-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- With 'DROP POLICY IF EXISTS' guards so the script can be safely re-run
-- ============================================================================

-- ----------------------------------------------------------------------------
-- PROFILES POLICIES
-- ----------------------------------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists "Authenticated users can view profiles" on public.profiles;
create policy "Authenticated users can view profiles"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);


-- ----------------------------------------------------------------------------
-- CIRCLES POLICIES
-- ----------------------------------------------------------------------------
alter table public.circles enable row level security;

drop policy if exists "Members and creators can view circles" on public.circles;
drop policy if exists "Members and code holders can view circles" on public.circles;
create policy "Members and creators can view circles"
  on public.circles for select
  to authenticated
  using (
    id in (select circle_id from public.circle_members where user_id = auth.uid())
    or created_by = auth.uid()
  );

drop policy if exists "Users can create circles" on public.circles;
create policy "Users can create circles"
  on public.circles for insert
  to authenticated
  with check (auth.uid() = created_by);

drop policy if exists "Creators can update their circles" on public.circles;
create policy "Creators can update their circles"
  on public.circles for update
  to authenticated
  using (auth.uid() = created_by);


-- ----------------------------------------------------------------------------
-- CIRCLE_MEMBERS POLICIES
-- ----------------------------------------------------------------------------
alter table public.circle_members enable row level security;

drop policy if exists "Circle members can see who is in their circle" on public.circle_members;
create policy "Circle members can see who is in their circle"
  on public.circle_members for select
  to authenticated
  using (
    circle_id in (select circle_id from public.circle_members where user_id = auth.uid())
  );

drop policy if exists "Users can join a circle" on public.circle_members;
create policy "Users can join a circle"
  on public.circle_members for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can leave a circle" on public.circle_members;
create policy "Users can leave a circle"
  on public.circle_members for delete
  to authenticated
  using (auth.uid() = user_id);


-- ----------------------------------------------------------------------------
-- HELPER FUNCTION: JOIN CIRCLE WITH CODE
-- ----------------------------------------------------------------------------
create or replace function public.join_circle_with_code(code text)
returns uuid as $$
declare
  target_circle_id uuid;
begin
  select id into target_circle_id
  from public.circles
  where upper(invite_code) = upper(trim(code));

  if target_circle_id is null then
    raise exception 'Invalid invite code';
  end if;

  insert into public.circle_members (circle_id, user_id)
  values (target_circle_id, auth.uid())
  on conflict (circle_id, user_id) do nothing;

  return target_circle_id;
end;
$$ language plpgsql security definer;


-- ----------------------------------------------------------------------------
-- IDEAS POLICIES
-- ----------------------------------------------------------------------------
alter table public.ideas enable row level security;

drop policy if exists "Users can view their own ideas or ideas shared to their circles" on public.ideas;
create policy "Users can view their own ideas or ideas shared to their circles"
  on public.ideas for select
  to authenticated
  using (
    user_id = auth.uid()
    or id in (
      select s.idea_id
      from public.idea_shares s
      join public.circle_members m on s.circle_id = m.circle_id
      where m.user_id = auth.uid()
    )
  );

drop policy if exists "Users can create ideas" on public.ideas;
create policy "Users can create ideas"
  on public.ideas for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can edit their own ideas" on public.ideas;
create policy "Users can edit their own ideas"
  on public.ideas for update
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can delete their own ideas" on public.ideas;
create policy "Users can delete their own ideas"
  on public.ideas for delete
  to authenticated
  using (auth.uid() = user_id);


-- ----------------------------------------------------------------------------
-- IDEA_SHARES POLICIES
-- ----------------------------------------------------------------------------
alter table public.idea_shares enable row level security;

drop policy if exists "View idea shares" on public.idea_shares;
create policy "View idea shares"
  on public.idea_shares for select
  to authenticated
  using (
    circle_id in (select circle_id from public.circle_members where user_id = auth.uid())
    or idea_id in (select id from public.ideas where user_id = auth.uid())
  );

drop policy if exists "Idea owner can share their idea" on public.idea_shares;
create policy "Idea owner can share their idea"
  on public.idea_shares for insert
  to authenticated
  with check (
    idea_id in (select id from public.ideas where user_id = auth.uid())
  );

drop policy if exists "Idea owner can unshare their idea" on public.idea_shares;
create policy "Idea owner can unshare their idea"
  on public.idea_shares for delete
  to authenticated
  using (
    idea_id in (select id from public.ideas where user_id = auth.uid())
  );


-- ----------------------------------------------------------------------------
-- IDEA_UPDATES POLICIES (Progress Notes)
-- ----------------------------------------------------------------------------
alter table public.idea_updates enable row level security;

drop policy if exists "View progress notes" on public.idea_updates;
create policy "View progress notes"
  on public.idea_updates for select
  to authenticated
  using (
    user_id = auth.uid()
    or idea_id in (
      select s.idea_id
      from public.idea_shares s
      join public.circle_members m on s.circle_id = m.circle_id
      where m.user_id = auth.uid()
    )
  );

drop policy if exists "Idea owner can add progress notes" on public.idea_updates;
create policy "Idea owner can add progress notes"
  on public.idea_updates for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and idea_id in (select id from public.ideas where user_id = auth.uid())
  );

drop policy if exists "Idea owner can delete their progress notes" on public.idea_updates;
create policy "Idea owner can delete their progress notes"
  on public.idea_updates for delete
  to authenticated
  using (auth.uid() = user_id);
