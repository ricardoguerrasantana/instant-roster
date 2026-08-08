create function private.normalise_employee_fields()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.full_name := pg_catalog.regexp_replace(
    pg_catalog.btrim(new.full_name),
    '[[:space:]]+',
    ' ',
    'g'
  );
  new.employee_code := pg_catalog.upper(
    nullif(pg_catalog.btrim(new.employee_code), '')
  );

  return new;
end;
$$;

revoke all on function private.normalise_employee_fields()
  from public, anon, authenticated;

comment on function private.normalise_employee_fields() is
  'Normalises employee names and optional operational codes before database validation.';

create trigger employees_normalise_fields
before insert or update of full_name, employee_code on public.employees
for each row execute function private.normalise_employee_fields();

update public.employees
set
  full_name = pg_catalog.regexp_replace(
    pg_catalog.btrim(full_name),
    '[[:space:]]+',
    ' ',
    'g'
  ),
  employee_code = pg_catalog.upper(
    nullif(pg_catalog.btrim(employee_code), '')
  )
where full_name is distinct from pg_catalog.regexp_replace(
    pg_catalog.btrim(full_name),
    '[[:space:]]+',
    ' ',
    'g'
  )
  or employee_code is distinct from pg_catalog.upper(
    nullif(pg_catalog.btrim(employee_code), '')
  );

alter table public.employees
  drop constraint if exists employees_full_name_check,
  drop constraint if exists employees_check,
  drop constraint if exists employees_organisation_id_employee_code_key;

alter table public.employees
  add constraint employees_full_name_length_check
    check (pg_catalog.char_length(full_name) between 2 and 100),
  add constraint employees_employee_code_format_check
    check (
      employee_code is null
      or employee_code ~ '^[A-Z0-9_-]{2,30}$'
    ),
  add constraint employees_default_hours_order_check
    check (
      default_minimum_desired_hours >= 0
      and default_minimum_desired_hours <= default_target_hours
      and default_target_hours <= default_maximum_desired_hours
      and default_maximum_desired_hours <= default_maximum_allowed_hours
    ),
  add constraint employees_default_hours_quarter_hour_check
    check (
      default_minimum_desired_hours % 0.25 = 0
      and default_target_hours % 0.25 = 0
      and default_maximum_desired_hours % 0.25 = 0
      and default_maximum_allowed_hours % 0.25 = 0
    ),
  add constraint employees_default_maximum_allowed_hours_check
    check (default_maximum_allowed_hours <= 168),
  add constraint employees_notes_length_check
    check (notes is null or pg_catalog.char_length(notes) <= 2000);

create unique index employees_organisation_employee_code_ci_uidx
  on public.employees (organisation_id, pg_catalog.lower(employee_code))
  where employee_code is not null;

create index employees_organisation_active_idx
  on public.employees (organisation_id, active);

create index employees_organisation_full_name_idx
  on public.employees (organisation_id, full_name);

grant execute on function private.has_organisation_role(uuid, text[])
  to authenticated;

comment on function private.has_organisation_role(uuid, text[]) is
  'SECURITY DEFINER active-membership role lookup used by organisation-scoped write policies.';

revoke all on table public.employees from public, anon, authenticated;

grant select on table public.employees to authenticated;

grant insert (
  organisation_id,
  employee_code,
  full_name,
  employment_type,
  default_target_hours,
  default_minimum_desired_hours,
  default_maximum_desired_hours,
  default_maximum_allowed_hours,
  default_overtime_preference,
  active,
  notes
) on public.employees to authenticated;

grant update (
  employee_code,
  full_name,
  employment_type,
  default_target_hours,
  default_minimum_desired_hours,
  default_maximum_desired_hours,
  default_maximum_allowed_hours,
  default_overtime_preference,
  active,
  notes
) on public.employees to authenticated;

create policy employees_select_for_active_members
on public.employees
for select
to authenticated
using ((select private.is_active_organisation_member(organisation_id)));

create policy employees_insert_for_management_roles
on public.employees
for insert
to authenticated
with check (
  (select private.has_organisation_role(
    organisation_id,
    array['owner', 'admin', 'manager']
  ))
);

create policy employees_update_for_management_roles
on public.employees
for update
to authenticated
using (
  (select private.has_organisation_role(
    organisation_id,
    array['owner', 'admin', 'manager']
  ))
)
with check (
  (select private.has_organisation_role(
    organisation_id,
    array['owner', 'admin', 'manager']
  ))
);
