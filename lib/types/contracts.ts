export type CusumState = 'none' | 'early_change' | 'confirmed_shift';

export interface Signal {
  source: string;
  entity: string;
  signal_type: string;
  raw_value: number;
  unit: string;
  timestamp: string;
  window_days: number;
  source_url?: string | null;
  raw_ref?: string | null;
  z_score?: number | null;
  ewma?: number | null;
  momentum?: number | null;
  cusum_state?: CusumState | null;
  decay_weight?: number | null;
  reliability_weight?: number | null;
  final_weight?: number | null;
  contribution?: number | null;
  confidence?: number | null;
  trace: string[];
}

export interface Outcome {
  entity: string;
  mission_type: string;
  horizon_days: number;
  outcome_type: string;
  actual_value: number;
  observed_at: string;
  source: string;
}

export type AgentStatus = 'success' | 'partial' | 'failed' | 'skipped' | 'rate_limited' | 'no_data';

export interface AgentResult {
  agent: string;
  status: AgentStatus;
  signals: Signal[];
  errors: string[];
  records_examined: number;
  records_returned: number;
}

export interface CompositeResult {
  score: number;
  confidence: number;
  traces: string[];
}
