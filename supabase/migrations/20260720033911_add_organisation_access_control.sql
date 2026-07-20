create schema if not exists private;

revoke all on schema private from public, anon, authenticated;

create function private.is_active_organisation_member(organisation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organisation_members as membership
    where membership.organisation_id = $1
      and membership.user_id = (select auth.uid())
      and membership.status = 'active'::public.organisation_member_status
  );
$$;

create function private.has_organisation_role(
  organisation_id uuid,
  allowed_roles text[]
)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if $1 is null or $2 is null or pg_catalog.cardinality($2) = 0 then
    return false;
  end if;

  if exists (
    select 1
    from pg_catalog.unnest($2) as allowed(role_name)
    where allowed.role_name is null
      or allowed.role_name not in (
        'owner',
        'admin',
        'scheduler',
        'manager',
        'viewer'
      )
  ) then
    raise exception using
      errcode = '22023',
      message = 'Allowed roles contain an invalid organisation role.';
  end if;

  return exists (
    select 1
    from public.organisation_members as membership
    where membership.organisation_id = $1
      and membership.user_id = (select auth.uid())
      and membership.status = 'active'::public.organisation_member_status
      and membership.role::text = any ($2)
  );
end;
$$;

create function private.onboard_organisation(
  organisation_name text,
  organisation_slug text,
  profile_full_name text,
  organisation_timezone text default 'Australia/Brisbane'
)
returns table (
  organisation_id uuid,
  name text,
  slug text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  normalised_organisation_name text;
  normalised_slug text;
  normalised_profile_full_name text;
  normalised_timezone text;
  new_organisation_id uuid;
begin
  if current_user_id is null then
    raise exception using
      errcode = '42501',
      message = 'Authentication is required.';
  end if;

  if coalesce((select auth.jwt() ->> 'is_anonymous') = 'true', false) then
    raise exception using
      errcode = '42501',
      message = 'Anonymous users cannot onboard an organisation.';
  end if;

  normalised_organisation_name := pg_catalog.regexp_replace(
    pg_catalog.btrim(organisation_name),
    '[[:space:]]+',
    ' ',
    'g'
  );
  normalised_slug := pg_catalog.lower(pg_catalog.btrim(organisation_slug));
  normalised_profile_full_name := pg_catalog.regexp_replace(
    pg_catalog.btrim(profile_full_name),
    '[[:space:]]+',
    ' ',
    'g'
  );
  normalised_timezone := pg_catalog.btrim(organisation_timezone);

  if normalised_organisation_name is null
    or pg_catalog.char_length(normalised_organisation_name) not between 2 and 100
  then
    raise exception using
      errcode = '22023',
      message = 'Organisation name must be between 2 and 100 characters.';
  end if;

  if normalised_slug is null
    or pg_catalog.char_length(normalised_slug) not between 3 and 63
    or normalised_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  then
    raise exception using
      errcode = '22023',
      message = 'Organisation slug must be 3 to 63 lowercase letters, numbers, or single hyphens.';
  end if;

  if normalised_profile_full_name is null
    or pg_catalog.char_length(normalised_profile_full_name) not between 2 and 100
  then
    raise exception using
      errcode = '22023',
      message = 'Profile name must be between 2 and 100 characters.';
  end if;

  if normalised_timezone is null
    or not exists (
      select 1
      from pg_catalog.pg_timezone_names as timezone_name
      where timezone_name.name = normalised_timezone
    )
  then
    raise exception using
      errcode = '22023',
      message = 'Organisation timezone is invalid.';
  end if;

  perform 1
  from auth.users as auth_user
  where auth_user.id = current_user_id
  for update;

  if not found then
    raise exception using
      errcode = '42501',
      message = 'Authentication is required.';
  end if;

  if exists (
    select 1
    from public.organisation_members as membership
    where membership.user_id = current_user_id
      and membership.status = 'active'::public.organisation_member_status
  ) then
    raise exception using
      errcode = 'P0001',
      message = 'An active organisation membership already exists.';
  end if;

  if exists (
    select 1
    from public.organisations as organisation
    where organisation.slug = normalised_slug
  ) then
    raise exception using
      errcode = 'P0001',
      message = 'Organisation slug is already in use.';
  end if;

  insert into public.profiles (id, full_name)
  values (current_user_id, normalised_profile_full_name)
  on conflict (id) do update
  set full_name = excluded.full_name;

  begin
    insert into public.organisations (name, slug, timezone, active)
    values (
      normalised_organisation_name,
      normalised_slug,
      normalised_timezone,
      true
    )
    returning id into new_organisation_id;
  exception
    when unique_violation then
      raise exception using
        errcode = 'P0001',
        message = 'Organisation slug is already in use.';
  end;

  insert into public.organisation_members (
    organisation_id,
    user_id,
    role,
    status
  )
  values (
    new_organisation_id,
    current_user_id,
    'owner'::public.organisation_member_role,
    'active'::public.organisation_member_status
  );

  return query
  select
    new_organisation_id,
    normalised_organisation_name,
    normalised_slug;
end;
$$;

create function public.onboard_organisation(
  organisation_name text,
  organisation_slug text,
  profile_full_name text,
  organisation_timezone text default 'Australia/Brisbane'
)
returns table (
  organisation_id uuid,
  name text,
  slug text
)
language sql
security invoker
set search_path = ''
as $$
  select *
  from private.onboard_organisation($1, $2, $3, $4);
$$;

revoke all on all functions in schema private from public, anon, authenticated;
revoke all on function public.onboard_organisation(text, text, text, text)
  from public, anon, authenticated;

grant usage on schema private to authenticated;
grant execute on function private.is_active_organisation_member(uuid)
  to authenticated;
grant execute on function private.onboard_organisation(text, text, text, text)
  to authenticated;
grant execute on function public.onboard_organisation(text, text, text, text)
  to authenticated;

comment on schema private is
  'Non-exposed application authorization and privileged implementation functions.';
comment on function private.is_active_organisation_member(uuid) is
  'SECURITY DEFINER membership lookup used by RLS. Authenticated execution is required by the organisations policy; the schema is not exposed through the Data API.';
comment on function private.has_organisation_role(uuid, text[]) is
  'Owner-only SECURITY DEFINER role lookup reserved for future RLS policies.';
comment on function private.onboard_organisation(text, text, text, text) is
  'SECURITY DEFINER onboarding implementation. Authenticated execution is required because the public wrapper is SECURITY INVOKER; the private schema is not exposed through the Data API.';
comment on function public.onboard_organisation(text, text, text, text) is
  'Authenticated Data API wrapper for transactional organisation onboarding.';

revoke all on table
  public.organisations,
  public.profiles,
  public.organisation_members,
  public.sites,
  public.employees,
  public.skills,
  public.employee_skills,
  public.shift_templates,
  public.roster_periods,
  public.employee_roster_goals,
  public.shift_requirements,
  public.shift_skill_requirements,
  public.employee_availability_rules,
  public.employee_availability_exceptions,
  public.employee_preferences
from public, anon, authenticated;

grant select, update on table public.profiles to authenticated;
grant select on table public.organisations to authenticated;
grant select on table public.organisation_members to authenticated;

create policy profiles_select_own
on public.profiles
for select
to authenticated
using (id = (select auth.uid()));

create policy profiles_update_own
on public.profiles
for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy organisations_select_for_active_members
on public.organisations
for select
to authenticated
using ((select private.is_active_organisation_member(id)));

create policy organisation_members_select_own
on public.organisation_members
for select
to authenticated
using (user_id = (select auth.uid()));
