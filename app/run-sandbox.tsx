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

interface SubmittedMission {
  entity: string;
  missionType: string;
  horizonDays: number;
}

const missionLabels: Record<string, string> = {
  sector_momentum: 'Sector momentum',
  company_intelligence: 'Company intelligence',
  career_opportunity: 'Career opportunity',
};

function signalDirection(score: number) {
  if (score >= 10) return 'strengthening';
  if (score <= -10) return 'weakening';
  return 'mostly flat';
}

function confidenceLabel(confidence: number) {
  if (confidence >= 0.75) return 'high';
  if (confidence >= 0.45) return 'medium';
  return 'low';
}

function plainTrace(trace: string) {
  if (trace.startsWith('Normalization:')) {
    return 'A synthetic evidence signal was compared with its recent baseline.';
  }
  if (trace.startsWith('Composite:')) {
    return 'The deterministic model combined the signal contributions into one directional score.';
  }
  return trace;
}

export function RunSandbox() {
  const [result, setResult] = useState<RunResult | null>(null);
  const [submittedMission, setSubmittedMission] = useState<SubmittedMission | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const direction = useMemo(() => (result ? signalDirection(result.score) : null), [result]);
  const confidence = useMemo(() => (result ? confidenceLabel(result.confidence) : null), [result]);

  async function submitRun(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const mission = {
      entity: String(formData.get('entity') ?? 'NVIDIA'),
      missionType: String(formData.get('missionType') ?? 'sector_momentum'),
      horizonDays: Number(formData.get('horizonDays') ?? 90),
    };
    const response = await fetch('/api/runs/enqueue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mission),
    });
    const payload = await response.json();
    setPending(false);

    if (!payload.ok) {
      setResult(null);
      setError(payload.error ?? 'Run failed');
      return;
    }

    setSubmittedMission(mission);
    setResult(payload);
  }

  return (
    <main className="shell">
      <section className="intro">
        <p className="eyebrow">Signal Engine demo</p>
        <h1>Turn public evidence into a directional signal.</h1>
        <p className="lede">
          This first demo uses synthetic evidence so you can see the scoring flow without accounts, keys, or Supabase.
        </p>
      </section>

      <section className="workspace" aria-label="Signal workspace">
        <form className="run-form" onSubmit={submitRun}>
          <div>
            <label htmlFor="entity">What are you watching?</label>
            <input id="entity" name="entity" defaultValue="NVIDIA" placeholder="Company, sector, career, or theme" />
          </div>

          <div>
            <label htmlFor="missionType">What signal do you want?</label>
            <select id="missionType" name="missionType" defaultValue="sector_momentum">
              <option value="sector_momentum">Sector momentum</option>
              <option value="company_intelligence">Company intelligence</option>
              <option value="career_opportunity">Career opportunity</option>
            </select>
          </div>

          <div>
            <label htmlFor="horizonDays">Time horizon</label>
            <select id="horizonDays" name="horizonDays" defaultValue="90">
              <option value="30">30 days</option>
              <option value="90">90 days</option>
              <option value="180">180 days</option>
            </select>
          </div>

          <button type="submit" disabled={pending}>
            {pending ? 'Running analysis...' : 'Generate signal'}
          </button>
        </form>

        <aside className="result-panel" aria-live="polite">
          {!result ? (
            <div className="empty-state">
              <h2>Ready for a sample run</h2>
              <p>
                Generate a signal to see the current view, confidence range, and the evidence trail used by the model.
              </p>
            </div>
          ) : (
            <div>
              <p className="eyebrow">Current view</p>
              <h2>{direction}</h2>
              <p className="summary">
                {missionLabels[submittedMission?.missionType ?? 'sector_momentum']} for{' '}
                {submittedMission?.entity ?? 'this target'} is {direction} over{' '}
                {submittedMission?.horizonDays ?? 90} days. Confidence is {confidence}, with a directional score range
                from {result.scoreRangeLow.toFixed(1)} to {result.scoreRangeHigh.toFixed(1)}.
              </p>

              <div className="metrics">
                <div>
                  <span>Score</span>
                  <strong>{result.score.toFixed(1)}</strong>
                </div>
                <div>
                  <span>Confidence</span>
                  <strong>{confidence}</strong>
                </div>
                <div>
                  <span>Range</span>
                  <strong>
                    {result.scoreRangeLow.toFixed(1)} to {result.scoreRangeHigh.toFixed(1)}
                  </strong>
                </div>
              </div>

              <p className="note">
                This is directional intelligence, not advice. Storage mode is {result.storageMode}; no external data
                source is required for this demo.
              </p>

              <details>
                <summary>Why did the model say this?</summary>
                <ul>
                  {result.traces.map((trace) => (
                    <li key={trace}>{plainTrace(trace)}</li>
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
