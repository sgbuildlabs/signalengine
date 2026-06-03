import { enqueueSyntheticRun } from '@/lib/runs/enqueue';

async function enqueueAction(formData: FormData) {
  'use server';
  const entity = String(formData.get('entity') ?? 'NVIDIA');
  const missionType = String(formData.get('missionType') ?? 'sector_momentum');
  const horizonDays = Number(formData.get('horizonDays') ?? 90);
  await enqueueSyntheticRun({ entity, missionType, horizonDays });
}

export default function HomePage() {
  return (
    <main style={{ maxWidth: 860, margin: '0 auto' }}>
      <h1>Signal Engine - Sprint 1 Run Sandbox</h1>
      <p>
        This Sprint 1 slice enqueues a synthetic deterministic run and persists run + model output in Supabase.
      </p>
      <form action={enqueueAction} style={{ display: 'grid', gap: 12, maxWidth: 420 }}>
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
        <button type="submit">Run Synthetic Pipeline</button>
      </form>
      <p style={{ marginTop: 20 }}>
        API fallback: <code>POST /api/runs/enqueue</code> with {'{ entity, missionType, horizonDays }'}.
      </p>
    </main>
  );
}
