# Signal Engine Roadmap

## Product Mission
Signal Engine helps IT services leaders understand what may be changing around an account, industry, capability, competitor, or delivery situation before they walk into a business conversation.

The product turns free public evidence into role-specific management readouts:
- what changed
- why it matters for this role
- which business dimensions are affected
- how much confidence the system has
- what to check next
- what would change the view

The product is not a dashboard of model math. It is an intelligence cockpit for account planning, QBRs, delivery governance, pipeline reviews, practice planning, and leadership updates.

## Primary Segment
Mid-to-senior leaders in IT services firms who need external intelligence but do not have time to inspect raw public data.

Primary wedge:
- Client Partners and Account Leaders preparing account reviews, QBRs, growth plans, renewal discussions, and leadership updates.

Expansion segments:
- Delivery Leaders watching delivery risk and client pressure.
- Practice or Offering Leaders watching demand formation.
- Sales and Business Development Leaders prioritizing pursuit triggers.
- Industry Leads watching sector shifts.
- Talent and Workforce Leaders watching capability demand.
- PMO and Account Operations Leaders tracking recurring account intelligence.

## Personas
1. Client Partner
- Goal: protect and grow strategic accounts.
- Needs: expansion signals, executive narrative shifts, risk flags, relationship prompts, and account-review talking points.

2. Delivery Leader
- Goal: keep delivery healthy and anticipate escalation pressure.
- Needs: operational risk, compliance pressure, client stress, scope-change indicators, and delivery-watch prompts.

3. Practice or Offering Leader
- Goal: invest in the right offerings and capabilities.
- Needs: demand formation, competitor motion, technology adoption, innovation activity, and capability relevance.

4. Sales or Business Development Leader
- Goal: focus sellers on accounts with credible movement.
- Needs: pursuit triggers, white-space indicators, buying-cycle clues, competitor activity, and account prioritization.

5. Industry Lead
- Goal: brief leadership on sector shifts and implications.
- Needs: sector headwinds/tailwinds, regulatory movement, spending pressure, transformation urgency, and board-level narrative.

6. Talent or Workforce Leader
- Goal: align skills and staffing with demand.
- Needs: capability demand, redeployment signals, hiring pressure, skill adjacency, and timing.

7. PMO or Account Operations Lead
- Goal: keep account intelligence consistent over time.
- Needs: repeatable readouts, prior-vs-current changes, evidence history, and follow-up reminders.

## 10 Jobs To Be Done
1. When I prepare for an account review, help me see what changed around the client before I meet leadership.
2. When I own a strategic client, help me spot expansion, risk, or relationship signals early enough to ask better questions.
3. When I lead delivery, help me understand whether external pressure could affect scope, timeline, quality, or escalation risk.
4. When I run a practice, help me see where demand may be forming so I can prioritize offerings.
5. When I manage sales coverage, help me identify which accounts deserve attention this week.
6. When I build a QBR or leadership update, help me convert scattered public evidence into a concise business readout.
7. When a client industry shifts, help me understand whether the change affects spend, urgency, risk, or competitive posture.
8. When I plan workforce capacity, help me see whether capability demand is rising, fading, or moving to adjacent skills.
9. When I hear a hypothesis from sales or delivery, help me validate or challenge it with traceable public evidence.
10. When I revisit a client or market over time, help me see what changed since the last run and whether confidence improved or weakened.

## Role-First Mission Model
Every mission starts with business context before model context.

Required mission fields:
- role: client_partner, delivery_leader, practice_lead, sales_leader, industry_lead, talent_leader, pmo_ops
- business_situation: account_review, qbr, pursuit_planning, delivery_governance, renewal_watch, practice_planning, workforce_planning, leadership_update
- target_type: client, prospect, competitor, sector, offering, capability, regulation, geography
- target: free text entity or theme
- business_question: growth, risk, demand, delivery_health, competitive_pressure, renewal_expansion, talent_readiness, regulatory_pressure
- horizon_days: 30, 90, 180
- selected_dimensions: account_growth, budget_pressure, delivery_risk, relationship_risk, regulatory_pressure, transformation_urgency, competitive_threat, talent_readiness, offering_demand, renewal_timing, executive_narrative, sector_headwinds

## Readout Framework
Primary output must be useful to a management user in under five seconds.

Readout sections:
- Bottom line: one plain-language view of what may be changing.
- Role implication: why this matters for the selected persona.
- Business dimensions: 5-8 contextual dimensions with state, rationale, and watch level.
- Confidence: plain English plus deterministic backing numbers available on expand.
- Evidence drivers: top positive and negative drivers from traces.
- Missing data: what was unavailable and how it affected confidence.
- Next checks: practical questions the user can bring to the next meeting.
- What would change the view: explicit invalidation or confirmation conditions.
- Trace details: expandable model explanation, never the primary screen.

No primary screen should lead with raw z-scores, sigma, storage mode, internal mission_type, source jargon, or numeric ranges without business translation.

## Product Market Fit Hypothesis
Initial PMF wedge:
- IT services Client Partners and Account Leaders use Signal Engine before QBRs and account reviews to identify credible account-growth and account-risk questions from public evidence.

Why this wedge is attractive:
- The workflow already exists: QBRs, account plans, pipeline reviews, leadership updates.
- The pain is frequent: account teams struggle to separate meaningful external change from news noise.
- The output is actionable without giving advice: better questions, sharper briefs, stronger account hypotheses.
- The product moat maps to the spec: deterministic scoring, persistent beliefs, traceability, and run-over-run memory.

PMF signals to validate:
- Users run the same account repeatedly.
- Users export or copy readouts into QBR/account planning materials.
- Users ask follow-up questions like "what changed since last run?" or "what would change the conclusion?"
- Users trust the output more because evidence, missing data, and confidence are visible.
- Users request account/team watchlists.

## UX/UI Framework Guardrails
The product should keep the cockpit direction and avoid regressing into a raw form.

UI principles:
- Role first, target second, model third.
- Use business-language controls instead of technical labels.
- Render outcomes as readouts, not score reports.
- Use progressive disclosure for math, traces, and source details.
- Show uncertainty, missing data, and source quality without weakening the main insight.
- Keep the interface dense enough for managers but calm enough for first-time users.
- Preserve deterministic-number guardrails; LLM narration may not invent numbers.

## Revised Sprint Roadmap

### Sprint UX-0 - Role-First Product Shell
Build:
- Replace generic sandbox framing with role-first mission setup.
- Add persona selector for Client Partner, Delivery Leader, Practice Lead, Sales Leader, Industry Lead, Talent Leader, and PMO/Ops.
- Add business situation selector tied to IT services workflows.
- Keep the current cockpit layout: mission setup on the left, readout on the right.
Definition of done:
- A first-time IT services manager understands who the product is for and what question it helps answer.
- The demo runs without Supabase and still produces a useful management readout.

### Sprint UX-1 - Contextual Management Readout
Build:
- Replace generic dimensions with IT services dimensions: account growth, budget pressure, delivery risk, relationship risk, regulatory pressure, transformation urgency, competitive threat, talent readiness, offering demand, renewal timing.
- Map selected role and situation to dimension priorities.
- Translate deterministic score/confidence into plain-language posture and watch level.
Definition of done:
- The output reads like a useful account or management brief, not a math report.
- Users can tell what to do next without reading trace details.

### Sprint UX-2 - Mission Templates for IT Services
Build:
- Add one-click templates: Account QBR prep, Strategic client growth watch, Delivery risk watch, Competitor account movement, Practice demand pulse, Workforce capability watch, Regulatory pressure watch.
- Each template sets role, situation, target_type, question, horizon, and dimensions.
Definition of done:
- A user can start a meaningful mission in one click and then edit assumptions.

### Sprint UX-3 - Evidence Drivers and Business Rationale
Build:
- Convert trace entries into business-facing evidence driver cards.
- Separate observed evidence, model transformation, confidence penalty, and final readout.
- Keep raw model values behind an expandable technical drawer.
Definition of done:
- Every primary claim expands into trace-derived evidence.
- The first screen remains free of raw math jargon.

### Sprint UX-4 - Realtime Agent Lanes
Build:
- Pull Phase 5 forward visually using run_events.
- Show lanes for source collection, partial failures, model phases, and finalization.
- Use business labels for source groups: filings, news, macro, demand, talent/community, regulation, innovation.
Definition of done:
- Users can watch the run assemble without needing to understand the backend.
- Missing data is visible and confidence impact is clear.

### Sprint UX-5 - Hypothesis Ledger Preview
Build:
- Surface role-specific hypotheses: strengthening, weakening, stable, invalidated.
- Show prior vs current confidence when prior runs exist.
- Add invalidation conditions in business language.
Definition of done:
- Users can see what changed since the last run and what would change the conclusion.

### Sprint UX-6 - Interrogation Loop
Build:
- Add challenge controls: compare two accounts, compare two sectors, remove a source class, change horizon, show only filings/news/regulation/demand, ask what would change the view.
Definition of done:
- Users can challenge a result without leaving the run page.
- All changes remain traceable and deterministic.

## Spec Build Phases
The UX acceleration track must not compromise the spec build order. It changes presentation and mission framing, not the deterministic model contract.

### Sprint -1 - Scaffolding/Tooling/CI
Build:
- Next.js App Router baseline.
- Supabase local dev wiring and migration pipeline where a persistent DB is used.
- Vercel project link and environment contract.
- GitHub Actions typecheck and tests.
Definition of done:
- Repo runs locally, CI is green, deployment works, and persistence path is documented.

### Phase 0 - Math and Storage Skeleton
Build:
- Schema/migration scaffold for spec tables and infra tables.
- Signal/Outcome/AgentResult contracts.
- Deterministic model stack interfaces.
- Synthetic signal generator.
- Unit tests for L1 normalization and fixed-weight composite.
Definition of done:
- Synthetic signals produce deterministic scores.
- Scores are reproducible across runs.
- Traces are generated.

### Phase 1 - One Real Agent
Build:
- EDGAR agent.
- raw_events storage.
- signals storage.
- L1 normalization.
- fixed L5 composite.
- basic run record.
Definition of done:
- Given one ticker/company, EDGAR produces Signal[].
- Model stack produces one composite score.
- Run and signals are persisted when persistence is configured.

### Phase 2 - Belief Chain
Build:
- beliefs table usage.
- Normal-Normal Bayesian update.
- prior/posterior trace entries.
- run-over-run update.
Definition of done:
- Run same entity twice.
- Second run loads first run posterior as prior.
- Trace shows prior to observation to posterior.

### Phase 3 - Add Time Dynamics
Build:
- EWMA.
- momentum.
- recency decay.
- source reliability integration.
- missing-data penalty.
Definition of done:
- Score changes when evidence is fresh vs stale.
- Confidence drops when expected sources are missing.

### Phase 4 - Add More Agents
Build:
- GDELT.
- FRED.
- Wikimedia Pageviews.
- Hacker News Algolia.
- Reddit optional.
- shared AgentResult contract.
- Postgres cache and rate-limit layer or equivalent durable cache.
- source_attempts table.
Definition of done:
- At least four agents run in parallel.
- Failed optional agents do not kill the run.

### Phase 5 - Streaming UX
Build:
- run_events writing from worker.
- Supabase Realtime or equivalent event transport.
- agent lane events and model update events.
- frontend run page lane rendering.
Definition of done:
- User watches agent progress in real time.
- Partial failures are visible.
- Model stack progress is visible.

### Phase 6 - Orchestrator LLM
Build:
- intent parsing.
- role/situation/mission profile selection.
- entity resolution.
- agent selection.
- structured output validation.
- final prose generation from deterministic model_output_json.
- numeric hallucination validator gate.
Definition of done:
- LLM selects relevant agents and mission profile.
- Final explanation contains only allowed deterministic numbers.
- Invalid numeric prose is rejected, regenerated, or templated.

### Phase 7 - Backtest Framework
Build:
- forecasts table usage.
- outcomes table usage.
- forecast resolver.
- directional accuracy metric.
- error metric.
- no-leakage guardrails.
Definition of done:
- One historical backtest runs.
- Predicted outcome type matches actual outcome type.
- No same-window tuning leakage.

### Phase 8 - Conservative Self-Tuning Weights
Build:
- hit-rate calculation.
- sample_n thresholds.
- Bayesian shrinkage plan.
- weight caps.
- effective weights.
Definition of done:
- Weights do not move aggressively before sample_n >= 20.
- No low-reliability source can dominate a forecast.

### Phase 9 - Hypothesis Ledger
Build:
- hypotheses table wiring.
- hypothesis generation from model outputs.
- status tracking.
- prior vs current confidence history.
- evidence_for/evidence_against linking.
- invalidation conditions surfaced.
Definition of done:
- Each run creates or updates hypotheses.
- Hypotheses show confidence change since prior run.
- Each hypothesis lists invalidation conditions.
- Hypothesis claims contain only validated deterministic numbers.

### Phase 10 - Interrogation Loop
Build:
- why this score?
- remove source and rerun.
- show only one source class.
- compare two entities.
- compare two missions.
- what would change conclusion?
Definition of done:
- User can challenge result.
- System reruns with modified source inclusion/weights.
- All changes are traceable.

## Stack Adaptation Notes
- SSE is replaced by Supabase Realtime or equivalent event transport.
- Redis is replaced by durable cache/rate-limit tables unless another durable store is selected.
- Long-running FastAPI requests are replaced by job queue + worker route + cron drain.
- The no-Supabase demo mode is acceptable only for synthetic demos; real product runs need durable memory because the product must not run statelessly.
