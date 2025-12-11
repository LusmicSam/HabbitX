-- Enable UUID extension
create extension if not exists "pgcrypto";

-- Habits Table
create table habits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  description text,
  color text default '#6366f1',
  created_at timestamptz default now()
);

-- Habit Logs Table (tracks completions)
create table habit_logs (
  id uuid default gen_random_uuid() primary key,
  habit_id uuid references habits(id) on delete cascade not null,
  completed_at date not null,
  unique(habit_id, completed_at)
);

-- Row Level Security (RLS) Policies
alter table habits enable row level security;
alter table habit_logs enable row level security;

-- Habits Policies
create policy "Users can view their own habits" 
  on habits for select 
  using (auth.uid() = user_id);

create policy "Users can insert their own habits" 
  on habits for insert 
  with check (auth.uid() = user_id);

create policy "Users can update their own habits" 
  on habits for update 
  using (auth.uid() = user_id);

create policy "Users can delete their own habits" 
  on habits for delete 
  using (auth.uid() = user_id);

-- Logs Policies
create policy "Users can view logs for their habits" 
  on habit_logs for select 
  using (
    exists (
      select 1 from habits 
      where habits.id = habit_logs.habit_id 
      and habits.user_id = auth.uid()
    )
  );

create policy "Users can insert logs for their habits" 
  on habit_logs for insert 
  with check (
    exists (
      select 1 from habits 
      where habits.id = habit_logs.habit_id 
      and habits.user_id = auth.uid()
    )
  );

create policy "Users can delete logs for their habits" 
  on habit_logs for delete 
  using (
    exists (
      select 1 from habits 
      where habits.id = habit_logs.habit_id 
      and habits.user_id = auth.uid()
    )
  );
