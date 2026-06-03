# Signal Engine Data Model (Sprint 0, Design Only)

## TypeScript Contracts

```ts
export type CusumState = 'none' | 'early_change' | 'confirmed_shift';

export interface Signal {
  source: string;
  entity: string;
  signal_type: string;
  raw_value: number;
  unit: string;
  timestamp: string; // ISO datetime
  window_days: number;
  source_url?: string | null;
  raw_ref?: string | null;

  z_score?: number | null;
  ewma?: number | null;
  momentum?: number | null;
  cusum_state?: CusumState | null;
  decay_weight?: number | null;
  reliability_weight?: number | null;
  final_weight?: number | null;
  contribution?: number | null;
  confidence?: number | null;

  trace: string[];
}

export interface Outcome {
  entity: string;
  mission_type: string;
  horizon_days: number;
  outcome_type: string;
  actual_value: number;
  observed_at: string; // ISO datetime
  source: string;
}

export type AgentStatus =
  | 'success'
  | 'partial'
  | 'failed'
  | 'skipped'
  | 'rate_limited'
  | 'no_data';

export interface AgentResult {
  agent: string;
  status: AgentStatus;
  signals: Signal[];
  errors: string[];
  records_examined: number;
  records_returned: number;
}
```

## Supabase Migration DDL Plan

Note: DDL preserves every spec table/column/key, then appends `user_id` to domain tables as an additive platform extension.

```sql
-- prerequisites
create extension if not exists timescaledb;
create extension if not exists vector;

-- §12
create table source_reliability (
  source text primary key,
  base_reliability real not null,
  freshness_half_life_days int not null,
  expected_lag_days int default 0,
  default_weight_cap real default 1.0,
  notes text
);

-- §14.1
create table runs (
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

-- §14.2
create table raw_events (
  raw_event_id uuid primary key,
  user_id uuid not null references auth.users(id),
  run_id uuid references runs(run_id),
  source text not null,
  entity text,
  source_url text,
  external_id text,
  content_hash text,
  published_at timestamptz,
  fetched_at timestamptz not null default now(),
  raw_json jsonb
);

-- §14.3
create table signals (
  signal_id uuid primary key,
  user_id uuid not null references auth.users(id),
  run_id uuid references runs(run_id),
  raw_event_id uuid references raw_events(raw_event_id),
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

-- §14.4
create table beliefs (
  user_id uuid not null references auth.users(id),
  entity text not null,
  mission_type text not null,
  signal_type text not null,
  horizon_days int not null,
  prior_mean real,
  prior_var real,
  posterior_mean real,
  posterior_var real,
  updated_at timestamptz,
  primary key (user_id, entity, mission_type, signal_type, horizon_days)
);

-- §14.5
create table weights (
  user_id uuid not null references auth.users(id),
  entity text not null,
  mission_type text not null,
  source text not null,
  horizon_days int not null,
  default_weight real not null,
  observed_weight real,
  effective_weight real not null,
  hit_rate real,
  sample_n int default 0,
  updated_at timestamptz,
  primary key (user_id, entity, mission_type, source, horizon_days)
);

-- §14.6
create table forecasts (
  forecast_id uuid primary key,
  user_id uuid not null references auth.users(id),
  run_id uuid references runs(run_id),
  entity text not null,
  mission_type text not null,
  horizon_days int not null,
  outcome_type text not null,
  predicted real not null,
  horizon_end timestamptz not null,
  actual real,
  error real,
  resolved_at timestamptz
);

-- §14.7
create table outcomes (
  outcome_id uuid primary key,
  user_id uuid not null references auth.users(id),
  entity text not null,
  mission_type text not null,
  horizon_days int not null,
  outcome_type text not null,
  actual_value real not null,
  observed_at timestamptz not null,
  source text not null,
  raw_ref text
);

-- §14.8
create table model_outputs (
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

-- §14.9
create table hypotheses (
  hypothesis_id uuid primary key,
  user_id uuid not null references auth.users(id),
  mission_id uuid,
  entity text not null,
  mission_type text not null,
  horizon_days int not null,
  claim text not null,
  status text,
  previous_confidence real,
  current_confidence real,
  evidence_for jsonb,
  evidence_against jsonb,
  invalidation_conditions jsonb,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

-- §13
create table source_attempts (
  id uuid primary key,
  user_id uuid not null references auth.users(id),
  run_id uuid references runs(run_id),
  source text not null,
  status text not null,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  records_returned int default 0
);

-- infra: cache + rate limits + jobs + run events
create table cache (
  key_hash text primary key,
  user_id uuid references auth.users(id),
  source text,
  value jsonb not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table rate_limits (
  source text not null,
  window_start timestamptz not null,
  count int not null,
  backoff_until timestamptz,
  updated_at timestamptz not null default now(),
  primary key (source, window_start)
);

create table jobs (
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

create table run_events (
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
```

## RLS Baseline
- Enable RLS on all user-scoped tables.
- Policy pattern:
  - `USING (user_id = auth.uid())`
  - `WITH CHECK (user_id = auth.uid())`
- `source_reliability` and `rate_limits` are global operational tables; write access is restricted to service-role paths.

## Required Indexing (minimum)
- `runs(user_id, created_at desc)`
- `signals(user_id, run_id, ts desc)`
- `source_attempts(user_id, run_id)`
- `run_events(user_id, run_id, ts)`
- `cache(expires_at)`
- `jobs(status, available_at)`

## Belief Key
Beliefs are keyed as:
`(entity, mission_type, signal_type, horizon_days)`
In multi-tenant storage, the physical key is:
`(user_id, entity, mission_type, signal_type, horizon_days)`

## Weight Shrinkage Plan (§16)
```text
if observed_weight is null -> effective = default_weight
if sample_n < 20  -> effective = 0.80*default + 0.20*observed
if sample_n < 100 -> effective = 0.50*default + 0.50*observed
else              -> effective = 0.20*default + 0.80*observed
```
Then apply cap:
`effective_weight <= source_reliability.default_weight_cap`
