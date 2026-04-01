-- Buddy evolution state (one per user, upserted on sync)
create table if not exists buddies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  github_username text not null,

  -- Companion bones (deterministic, for display)
  species text not null,
  rarity text not null,
  eye text not null,
  hat text not null,
  shiny boolean default false,
  base_stats jsonb not null default '{}',
  companion_name text default 'Buddy',

  -- Evolution state
  total_xp bigint default 0,
  tier text default 'hatchling',
  stat_growth jsonb default '{}',
  streak_days int default 0,

  -- Lifetime stats
  lifetime_stats jsonb default '{}',

  -- Timestamps
  evolved_at jsonb default '{}',
  last_synced_at timestamptz default now(),
  created_at timestamptz default now(),

  unique(user_id)
);

-- Achievements earned by buddies
create table if not exists achievements (
  id uuid primary key default gen_random_uuid(),
  buddy_id uuid references buddies(id) on delete cascade not null,
  achievement_key text not null,
  unlocked_at timestamptz default now(),
  unique(buddy_id, achievement_key)
);

-- Plugin auth tokens (one per user)
create table if not exists plugin_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  token text not null unique,
  created_at timestamptz default now(),
  unique(user_id)
);

-- RLS policies
alter table buddies enable row level security;
alter table achievements enable row level security;
alter table plugin_tokens enable row level security;

-- Buddies: anyone can read, only owner can write
create policy "buddies_select" on buddies for select using (true);
create policy "buddies_insert" on buddies for insert with check (auth.uid() = user_id);
create policy "buddies_update" on buddies for update using (auth.uid() = user_id);

-- Achievements: anyone can read
create policy "achievements_select" on achievements for select using (true);

-- Plugin tokens: only owner
create policy "plugin_tokens_all" on plugin_tokens for all using (auth.uid() = user_id);

-- Leaderboard view
create or replace view leaderboard as
  select
    github_username,
    species,
    rarity,
    shiny,
    total_xp,
    tier,
    companion_name,
    streak_days
  from buddies
  order by total_xp desc;
