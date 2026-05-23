'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Run } from '@/lib/store';

export default function HistoryPage() {
  const [runs, setRuns] = useState<Run[]>([]);

  useEffect(() => {
    fetch('/api/runs').then(r => r.json()).then(setRuns);
  }, []);

  const fastestScale = runs.length > 0 ? Math.max(...runs.map(r => r.scale_mph)) : null;

  return (
    <main className="min-h-screen bg-[#0a0a0a] p-4 md:p-8">
      <div className="w-full max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Image src="/logo.png" alt="N1 Racing" width={100} height={36} style={{ objectFit: 'contain' }} />
          <Link href="/" className="text-[#444] hover:text-[#F5B800] text-xs uppercase tracking-widest transition-colors">
            ← Live
          </Link>
        </div>

        {/* Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-4 stripe-bar rounded-full" />
            <span className="text-[#555] uppercase tracking-widest text-xs font-semibold">Run History</span>
          </div>
          {fastestScale && (
            <p className="text-[#333] text-xs mt-2">
              Best: <span className="text-[#F5B800] font-bold dseg">{Math.round(fastestScale)}</span>
              <span className="text-[#444] ml-1">scale mph</span>
            </p>
          )}
        </div>

        {runs.length === 0 ? (
          <div className="text-center py-24 text-[#333] text-sm uppercase tracking-widest">No runs yet</div>
        ) : (
          <div className="bg-[#141414] rounded-2xl border border-[#242424] overflow-hidden">
            <div className="h-1 w-full stripe-bar" />
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e1e1e]">
                  <th className="px-5 py-4 text-left text-[#333] text-xs uppercase tracking-widest font-medium">#</th>
                  <th className="px-5 py-4 text-left text-[#333] text-xs uppercase tracking-widest font-medium">Scale Speed</th>
                  <th className="px-5 py-4 text-left text-[#333] text-xs uppercase tracking-widest font-medium">Actual</th>
                  <th className="px-5 py-4 text-left text-[#333] text-xs uppercase tracking-widest font-medium">Time</th>
                  <th className="px-5 py-4 text-left text-[#333] text-xs uppercase tracking-widest font-medium">When</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => {
                  const isBest = run.scale_mph === fastestScale;
                  return (
                    <tr key={run.run_id} className={`border-b border-[#1a1a1a] last:border-0 ${isBest ? 'bg-[#1a1200]' : ''}`}>
                      <td className="px-5 py-4 text-[#333] font-mono text-xs">{run.run_id}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-baseline gap-2">
                          <span className="dseg text-2xl font-bold" style={{ color: isBest ? '#F5A800' : '#f0f0f0' }}>
                            {Math.round(run.scale_mph)}
                          </span>
                          <span className="text-[#444] text-xs">mph</span>
                          {isBest && <span className="text-[#F5B800] text-xs uppercase tracking-widest">best</span>}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="dseg text-[#555] text-sm">{run.speed_mph.toFixed(2)}</span>
                        <span className="text-[#333] text-xs ml-1">mph</span>
                      </td>
                      <td className="px-5 py-4 dseg text-[#666] text-sm">{(run.elapsed_ms / 1000).toFixed(3)}s</td>
                      <td className="px-5 py-4 text-[#333] text-xs font-mono">{new Date(run.timestamp).toLocaleTimeString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
