# Sprint Roadmap (Spec §28 mapped to Vercel + Supabase stack)

## UX Acceleration Track - Signal Cockpit
Goal:
- Move Signal Engine from a form-and-result sandbox into an investigative cockpit where users can ask a strategic question, watch evidence assemble, understand conviction, and challenge the conclusion.

Build principles:
- Ask: support natural-language missions alongside structured controls.
- Watch: show realtime agent lanes for source collection, partial failures, model phases, and finalization.
- Understand: make the result instantly scannable with direction, confidence, range, source coverage, and top evidence drivers.
- Trust: make missing-data penalties, trace-derived rationale, and deterministic-number boundaries visible without overwhelming the main answer.
- Challenge: let users compare, remove sources, change horizon, isolate source classes, and ask what would change the conclusion.

Immediate build plan:
- Sprint UX-0: Product Shell
  - Replace the demo layout with a cockpit: mission composer, live run canvas, insight summary, and recent runs.
  - Add one-click sample missions for company intelligence, sector momentum, career opportunity, competitor watch, regulatory risk, and innovation pulse.
- Sprint UX-1: Signal Result Card
  - Add a primary conviction card with direction badge, confidence meter, score range, storage/source coverage, and top three evidence drivers.
  - Separate directional intelligence caveats from the primary result so they do not dilute the insight reveal.
- Sprint UX-2: Realtime Agent Lanes
  - Pull Phase 5 forward visually using `run_events`.
  - Render lane states for queued, searching, found, partial, failed, modeling, and done.
  - Keep partial failures visible while preserving confidence in the run continuing.
- Sprint UX-3: Evidence Timeline
  - Convert trace entries into a chronological evidence trail with expandable source cards.
  - Distinguish observed evidence, model transformation, penalties, and final synthesis.
- Sprint UX-4: Mission Templates
  - Turn common jobs into guided templates with sensible defaults and editable assumptions.
  - Preserve a freeform mission path for expert users.
- Sprint UX-5: Hypothesis Ledger Preview
  - Surface strengthening, weakening, stable, and invalidated theses before the full ledger backend is complete.
  - Show prior vs current confidence when prior runs exist.
- Sprint UX-6: Interrogation Loop
  - Add challenge controls: compare two entities, compare two missions, remove a source, show only one source class, change horizon, and reveal what would flip the result.

Definition of done:
- A first-time user can run a meaningful sample mission in one click.
- A repeat user can understand the conclusion in under five seconds.
- Every primary claim can be expanded into traceable evidence.
- Users can challenge a result without leaving the run page.
- The UI makes progress, uncertainty, missing data, and source quality legible.
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
