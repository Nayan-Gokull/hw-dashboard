'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Run } from '@/lib/store';

export default function HistoryPage() {
  const [runs, setRuns] = useState<Run[]>([]);

  useEffect(() => {
    fetch('/api/runs')
      .then(r => r.json())
      .then(setRuns);
  }, []);

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6">
      <div className="w-full max-w-2xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold tracking-tight">All Runs</h1>
          <Link href="/" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
            ← Live view
          </Link>
        </div>

        {runs.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No runs yet.</p>
        ) : (
          <div className="rounded-xl border border-gray-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-900 text-gray-400 text-left">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Speed</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">When</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run, i) => (
                  <tr key={run.run_id} className={i % 2 === 0 ? 'bg-gray-950' : 'bg-gray-900'}>
                    <td className="px-4 py-3 text-gray-500">{run.run_id}</td>
                    <td className="px-4 py-3 font-bold text-yellow-400">
                      {run.speed_mph.toFixed(1)} mph
                      <span className="text-gray-500 font-normal ml-2 text-xs">{run.speed_kmh.toFixed(1)} km/h</span>
                    </td>
                    <td className="px-4 py-3">{(run.elapsed_ms / 1000).toFixed(3)}s</td>
                    <td className="px-4 py-3 text-gray-400">{new Date(run.timestamp).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </main>
  );
}
