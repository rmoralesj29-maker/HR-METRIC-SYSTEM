-- Enable Row Level Security
alter default privileges in schema public grant all on tables to postgres, anon, service_role;

-- EMPLOYEES TABLE
create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  role text,
  country text,
  start_date date,
  date_of_birth date,
  gender text,
  status_vr text default 'VR0', -- VR0, VR1, VR2, VR3, VR4, VR5
  languages text[] default '{}',
  custom_fields jsonb default '{}'::jsonb,
  performance_rating numeric default 3,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.employees enable row level security;

create policy "Allow public read access" on public.employees
  for select using (true);

create policy "Allow public insert access" on public.employees
  for insert with check (true);

create policy "Allow public update access" on public.employees
  for update using (true);

create policy "Allow public delete access" on public.employees
  for delete using (true);

-- VACATIONS TABLE
create table if not exists public.vacations (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  days numeric not null,
  type text not null, -- Vacation, Sick, Personal, Other
  status text default 'Pending', -- Pending, Approved, Rejected
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.vacations enable row level security;

create policy "Allow public read access vacations" on public.vacations
  for select using (true);

create policy "Allow public insert access vacations" on public.vacations
  for insert with check (true);

create policy "Allow public update access vacations" on public.vacations
  for update using (true);

create policy "Allow public delete access vacations" on public.vacations
  for delete using (true);

-- SETTINGS TABLE
create table if not exists public.settings (
  id int primary key default 1, -- Singleton row
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  constraint single_row check (id = 1)
);

alter table public.settings enable row level security;

create policy "Allow public read access settings" on public.settings
  for select using (true);

create policy "Allow public insert access settings" on public.settings
  for insert with check (true);

create policy "Allow public update access settings" on public.settings
  for update using (true);

-- Insert default settings if not exists
insert into public.settings (id, settings)
values (1, '{
  "adultAgeThreshold": 22,
  "raiseMilestones": [6, 12, 36, 60],
  "vrThresholds": {"vr0": 0, "vr1": 7, "vr2": 13, "vr3": 37, "vr4": 61},
  "raiseWindowDays": 15,
  "showCountryStats": true,
  "showLanguageStats": true,
  "sickDaysByYear": {
    "2025": [
      {"month": "Jan", "value": 0},
      {"month": "Feb", "value": 0},
      {"month": "Mar", "value": 0},
      {"month": "Apr", "value": 0},
      {"month": "May", "value": 0},
      {"month": "Jun", "value": 0},
      {"month": "Jul", "value": 0},
      {"month": "Aug", "value": 0},
      {"month": "Sep", "value": 0},
      {"month": "Oct", "value": 0},
      {"month": "Nov", "value": 0},
      {"month": "Dec", "value": 0}
    ]
  }
}'::jsonb)
on conflict (id) do nothing;
