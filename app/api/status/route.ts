import { NextRequest, NextResponse } from 'next/server';

export type LaunchState = 'idle' | 'countdown' | 'armed';

interface Status {
  state: LaunchState;
  updated_at: string;
}

let current: Status = { state: 'idle', updated_at: new Date().toISOString() };

export async function GET() {
  return NextResponse.json(current);
}

export async function POST(req: NextRequest) {
  const { state } = await req.json();
  current = { state, updated_at: new Date().toISOString() };
  return NextResponse.json({ ok: true });
}
