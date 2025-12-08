-- Create the table used by the in-app Supabase memory test
create table if not exists public.app_memory_test (
  id uuid primary key default gen_random_uuid(),
  value text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Optional RLS helper policy for anonymous usage
alter table public.app_memory_test enable row level security;
create policy if not exists "Allow anon read/write for cloud test" on public.app_memory_test
  for select using (true);
create policy if not exists "Allow anon inserts for cloud test" on public.app_memory_test
  for insert with check (true);
