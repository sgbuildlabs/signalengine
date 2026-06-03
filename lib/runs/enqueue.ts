import { randomUUID } from 'node:crypto';
import { getSupabaseServiceClient } from '@/lib/supabase/server';
import { l1Normalize, l5FixedComposite, syntheticSignals } from '@/lib/model-stack/phase0';

export async function enqueueSyntheticRun(input: {
  entity: string;
  missionType: string;
  horizonDays: number;
}) {
  const supabase = getSupabaseServiceClient();
  const runId = randomUUID();
  const userId = process.env.SEED_USER_ID ?? '00000000-0000-0000-0000-000000000000';

  const { error: runErr } = await supabase.from('runs').insert({
    run_id: runId,
    user_id: userId,
    entity: input.entity,
    mission_type: input.missionType,
    horizon_days: input.horizonDays,
    status: 'completed',
  });
  if (runErr) throw runErr;

  const normalized = l1Normalize(syntheticSignals(input.entity), [10, 12, 14, 16, 18]);
  const composite = l5FixedComposite(normalized);

  const signalRows = normalized.map((s) => ({
    signal_id: randomUUID(),
    user_id: userId,
    run_id: runId,
    source: s.source,
    entity: s.entity,
    mission_type: input.missionType,
    signal_type: s.signal_type,
    raw_value: s.raw_value,
    unit: s.unit,
    z_score: s.z_score,
    final_weight: s.final_weight,
    contribution: (s.z_score ?? 0) * (s.final_weight ?? 0) * 10,
    confidence: composite.confidence,
    trace: s.trace,
    ts: s.timestamp,
  }));

  const { error: sigErr } = await supabase.from('signals').insert(signalRows);
  if (sigErr) throw sigErr;

  const { error: outputErr } = await supabase.from('model_outputs').insert({
    model_output_id: randomUUID(),
    user_id: userId,
    run_id: runId,
    entity: input.entity,
    mission_type: input.missionType,
    horizon_days: input.horizonDays,
    model_name: 'phase0_fixed_composite',
    output_score: composite.score,
    confidence: composite.confidence,
    score_range_low: composite.score - 5,
    score_range_high: composite.score + 5,
    input_features: { synthetic: true },
    explanation_json: { traces: composite.traces },
    allowed_numbers: [composite.score, composite.confidence, composite.score - 5, composite.score + 5],
  });
  if (outputErr) throw outputErr;

  return { runId, score: composite.score, confidence: composite.confidence };
}
