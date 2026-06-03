'use client';

import { FormEvent, useState } from 'react';

interface RunResult {
  runId: string;
  score: number;
  confidence: number;
  scoreRangeLow: number;
  scoreRangeHigh: number;
  storageMode: 'supabase' | 'ephemeral';
  traces: string[];
}

export function RunSandbox() {
  const [result, setResult] = useState<RunResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submitRun(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const response = await fetch('/api/runs/enqueue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entity: formData.get('entity'),
        missionType: formData.get('missionType'),
        horizonDays: Number(formData.get('horizonDays')),
      }),
    });
    const payload = await response.json();
    setPending(false);

    if (!payload.ok) {
      setResult(null);
      setError(payload.error ?? 'Run failed');
      return;
    }

    setResult(payload);
  }

  return (
    <main style={{ maxWidth: 860, margin: '0 auto' }}>
      <h1>Signal Engine - Sprint 1 Run Sandbox</h1>
      <p>Run deterministic synthetic signals now. Supabase persistence is optional for this sandbox.</p>
      <form onSubmit={submitRun} style={{ display: 'grid', gap: 12, maxWidth: 420 }}>
        <label>
          Entity
          <input name="entity" defaultValue="NVIDIA" style={{ width: '100%' }} />
        </label>
        <label>
          Mission Type
          <input name="missionType" defaultValue="sector_momentum" style={{ width: '100%' }} />
        </label>
        <label>
          Horizon Days
          <input name="horizonDays" type="number" defaultValue={90} style={{ width: '100%' }} />
        </label>
        <button type="submit" disabled={pending}>
          {pending ? 'Running...' : 'Run Synthetic Pipeline'}
        </button>
      </form>

      {error ? <p style={{ color: '#b91c1c' }}>{error}</p> : null}

      {result ? (
        <section style={{ marginTop: 24 }}>
          <h2>Directional Signal</h2>
          <p>
            Score {result.score.toFixed(4)} with confidence {result.confidence.toFixed(2)} and range{' '}
            {result.scoreRangeLow.toFixed(4)} to {result.scoreRangeHigh.toFixed(4)}.
          </p>
          <p>Storage mode: {result.storageMode}</p>
          <ul>
            {result.traces.map((trace) => (
              <li key={trace}>{trace}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
