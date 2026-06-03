import assert from 'node:assert/strict';
import test from 'node:test';
import { enqueueSyntheticRun } from '../lib/runs/enqueue';

test('enqueueSyntheticRun returns an ephemeral result without Supabase config', async () => {
  const oldUrl = process.env.SUPABASE_URL;
  const oldKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    const result = await enqueueSyntheticRun({
      entity: 'NVIDIA',
      missionType: 'sector_momentum',
      horizonDays: 90,
    });

    assert.equal(result.storageMode, 'ephemeral');
    assert.equal(result.confidence, 0.6);
    assert.ok(result.traces.some((trace) => trace.startsWith('Normalization:')));
    assert.ok(result.traces.some((trace) => trace.startsWith('Composite:')));
  } finally {
    if (oldUrl === undefined) {
      delete process.env.SUPABASE_URL;
    } else {
      process.env.SUPABASE_URL = oldUrl;
    }
    if (oldKey === undefined) {
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    } else {
      process.env.SUPABASE_SERVICE_ROLE_KEY = oldKey;
    }
  }
});
