-- One private dashboard per authenticated account.
create table public.dashboard_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  revision bigint not null default 1 check (revision > 0),
  snapshot jsonb not null check (
    jsonb_typeof(snapshot) = 'object'
    and snapshot ?& array['weekly', 'content', 'conversion']
    and jsonb_typeof(snapshot->'weekly') = 'array'
    and jsonb_typeof(snapshot->'content') = 'array'
    and jsonb_typeof(snapshot->'conversion') = 'array'
  )
);

alter table public.dashboard_state enable row level security;
revoke all on public.dashboard_state from public, anon, authenticated;
grant select, insert, update on public.dashboard_state to authenticated;
create policy dashboard_read on public.dashboard_state for select to authenticated
  using ((select auth.uid()) = user_id);
create policy dashboard_insert on public.dashboard_state for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy dashboard_update on public.dashboard_state for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
