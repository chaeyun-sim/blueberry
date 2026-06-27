create table commission_categories (
  id         uuid         primary key default gen_random_uuid(),
  name       text         not null,
  user_id    uuid         not null references auth.users(id) on delete cascade,
  created_at timestamptz  not null default now()
);

alter table commissions
  add column category_id uuid references commission_categories(id) on delete set null;

alter table commission_categories enable row level security;

create policy "Users manage own categories" on commission_categories
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);
