-- BoraLah: esquema do banco no Supabase
-- Rode este arquivo inteiro no SQL Editor do painel do Supabase (uma vez só).

-- ---------- Tabelas ----------

create table if not exists public.places (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  price_level smallint not null default 2 check (price_level between 1 and 3),
  neighborhood text,
  maps_url text,
  instagram text,
  kids_space boolean not null default false,
  kids_types text[] not null default '{}',
  kids_age text,
  high_chair text not null default 'nao_sei' check (high_chair in ('sim', 'nao', 'nao_sei')),
  changing_table text not null default 'nao_sei' check (changing_table in ('sim', 'nao', 'nao_sei')),
  photos text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.visits (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places (id) on delete cascade,
  visited_on date not null default current_date,
  rating numeric(2, 1) not null check (rating between 1 and 5),
  baby_liked text check (baby_liked in ('amou', 'mais_ou_menos', 'nao_curtiu')),
  would_return text check (would_return in ('sim', 'talvez', 'nao')),
  spent numeric(10, 2),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists visits_place_id_idx on public.visits (place_id);

-- Quem pode editar. Depois do primeiro login, insira o seu user id aqui (veja o README).
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------- Segurança (RLS) ----------
-- Leitura liberada para qualquer pessoa com o link do app.
-- Escrita só para quem está na tabela admins.

alter table public.places enable row level security;
alter table public.visits enable row level security;
alter table public.admins enable row level security;

drop policy if exists "places: leitura pública" on public.places;
create policy "places: leitura pública" on public.places for select using (true);
drop policy if exists "places: admin escreve" on public.places;
create policy "places: admin escreve" on public.places for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "visits: leitura pública" on public.visits;
create policy "visits: leitura pública" on public.visits for select using (true);
drop policy if exists "visits: admin escreve" on public.visits;
create policy "visits: admin escreve" on public.visits for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins: cada um vê a si mesmo" on public.admins;
create policy "admins: cada um vê a si mesmo" on public.admins for select using (user_id = auth.uid());

-- ---------- Fotos (Storage) ----------

insert into storage.buckets (id, name, public)
values ('fotos', 'fotos', true)
on conflict (id) do nothing;

drop policy if exists "fotos: admin envia" on storage.objects;
create policy "fotos: admin envia" on storage.objects for insert
  with check (bucket_id = 'fotos' and public.is_admin());

drop policy if exists "fotos: admin apaga" on storage.objects;
create policy "fotos: admin apaga" on storage.objects for delete
  using (bucket_id = 'fotos' and public.is_admin());
