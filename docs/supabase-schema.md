# Supabase Schema

Run these in the Supabase SQL editor when setting up a new project.

## tickets (0011)

```sql
create table if not exists public.tickets (
  id text primary key,
  filename text not null,
  title text not null,
  body_md text not null,
  kanban_column_id text null,
  kanban_position int null,
  kanban_moved_at timestamptz null,
  updated_at timestamptz not null default now()
);
```

## kanban_columns (0020)

```sql
create table if not exists public.kanban_columns (
  id text primary key,
  title text not null,
  position int not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

When `kanban_columns` is empty, the app initializes it with: Unassigned, To-do, Doing, Done (positions 0–3).

## projects (Project initialization wizard)

```sql
create table if not exists public.projects (
  id text primary key,
  name text not null,
  repo_url text not null,
  tech_stack text null,
  build_command text null,
  test_command text null,
  lint_command text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## project_instruction_sets (Project initialization wizard)

```sql
create table if not exists public.project_instruction_sets (
  id text primary key,
  project_id text not null references public.projects(id) on delete cascade,
  category text not null,
  content text not null,
  is_default boolean not null default false,
  version text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Categories: `agent-rules`, `process`, `setup`, `build`, `other`

## project_scripts (Project initialization wizard)

```sql
create table if not exists public.project_scripts (
  id text primary key,
  project_id text not null references public.projects(id) on delete cascade,
  name text not null,
  content text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```
