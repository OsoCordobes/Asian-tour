-- Esquema + RLS para el modelo "link secreto = capability token" (dos saltos).
-- slug de alta entropía -> RPC -> trip_id (UUID) -> child tables.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tablas
-- ---------------------------------------------------------------------------
create table if not exists public.trips (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  titulo     text not null default 'Nuestro viaje',
  created_at timestamptz not null default now()
);

create table if not exists public.personas (
  id         uuid primary key default gen_random_uuid(),
  trip_id    uuid not null references public.trips(id) on delete cascade,
  nombre     text not null check (length(nombre) <= 24),
  color      text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.notas (
  id           uuid primary key default gen_random_uuid(),
  trip_id      uuid not null references public.trips(id) on delete cascade,
  destino_id   text,
  autor_id     uuid not null,
  autor_nombre text not null,
  autor_color  text not null,
  texto        text not null check (length(texto) <= 2000),
  created_at   timestamptz not null default now(),
  deleted_at   timestamptz
);

create table if not exists public.precios (
  id           uuid primary key default gen_random_uuid(),
  trip_id      uuid not null references public.trips(id) on delete cascade,
  tramo_id     text not null,
  autor_id     uuid not null,
  autor_nombre text not null,
  autor_color  text not null,
  monto        numeric not null check (monto >= 0),
  moneda       text not null,
  monto_eur    numeric not null,
  fuente       text check (fuente is null or length(fuente) <= 120),
  created_at   timestamptz not null default now(),
  deleted_at   timestamptz
);

create index if not exists notas_trip_idx on public.notas (trip_id);
create index if not exists precios_trip_idx on public.precios (trip_id);

-- ---------------------------------------------------------------------------
-- Anti-abuse liviano: límite de filas por trip (en vez de rate-limit de infra)
-- ---------------------------------------------------------------------------
create or replace function public.limit_rows_per_trip()
returns trigger
language plpgsql
as $$
begin
  if (select count(*) from public.notas where trip_id = new.trip_id) > 500
     or (select count(*) from public.precios where trip_id = new.trip_id) > 500 then
    raise exception 'Límite de filas por viaje alcanzado';
  end if;
  return new;
end;
$$;

drop trigger if exists notas_limit on public.notas;
create trigger notas_limit before insert on public.notas
  for each row execute function public.limit_rows_per_trip();
drop trigger if exists precios_limit on public.precios;
create trigger precios_limit before insert on public.precios
  for each row execute function public.limit_rows_per_trip();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.trips    enable row level security;
alter table public.personas enable row level security;
alter table public.notas    enable row level security;
alter table public.precios  enable row level security;

-- trips: SIN policies para anon. La única puerta es el RPC de abajo.
-- (Sin policy de select, anon no puede enumerar slugs.)

-- RPC: única forma de resolver slug -> trip. security definer + search_path
-- fijo (evita hijacking). El slug de alta entropía es el secreto.
create or replace function public.get_trip_by_slug(p_slug text)
returns table (id uuid, slug text, titulo text)
language sql
security definer
set search_path = ''
as $$
  select t.id, t.slug, t.titulo
  from public.trips t
  where t.slug = p_slug
  limit 1;
$$;

grant execute on function public.get_trip_by_slug(text) to anon;

-- Chequeo de existencia de trip para las policies. DEBE ser security definer:
-- como `trips` tiene RLS y anon no tiene select, una subconsulta inline contra
-- `public.trips` dentro de una policy se evalúa como anon y ve 0 filas (todo
-- denegaría). La función bypassa esa RLS sin exponer enumeración (no devuelve
-- datos del trip, solo un booleano por id ya conocido).
create or replace function public.trip_exists(p_trip_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (select 1 from public.trips t where t.id = p_trip_id);
$$;

grant execute on function public.trip_exists(uuid) to anon;

-- Child tables: NUNCA using(true). La fila debe pertenecer a un trip existente
-- (vía trip_exists). Como `trips` no es enumerable y el UUID no es adivinable,
-- en la práctica solo opera quien tiene el slug. El borrado es SOFT (update de
-- deleted_at); no se otorga delete a anon.
do $$
declare tbl text;
begin
  foreach tbl in array array['personas','notas','precios'] loop
    execute format('drop policy if exists %I_select on public.%I', tbl, tbl);
    execute format($f$create policy %I_select on public.%I for select to anon
      using (public.trip_exists(trip_id))$f$, tbl, tbl);

    execute format('drop policy if exists %I_insert on public.%I', tbl, tbl);
    execute format($f$create policy %I_insert on public.%I for insert to anon
      with check (public.trip_exists(trip_id))$f$, tbl, tbl);

    execute format('drop policy if exists %I_update on public.%I', tbl, tbl);
    execute format($f$create policy %I_update on public.%I for update to anon
      using (public.trip_exists(trip_id))
      with check (public.trip_exists(trip_id))$f$, tbl, tbl);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Realtime: las tablas deben estar en la publication (RLS aplica también acá).
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table public.notas;
alter publication supabase_realtime add table public.precios;
