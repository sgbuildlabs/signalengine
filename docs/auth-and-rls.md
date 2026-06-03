# Auth and RLS Design (Sprint 0, Design Only)

## Supabase Auth Flow
1. User signs in via Supabase Auth.
2. Session token is sent with Next.js requests.
3. Server route handlers create scoped Supabase client with user JWT.
4. Enqueue/read endpoints execute with user context and RLS policies.
5. Worker route executes with service-role key for internal writes.

## Tenant Model
- Domain rows are user-scoped via `user_id`.
- User-facing queries are always RLS filtered.
- Internal worker logic must still write correct `user_id` for every row.

## RLS Policy Template
For each user-scoped domain table:
```sql
alter table <table_name> enable row level security;

create policy "select_own_<table_name>"
on <table_name> for select
using (user_id = auth.uid());

create policy "insert_own_<table_name>"
on <table_name> for insert
with check (user_id = auth.uid());

create policy "update_own_<table_name>"
on <table_name> for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "delete_own_<table_name>"
on <table_name> for delete
using (user_id = auth.uid());
```

Tables using template:
- `runs`
- `raw_events`
- `signals`
- `beliefs`
- `weights`
- `forecasts`
- `outcomes`
- `model_outputs`
- `hypotheses`
- `source_attempts`
- `jobs`
- `run_events`
- `cache` (if user-scoped entries are stored)

## Global Operational Tables
- `source_reliability`
- `rate_limits`

Policy approach:
- Deny direct user writes.
- Optionally allow authenticated read of `source_reliability` if needed for UI transparency.
- Service-role only mutation through worker paths.

## Service-Role Boundaries
- Allowed:
  - claim/update jobs
  - write run_events
  - persist model outputs and derived artifacts
  - update rate limits and cache
- Not allowed:
  - bypass product rules (deterministic math, numeric validator gate)

## API Boundary Rules
- User-facing endpoints must never accept arbitrary `user_id` in payload.
- `user_id` is derived from auth context server-side.
- Worker payloads include `user_id` copied from authoritative `runs` row, not client input.

## Auditing
- Every run artifact links back to `run_id` + `user_id`.
- Failed source attempts and job errors are persisted for post-run diagnostics.
