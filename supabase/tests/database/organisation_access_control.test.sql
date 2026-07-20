begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(43);

insert into auth.users (
  id,
  aud,
  role,
  email,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  is_anonymous
)
values
  (
    'e1000000-0000-4000-8000-000000000001',
    'authenticated',
    'authenticated',
    'owner-one@example.test',
    '{}'::jsonb,
    '{}'::jsonb,
    now(),
    now(),
    false
  ),
  (
    'e2000000-0000-4000-8000-000000000002',
    'authenticated',
    'authenticated',
    'owner-two@example.test',
    '{}'::jsonb,
    '{}'::jsonb,
    now(),
    now(),
    false
  ),
  (
    'e3000000-0000-4000-8000-000000000003',
    'authenticated',
    'authenticated',
    'atomic-failure@example.test',
    '{}'::jsonb,
    '{}'::jsonb,
    now(),
    now(),
    false
  ),
  (
    'e4000000-0000-4000-8000-000000000004',
    'authenticated',
    'authenticated',
    'anonymous-user@example.test',
    '{}'::jsonb,
    '{}'::jsonb,
    now(),
    now(),
    true
  ),
  (
    'e5000000-0000-4000-8000-000000000005',
    'authenticated',
    'authenticated',
    'duplicate-slug@example.test',
    '{}'::jsonb,
    '{}'::jsonb,
    now(),
    now(),
    false
  );

select ok(
  not exists (
    select 1
    from pg_catalog.pg_proc as procedure
    cross join lateral pg_catalog.aclexplode(
      coalesce(
        procedure.proacl,
        pg_catalog.acldefault('f', procedure.proowner)
      )
    ) as privilege
    where procedure.oid = 'public.onboard_organisation(text,text,text,text)'::regprocedure
      and privilege.grantee = 0
      and privilege.privilege_type = 'EXECUTE'
  ),
  'PUBLIC cannot execute the onboarding wrapper'
);

select ok(
  not pg_catalog.has_function_privilege(
    'anon',
    'public.onboard_organisation(text,text,text,text)',
    'EXECUTE'
  ),
  'anon cannot execute the onboarding wrapper'
);

select ok(
  not exists (
    select 1
    from pg_catalog.pg_proc as procedure
    cross join lateral pg_catalog.aclexplode(
      coalesce(
        procedure.proacl,
        pg_catalog.acldefault('f', procedure.proowner)
      )
    ) as privilege
    where procedure.oid = 'private.is_active_organisation_member(uuid)'::regprocedure
      and privilege.grantee = 0
      and privilege.privilege_type = 'EXECUTE'
  ),
  'PUBLIC cannot execute the active-membership helper'
);

select ok(
  not pg_catalog.has_function_privilege(
    'anon',
    'private.is_active_organisation_member(uuid)',
    'EXECUTE'
  ),
  'anon cannot execute the active-membership helper'
);

select ok(
  not exists (
    select 1
    from pg_catalog.pg_proc as procedure
    cross join lateral pg_catalog.aclexplode(
      coalesce(
        procedure.proacl,
        pg_catalog.acldefault('f', procedure.proowner)
      )
    ) as privilege
    where procedure.oid = 'private.has_organisation_role(uuid,text[])'::regprocedure
      and privilege.grantee = 0
      and privilege.privilege_type = 'EXECUTE'
  ),
  'PUBLIC cannot execute the role helper'
);

select ok(
  not pg_catalog.has_function_privilege(
    'anon',
    'private.has_organisation_role(uuid,text[])',
    'EXECUTE'
  ),
  'anon cannot execute the role helper'
);

select ok(
  not exists (
    select 1
    from pg_catalog.pg_proc as procedure
    cross join lateral pg_catalog.aclexplode(
      coalesce(
        procedure.proacl,
        pg_catalog.acldefault('f', procedure.proowner)
      )
    ) as privilege
    where procedure.oid = 'private.onboard_organisation(text,text,text,text)'::regprocedure
      and privilege.grantee = 0
      and privilege.privilege_type = 'EXECUTE'
  ),
  'PUBLIC cannot execute the private onboarding implementation'
);

select ok(
  not pg_catalog.has_function_privilege(
    'anon',
    'private.onboard_organisation(text,text,text,text)',
    'EXECUTE'
  ),
  'anon cannot execute the private onboarding implementation'
);

select ok(
  not pg_catalog.has_function_privilege(
    'authenticated',
    'private.has_organisation_role(uuid,text[])',
    'EXECUTE'
  ),
  'authenticated has no direct role-helper execution privilege yet'
);

set local role anon;
set local "request.jwt.claims" = '{}';

select throws_ok(
  $$
    select *
    from public.onboard_organisation(
      'Anonymous Organisation',
      'anonymous-organisation',
      'Anonymous User'
    )
  $$,
  '42501',
  'permission denied for function onboard_organisation',
  'an anon database role cannot onboard an organisation'
);

reset role;
set local role authenticated;
set local "request.jwt.claims" =
  '{"sub":"e4000000-0000-4000-8000-000000000004","role":"authenticated","is_anonymous":true}';

select throws_ok(
  $$
    select *
    from public.onboard_organisation(
      'Anonymous Auth Organisation',
      'anonymous-auth-organisation',
      'Anonymous Auth User'
    )
  $$,
  '42501',
  'Anonymous users cannot onboard an organisation.',
  'an authenticated anonymous Auth user cannot onboard an organisation'
);

reset role;
set local role authenticated;
set local "request.jwt.claims" =
  '{"sub":"e1000000-0000-4000-8000-000000000001","role":"authenticated","is_anonymous":false}';

select lives_ok(
  $$
    select *
    from public.onboard_organisation(
      '  Alpha   Roster  ',
      'Alpha-Team',
      '  Alice   Owner  ',
      'Australia/Brisbane'
    )
  $$,
  'an authenticated user can onboard one organisation'
);

select is(
  (
    select profile.full_name
    from public.profiles as profile
    where profile.id = 'e1000000-0000-4000-8000-000000000001'
  ),
  'Alice Owner',
  'onboarding creates and normalises the owner profile'
);

select is(
  (
    select organisation.name || '|' || organisation.slug || '|' || organisation.timezone
    from public.organisations as organisation
    where organisation.slug = 'alpha-team'
  ),
  'Alpha Roster|alpha-team|Australia/Brisbane',
  'the owner can read the normalised organisation'
);

select is(
  (
    select membership.role::text || '|' || membership.status::text
    from public.organisation_members as membership
    join public.organisations as organisation
      on organisation.id = membership.organisation_id
    where membership.user_id = 'e1000000-0000-4000-8000-000000000001'
      and organisation.slug = 'alpha-team'
  ),
  'owner|active',
  'onboarding creates an active owner membership readable by its owner'
);

select ok(
  private.is_active_organisation_member(
    (
      select organisation.id
      from public.organisations as organisation
      where organisation.slug = 'alpha-team'
    )
  ),
  'the active-membership helper recognises the owner'
);

reset role;
set local "request.jwt.claims" =
  '{"sub":"e1000000-0000-4000-8000-000000000001","role":"authenticated","is_anonymous":false}';

select ok(
  private.has_organisation_role(
    (
      select organisation.id
      from public.organisations as organisation
      where organisation.slug = 'alpha-team'
    ),
    array['owner']
  ),
  'the role helper recognises an allowed active owner role'
);

select throws_ok(
  $$
    select private.has_organisation_role(
      (
        select organisation.id
        from public.organisations as organisation
        where organisation.slug = 'alpha-team'
      ),
      array['invalid-role']
    )
  $$,
  '22023',
  'Allowed roles contain an invalid organisation role.',
  'the role helper rejects invalid role values'
);

set local role authenticated;

select throws_ok(
  $$
    select *
    from public.onboard_organisation(
      'Second Organisation',
      'second-organisation',
      'Alice Changed'
    )
  $$,
  'P0001',
  'An active organisation membership already exists.',
  'a second onboarding attempt by the same user is rejected'
);

select is(
  (
    select count(*)
    from public.organisation_members as membership
    where membership.user_id = 'e1000000-0000-4000-8000-000000000001'
      and membership.status = 'active'::public.organisation_member_status
  ),
  1::bigint,
  'the rejected second onboarding leaves exactly one active membership'
);

reset role;
set local role authenticated;
set local "request.jwt.claims" =
  '{"sub":"e2000000-0000-4000-8000-000000000002","role":"authenticated","is_anonymous":false}';

select is(
  (
    select count(*)
    from public.profiles as profile
    where profile.id = 'e1000000-0000-4000-8000-000000000001'
  ),
  0::bigint,
  'another user cannot read the first user profile'
);

select is(
  (
    select count(*)
    from public.organisations as organisation
    where organisation.slug = 'alpha-team'
  ),
  0::bigint,
  'another user cannot read the first user organisation'
);

select is(
  (
    select count(*)
    from public.organisation_members as membership
    where membership.user_id = 'e1000000-0000-4000-8000-000000000001'
  ),
  0::bigint,
  'another user cannot read the first user membership'
);

select lives_ok(
  $$
    select *
    from public.onboard_organisation(
      'Beta Roster',
      'beta-roster',
      'Bob Owner',
      'Australia/Sydney'
    )
  $$,
  'a second authenticated user can onboard a separate organisation'
);

select is(
  (
    select profile.full_name
    from public.profiles as profile
    where profile.id = 'e2000000-0000-4000-8000-000000000002'
  ),
  'Bob Owner',
  'the second owner can read their own profile'
);

select is(
  (
    select organisation.slug
    from public.organisations as organisation
    where organisation.slug = 'beta-roster'
  ),
  'beta-roster',
  'the second owner can read their own organisation'
);

select is(
  (
    select membership.role::text || '|' || membership.status::text
    from public.organisation_members as membership
    where membership.user_id = 'e2000000-0000-4000-8000-000000000002'
  ),
  'owner|active',
  'the second owner can read their own active owner membership'
);

select is(
  (
    select count(*)
    from public.organisations as organisation
    where organisation.slug = 'alpha-team'
  ),
  0::bigint,
  'the second owner remains isolated from the first organisation'
);

select throws_ok(
  $$
    insert into public.organisations (name, slug, timezone)
    values ('Direct Organisation', 'direct-organisation', 'Australia/Brisbane')
  $$,
  '42501',
  'permission denied for table organisations',
  'authenticated users cannot directly insert organisations'
);

select throws_ok(
  $$
    insert into public.organisation_members (
      organisation_id,
      user_id,
      role,
      status
    )
    select
      organisation.id,
      'e1000000-0000-4000-8000-000000000001',
      'viewer'::public.organisation_member_role,
      'active'::public.organisation_member_status
    from public.organisations as organisation
    where organisation.slug = 'beta-roster'
  $$,
  '42501',
  'permission denied for table organisation_members',
  'authenticated users cannot directly insert organisation memberships'
);

select throws_ok(
  $$
    insert into public.profiles (id, full_name)
    values ('e5000000-0000-4000-8000-000000000005', 'Direct Profile')
  $$,
  '42501',
  'permission denied for table profiles',
  'authenticated users cannot directly insert profiles'
);

select is(
  (
    select count(*)
    from (
      values
        ('sites'),
        ('employees'),
        ('skills'),
        ('employee_skills'),
        ('shift_templates'),
        ('roster_periods'),
        ('employee_roster_goals'),
        ('shift_requirements'),
        ('shift_skill_requirements'),
        ('employee_availability_rules'),
        ('employee_availability_exceptions'),
        ('employee_preferences')
    ) as operational_table(table_name)
    where pg_catalog.has_table_privilege(
      'authenticated',
      'public.' || operational_table.table_name,
      'SELECT'
    )
  ),
  0::bigint,
  'authenticated has no SELECT grant on any operational table'
);

select throws_ok(
  $$select * from public.sites$$,
  '42501',
  'permission denied for table sites',
  'an authenticated user cannot query an operational table'
);

select lives_ok(
  $$
    update public.profiles
    set full_name = 'Bob Updated'
    where id = 'e2000000-0000-4000-8000-000000000002'
  $$,
  'an authenticated user can update their own profile'
);

select is(
  (
    select profile.full_name
    from public.profiles as profile
    where profile.id = 'e2000000-0000-4000-8000-000000000002'
  ),
  'Bob Updated',
  'the owner sees their updated profile'
);

select results_eq(
  $$
    update public.profiles
    set full_name = 'Unauthorised Change'
    where id = 'e1000000-0000-4000-8000-000000000001'
    returning 1
  $$,
  $$select 1 where false$$,
  'an authenticated user cannot update another user profile'
);

reset role;
set local role authenticated;
set local "request.jwt.claims" =
  '{"sub":"e1000000-0000-4000-8000-000000000001","role":"authenticated","is_anonymous":false}';

select is(
  (
    select count(*)
    from public.organisations as organisation
    where organisation.slug = 'beta-roster'
  ),
  0::bigint,
  'the first owner remains isolated from the second organisation'
);

reset role;

create function private.reject_atomic_test_membership()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception using
    errcode = 'P0001',
    message = 'Forced membership failure.';
end;
$$;

revoke all on function private.reject_atomic_test_membership()
  from public, anon, authenticated;

create trigger reject_atomic_test_membership
before insert on public.organisation_members
for each row
when (new.user_id = 'e3000000-0000-4000-8000-000000000003')
execute function private.reject_atomic_test_membership();

set local role authenticated;
set local "request.jwt.claims" =
  '{"sub":"e3000000-0000-4000-8000-000000000003","role":"authenticated","is_anonymous":false}';

select throws_ok(
  $$
    select *
    from public.onboard_organisation(
      'Atomic Roster',
      'atomic-roster',
      'Atomic Owner'
    )
  $$,
  'P0001',
  'Forced membership failure.',
  'a late membership failure aborts onboarding'
);

reset role;

select is(
  (
    select count(*)
    from public.profiles as profile
    where profile.id = 'e3000000-0000-4000-8000-000000000003'
  ),
  0::bigint,
  'atomic failure rolls back the profile insert'
);

select is(
  (
    select count(*)
    from public.organisations as organisation
    where organisation.slug = 'atomic-roster'
  ),
  0::bigint,
  'atomic failure rolls back the organisation insert'
);

select is(
  (
    select count(*)
    from public.organisation_members as membership
    where membership.user_id = 'e3000000-0000-4000-8000-000000000003'
  ),
  0::bigint,
  'atomic failure leaves no membership'
);

set local role authenticated;
set local "request.jwt.claims" =
  '{"sub":"e5000000-0000-4000-8000-000000000005","role":"authenticated","is_anonymous":false}';

select throws_ok(
  $$
    select *
    from public.onboard_organisation(
      'Duplicate Slug Roster',
      'alpha-team',
      'Duplicate Slug Owner'
    )
  $$,
  'P0001',
  'Organisation slug is already in use.',
  'duplicate organisation slugs return a safe error'
);

reset role;

select is(
  (
    select count(*)
    from public.profiles as profile
    where profile.id = 'e5000000-0000-4000-8000-000000000005'
  ),
  0::bigint,
  'duplicate-slug failure leaves no profile'
);

select * from finish();

rollback;
