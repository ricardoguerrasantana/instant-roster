begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(68);

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
  ('f1000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'employee-owner@example.test', '{}'::jsonb, '{}'::jsonb, now(), now(), false),
  ('f2000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'employee-admin@example.test', '{}'::jsonb, '{}'::jsonb, now(), now(), false),
  ('f3000000-0000-4000-8000-000000000003', 'authenticated', 'authenticated', 'employee-manager@example.test', '{}'::jsonb, '{}'::jsonb, now(), now(), false),
  ('f4000000-0000-4000-8000-000000000004', 'authenticated', 'authenticated', 'employee-scheduler@example.test', '{}'::jsonb, '{}'::jsonb, now(), now(), false),
  ('f5000000-0000-4000-8000-000000000005', 'authenticated', 'authenticated', 'employee-viewer@example.test', '{}'::jsonb, '{}'::jsonb, now(), now(), false),
  ('f6000000-0000-4000-8000-000000000006', 'authenticated', 'authenticated', 'employee-suspended@example.test', '{}'::jsonb, '{}'::jsonb, now(), now(), false),
  ('f7000000-0000-4000-8000-000000000007', 'authenticated', 'authenticated', 'employee-outsider@example.test', '{}'::jsonb, '{}'::jsonb, now(), now(), false),
  ('f8000000-0000-4000-8000-000000000008', 'authenticated', 'authenticated', 'employee-other-owner@example.test', '{}'::jsonb, '{}'::jsonb, now(), now(), false);

insert into public.profiles (id, full_name)
values
  ('f1000000-0000-4000-8000-000000000001', 'Employee Owner'),
  ('f2000000-0000-4000-8000-000000000002', 'Employee Admin'),
  ('f3000000-0000-4000-8000-000000000003', 'Employee Manager'),
  ('f4000000-0000-4000-8000-000000000004', 'Employee Scheduler'),
  ('f5000000-0000-4000-8000-000000000005', 'Employee Viewer'),
  ('f6000000-0000-4000-8000-000000000006', 'Suspended Manager'),
  ('f7000000-0000-4000-8000-000000000007', 'Employee Outsider'),
  ('f8000000-0000-4000-8000-000000000008', 'Other Owner');

insert into public.organisations (id, name, slug, timezone)
values
  ('a1000000-0000-4000-8000-000000000001', 'Employee Alpha', 'employee-alpha', 'Australia/Brisbane'),
  ('a2000000-0000-4000-8000-000000000002', 'Employee Beta', 'employee-beta', 'Australia/Brisbane');

insert into public.organisation_members (
  organisation_id,
  user_id,
  role,
  status
)
values
  ('a1000000-0000-4000-8000-000000000001', 'f1000000-0000-4000-8000-000000000001', 'owner', 'active'),
  ('a1000000-0000-4000-8000-000000000001', 'f2000000-0000-4000-8000-000000000002', 'admin', 'active'),
  ('a1000000-0000-4000-8000-000000000001', 'f3000000-0000-4000-8000-000000000003', 'manager', 'active'),
  ('a1000000-0000-4000-8000-000000000001', 'f4000000-0000-4000-8000-000000000004', 'scheduler', 'active'),
  ('a1000000-0000-4000-8000-000000000001', 'f5000000-0000-4000-8000-000000000005', 'viewer', 'active'),
  ('a1000000-0000-4000-8000-000000000001', 'f6000000-0000-4000-8000-000000000006', 'manager', 'suspended'),
  ('a2000000-0000-4000-8000-000000000002', 'f8000000-0000-4000-8000-000000000008', 'owner', 'active');

insert into public.employees (
  id,
  organisation_id,
  employee_code,
  full_name,
  employment_type,
  default_target_hours,
  default_minimum_desired_hours,
  default_maximum_desired_hours,
  default_maximum_allowed_hours,
  active,
  updated_at
)
values
  ('b1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'ALPHA-1', 'Alpha Active', 'full_time', 38, 0, 38, 38, true, '2026-01-01 00:00:00+00'),
  ('b1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000001', 'ALPHA-2', 'Alpha Inactive', 'part_time', 20, 0, 20, 20, false, '2026-01-01 00:00:00+00'),
  ('b1000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000001', 'OWNER-UPD', 'Owner Update', 'casual', 10, 0, 10, 10, true, '2026-01-01 00:00:00+00'),
  ('b1000000-0000-4000-8000-000000000004', 'a1000000-0000-4000-8000-000000000001', 'ADMIN-UPD', 'Admin Update', 'casual', 10, 0, 10, 10, true, '2026-01-01 00:00:00+00'),
  ('b1000000-0000-4000-8000-000000000005', 'a1000000-0000-4000-8000-000000000001', 'MANAGER-UPD', 'Manager Update', 'casual', 10, 0, 10, 10, true, '2026-01-01 00:00:00+00'),
  ('b1000000-0000-4000-8000-000000000006', 'a1000000-0000-4000-8000-000000000001', 'STATUS-1', 'Status Employee', 'contractor', 10, 0, 10, 10, true, '2026-01-01 00:00:00+00'),
  ('b2000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000002', 'BETA-1', 'Beta Employee', 'full_time', 38, 0, 38, 38, true, '2026-01-01 00:00:00+00');

insert into public.skills (id, organisation_id, name)
values (
  'c1000000-0000-4000-8000-000000000001',
  'a1000000-0000-4000-8000-000000000001',
  'Employee Test Skill'
);

insert into public.employee_skills (
  id,
  organisation_id,
  employee_id,
  skill_id
)
values (
  'd1000000-0000-4000-8000-000000000001',
  'a1000000-0000-4000-8000-000000000001',
  'b1000000-0000-4000-8000-000000000006',
  'c1000000-0000-4000-8000-000000000001'
);

select ok(
  (
    select relation.relrowsecurity
    from pg_catalog.pg_class as relation
    where relation.oid = 'public.employees'::regclass
  ),
  'employees has row-level security enabled'
);

select is(
  (
    select count(*)
    from pg_catalog.pg_policies as policy
    where policy.schemaname = 'public'
      and policy.tablename = 'employees'
      and policy.roles = array['authenticated']::name[]
      and policy.cmd in ('SELECT', 'INSERT', 'UPDATE')
  ),
  3::bigint,
  'employees has authenticated-only SELECT, INSERT, and UPDATE policies'
);

select is(
  (
    select count(*)
    from pg_catalog.pg_policies as policy
    where policy.schemaname = 'public'
      and policy.tablename = 'employees'
      and policy.cmd = 'DELETE'
  ),
  0::bigint,
  'employees has no DELETE policy'
);

select ok(
  pg_catalog.has_table_privilege('authenticated', 'public.employees', 'SELECT'),
  'authenticated has employee SELECT privilege'
);

select ok(
  not pg_catalog.has_table_privilege('authenticated', 'public.employees', 'DELETE'),
  'authenticated has no employee DELETE privilege'
);

select ok(
  not pg_catalog.has_table_privilege(
    'anon',
    'public.employees',
    'SELECT, INSERT, UPDATE, DELETE'
  ),
  'anon has no employee table privileges'
);

select ok(
  not exists (
    select 1
    from (
      values ('id'), ('profile_id'), ('created_at'), ('updated_at')
    ) as protected_column(column_name)
    where pg_catalog.has_column_privilege(
      'authenticated',
      'public.employees',
      protected_column.column_name,
      'INSERT'
    )
  ),
  'authenticated cannot insert protected employee columns'
);

select ok(
  not exists (
    select 1
    from (
      values
        ('id'),
        ('organisation_id'),
        ('profile_id'),
        ('created_at'),
        ('updated_at')
    ) as protected_column(column_name)
    where pg_catalog.has_column_privilege(
      'authenticated',
      'public.employees',
      protected_column.column_name,
      'UPDATE'
    )
  ),
  'authenticated cannot update employee ownership or protected columns'
);

select is(
  (
    select count(*)
    from (
      values
        ('organisation_id'),
        ('employee_code'),
        ('full_name'),
        ('employment_type'),
        ('default_target_hours'),
        ('default_minimum_desired_hours'),
        ('default_maximum_desired_hours'),
        ('default_maximum_allowed_hours'),
        ('default_overtime_preference'),
        ('active'),
        ('notes')
    ) as insert_column(column_name)
    where pg_catalog.has_column_privilege(
      'authenticated',
      'public.employees',
      insert_column.column_name,
      'INSERT'
    )
  ),
  11::bigint,
  'authenticated can insert only the employee ownership and editable fields required by the feature'
);

select is(
  (
    select count(*)
    from (
      values
        ('employee_code'),
        ('full_name'),
        ('employment_type'),
        ('default_target_hours'),
        ('default_minimum_desired_hours'),
        ('default_maximum_desired_hours'),
        ('default_maximum_allowed_hours'),
        ('default_overtime_preference'),
        ('active'),
        ('notes')
    ) as update_column(column_name)
    where pg_catalog.has_column_privilege(
      'authenticated',
      'public.employees',
      update_column.column_name,
      'UPDATE'
    )
  ),
  10::bigint,
  'authenticated can update the ten employee-managed fields'
);

select ok(
  pg_catalog.has_function_privilege(
    'authenticated',
    'private.has_organisation_role(uuid,text[])',
    'EXECUTE'
  ),
  'authenticated can execute the role helper used by employee write policies'
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
    where procedure.oid = 'private.normalise_employee_fields()'::regprocedure
      and privilege.grantee = 0
      and privilege.privilege_type = 'EXECUTE'
  ),
  'PUBLIC cannot execute the employee normalisation trigger function'
);

select ok(
  not pg_catalog.has_function_privilege(
    'authenticated',
    'private.normalise_employee_fields()',
    'EXECUTE'
  ),
  'authenticated cannot directly execute the employee normalisation trigger function'
);

set local role anon;
set local "request.jwt.claims" = '{}';

select throws_ok(
  $$select * from public.employees$$,
  '42501',
  'permission denied for table employees',
  'anon cannot read employees'
);

reset role;
set local role authenticated;
set local "request.jwt.claims" =
  '{"sub":"f1000000-0000-4000-8000-000000000001","role":"authenticated","is_anonymous":false}';

select is(
  (select count(*) from public.employees),
  6::bigint,
  'an active owner can read all active and inactive employees in their organisation'
);

select is(
  (select count(*) from public.employees where not active),
  1::bigint,
  'an active owner can read inactive employees'
);

select is(
  (
    select count(*)
    from public.employees
    where id = 'b2000000-0000-4000-8000-000000000001'
  ),
  0::bigint,
  'an owner cannot read another organisation employee'
);

reset role;
set local role authenticated;
set local "request.jwt.claims" =
  '{"sub":"f2000000-0000-4000-8000-000000000002","role":"authenticated","is_anonymous":false}';

select is(
  (select count(*) from public.employees),
  6::bigint,
  'an active admin can read their organisation employees'
);

reset role;
set local role authenticated;
set local "request.jwt.claims" =
  '{"sub":"f3000000-0000-4000-8000-000000000003","role":"authenticated","is_anonymous":false}';

select is(
  (select count(*) from public.employees),
  6::bigint,
  'an active manager can read their organisation employees'
);

reset role;
set local role authenticated;
set local "request.jwt.claims" =
  '{"sub":"f4000000-0000-4000-8000-000000000004","role":"authenticated","is_anonymous":false}';

select is(
  (select count(*) from public.employees),
  6::bigint,
  'an active scheduler can read their organisation employees'
);

reset role;
set local role authenticated;
set local "request.jwt.claims" =
  '{"sub":"f5000000-0000-4000-8000-000000000005","role":"authenticated","is_anonymous":false}';

select is(
  (select count(*) from public.employees),
  6::bigint,
  'an active viewer can read their organisation employees'
);

reset role;
set local role authenticated;
set local "request.jwt.claims" =
  '{"sub":"f6000000-0000-4000-8000-000000000006","role":"authenticated","is_anonymous":false}';

select is(
  (select count(*) from public.employees),
  0::bigint,
  'a suspended member cannot read employees'
);

reset role;
set local role authenticated;
set local "request.jwt.claims" =
  '{"sub":"f7000000-0000-4000-8000-000000000007","role":"authenticated","is_anonymous":false}';

select is(
  (select count(*) from public.employees),
  0::bigint,
  'an authenticated user without a membership cannot read employees'
);

reset role;
set local role authenticated;
set local "request.jwt.claims" =
  '{"sub":"f1000000-0000-4000-8000-000000000001","role":"authenticated","is_anonymous":false}';

select lives_ok(
  $$
    insert into public.employees (
      organisation_id,
      employee_code,
      full_name,
      employment_type,
      default_target_hours,
      default_minimum_desired_hours,
      default_maximum_desired_hours,
      default_maximum_allowed_hours,
      notes
    )
    values (
      'a1000000-0000-4000-8000-000000000001',
      '  staff-1  ',
      '  Mary   Jane  ',
      'full_time',
      38,
      0,
      38,
      38,
      'Operational note'
    )
  $$,
  'an owner can create an employee in their organisation'
);

select is(
  (
    select employee_code || '|' || full_name
    from public.employees
    where employee_code = 'STAFF-1'
  ),
  'STAFF-1|Mary Jane',
  'employee codes and names are normalised before storage'
);

reset role;
set local role authenticated;
set local "request.jwt.claims" =
  '{"sub":"f2000000-0000-4000-8000-000000000002","role":"authenticated","is_anonymous":false}';

select lives_ok(
  $$
    insert into public.employees (
      organisation_id,
      employee_code,
      full_name,
      employment_type
    )
    values (
      'a1000000-0000-4000-8000-000000000001',
      'ADMIN-NEW',
      'Admin Created',
      'part_time'
    )
  $$,
  'an admin can create an employee in their organisation'
);

reset role;
set local role authenticated;
set local "request.jwt.claims" =
  '{"sub":"f3000000-0000-4000-8000-000000000003","role":"authenticated","is_anonymous":false}';

select lives_ok(
  $$
    insert into public.employees (
      organisation_id,
      employee_code,
      full_name,
      employment_type
    )
    values (
      'a1000000-0000-4000-8000-000000000001',
      'MANAGER-NEW',
      'Manager Created',
      'casual'
    )
  $$,
  'a manager can create an employee in their organisation'
);

reset role;
set local role authenticated;
set local "request.jwt.claims" =
  '{"sub":"f4000000-0000-4000-8000-000000000004","role":"authenticated","is_anonymous":false}';

select throws_ok(
  $$
    insert into public.employees (
      organisation_id,
      full_name,
      employment_type
    )
    values (
      'a1000000-0000-4000-8000-000000000001',
      'Scheduler Created',
      'casual'
    )
  $$,
  '42501',
  'new row violates row-level security policy for table "employees"',
  'a scheduler cannot create an employee'
);

reset role;
set local role authenticated;
set local "request.jwt.claims" =
  '{"sub":"f5000000-0000-4000-8000-000000000005","role":"authenticated","is_anonymous":false}';

select throws_ok(
  $$
    insert into public.employees (
      organisation_id,
      full_name,
      employment_type
    )
    values (
      'a1000000-0000-4000-8000-000000000001',
      'Viewer Created',
      'casual'
    )
  $$,
  '42501',
  'new row violates row-level security policy for table "employees"',
  'a viewer cannot create an employee'
);

reset role;
set local role authenticated;
set local "request.jwt.claims" =
  '{"sub":"f6000000-0000-4000-8000-000000000006","role":"authenticated","is_anonymous":false}';

select throws_ok(
  $$
    insert into public.employees (
      organisation_id,
      full_name,
      employment_type
    )
    values (
      'a1000000-0000-4000-8000-000000000001',
      'Suspended Created',
      'casual'
    )
  $$,
  '42501',
  'new row violates row-level security policy for table "employees"',
  'a suspended manager cannot create an employee'
);

reset role;
set local role authenticated;
set local "request.jwt.claims" =
  '{"sub":"f7000000-0000-4000-8000-000000000007","role":"authenticated","is_anonymous":false}';

select throws_ok(
  $$
    insert into public.employees (
      organisation_id,
      full_name,
      employment_type
    )
    values (
      'a1000000-0000-4000-8000-000000000001',
      'Outsider Created',
      'casual'
    )
  $$,
  '42501',
  'new row violates row-level security policy for table "employees"',
  'an authenticated user without a membership cannot create an employee'
);

reset role;
set local role authenticated;
set local "request.jwt.claims" =
  '{"sub":"f3000000-0000-4000-8000-000000000003","role":"authenticated","is_anonymous":false}';

select throws_ok(
  $$
    insert into public.employees (
      organisation_id,
      full_name,
      employment_type
    )
    values (
      'a2000000-0000-4000-8000-000000000002',
      'Cross Organisation',
      'casual'
    )
  $$,
  '42501',
  'new row violates row-level security policy for table "employees"',
  'a manager cannot create an employee in another organisation'
);

reset role;
set local role anon;
set local "request.jwt.claims" = '{}';

select throws_ok(
  $$
    insert into public.employees (
      organisation_id,
      full_name,
      employment_type
    )
    values (
      'a1000000-0000-4000-8000-000000000001',
      'Anonymous Created',
      'casual'
    )
  $$,
  '42501',
  'permission denied for table employees',
  'anon cannot create an employee'
);

reset role;
set local role authenticated;
set local "request.jwt.claims" =
  '{"sub":"f3000000-0000-4000-8000-000000000003","role":"authenticated","is_anonymous":false}';

select throws_ok(
  $$
    insert into public.employees (
      organisation_id,
      employee_code,
      full_name,
      employment_type
    )
    values (
      'a1000000-0000-4000-8000-000000000001',
      'staff-1',
      'Duplicate Code',
      'casual'
    )
  $$,
  '23505',
  'duplicate key value violates unique constraint "employees_organisation_employee_code_ci_uidx"',
  'employee codes are unique without regard to case inside an organisation'
);

reset role;
set local role authenticated;
set local "request.jwt.claims" =
  '{"sub":"f8000000-0000-4000-8000-000000000008","role":"authenticated","is_anonymous":false}';

select lives_ok(
  $$
    insert into public.employees (
      organisation_id,
      employee_code,
      full_name,
      employment_type
    )
    values (
      'a2000000-0000-4000-8000-000000000002',
      'staff-1',
      'Other Organisation Code',
      'casual'
    )
  $$,
  'the same employee code is allowed in another organisation'
);

reset role;
set local role authenticated;
set local "request.jwt.claims" =
  '{"sub":"f1000000-0000-4000-8000-000000000001","role":"authenticated","is_anonymous":false}';

select lives_ok(
  $$
    insert into public.employees (
      organisation_id,
      employee_code,
      full_name,
      employment_type
    )
    values (
      'a1000000-0000-4000-8000-000000000001',
      '   ',
      'No Employee Code',
      'other'
    )
  $$,
  'a blank optional employee code is accepted as no code'
);

select is(
  (
    select employee_code
    from public.employees
    where full_name = 'No Employee Code'
  ),
  null,
  'a blank employee code is stored as null'
);

select is(
  (
    select active
    from public.employees
    where full_name = 'No Employee Code'
  ),
  true,
  'a newly inserted employee is active by default'
);

select throws_ok(
  $$
    insert into public.employees (organisation_id, full_name, employment_type)
    values ('a1000000-0000-4000-8000-000000000001', ' X ', 'casual')
  $$,
  '23514',
  'new row for relation "employees" violates check constraint "employees_full_name_length_check"',
  'an employee name shorter than two normalised characters is rejected'
);

select throws_ok(
  $$
    insert into public.employees (organisation_id, full_name, employment_type)
    values (
      'a1000000-0000-4000-8000-000000000001',
      repeat('x', 101),
      'casual'
    )
  $$,
  '23514',
  'new row for relation "employees" violates check constraint "employees_full_name_length_check"',
  'an employee name longer than 100 characters is rejected'
);

select throws_ok(
  $$
    insert into public.employees (
      organisation_id,
      employee_code,
      full_name,
      employment_type
    )
    values (
      'a1000000-0000-4000-8000-000000000001',
      'BAD CODE',
      'Invalid Code Character',
      'casual'
    )
  $$,
  '23514',
  'new row for relation "employees" violates check constraint "employees_employee_code_format_check"',
  'employee codes reject characters outside letters, numbers, hyphens, and underscores'
);

select throws_ok(
  $$
    insert into public.employees (
      organisation_id,
      employee_code,
      full_name,
      employment_type
    )
    values (
      'a1000000-0000-4000-8000-000000000001',
      'A',
      'Short Code',
      'casual'
    )
  $$,
  '23514',
  'new row for relation "employees" violates check constraint "employees_employee_code_format_check"',
  'employee codes shorter than two characters are rejected'
);

select throws_ok(
  $$
    insert into public.employees (
      organisation_id,
      employee_code,
      full_name,
      employment_type
    )
    values (
      'a1000000-0000-4000-8000-000000000001',
      repeat('A', 31),
      'Long Code',
      'casual'
    )
  $$,
  '23514',
  'new row for relation "employees" violates check constraint "employees_employee_code_format_check"',
  'employee codes longer than 30 characters are rejected'
);

select throws_ok(
  $$
    insert into public.employees (
      organisation_id,
      full_name,
      employment_type,
      default_target_hours,
      default_minimum_desired_hours,
      default_maximum_desired_hours,
      default_maximum_allowed_hours
    )
    values (
      'a1000000-0000-4000-8000-000000000001',
      'Negative Hours',
      'casual',
      0,
      -0.25,
      0,
      0
    )
  $$,
  '23514',
  'new row for relation "employees" violates check constraint "employees_default_hours_order_check"',
  'negative default hours are rejected'
);

select throws_ok(
  $$
    insert into public.employees (
      organisation_id,
      full_name,
      employment_type,
      default_target_hours,
      default_minimum_desired_hours,
      default_maximum_desired_hours,
      default_maximum_allowed_hours
    )
    values (
      'a1000000-0000-4000-8000-000000000001',
      'Invalid Hour Order',
      'casual',
      5,
      10,
      10,
      10
    )
  $$,
  '23514',
  'new row for relation "employees" violates check constraint "employees_default_hours_order_check"',
  'invalid default hour ordering is rejected'
);

select throws_ok(
  $$
    insert into public.employees (
      organisation_id,
      full_name,
      employment_type,
      default_maximum_allowed_hours
    )
    values (
      'a1000000-0000-4000-8000-000000000001',
      'Maximum Too High',
      'casual',
      168.25
    )
  $$,
  '23514',
  'new row for relation "employees" violates check constraint "employees_default_maximum_allowed_hours_check"',
  'maximum allowed hours above 168 are rejected'
);

select throws_ok(
  $$
    insert into public.employees (
      organisation_id,
      full_name,
      employment_type,
      default_target_hours,
      default_maximum_desired_hours,
      default_maximum_allowed_hours
    )
    values (
      'a1000000-0000-4000-8000-000000000001',
      'Invalid Increment',
      'casual',
      0.10,
      0.10,
      0.10
    )
  $$,
  '23514',
  'new row for relation "employees" violates check constraint "employees_default_hours_quarter_hour_check"',
  'default hours outside quarter-hour increments are rejected'
);

select throws_ok(
  $$
    insert into public.employees (
      organisation_id,
      full_name,
      employment_type,
      notes
    )
    values (
      'a1000000-0000-4000-8000-000000000001',
      'Long Notes',
      'casual',
      repeat('n', 2001)
    )
  $$,
  '23514',
  'new row for relation "employees" violates check constraint "employees_notes_length_check"',
  'employee notes longer than 2,000 characters are rejected'
);

select lives_ok(
  $$
    insert into public.employees (
      organisation_id,
      employee_code,
      full_name,
      employment_type,
      default_target_hours,
      default_minimum_desired_hours,
      default_maximum_desired_hours,
      default_maximum_allowed_hours
    )
    values (
      'a1000000-0000-4000-8000-000000000001',
      'MAX-168',
      'Valid Maximum',
      'contractor',
      37.5,
      20.25,
      100.75,
      168
    )
  $$,
  'valid quarter-hour values up to 168 hours are accepted'
);

select lives_ok(
  $$
    update public.employees
    set full_name = '  Owner   Changed  '
    where id = 'b1000000-0000-4000-8000-000000000003'
  $$,
  'an owner can update their organisation employee'
);

select is(
  (
    select full_name
    from public.employees
    where id = 'b1000000-0000-4000-8000-000000000003'
  ),
  'Owner Changed',
  'employee names are normalised on update'
);

select ok(
  (
    select updated_at > '2026-01-01 00:00:00+00'::timestamptz
    from public.employees
    where id = 'b1000000-0000-4000-8000-000000000003'
  ),
  'employee updates refresh updated_at through the existing trigger'
);

reset role;
set local role authenticated;
set local "request.jwt.claims" =
  '{"sub":"f2000000-0000-4000-8000-000000000002","role":"authenticated","is_anonymous":false}';

select lives_ok(
  $$
    update public.employees
    set notes = 'Admin updated'
    where id = 'b1000000-0000-4000-8000-000000000004'
  $$,
  'an admin can update their organisation employee'
);

reset role;
set local role authenticated;
set local "request.jwt.claims" =
  '{"sub":"f3000000-0000-4000-8000-000000000003","role":"authenticated","is_anonymous":false}';

select lives_ok(
  $$
    update public.employees
    set notes = 'Manager updated'
    where id = 'b1000000-0000-4000-8000-000000000005'
  $$,
  'a manager can update their organisation employee'
);

reset role;
set local role authenticated;
set local "request.jwt.claims" =
  '{"sub":"f4000000-0000-4000-8000-000000000004","role":"authenticated","is_anonymous":false}';

select results_eq(
  $$
    update public.employees
    set notes = 'Scheduler changed'
    where id = 'b1000000-0000-4000-8000-000000000001'
    returning id
  $$,
  $$select id from public.employees where false$$,
  'a scheduler cannot update an employee'
);

reset role;
set local role authenticated;
set local "request.jwt.claims" =
  '{"sub":"f5000000-0000-4000-8000-000000000005","role":"authenticated","is_anonymous":false}';

select results_eq(
  $$
    update public.employees
    set notes = 'Viewer changed'
    where id = 'b1000000-0000-4000-8000-000000000001'
    returning id
  $$,
  $$select id from public.employees where false$$,
  'a viewer cannot update an employee'
);

reset role;
set local role authenticated;
set local "request.jwt.claims" =
  '{"sub":"f6000000-0000-4000-8000-000000000006","role":"authenticated","is_anonymous":false}';

select results_eq(
  $$
    update public.employees
    set notes = 'Suspended changed'
    where id = 'b1000000-0000-4000-8000-000000000001'
    returning id
  $$,
  $$select id from public.employees where false$$,
  'a suspended manager cannot update an employee'
);

reset role;
set local role authenticated;
set local "request.jwt.claims" =
  '{"sub":"f7000000-0000-4000-8000-000000000007","role":"authenticated","is_anonymous":false}';

select results_eq(
  $$
    update public.employees
    set notes = 'Outsider changed'
    where id = 'b1000000-0000-4000-8000-000000000001'
    returning id
  $$,
  $$select id from public.employees where false$$,
  'an authenticated user without a membership cannot update an employee'
);

reset role;
set local role authenticated;
set local "request.jwt.claims" =
  '{"sub":"f3000000-0000-4000-8000-000000000003","role":"authenticated","is_anonymous":false}';

select results_eq(
  $$
    update public.employees
    set notes = 'Cross-organisation changed'
    where id = 'b2000000-0000-4000-8000-000000000001'
    returning id
  $$,
  $$select id from public.employees where false$$,
  'a manager cannot update another organisation employee'
);

select throws_ok(
  $$
    update public.employees
    set organisation_id = 'a2000000-0000-4000-8000-000000000002'
    where id = 'b1000000-0000-4000-8000-000000000001'
  $$,
  '42501',
  'permission denied for table employees',
  'an authenticated manager cannot change employee organisation ownership'
);

select lives_ok(
  $$
    update public.employees
    set active = false
    where id = 'b1000000-0000-4000-8000-000000000006'
  $$,
  'a manager can deactivate an employee'
);

select is(
  (
    select count(*)
    from public.employees
    where id = 'b1000000-0000-4000-8000-000000000006'
      and not active
  ),
  1::bigint,
  'deactivation retains the employee row as inactive'
);

reset role;

select is(
  (
    select count(*)
    from public.employee_skills
    where employee_id = 'b1000000-0000-4000-8000-000000000006'
  ),
  1::bigint,
  'deactivation preserves existing employee relationships'
);

set local role authenticated;
set local "request.jwt.claims" =
  '{"sub":"f3000000-0000-4000-8000-000000000003","role":"authenticated","is_anonymous":false}';

select lives_ok(
  $$
    update public.employees
    set active = true
    where id = 'b1000000-0000-4000-8000-000000000006'
  $$,
  'a manager can reactivate an employee'
);

select is(
  (
    select active
    from public.employees
    where id = 'b1000000-0000-4000-8000-000000000006'
  ),
  true,
  'reactivation returns the retained employee to active status'
);

reset role;
set local role authenticated;
set local "request.jwt.claims" =
  '{"sub":"f1000000-0000-4000-8000-000000000001","role":"authenticated","is_anonymous":false}';

select throws_ok(
  $$
    delete from public.employees
    where id = 'b1000000-0000-4000-8000-000000000001'
  $$,
  '42501',
  'permission denied for table employees',
  'an owner cannot delete an employee'
);

reset role;
set local role authenticated;
set local "request.jwt.claims" =
  '{"sub":"f5000000-0000-4000-8000-000000000005","role":"authenticated","is_anonymous":false}';

select throws_ok(
  $$
    delete from public.employees
    where id = 'b1000000-0000-4000-8000-000000000001'
  $$,
  '42501',
  'permission denied for table employees',
  'a viewer cannot delete an employee'
);

reset role;

select * from finish();

rollback;
