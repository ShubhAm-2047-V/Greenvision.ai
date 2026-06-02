-- Supabase PostgreSQL Database Schema for AgroMind AI

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  role text not null default 'farmer' check (role in ('farmer', 'admin')),
  lat double precision,
  lon double precision,
  state text,
  district text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Profiles
alter table public.profiles enable row level security;

create policy "Users can view their own profile." on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile." on public.profiles
  for update using (auth.uid() = id);

-- Trigger to automatically create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Farmer'),
    coalesce(new.raw_user_meta_data->>'role', 'farmer')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. FARMS TABLE
create table public.farms (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  image_url text,
  lat double precision,
  lon double precision,
  state text,
  district text,
  village text,
  dimensions text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.farms enable row level security;

create policy "Users can view their own farms." on public.farms
  for select using (auth.uid() = user_id);

create policy "Users can insert their own farms." on public.farms
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own farms." on public.farms
  for update using (auth.uid() = user_id);

create policy "Users can delete their own farms." on public.farms
  for delete using (auth.uid() = user_id);


-- 3. PREDICTIONS TABLE (Full Agronomic recommendations compiled by AI)
create table public.predictions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  farm_id uuid references public.farms(id) on delete set null,
  crop text not null,
  confidence double precision not null,
  nitrogen double precision,
  phosphorus double precision,
  potassium double precision,
  ph double precision,
  temperature double precision,
  humidity double precision,
  rainfall double precision,
  season text,
  state text,
  district text,
  expected_yield text,
  expected_revenue text,
  expected_profit text,
  explanation text,
  fertilizer_plan jsonb,
  irrigation_schedule jsonb,
  yield_forecast jsonb,
  crops_list jsonb, -- Top 5 recommendations array
  farm_health_score double precision,
  soil_health_score double precision,
  soil_analysis jsonb,
  weather_data jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.predictions enable row level security;

create policy "Users can view their own predictions." on public.predictions
  for select using (auth.uid() = user_id);

create policy "Users can insert their own predictions." on public.predictions
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own predictions." on public.predictions
  for delete using (auth.uid() = user_id);


-- 4. DISEASE RECORDS TABLE (Pathology logs)
create table public.disease_records (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  image_url text not null,
  crop_type text not null,
  disease_name text not null,
  confidence double precision not null,
  severity text not null,
  treatment text not null,
  prevention text not null,
  medicine text not null,
  recovery_time text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.disease_records enable row level security;

create policy "Users can view their own disease scans." on public.disease_records
  for select using (auth.uid() = user_id);

create policy "Users can insert their own disease scans." on public.disease_records
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own disease scans." on public.disease_records
  for delete using (auth.uid() = user_id);


-- 5. CHAT MESSAGES TABLE
create table public.chat_messages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  sender text not null check (sender in ('user', 'bot')),
  text text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.chat_messages enable row level security;

create policy "Users can view their own messages." on public.chat_messages
  for select using (auth.uid() = user_id);

create policy "Users can insert their own messages." on public.chat_messages
  for insert with check (auth.uid() = user_id);


-- 6. STORAGE BUCKETS GUIDELINES (Execute in Supabase Storage dashboard)
-- Note: Create the following public storage buckets in Supabase Storage:
--   - 'farm-images' (make it public)
--   - 'leaf-images' (make it public)
--   - 'farm-reports' (make it public)

-- Upgrade migrations for existing database schemas:
ALTER TABLE public.predictions ADD COLUMN IF NOT EXISTS farm_health_score double precision;
ALTER TABLE public.predictions ADD COLUMN IF NOT EXISTS soil_health_score double precision;
ALTER TABLE public.predictions ADD COLUMN IF NOT EXISTS soil_analysis jsonb;
ALTER TABLE public.predictions ADD COLUMN IF NOT EXISTS weather_data jsonb;

