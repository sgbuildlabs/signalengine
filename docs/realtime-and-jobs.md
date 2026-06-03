# Realtime and Jobs Design (Sprint 0, Design Only)

## Overview
Runs are asynchronous background jobs. Worker route invocations process bounded slices to fit Vercel limits. Progress is written to `run_events` and streamed via Supabase Realtime.

## Job Queue Schema
`jobs(job_id, user_id, job_type, status, payload, attempts, max_attempts, available_at, locked_at, lock_token, last_error, created_at, updated_at)`

Status values:
- `queued`
- `running`
- `succeeded`
- `failed`
- `retry_scheduled`

## Locking and Claiming
- Worker claims one job with atomic update where:
  - `status in ('queued','retry_scheduled')`
  - `available_at <= now()`
  - `locked_at is null or stale`
- Sets `status='running'`, `locked_at=now()`, new `lock_token`, increments `attempts`.
- Only owner of `lock_token` can update completion state.

## Retry and Backoff
- Retry on transient source errors and rate limits.
- Exponential backoff by attempt count (e.g., 15s, 30s, 60s, 120s, capped).
- On max attempts exceeded -> `failed` with persisted `last_error` and final `run_events` error.

## Worker Triggering
- Immediate kick on enqueue: call worker drain endpoint once.
- Vercel Cron triggers drain on short interval (e.g., every minute).
- Drain endpoint processes up to N jobs per invocation with time budget guard.

## Bounded Slice Model
Each invocation enforces:
- `MAX_JOB_STEPS_PER_INVOCATION`
- `MAX_WALL_MS` guard (stop before hard function timeout)

Checkpoint fields in `jobs.payload`:
- `phase` (planning/fetching/modeling/persisting/finalizing)
- `completed_agents`
- `pending_agents`
- `partial_model_state`

If budget reached:
- Persist checkpoint
- Set `status='retry_scheduled'`, `available_at=now()`
- Next invocation resumes from checkpoint

## Parallel Agent Execution
- Inside a job phase, selected agents run with `Promise.all`.
- Every agent result is mapped to `AgentResult` and persisted, even on partial failures.
- Missing-data penalty is computed from expected vs successful sources.

## Realtime Event Contract (Spec §24 mapping)
`run_events` columns:
- `run_id`
- `kind` = `milestone | agent_update | agent_error | model_update | trace_update | narration | done`
- `agent` (nullable)
- `phase`
- `detail`
- `progress` (0..1)
- `partial_result` (jsonb)
- `ts`

Example rows:
- `agent_update`, `agent='NEWS'`, `phase='fetching'`, `detail='Searching GDELT...'`, `progress=0.35`
- `model_update`, `phase='l1_normalization'`, `detail='Computed z-scores for 18 signals'`, `partial_result={...}`

## Client Subscription
- UI subscribes by `run_id` and `user_id`.
- Ordered by `ts asc`.
- Lane rendering by `agent` and `kind`.
- Finalization on `kind='done'`.

## Failure Semantics
- Any single source failure writes `agent_error` event and `source_attempts` row.
- Run continues unless mission-required source set fails below minimum coverage threshold.
- Confidence reduction is explicit and trace-logged.
