import assert from 'node:assert/strict';
import test from 'node:test';
import { l1Normalize, l5FixedComposite, syntheticSignals } from '../lib/model-stack/phase0';

test('l1Normalize produces deterministic z-score', () => {
  const signals = syntheticSignals('NVIDIA').slice(0, 1);
  const out = l1Normalize(signals, [10, 12, 14, 16, 18]);
  assert.equal(Number((out[0].z_score ?? 0).toFixed(4)), 1.8974);
  assert.match(out[0].trace[0], /Normalization:/);
});

test('l5FixedComposite is reproducible', () => {
  const normalized = l1Normalize(syntheticSignals('NVIDIA'), [10, 12, 14, 16, 18]);
  const compositeA = l5FixedComposite(normalized);
  const compositeB = l5FixedComposite(normalized);
  assert.equal(compositeA.score, compositeB.score);
  assert.equal(compositeA.confidence, 0.6);
  assert.ok(compositeA.traces.length > 0);
});
