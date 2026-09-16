-- ══════════════════════════════════════════════════════════
-- 잡담회 바이브코딩 데모데이 — 초기 스키마
-- Supabase SQL Editor에 그대로 붙여넣어 실행합니다.
-- ══════════════════════════════════════════════════════════

-- ── profiles ──────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  avatar_url text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- 가입 시 프로필 자동 생성
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 관리자 여부 헬퍼 (RLS 정책이 profiles를 재귀 참조하지 않도록 security definer)
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- updated_at 자동 갱신
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── events (회차) ─────────────────────────────────────────
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ── projects (결과물) ─────────────────────────────────────
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events on delete cascade,
  owner_id uuid not null references public.profiles on delete cascade,

  title text not null,
  one_liner text not null,
  problem text not null, -- 어떤 문제를 푸는가
  target_customer text not null, -- 누구를 위한 것인가
  solution text not null, -- 어떻게 푸는가

  service_url text,
  demo_video_url text,
  thumbnail_url text,

  ai_tools text[] not null default '{}',
  build_hours numeric(5, 1),
  team_name text,

  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_event_id_idx on public.projects (event_id);
create index if not exists projects_owner_id_idx on public.projects (owner_id);

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- ── ratings (평가) ────────────────────────────────────────
create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects on delete cascade,
  rater_id uuid not null references public.profiles on delete cascade,

  fun smallint not null check (fun between 1 and 5),
  completeness smallint not null check (completeness between 1 and 5),
  problem_value smallint not null check (problem_value between 1 and 5),
  comment text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (project_id, rater_id) -- 1인 1표
);

create index if not exists ratings_project_id_idx on public.ratings (project_id);

drop trigger if exists ratings_set_updated_at on public.ratings;
create trigger ratings_set_updated_at
  before update on public.ratings
  for each row execute function public.set_updated_at();

-- ── project_scores (집계 뷰) ──────────────────────────────
-- MVP라 단순 평균을 쓴다. rating_count를 함께 노출해 표본 수가 보이게 한다.
create or replace view public.project_scores
with (security_invoker = on) as
select
  p.id as project_id,
  count(r.id)::int as rating_count,
  round(avg(r.fun)::numeric, 2) as avg_fun,
  round(avg(r.completeness)::numeric, 2) as avg_completeness,
  round(avg(r.problem_value)::numeric, 2) as avg_problem_value,
  round(avg((r.fun + r.completeness + r.problem_value) / 3.0)::numeric, 2) as avg_overall
from public.projects p
left join public.ratings r on r.project_id = p.id
group by p.id;

-- ══════════════ RLS ══════════════
alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.projects enable row level security;
alter table public.ratings enable row level security;

-- profiles: 누구나 조회, 본인만 수정
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select using (true);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());

-- events: 누구나 조회, 관리자만 생성/수정/삭제
drop policy if exists events_select on public.events;
create policy events_select on public.events for select using (true);

drop policy if exists events_admin_write on public.events;
create policy events_admin_write on public.events for all
  using (public.is_admin()) with check (public.is_admin());

-- projects: 숨김이 아니면 누구나 조회 (본인/관리자는 숨김도 조회)
drop policy if exists projects_select on public.projects;
create policy projects_select on public.projects for select
  using (not is_hidden or owner_id = auth.uid() or public.is_admin());

drop policy if exists projects_insert_own on public.projects;
create policy projects_insert_own on public.projects for insert
  with check (owner_id = auth.uid());

drop policy if exists projects_update_own on public.projects;
create policy projects_update_own on public.projects for update
  using (owner_id = auth.uid() or public.is_admin())
  with check (owner_id = auth.uid() or public.is_admin());

drop policy if exists projects_delete_own on public.projects;
create policy projects_delete_own on public.projects for delete
  using (owner_id = auth.uid() or public.is_admin());

-- ratings: 누구나 조회 / 로그인 사용자가 본인 명의로, 본인 프로젝트가 아닌 것에만 평가
drop policy if exists ratings_select on public.ratings;
create policy ratings_select on public.ratings for select using (true);

drop policy if exists ratings_insert_own on public.ratings;
create policy ratings_insert_own on public.ratings for insert
  with check (
    rater_id = auth.uid()
    and not exists (
      select 1 from public.projects p
      where p.id = project_id and p.owner_id = auth.uid()
    )
  );

drop policy if exists ratings_update_own on public.ratings;
create policy ratings_update_own on public.ratings for update
  using (rater_id = auth.uid()) with check (rater_id = auth.uid());

drop policy if exists ratings_delete_own on public.ratings;
create policy ratings_delete_own on public.ratings for delete
  using (rater_id = auth.uid() or public.is_admin());

-- ══════════════ Storage (썸네일) ══════════════
insert into storage.buckets (id, name, public)
values ('thumbnails', 'thumbnails', true)
on conflict (id) do nothing;

drop policy if exists thumbnails_public_read on storage.objects;
create policy thumbnails_public_read on storage.objects for select
  using (bucket_id = 'thumbnails');

-- 업로드 경로는 `<user_id>/<filename>` 규칙을 따른다
drop policy if exists thumbnails_own_write on storage.objects;
create policy thumbnails_own_write on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'thumbnails'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists thumbnails_own_delete on storage.objects;
create policy thumbnails_own_delete on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'thumbnails'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ══════════════ 시드: 첫 회차 ══════════════
insert into public.events (slug, title, description, is_active)
values (
  'vibecoding-demoday-1',
  '잡담회 바이브코딩 데모데이',
  'AI와 함께 만든 결과물을 공유하고 서로 피드백하는 자리입니다.',
  true
)
on conflict (slug) do nothing;
