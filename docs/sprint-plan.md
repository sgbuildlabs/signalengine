# Sprint Roadmap (Spec §28 mapped to Vercel + Supabase stack)

## Sprint -1 (Scaffolding/Tooling/CI)
Build:
- Next.js App Router baseline (frontend + route handlers)
- Supabase local dev wiring and migration pipeline
- Vercel project link and environment contract
- GitHub Actions: typecheck + tests on PR
Definition of done:
- Repo runs locally, CI green on scaffold PR, Supabase migration workflow validated.

## Phase 0 — Math and Storage Skeleton
Build:
- Supabase migrations for spec tables + infra tables
- Signal/Outcome TS contracts
- deterministic model stack interfaces
- synthetic signal generator
- unit tests for L1 normalization
- unit tests for fixed-weight composite
Definition of done (spec-aligned):
- Synthetic signals produce deterministic scores.
- Scores are reproducible across runs.
- Traces are generated.

## Phase 1 — One Real Agent
Build:
- EDGAR agent
- raw_events storage
- signals storage
- L1 normalization
- fixed L5 composite
- basic run record
Definition of done:
- Given one ticker/company, EDGAR produces Signal[].
- Model stack produces one composite score.
- Run and signals are written to Supabase Postgres.

## Phase 2 — Belief Chain
Build:
- beliefs table usage
- Normal-Normal Bayesian update
- prior/posterior trace entries
- run-over-run update
Definition of done:
- Run same entity twice.
- Second run loads first run posterior as prior.
- Trace shows prior ? observation ? posterior.

## Phase 3 — Add Time Dynamics
Build:
- EWMA
- momentum
- recency decay
- source reliability table integration
- missing-data penalty
Definition of done:
- Score changes when evidence is fresh vs stale.
- Confidence drops when expected sources are missing.

## Phase 4 — Add More Agents
Add:
- GDELT
- FRED
- Wikimedia Pageviews
- Hacker News Algolia
- Reddit optional
Use:
- Promise.all for parallelism
- shared AgentResult contract
- Postgres cache and rate-limit layer
- source_attempts table
Definition of done:
- At least four agents run in parallel.
- Failed optional agents do not kill the run.

## Phase 5 — Streaming UX (Realtime adaptation)
Build:
- run_events writing from worker
- Supabase Realtime subscription layer
- agent lane events and model update events
- frontend run page with lane rendering
Definition of done:
- User watches agent progress in real time.
- Partial failures are visible.
- Model stack progress is visible.

## Phase 6 — Orchestrator LLM
Build:
- intent parsing
- mission profile selection
- entity resolution
- agent selection
- structured output validation
- final prose generation from model_output_json
- numeric hallucination validator gate
Definition of done:
- LLM selects relevant agents.
- Final explanation contains only allowed deterministic numbers.
- Invalid numeric prose is rejected/regenerated/templated.

## Phase 7 — Backtest Framework
Build:
- forecasts table usage
- outcomes table usage
- forecast resolver
- directional accuracy metric
- error metric
- no-leakage guardrails
Definition of done:
- One historical backtest runs.
- Predicted outcome type matches actual outcome type.
- No same-window tuning leakage.

## Phase 8 — Conservative Self-Tuning Weights
Build:
- hit-rate calculation
- sample_n thresholds
- Bayesian shrinkage plan
- weight caps
- effective weights
Definition of done:
- Weights do not move aggressively before sample_n >= 20.
- No low-reliability source can dominate a forecast.

## Phase 9 — Hypothesis Ledger
Build:
- hypotheses table wiring
- hypothesis generation from model outputs
- status tracking (strengthening/weakening/stable/invalidated)
- prior vs current confidence history
- evidence_for/evidence_against linking
- invalidation conditions surfaced
Definition of done:
- Each run creates/updates hypotheses.
- Hypotheses show confidence change since prior run.
- Each hypothesis lists invalidation conditions.
- Hypothesis claims contain only validated deterministic numbers.

## Phase 10 — Interrogation Loop
Build:
- why this score?
- remove source and rerun
- show only one source class
- compare two entities
- compare two missions
- what would change conclusion?
Definition of done:
- User can challenge result.
- System reruns with modified source inclusion/weights.
- All changes are traceable.

## Stack Adaptation Notes
- SSE replaced by Supabase Realtime transport.
- Redis replaced by Postgres cache + rate-limit tables.
- Long-running FastAPI request replaced by job queue + worker route + cron drain.
