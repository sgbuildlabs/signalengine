# Signal Engine Model Stack (Sprint 0, Design Only)

All layers are deterministic TypeScript functions. Every layer appends one deterministic trace string per signal it changes.

## Shared Types
```ts
interface Signal { /* see docs/data-model.md */ }
interface HistoryPoint { ts: string; value: number }
interface BeliefState { prior_mean: number; prior_var: number }
interface MissionProfile { mission_type: string; horizon_days: number }
```

## L1 Normalization
```ts
function l1Normalize(
  signals: Signal[],
  historyByKey: Record<string, number[]>
): Signal[]
```
- Input: raw signals + trailing values by `(entity, signal_type, source)`.
- Output: same signals with `z_score` set.
- Trace template:
  - `Normalization: raw={raw_value}; mu={mu}; sigma={sigma}; z={z}.`

Test vector:
- history `[10, 12, 14, 16, 18]`, raw `20`
- `mu=14`, sample `sigma=sqrt(10)=3.1623`, `z=(20-14)/3.1623=1.8974`
- expected `z_score=1.8974` (4 d.p.)

## L2 Time Dynamics (EWMA + momentum + decay)
```ts
function l2TimeDynamics(
  signals: Signal[],
  priorEwmaByKey: Record<string, number>,
  nowIso: string,
  halfLifeDaysBySource: Record<string, number>,
  alphaBySignalType: Record<string, number>
): Signal[]
```
- Output fields: `ewma`, `momentum`, `decay_weight`.
- Formulas:
  - `ewma_t = alpha*x_t + (1-alpha)*ewma_(t-1)`
  - `momentum = (ewma_t-ewma_(t-1))/abs(ewma_(t-1))`
  - `decay = exp(-ln(2)*age_days/half_life_days)`
- Trace template:
  - `Time dynamics: ewma_prev={prev}; ewma={ewma}; momentum={momentum_pct}%; decay={decay}.`

Test vector:
- `x_t=2.0`, `ewma_prev=1.5`, `alpha=0.3`, age=7d, half-life=14d
- `ewma=1.65`, `momentum=0.10`, `decay=exp(-ln2*0.5)=0.7071`

## L2.5 CUSUM Change Point
```ts
function l25Cusum(
  signals: Signal[],
  cusumStateByKey: Record<string, { sPos: number; sNeg: number }>,
  histMeanStdByKey: Record<string, { mu: number; sigma: number }>,
  params: { kSigma: number; hSigma: number }
): Signal[]
```
- Slack `k = kSigma*sigma`; threshold `h = hSigma*sigma`.
- `sPos = max(0, sPosPrev + (x-mu) - k)`
- `sNeg = max(0, sNegPrev - (x-mu) - k)`
- state:
  - `none` if both <= `0.7h`
  - `early_change` if max(`sPos`,`sNeg`) > `0.7h` and <= `h`
  - `confirmed_shift` if max(`sPos`,`sNeg`) > `h`
- Trace template:
  - `Change-point: x={x}; mu={mu}; k={k}; h={h}; s_pos={sPos}; s_neg={sNeg}; state={state}.`

Test vector:
- `mu=100`, `sigma=10`, `kSigma=0.5` => `k=5`, `hSigma=4` => `h=40`
- prev `sPos=30`, `x=118`: new `sPos=max(0,30+(18)-5)=43`
- `43 > 40` => `cusum_state='confirmed_shift'`

## L3 Cross-Signal Relationships
```ts
interface CrossSignalAdjustments {
  bySignalId: Record<string, number>; // additive contribution adjustment in score points
}

function l3CrossSignal(
  signals: Signal[],
  missionProfile: MissionProfile
): CrossSignalAdjustments
```
- Purpose: detect agreement/divergence and adjust confidence/contribution modestly.
- Deterministic rule (initial):
  - correlation-sign agreement bonus `+0.5` points per agreeing pair
  - divergence penalty `-0.75` per high-magnitude opposite pair (`|z|>=1.0`)
- Trace template:
  - `Cross-signal: agreement_pairs={a}; divergence_pairs={d}; adj={adj}.`

Test vector:
- three normalized signals z: `+2.0`, `+1.5`, `-1.8`
- agreeing pair count=1, divergent pairs=2
- adjustment `0.5*1 - 0.75*2 = -1.0`

## L4 Bayesian Belief Update (Normal-Normal)
```ts
interface UpdatedBelief {
  key: string;
  prior_mean: number;
  prior_var: number;
  obs_mean: number;
  obs_var: number;
  posterior_mean: number;
  posterior_var: number;
}

function l4BayesUpdate(
  observationsByBeliefKey: Record<string, { obs_mean: number; obs_var: number }>,
  priorsByBeliefKey: Record<string, BeliefState>
): UpdatedBelief[]
```
- Formulas:
  - `post_var = 1 / (1/prior_var + 1/obs_var)`
  - `post_mean = post_var * (prior_mean/prior_var + obs_mean/obs_var)`
- Trace template:
  - `Belief update: prior=({pm},{pv}); obs=({om},{ov}); posterior=({postm},{postv}).`

Test vector:
- prior `(0.4, 0.25)`, obs `(0.8, 0.16)`
- `post_var=1/(4+6.25)=0.09756`
- `post_mean=0.09756*(1.6+5.0)=0.6439`

## L5 Composite + Uncertainty
```ts
interface CompositeResult {
  compositeScore: number; // bounded [-100, 100]
  confidence: number;     // [0,1]
  missingDataPenalty: number;
  contributions: Array<{ signalId: string; contribution: number }>;
}

function l5Composite(
  signals: Signal[],
  effectiveWeightsBySource: Record<string, number>,
  penalties: { missingDataPenalty: number; concentrationPenalty: number }
): CompositeResult
```
- Contribution per signal:
  - `contribution = z_score * final_weight * 10`
  - `final_weight = default_or_effective * reliability_weight * decay_weight`
- score:
  - `raw = sum(contributions) + cross_signal_adjustments`
  - `score = clamp(raw, -100, 100)`
- confidence base:
  - weighted coverage minus penalties.
- Trace template:
  - `Composite: weight={fw}; contribution={c}; missing_penalty={mp}; score={score}; confidence={conf}.`

Test vector:
- contributions: `+12`, `+8`, `-5` => raw `15`
- missing penalty `0.20` (2/10 expected missing)
- confidence base `0.75`, final `0.55`
- expected score `15`, confidence `0.55`

## L6 Confidence + Packaging
```ts
interface ModelOutput {
  score: number;
  confidence: number;
  confidenceLabel: 'low' | 'medium' | 'high';
  scoreRangeLow: number;
  scoreRangeHigh: number;
  allowed_numbers: number[];
  explanation: Record<string, unknown>;
}

function l6Package(
  result: CompositeResult,
  tracesBySignal: Record<string, string[]>,
  uncertainty: { dispersion: number; missingDataPenalty: number }
): ModelOutput
```
- Confidence labels:
  - low `<0.45`, medium `<0.75`, high `>=0.75`.
- Range:
  - `halfWidth = max(5, round(uncertainty.dispersion*10 + missingDataPenalty*20))`
  - low/high = clamp(score ± halfWidth, -100, 100)
- `allowed_numbers` includes every numeric emitted value.
- Trace template:
  - `Packaging: score={score}; confidence={confidence}; range=[{low},{high}].`

Test vector:
- score `71`, confidence `0.64`, dispersion `0.45`, missing penalty `0.10`
- halfWidth `max(5, round(4.5+2))=7`
- range `[64, 78]`, label `medium`

## Determinism Rules
- No random seeds in runtime scoring.
- Stable sorting before aggregation.
- Fixed rounding policy in formatting layer only (math computed in full precision).
- All model traces include source numeric values used in that layer.
