-- Sprint 1: core schema for usable synthetic run slice
create extension if not exists timescaledb;
create extension if not exists vector;

create table if not exists runs (
  run_id uuid primary key,
  user_id uuid not null references auth.users(id),
  mission_id uuid,
  entity text not null,
  mission_type text not null,
  horizon_days int not null,
  composite real,
  confidence real,
  confidence_label text,
  score_range_low real,
  score_range_high real,
  prior_run_id uuid,
  status text not null,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists signals (
  signal_id uuid primary key,
  user_id uuid not null references auth.users(id),
  run_id uuid references runs(run_id),
  raw_event_id uuid,
  source text not null,
  entity text not null,
  mission_type text not null,
  signal_type text not null,
  raw_value real not null,
  unit text not null,
  z_score real,
  ewma real,
  momentum real,
  decay_weight real,
  reliability_weight real,
  final_weight real,
  contribution real,
  confidence real,
  trace jsonb,
  ts timestamptz not null
);

create table if not exists model_outputs (
  model_output_id uuid primary key,
  user_id uuid not null references auth.users(id),
  run_id uuid references runs(run_id),
  entity text not null,
  mission_type text not null,
  horizon_days int not null,
  model_name text not null,
  output_score real,
  confidence real,
  score_range_low real,
  score_range_high real,
  input_features jsonb,
  explanation_json jsonb,
  allowed_numbers jsonb,
  created_at timestamptz default now()
);

create table if not exists jobs (
  job_id uuid primary key,
  user_id uuid not null references auth.users(id),
  job_type text not null,
  status text not null,
  payload jsonb not null,
  attempts int not null default 0,
  max_attempts int not null default 8,
  available_at timestamptz not null default now(),
  locked_at timestamptz,
  lock_token text,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists run_events (
  event_id uuid primary key,
  user_id uuid not null references auth.users(id),
  run_id uuid not null references runs(run_id),
  kind text not null,
  agent text,
  phase text not null,
  detail text not null,
  progress real,
  partial_result jsonb,
  ts timestamptz not null default now()
);

alter table runs enable row level security;
alter table signals enable row level security;
alter table model_outputs enable row level security;
alter table jobs enable row level security;
alter table run_events enable row level security;

create policy "runs_owner_select" on runs for select using (user_id = auth.uid());
create policy "runs_owner_insert" on runs for insert with check (user_id = auth.uid());
create policy "runs_owner_update" on runs for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "signals_owner_select" on signals for select using (user_id = auth.uid());
create policy "signals_owner_insert" on signals for insert with check (user_id = auth.uid());
create policy "signals_owner_update" on signals for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "outputs_owner_select" on model_outputs for select using (user_id = auth.uid());
create policy "outputs_owner_insert" on model_outputs for insert with check (user_id = auth.uid());
create policy "outputs_owner_update" on model_outputs for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "jobs_owner_select" on jobs for select using (user_id = auth.uid());
create policy "jobs_owner_insert" on jobs for insert with check (user_id = auth.uid());
create policy "jobs_owner_update" on jobs for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "events_owner_select" on run_events for select using (user_id = auth.uid());
create policy "events_owner_insert" on run_events for insert with check (user_id = auth.uid());
create policy "events_owner_update" on run_events for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create index if not exists idx_runs_user_created on runs(user_id, created_at desc);
create index if not exists idx_signals_user_run_ts on signals(user_id, run_id, ts desc);
create index if not exists idx_outputs_user_run on model_outputs(user_id, run_id);
create index if not exists idx_jobs_status_available on jobs(status, available_at);
create index if not exists idx_events_user_run_ts on run_events(user_id, run_id, ts);
