import { Client } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL env var is required");
  process.exit(1);
}

const sql = `
create extension if not exists pgcrypto;

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  author text not null,
  title_en text not null,
  title_zh text,
  content_en text not null,
  content_zh text,
  image_url text,
  published boolean not null default true
);
create index if not exists posts_created_at_idx on public.posts (created_at desc);

create table if not exists public.wishes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  message_en text not null,
  message_zh text,
  approved boolean not null default true
);
create index if not exists wishes_created_at_idx on public.wishes (created_at desc);

alter table public.posts enable row level security;
alter table public.wishes enable row level security;

drop policy if exists "public read posts" on public.posts;
create policy "public read posts" on public.posts for select using (true);

drop policy if exists "public read wishes" on public.wishes;
create policy "public read wishes" on public.wishes for select using (true);

select pg_notify('pgrst', 'reload schema');
`;

async function main() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    await client.query(sql);
    console.log("Supabase tables/policies initialized and schema reload triggered.");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
}); 