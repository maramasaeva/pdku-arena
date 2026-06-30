-- pdku-arena database schema
-- Run this in your Supabase SQL editor

-- Votes table
create table if not exists votes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id),
  category_id text not null,
  participant_id text not null,
  vote_date date not null default current_date,
  created_at timestamptz default now(),
  -- One vote per user per category per day
  unique(user_id, category_id, vote_date)
);

-- Jury votes table
create table if not exists jury_votes (
  id uuid default gen_random_uuid() primary key,
  juror_name text not null,
  category_id text not null,
  participant_id text not null,
  week_number int not null,
  created_at timestamptz default now(),
  unique(juror_name, category_id, week_number)
);

-- Row level security
alter table votes enable row level security;
alter table jury_votes enable row level security;

-- Anyone can read votes (for leaderboard)
create policy "Votes are publicly readable"
  on votes for select using (true);

-- Users can insert their own votes
create policy "Users can insert own votes"
  on votes for insert with check (auth.uid() = user_id);

-- Jury votes are publicly readable
create policy "Jury votes are publicly readable"
  on jury_votes for select using (true);

-- Index for performance
create index if not exists idx_votes_category on votes(category_id);
create index if not exists idx_votes_date on votes(vote_date);
create index if not exists idx_votes_user_date on votes(user_id, vote_date);
