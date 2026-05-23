'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Run } from '@/lib/store';

const AMBER       = '#F5A800';
const AMBER_DIM   = 'rgba(245,168,0,0.10)';
const AMBER_LABEL = 'rgba(245,168,0,0.38)';

export default function LivePage() {
  const [latest, setLatest]     = useState<Run | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const poll = async () => {
      try {
        const res  = await fetch('/api/runs');
        const runs: Run[] = await res.json();
        setConnected(true);
        if (runs.length > 0) setLatest(runs[0]);
      } catch { setConnected(false); }
    };
    poll();
    const id = setInterval(poll, 500);
    return () => clearInterval(id);
  }, []);

  const digits = latest ? Math.round(latest.scale_mph).toString().padStart(3, '0') : null;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0a0a0a', overflow: 'hidden' }}>

      {/* Top accent stripe */}
      <div className="stripe-bar" style={{ height: '3px', flexShrink: 0 }} />

      {/* Header */}
      <header style={{
        flexShrink: 0,
        padding: '14px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Image src="/logo.png" alt="N1 Racing" width={88} height={30} style={{ objectFit: 'contain' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className={connected ? 'live-dot' : ''} style={{
              width: '7px', height: '7px', borderRadius: '50%',
              background: connected ? '#F5B800' : '#333',
            }} />
            <span style={{ color: '#555', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 600 }}>
              {connected ? 'Live' : 'Offline'}
            </span>
          </div>
          <Link href="/history" style={{ color: '#3a3a3a', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', textDecoration: 'none', fontWeight: 600 }}
            onMouseEnter={e => (e.currentTarget.style.color = AMBER)}
            onMouseLeave={e => (e.currentTarget.style.color = '#3a3a3a')}>
            History
          </Link>
        </div>
      </header>

      {/* Retro screen — hero element */}
      <div style={{ flex: 1, padding: '0 28px 12px', display: 'flex', flexDirection: 'column', minHeight: 0 }}>

        {/* CRT outer bezel */}
        <div style={{
          flex: 1, minHeight: 0,
          background: '#0e0e0e',
          border: '2px solid #1c1c1c',
          borderRadius: '18px',
          padding: '10px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.03)',
        }}>
          {/* CRT screen surface */}
          <div style={{
            height: '100%',
            background: '#080600',
            borderRadius: '12px',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'inset 0 0 80px rgba(0,0,0,0.85)',
          }}>
            {/* Scanlines */}
            <div style={{
              position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
              background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.14) 0px, rgba(0,0,0,0.14) 1px, transparent 1px, transparent 4px)',
            }} />
            {/* Vignette */}
            <div style={{
              position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
              background: 'radial-gradient(ellipse 75% 60% at 50% 50%, transparent 40%, rgba(0,0,0,0.75) 100%)',
            }} />

            {/* ── IDLE STATE ─────────────────────────────── */}
            {!latest && (
              <div style={{ position: 'relative', zIndex: 3, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>

                {/* Wipe logo */}
                <div style={{ position: 'relative', width: '300px', height: '107px', overflow: 'hidden' }}>
                  <div className="wipe-stripe" style={{
                    position: 'absolute', top: 0, height: '107px', width: '3px',
                    background: 'linear-gradient(180deg, #F5B800, #F07000, #C8290A)',
                    boxShadow: '0 0 12px rgba(245,184,0,0.9), 0 0 24px rgba(240,112,0,0.5)',
                    zIndex: 2,
                  }} />
                  <div className="logo-reveal" style={{ position: 'absolute', inset: 0 }}>
                    <Image src="/logo.png" alt="N1 Racing" width={300} height={107} style={{ objectFit: 'contain', display: 'block' }} />
                  </div>
                </div>

                {/* Ghost digits */}
                <div className="dseg" style={{ fontSize: 'clamp(64px, 10vw, 110px)', color: AMBER_DIM, letterSpacing: '6px', lineHeight: 1 }}>
                  888
                </div>

                {/* READY */}
                <div className="dseg ready-blink" style={{
                  fontSize: '22px', letterSpacing: '14px', color: AMBER,
                  filter: `drop-shadow(0 0 6px ${AMBER})`,
                }}>
                  READY
                </div>
              </div>
            )}

            {/* ── RUN STATE ──────────────────────────────── */}
            {latest && (
              <div style={{ position: 'relative', zIndex: 3, textAlign: 'center', width: '100%', padding: '0 48px' }}>

                <div style={{ color: '#222', fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '16px' }}>
                  RUN #{latest.run_id}
                </div>

                {/* Ghost + active digits stacked */}
                <div style={{ position: 'relative', display: 'inline-block', lineHeight: 1, marginBottom: '16px' }}>
                  <div className="dseg" style={{ fontSize: 'clamp(80px, 13vw, 150px)', color: AMBER_DIM, letterSpacing: '8px' }}>
                    888
                  </div>
                  <div className="dseg" style={{
                    position: 'absolute', inset: 0,
                    fontSize: 'clamp(80px, 13vw, 150px)', color: AMBER, letterSpacing: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    filter: `drop-shadow(0 0 8px ${AMBER}) drop-shadow(0 0 28px rgba(245,140,0,0.45))`,
                  }}>
                    {digits}
                  </div>
                </div>

                <div style={{ color: AMBER_LABEL, fontSize: '13px', letterSpacing: '6px', textTransform: 'uppercase' }}>
                  MPH &nbsp;·&nbsp; SCALE 1:64
                </div>

              </div>
            )}
          </div>
        </div>

        {/* Stats strip — only shown after a run */}
        {latest && (
          <div style={{
            flexShrink: 0,
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
            gap: '10px',
            padding: '10px 0',
          }}>
            {[
              { label: 'Time',       value: (latest.elapsed_ms / 1000).toFixed(3) + 's' },
              { label: 'Actual mph', value: latest.speed_mph.toFixed(2) + ' mph'         },
              { label: 'Actual km/h',value: latest.speed_kmh.toFixed(2) + ' km/h'        },
            ].map(({ label, value }) => (
              <div key={label} style={{
                background: '#0f0f0f', border: '1px solid #1a1a1a', borderRadius: '12px',
                padding: '12px 16px',
                display: 'flex', flexDirection: 'column', gap: '4px',
              }}>
                <span style={{ color: '#333', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase' }}>{label}</span>
                <span className="dseg" style={{ color: '#666', fontSize: '18px' }}>{value}</span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
