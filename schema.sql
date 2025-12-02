-- Create Invites table
create table invites (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  slug text not null unique,
  cover_url text,
  background_url text,
  views_count integer default 0
);

-- Create Buttons table
create table buttons (
  id uuid default gen_random_uuid() primary key,
  invite_id uuid references invites(id) on delete cascade not null,
  label text not null,
  type text not null, -- 'location', 'rsvp', 'text'
  content text, -- JSON string or simple text depending on type
  display_order integer default 0
);

-- Create RSVPs table
create table rsvps (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  invite_id uuid references invites(id) on delete cascade not null,
  name text not null
);

-- Enable RLS
alter table invites enable row level security;
alter table buttons enable row level security;
alter table rsvps enable row level security;

-- Policies (Simple for now: Public read, Authenticated all)
create policy "Public invites are viewable by everyone"
  on invites for select
  using (true);

create policy "Authenticated users can do everything on invites"
  on invites for all
  using (auth.role() = 'authenticated');

create policy "Public buttons are viewable by everyone"
  on buttons for select
  using (true);

create policy "Authenticated users can do everything on buttons"
  on buttons for all
  using (auth.role() = 'authenticated');

create policy "Public can insert rsvps"
  on rsvps for insert
  with check (true);

create policy "Authenticated users can view rsvps"
  on rsvps for select
  using (auth.role() = 'authenticated');

-- Storage Setup
-- Note: You might need to enable the Storage extension or run this in the SQL Editor

-- 1. Create the bucket
insert into storage.buckets (id, name, public)
values ('images', 'images', true);

-- 2. Policy: Public can view images
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'images' );

-- 3. Policy: Authenticated users can upload
create policy "Authenticated Upload"
  on storage.objects for insert
  with check ( bucket_id = 'images' and auth.role() = 'authenticated' );
