import { Signal, CompositeResult } from '@/lib/types/contracts';

export function mean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function sampleStd(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  const variance = values.reduce((acc, v) => acc + (v - m) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

export function l1Normalize(signals: Signal[], history: number[]): Signal[] {
  const m = mean(history);
  const s = sampleStd(history);
  return signals.map((signal) => {
    const z = s === 0 ? 0 : (signal.raw_value - m) / s;
    return {
      ...signal,
      z_score: z,
      trace: [...signal.trace, `Normalization: raw=${signal.raw_value}; mu=${m}; sigma=${s}; z=${z}.`],
    };
  });
}

export function l5FixedComposite(signals: Signal[]): CompositeResult {
  const weighted = signals.map((s) => {
    const w = s.final_weight ?? 0;
    const z = s.z_score ?? 0;
    return z * w * 10;
  });
  const score = Math.max(-100, Math.min(100, weighted.reduce((a, b) => a + b, 0)));
  const confidence = 0.6;
  return {
    score,
    confidence,
    traces: [`Composite: score=${score}; confidence=${confidence}.`],
  };
}

export function syntheticSignals(entity: string): Signal[] {
  const now = new Date().toISOString();
  return [
    {
      source: 'SYNTHETIC_NEWS',
      entity,
      signal_type: 'news_velocity',
      raw_value: 20,
      unit: 'count',
      timestamp: now,
      window_days: 30,
      final_weight: 0.2,
      trace: [],
    },
    {
      source: 'SYNTHETIC_DEMAND',
      entity,
      signal_type: 'public_attention',
      raw_value: 15,
      unit: 'count',
      timestamp: now,
      window_days: 30,
      final_weight: 0.15,
      trace: [],
    },
  ];
}
