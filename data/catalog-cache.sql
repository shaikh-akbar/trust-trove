create table if not exists public.catalog_cache (
  key text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists catalog_cache_updated_at_idx
  on public.catalog_cache (updated_at desc);
