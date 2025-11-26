-- Create Users Table
create table public.users (
  id uuid default gen_random_uuid() primary key,
  username text not null,
  phone text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Reports Table
create table public.reports (
  id uuid default gen_random_uuid() primary key,
  venue_id text not null,
  user_id uuid references public.users(id) not null,
  queue_length text,
  door_policy text,
  capacity text,
  vibe text[], -- Array of strings
  vibe_details text,
  photo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS (Row Level Security)
alter table public.users enable row level security;
alter table public.reports enable row level security;

-- Create Policies (Public access for prototype)
-- Allow anyone to read/write users
create policy "Public users access" on public.users for all using (true);

-- Allow anyone to read/write reports
create policy "Public reports access" on public.reports for all using (true);
