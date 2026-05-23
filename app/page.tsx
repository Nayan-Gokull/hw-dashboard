'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Run } from '@/lib/store';

export default function LivePage() {
  const [latest, setLatest] = useState<Run | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch('/api/runs');
        const runs: Run[] = await res.json();
        setConnected(true);
        if (runs.length > 0) setLatest(runs[0]);
      } catch {
        setConnected(false);
      }
    };

    poll();
    const id = setInterval(poll, 500);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg">

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Hot Wheels Timer</h1>
          <div className="flex items-center gap-2 text-sm">
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-500'}`} />
            <span className="text-gray-400">{connected ? 'live' : 'disconnected'}</span>
          </div>
        </div>

        {latest ? (
          <div className="bg-gray-900 rounded-2xl p-8 text-center border border-gray-800">
            <p className="text-gray-400 text-sm mb-2">Run #{latest.run_id}</p>

            <div className="text-7xl font-black tracking-tighter text-yellow-400 mb-1">
              {latest.speed_mph.toFixed(1)}
            </div>
            <p className="text-gray-400 text-lg mb-6">mph &nbsp;·&nbsp; {latest.speed_kmh.toFixed(1)} km/h</p>

            <div className="text-3xl font-bold text-white mb-1">
              {(latest.elapsed_ms / 1000).toFixed(3)}s
            </div>
            <p className="text-gray-500 text-sm">elapsed</p>

            <p className="text-gray-600 text-xs mt-6">
              {new Date(latest.timestamp).toLocaleTimeString()}
            </p>
          </div>
        ) : (
          <div className="bg-gray-900 rounded-2xl p-8 text-center border border-gray-800">
            <div className="text-5xl mb-4">🏎️</div>
            <p className="text-gray-400">Waiting for first run...</p>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link href="/history" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
            View all runs →
          </Link>
        </div>

      </div>
    </main>
  );
}
