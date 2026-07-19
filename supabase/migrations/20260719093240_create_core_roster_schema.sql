create type public.organisation_member_role as enum (
  'owner',
  'admin',
  'scheduler',
  'manager',
  'viewer'
);

create type public.organisation_member_status as enum (
  'invited',
  'active',
  'suspended'
);

create type public.employment_type as enum (
  'full_time',
  'part_time',
  'casual',
  'contractor',
  'other'
);

create type public.overtime_preference as enum (
  'likes_overtime',
  'neutral',
  'avoid_overtime',
  'not_allowed'
);

create type public.roster_period_status as enum (
  'draft',
  'generated',
  'review',
  'published',
  'archived'
);

create type public.shift_priority as enum (
  'low',
  'normal',
  'high',
  'critical'
);

create type public.shift_requirement_status as enum (
  'active',
  'cancelled'
);

create type public.availability_type as enum (
  'available',
  'unavailable',
  'preferred',
  'not_preferred'
);

create type public.employee_preference_type as enum (
  'prefers_morning',
  'prefers_afternoon',
  'prefers_night',
  'avoid_morning',
  'avoid_afternoon',
  'avoid_night',
  'prefers_weekends',
  'avoid_weekends',
  'prefers_consecutive_days',
  'avoid_consecutive_days'
);

create table public.organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(btrim(name)) > 0),
  slug text not null unique check (length(btrim(slug)) > 0),
  timezone text not null default 'Australia/Brisbane' check (length(btrim(timezone)) > 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null check (length(btrim(full_name)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organisation_members (
  organisation_id uuid not null references public.organisations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.organisation_member_role not null,
  status public.organisation_member_status not null default 'invited',
  created_at timestamptz not null default now(),
  primary key (organisation_id, user_id)
);

create table public.sites (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations (id) on delete restrict,
  name text not null check (length(btrim(name)) > 0),
  location text,
  timezone text not null check (length(btrim(timezone)) > 0),
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, organisation_id)
);

create table public.employees (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations (id) on delete restrict,
  profile_id uuid,
  employee_code text,
  full_name text not null check (length(btrim(full_name)) > 0),
  employment_type public.employment_type not null,
  default_target_hours numeric(6, 2) not null default 0,
  default_minimum_desired_hours numeric(6, 2) not null default 0,
  default_maximum_desired_hours numeric(6, 2) not null default 0,
  default_maximum_allowed_hours numeric(6, 2) not null default 0,
  default_overtime_preference public.overtime_preference not null default 'neutral',
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, organisation_id),
  unique (organisation_id, employee_code),
  foreign key (organisation_id, profile_id)
    references public.organisation_members (organisation_id, user_id)
    on delete set null (profile_id),
  check (
    default_minimum_desired_hours >= 0
    and default_minimum_desired_hours <= default_target_hours
    and default_target_hours <= default_maximum_desired_hours
    and default_maximum_desired_hours <= default_maximum_allowed_hours
  )
);

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations (id) on delete restrict,
  name text not null check (length(btrim(name)) > 0),
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (id, organisation_id),
  unique (organisation_id, name)
);

create table public.employee_skills (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations (id) on delete restrict,
  employee_id uuid not null,
  skill_id uuid not null,
  verified boolean not null default false,
  valid_from date,
  valid_to date,
  notes text,
  created_at timestamptz not null default now(),
  unique (employee_id, skill_id),
  foreign key (employee_id, organisation_id)
    references public.employees (id, organisation_id) on delete cascade,
  foreign key (skill_id, organisation_id)
    references public.skills (id, organisation_id) on delete cascade,
  check (valid_to is null or valid_from is null or valid_to >= valid_from)
);

create table public.shift_templates (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations (id) on delete restrict,
  site_id uuid,
  name text not null check (length(btrim(name)) > 0),
  start_time time not null,
  end_time time not null,
  duration_minutes integer not null check (duration_minutes > 0),
  spans_next_day boolean not null default false,
  is_unsocial boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, organisation_id),
  foreign key (site_id, organisation_id)
    references public.sites (id, organisation_id) on delete restrict,
  check (
    (spans_next_day and end_time <= start_time)
    or (not spans_next_day and end_time > start_time)
  ),
  check (
    duration_minutes = extract(
      epoch from (
        date '2000-01-01'
        + end_time
        + case when spans_next_day then interval '1 day' else interval '0 days' end
        - (date '2000-01-01' + start_time)
      )
    ) / 60
  )
);

create table public.roster_periods (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations (id) on delete restrict,
  name text not null check (length(btrim(name)) > 0),
  start_date date not null,
  end_date date not null,
  status public.roster_period_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, organisation_id),
  check (end_date >= start_date)
);

create table public.employee_roster_goals (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations (id) on delete restrict,
  roster_period_id uuid not null,
  employee_id uuid not null,
  target_hours numeric(6, 2) not null,
  minimum_desired_hours numeric(6, 2) not null,
  maximum_desired_hours numeric(6, 2) not null,
  maximum_allowed_hours numeric(6, 2) not null,
  overtime_preference public.overtime_preference not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (employee_id, roster_period_id),
  foreign key (roster_period_id, organisation_id)
    references public.roster_periods (id, organisation_id) on delete restrict,
  foreign key (employee_id, organisation_id)
    references public.employees (id, organisation_id) on delete restrict,
  check (
    minimum_desired_hours >= 0
    and minimum_desired_hours <= target_hours
    and target_hours <= maximum_desired_hours
    and maximum_desired_hours <= maximum_allowed_hours
  )
);

create table public.shift_requirements (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations (id) on delete restrict,
  roster_period_id uuid not null,
  site_id uuid not null,
  shift_template_id uuid not null,
  work_date date not null,
  required_people integer not null check (required_people > 0),
  priority public.shift_priority not null default 'normal',
  status public.shift_requirement_status not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, organisation_id),
  foreign key (roster_period_id, organisation_id)
    references public.roster_periods (id, organisation_id) on delete restrict,
  foreign key (site_id, organisation_id)
    references public.sites (id, organisation_id) on delete restrict,
  foreign key (shift_template_id, organisation_id)
    references public.shift_templates (id, organisation_id) on delete restrict
);

create table public.shift_skill_requirements (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations (id) on delete restrict,
  shift_requirement_id uuid not null,
  skill_id uuid not null,
  required_count integer not null check (required_count > 0),
  created_at timestamptz not null default now(),
  unique (shift_requirement_id, skill_id),
  foreign key (shift_requirement_id, organisation_id)
    references public.shift_requirements (id, organisation_id) on delete cascade,
  foreign key (skill_id, organisation_id)
    references public.skills (id, organisation_id) on delete restrict
);

create table public.employee_availability_rules (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations (id) on delete restrict,
  employee_id uuid not null,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time,
  end_time time,
  availability_type public.availability_type not null,
  preference_strength smallint not null default 0 check (preference_strength between 0 and 3),
  effective_from date,
  effective_to date,
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (employee_id, organisation_id)
    references public.employees (id, organisation_id) on delete restrict,
  check (effective_to is null or effective_from is null or effective_to >= effective_from),
  check ((start_time is null) = (end_time is null)),
  check (start_time is null or start_time <> end_time)
);

create table public.employee_availability_exceptions (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations (id) on delete restrict,
  employee_id uuid not null,
  work_date date not null,
  start_time time,
  end_time time,
  availability_type public.availability_type not null,
  preference_strength smallint not null default 0 check (preference_strength between 0 and 3),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (employee_id, organisation_id)
    references public.employees (id, organisation_id) on delete restrict,
  check ((start_time is null) = (end_time is null)),
  check (start_time is null or start_time <> end_time)
);

create table public.employee_preferences (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations (id) on delete restrict,
  employee_id uuid not null,
  preference_type public.employee_preference_type not null,
  day_of_week smallint check (day_of_week between 0 and 6),
  shift_template_id uuid,
  preference_weight smallint not null check (preference_weight between 1 and 10),
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (employee_id, organisation_id)
    references public.employees (id, organisation_id) on delete restrict,
  foreign key (shift_template_id, organisation_id)
    references public.shift_templates (id, organisation_id) on delete restrict
);

create index organisation_members_user_id_idx
  on public.organisation_members (user_id);
create index sites_organisation_id_idx on public.sites (organisation_id);
create index employees_organisation_id_idx on public.employees (organisation_id);
create index employees_organisation_profile_id_idx
  on public.employees (organisation_id, profile_id)
  where profile_id is not null;
create index skills_organisation_id_idx on public.skills (organisation_id);
create index employee_skills_organisation_id_idx on public.employee_skills (organisation_id);
create index employee_skills_skill_id_idx on public.employee_skills (skill_id);
create index shift_templates_organisation_id_idx on public.shift_templates (organisation_id);
create index shift_templates_site_id_idx on public.shift_templates (site_id);
create index roster_periods_organisation_id_idx on public.roster_periods (organisation_id);
create index roster_periods_dates_idx on public.roster_periods (start_date, end_date);
create index employee_roster_goals_organisation_id_idx
  on public.employee_roster_goals (organisation_id);
create index employee_roster_goals_roster_period_id_idx
  on public.employee_roster_goals (roster_period_id);
create index employee_roster_goals_employee_id_idx
  on public.employee_roster_goals (employee_id);
create index shift_requirements_organisation_id_idx
  on public.shift_requirements (organisation_id);
create index shift_requirements_roster_period_work_date_idx
  on public.shift_requirements (roster_period_id, work_date);
create index shift_requirements_site_id_idx on public.shift_requirements (site_id);
create index shift_requirements_shift_template_id_idx
  on public.shift_requirements (shift_template_id);
create index shift_requirements_work_date_idx on public.shift_requirements (work_date);
create index shift_skill_requirements_organisation_id_idx
  on public.shift_skill_requirements (organisation_id);
create index shift_skill_requirements_skill_id_idx
  on public.shift_skill_requirements (skill_id);
create index employee_availability_rules_organisation_id_idx
  on public.employee_availability_rules (organisation_id);
create index employee_availability_rules_employee_id_idx
  on public.employee_availability_rules (employee_id);
create index employee_availability_rules_dates_idx
  on public.employee_availability_rules (effective_from, effective_to);
create index employee_availability_rules_day_idx
  on public.employee_availability_rules (day_of_week);
create index employee_availability_exceptions_organisation_id_idx
  on public.employee_availability_exceptions (organisation_id);
create index employee_availability_exceptions_employee_work_date_idx
  on public.employee_availability_exceptions (employee_id, work_date);
create index employee_availability_exceptions_work_date_idx
  on public.employee_availability_exceptions (work_date);
create index employee_preferences_organisation_id_idx
  on public.employee_preferences (organisation_id);
create index employee_preferences_employee_id_idx
  on public.employee_preferences (employee_id);
create index employee_preferences_shift_template_id_idx
  on public.employee_preferences (shift_template_id);

create function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.set_updated_at() from public;

create trigger organisations_set_updated_at
before update on public.organisations
for each row execute function public.set_updated_at();
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();
create trigger sites_set_updated_at
before update on public.sites
for each row execute function public.set_updated_at();
create trigger employees_set_updated_at
before update on public.employees
for each row execute function public.set_updated_at();
create trigger shift_templates_set_updated_at
before update on public.shift_templates
for each row execute function public.set_updated_at();
create trigger roster_periods_set_updated_at
before update on public.roster_periods
for each row execute function public.set_updated_at();
create trigger employee_roster_goals_set_updated_at
before update on public.employee_roster_goals
for each row execute function public.set_updated_at();
create trigger shift_requirements_set_updated_at
before update on public.shift_requirements
for each row execute function public.set_updated_at();
create trigger employee_availability_rules_set_updated_at
before update on public.employee_availability_rules
for each row execute function public.set_updated_at();
create trigger employee_availability_exceptions_set_updated_at
before update on public.employee_availability_exceptions
for each row execute function public.set_updated_at();
create trigger employee_preferences_set_updated_at
before update on public.employee_preferences
for each row execute function public.set_updated_at();

alter table public.organisations enable row level security;
alter table public.profiles enable row level security;
alter table public.organisation_members enable row level security;
alter table public.sites enable row level security;
alter table public.employees enable row level security;
alter table public.skills enable row level security;
alter table public.employee_skills enable row level security;
alter table public.shift_templates enable row level security;
alter table public.roster_periods enable row level security;
alter table public.employee_roster_goals enable row level security;
alter table public.shift_requirements enable row level security;
alter table public.shift_skill_requirements enable row level security;
alter table public.employee_availability_rules enable row level security;
alter table public.employee_availability_exceptions enable row level security;
alter table public.employee_preferences enable row level security;
