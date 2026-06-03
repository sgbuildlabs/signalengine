'use client';

import { FormEvent, useMemo, useState } from 'react';

interface RunResult {
  runId: string;
  score: number;
  confidence: number;
  scoreRangeLow: number;
  scoreRangeHigh: number;
  storageMode: 'supabase' | 'ephemeral';
  traces: string[];
}

interface SubmittedBrief {
  target: string;
  situation: string;
  question: string;
  horizonDays: number;
  lenses: string[];
}

const situationLabels: Record<string, string> = {
  leadership_update: 'brief leadership',
  planning: 'prepare a planning discussion',
  customer_watch: 'understand a customer or vendor',
  workforce: 'think through workforce or career impact',
};

const questionLabels: Record<string, string> = {
  momentum: 'Is momentum changing?',
  risk: 'Is risk building?',
  opportunity: 'Is opportunity opening?',
};

const lensLabels: Record<string, string> = {
  attention: 'Attention',
  narrative: 'Narrative',
  risk: 'Risk',
  demand: 'Demand',
};

function readoutStrength(score: number) {
  const abs = Math.abs(score);
  if (abs >= 25) return score > 0 ? 'clear positive movement' : 'clear negative movement';
  if (abs >= 10) return score > 0 ? 'early positive movement' : 'early negative movement';
  return 'no strong movement yet';
}

function managementPosture(score: number) {
  const abs = Math.abs(score);
  if (abs >= 25) return 'Bring this into the next planning conversation.';
  if (abs >= 10) return 'Keep it on the weekly watch list.';
  return 'Monitor for confirmation before escalating.';
}

function confidenceText(confidence: number) {
  if (confidence >= 0.75) return 'high enough to brief confidently';
  if (confidence >= 0.45) return 'moderate; useful for orientation, not a conclusion';
  return 'low; treat as an early prompt';
}

function dimensionValues(score: number) {
  return [
    {
      name: 'Market attention',
      state: score >= 0 ? 'warming' : 'cooling',
      detail: 'Synthetic attention signals are above the recent baseline.',
    },
    {
      name: 'Evidence strength',
      state: Math.abs(score) >= 10 ? 'developing' : 'thin',
      detail: 'This demo has a small evidence set, so the signal stays conservative.',
    },
    {
      name: 'Management risk',
      state: Math.abs(score) >= 25 ? 'needs review' : 'watch only',
      detail: 'No action claim is made; this is a prompt for follow-up research.',
    },
  ];
}

function explainTrace(trace: string) {
  if (trace.startsWith('Normalization:')) {
    return 'The engine compared one evidence point with a recent baseline.';
  }
  if (trace.startsWith('Composite:')) {
    return 'The engine combined the evidence into a single directional readout.';
  }
  return trace;
}

export function RunSandbox() {
  const [result, setResult] = useState<RunResult | null>(null);
  const [brief, setBrief] = useState<SubmittedBrief | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const dimensions = useMemo(() => (result ? dimensionValues(result.score) : []), [result]);

  async function submitRun(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const nextBrief: SubmittedBrief = {
      target: String(formData.get('target') ?? 'NVIDIA'),
      situation: String(formData.get('situation') ?? 'leadership_update'),
      question: String(formData.get('question') ?? 'momentum'),
      horizonDays: Number(formData.get('horizonDays') ?? 90),
      lenses: formData.getAll('lenses').map(String),
    };

    const response = await fetch('/api/runs/enqueue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entity: nextBrief.target,
        missionType: nextBrief.question === 'risk' ? 'company_intelligence' : 'sector_momentum',
        horizonDays: nextBrief.horizonDays,
      }),
    });
    const payload = await response.json();
    setPending(false);

    if (!payload.ok) {
      setResult(null);
      setError(payload.error ?? 'Run failed');
      return;
    }

    setBrief(nextBrief);
    setResult(payload);
  }

  return (
    <main className="shell">
      <section className="intro">
        <p className="eyebrow">Signal Engine demo</p>
        <h1>A management readout for what may be changing.</h1>
        <p className="lede">
          Pick the situation you are preparing for. The engine turns evidence into a plain-language view of momentum,
          risk, and what to watch next.
        </p>
      </section>

      <section className="workspace" aria-label="Signal workspace">
        <form className="run-form" onSubmit={submitRun}>
          <div className="form-block">
            <span className="step">1</span>
            <label htmlFor="situation">What are you trying to prepare?</label>
            <select id="situation" name="situation" defaultValue="leadership_update">
              <option value="leadership_update">A leadership update</option>
              <option value="planning">A planning discussion</option>
              <option value="customer_watch">A customer or vendor review</option>
              <option value="workforce">A workforce or career discussion</option>
            </select>
          </div>

          <div className="form-block">
            <span className="step">2</span>
            <label htmlFor="target">Who or what should we watch?</label>
            <input id="target" name="target" defaultValue="NVIDIA" placeholder="Company, sector, customer, theme" />
          </div>

          <div className="form-block">
            <span className="step">3</span>
            <label htmlFor="question">What question matters most?</label>
            <select id="question" name="question" defaultValue="momentum">
              <option value="momentum">Is momentum changing?</option>
              <option value="risk">Is risk building?</option>
              <option value="opportunity">Is opportunity opening?</option>
            </select>
          </div>

          <div className="form-grid">
            <div>
              <label htmlFor="horizonDays">Useful time window</label>
              <select id="horizonDays" name="horizonDays" defaultValue="90">
                <option value="30">Near term: 30 days</option>
                <option value="90">Planning view: 90 days</option>
                <option value="180">Strategic view: 180 days</option>
              </select>
            </div>
            <fieldset>
              <legend>Evidence lenses</legend>
              <label className="check">
                <input type="checkbox" name="lenses" value="attention" defaultChecked />
                Attention
              </label>
              <label className="check">
                <input type="checkbox" name="lenses" value="risk" defaultChecked />
                Risk
              </label>
              <label className="check">
                <input type="checkbox" name="lenses" value="demand" />
                Demand
              </label>
            </fieldset>
          </div>

          <button type="submit" disabled={pending}>
            {pending ? 'Building readout...' : 'Build readout'}
          </button>
        </form>

        <aside className="result-panel" aria-live="polite">
          {!result || !brief ? (
            <div className="empty-state">
              <p className="eyebrow">Output preview</p>
              <h2>A concise readout, not a math report.</h2>
              <p>
                You will see the bottom line, confidence in plain English, what dimensions moved, and what would make
                the view more or less convincing.
              </p>
            </div>
          ) : (
            <div>
              <p className="eyebrow">Management readout</p>
              <h2>{readoutStrength(result.score)}</h2>
              <p className="summary">
                For {brief.target}, this demo sees {readoutStrength(result.score)} over the next {brief.horizonDays}{' '}
                days. Use it to {situationLabels[brief.situation]}; the most relevant question is "
                {questionLabels[brief.question]}"
              </p>

              <div className="callout">
                <span>Suggested posture</span>
                <strong>{managementPosture(result.score)}</strong>
              </div>

              <div className="dimensions" aria-label="Signal dimensions">
                {dimensions.map((dimension) => (
                  <article key={dimension.name}>
                    <span>{dimension.name}</span>
                    <strong>{dimension.state}</strong>
                    <p>{dimension.detail}</p>
                  </article>
                ))}
              </div>

              <div className="readout-grid">
                <div>
                  <span>Confidence</span>
                  <strong>{confidenceText(result.confidence)}</strong>
                </div>
                <div>
                  <span>Selected lenses</span>
                  <strong>
                    {brief.lenses.length ? brief.lenses.map((lens) => lensLabels[lens]).join(', ') : 'Core signal'}
                  </strong>
                </div>
              </div>

              <section className="next-check">
                <h3>What to check next</h3>
                <ul>
                  <li>Look for a second confirming source before presenting this as a trend.</li>
                  <li>Compare the next run with this one to see whether the movement strengthens or fades.</li>
                  <li>Ask whether the signal matters for budget, staffing, customer risk, or timing.</li>
                </ul>
              </section>

              <p className="note">
                This is directional intelligence, not advice. This demo uses synthetic evidence and runs without a
                database.
              </p>

              <details>
                <summary>Show how the engine reached this view</summary>
                <ul>
                  {result.traces.map((trace) => (
                    <li key={trace}>{explainTrace(trace)}</li>
                  ))}
                </ul>
              </details>
            </div>
          )}

          {error ? <p className="error">{error}</p> : null}
        </aside>
      </section>
    </main>
  );
}
