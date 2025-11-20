-- Run this in your Supabase SQL Editor

-- 1. Profiles Table (Links Auth Users to Usernames)
create table if not exists profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- 2. Re-create Game State Table (Keyed by User ID now)
drop table if exists game_state;
create table game_state (
  user_id uuid references auth.users on delete cascade not null primary key,
  board jsonb not null,
  matched jsonb not null,
  moves int default 0,
  time_started timestamp with time zone,
  updated_at timestamp with time zone
);
alter table game_state enable row level security;

-- 3. Re-create Leaderboard Table
drop table if exists leaderboard;
create table leaderboard (
  user_id uuid references auth.users on delete cascade not null primary key,
  username text not null,
  wins int default 0,
  best_time float,
  best_moves int,
  last_played timestamp with time zone
);
alter table leaderboard enable row level security;
create policy "Leaderboard is viewable by everyone" on leaderboard for select using (true);
