-- Create transaction_patterns table
create table public.transaction_patterns (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null references public.profiles (id) on delete cascade,
  pattern_text text not null,
  category_id uuid not null references public.categories (id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  constraint transaction_patterns_pkey primary key (id),
  constraint transaction_patterns_user_id_pattern_text_key unique (user_id, pattern_text)
);

-- RLS Policies
alter table public.transaction_patterns enable row level security;

create policy "Users can view their own patterns" on public.transaction_patterns
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own patterns" on public.transaction_patterns
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own patterns" on public.transaction_patterns
  for update
  using (auth.uid() = user_id);

create policy "Users can delete their own patterns" on public.transaction_patterns
  for delete
  using (auth.uid() = user_id);
