-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Clientes table
create table if not exists public.clientes (
  id uuid default uuid_generate_v4() primary key,
  nombre text not null,
  descripcion text,
  color text not null default '#8B5CF6',
  estado text not null default 'activo' check (estado in ('activo', 'pausado', 'cerrado')),
  created_at timestamptz default now() not null
);

-- Tareas table
create table if not exists public.tareas (
  id uuid default uuid_generate_v4() primary key,
  cliente_id uuid references public.clientes(id) on delete cascade not null,
  titulo text not null,
  descripcion text,
  tipo_de_tarea text,
  prioridad text not null default 'media' check (prioridad in ('baja', 'media', 'alta', 'urgente')),
  tiempo_estimado text not null default 'medio' check (tiempo_estimado in ('corto', 'medio', 'largo')),
  estado text not null default 'pendiente' check (estado in ('pendiente', 'en proceso', 'en revisión', 'aprobada', 'entregada', 'pausada')),
  deadline date,
  created_at timestamptz default now() not null,
  fecha_de_resolucion timestamptz,
  mes text,
  notas text,
  link_externo text
);

-- Enable RLS
alter table public.clientes enable row level security;
alter table public.tareas enable row level security;

-- Policies (allow all for MVP - tighten later)
create policy "Allow all clientes" on public.clientes for all using (true) with check (true);
create policy "Allow all tareas" on public.tareas for all using (true) with check (true);

-- Indexes
create index if not exists tareas_cliente_id_idx on public.tareas(cliente_id);
create index if not exists tareas_estado_idx on public.tareas(estado);
create index if not exists tareas_mes_idx on public.tareas(mes);
create index if not exists tareas_deadline_idx on public.tareas(deadline);

-- Seed: Initial clients
insert into public.clientes (nombre, descripcion, color, estado) values
  ('Magnasco Brokers', 'Broker inmobiliario', '#8B5CF6', 'activo'),
  ('Prenut', 'Nutrición y salud', '#10B981', 'activo'),
  ('INI', 'Cliente INI', '#3B82F6', 'activo'),
  ('La Bragadense', 'Empresa local', '#F59E0B', 'activo'),
  ('ALFASAL', 'Cliente ALFASAL', '#EF4444', 'activo'),
  ('PelaGatxs', 'Cliente PelaGatxs', '#EC4899', 'activo'),
  ('Chicle', 'Agencia Chicle', '#6366F1', 'activo')
on conflict do nothing;
