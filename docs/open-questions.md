# Open Questions and Recommended Resolutions (Sprint 0)

## 1) Canonical Spec Location Drift
Ambiguity:
- Prompt says spec at repo root; currently source used is `C:\Users\sgupt\Downloads\SIGNAL_ENGINE_SPEC.md`.
Recommendation:
- Copy spec into repo root before Sprint 1 and pin SHA/checksum in README sprint log.

## 2) `source_reliability` tenancy model
Ambiguity:
- Should reliability be global or per-user customized?
Recommendation:
- Start global table (as spec shape), read-only to users, mutable by service-role/admin only.
- Add optional override table in later sprint if personalization needed.

## 3) `outcomes` ownership model
Ambiguity:
- Are outcomes personal user artifacts or shared benchmark truth?
Recommendation:
- Store as user-scoped initially to keep RLS simple.
- If shared benchmark mode is needed, add separate global benchmark outcomes table later.

## 4) Worker cadence and concurrency
Ambiguity:
- Cron interval and per-invocation batch size are unspecified.
Recommendation:
- Start with 1-minute cron, max 3 jobs/invocation, and strict wall-clock budget guard.

## 5) Retry limits and backoff curve
Ambiguity:
- Exact retry policy not specified.
Recommendation:
- `max_attempts=8`, exponential backoff capped at 15 minutes, classify errors as transient vs terminal.

## 6) Numeric validator precision policy
Ambiguity:
- Compare raw strings vs normalized decimals?
Recommendation:
- Normalize to canonical decimal string at fixed precision before set inclusion checks.

## 7) Mission table inclusion
Ambiguity:
- Spec DDL references `mission_id` but does not provide `missions` table DDL.
Recommendation:
- Introduce a `missions` domain table in Sprint -1 scaffolding (additive schema extension), keyed by `mission_id`, user-scoped with RLS.

## 8) Timescale hypertable strategy
Ambiguity:
- Which tables should become hypertables in Supabase?
Recommendation:
- Evaluate `signals`, `run_events`, and optionally `raw_events` after baseline migrations; apply hypertable conversion once query patterns stabilize.

## 9) Required-source threshold per mission
Ambiguity:
- Minimum coverage threshold to fail a run is not numerically fixed.
Recommendation:
- Define mission-level required source sets; fail only when required coverage < 50%, otherwise degrade confidence.

## 10) Realtime event retention
Ambiguity:
- Retention window for `run_events` not specified.
Recommendation:
- Keep full retention for MVP; revisit archival/TTL once storage profile is observed.
