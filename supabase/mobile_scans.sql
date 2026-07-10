-- Run this in Supabase SQL Editor
create table if not exists mobile_scans (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores(id) on delete cascade,
  barcode text not null,
  created_at timestamptz default now(),
  processed boolean default false
);

-- Allow the phone (unauthenticated) to INSERT scans
alter table mobile_scans enable row level security;

create policy "Anyone can insert mobile scans"
  on mobile_scans for insert
  with check (true);

-- Allow authenticated store users to read and update their own scans
create policy "Store users can read their scans"
  on mobile_scans for select
  using (auth.uid() is not null);

create policy "Store users can update their scans"
  on mobile_scans for update
  using (auth.uid() is not null);

-- Index for fast polling
create index if not exists mobile_scans_store_unprocessed
  on mobile_scans(store_id, processed, created_at)
  where processed = false;
