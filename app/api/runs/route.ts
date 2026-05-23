import { NextRequest, NextResponse } from 'next/server';
import { addRun, getRuns } from '@/lib/store';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const run = addRun({
    elapsed_ms: body.elapsed_ms,
    speed_mph: body.speed_mph,
    speed_kmh: body.speed_kmh,
    scale_mph: body.scale_mph ?? body.speed_mph * 64,
    scale_kmh: body.scale_kmh ?? body.speed_kmh * 64,
    timestamp: body.timestamp ?? new Date().toISOString(),
  });
  return NextResponse.json(run, { status: 201 });
}

export async function GET() {
  return NextResponse.json(getRuns());
}
