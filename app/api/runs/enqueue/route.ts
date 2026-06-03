import { NextRequest, NextResponse } from 'next/server';
import { enqueueSyntheticRun } from '@/lib/runs/enqueue';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const entity = String(body.entity ?? 'NVIDIA');
    const missionType = String(body.missionType ?? 'sector_momentum');
    const horizonDays = Number(body.horizonDays ?? 90);
    const result = await enqueueSyntheticRun({ entity, missionType, horizonDays });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
