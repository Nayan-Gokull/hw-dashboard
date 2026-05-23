'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Run } from '@/lib/store';

/* ── Retro CRT screen ────────────────────────────────────────────────────── */
function RetroDisplay({ speed, ready }: { speed?: number; ready: boolean }) {
  const digits = speed !== undefined ? speed.toFixed(1) : undefined;

  return (
    /* Outer bezel */
    <div style={{
      background: '#111',
      borderRadius: '14px',
      padding: '14px',
      border: '2px solid #1c1c1c',
      boxShadow: '0 8px 40px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.04)',
    }}>
      {/* Screen surface */}
      <div style={{
        background: '#070500',
        borderRadius: '8px',
        padding: '32px 36px 24px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'inset 0 0 60px rgba(0,0,0,0.9), inset 0 0 0 1px rgba(245,168,0,0.06)',
      }}>

        {/* Scanlines */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', borderRadius: '8px',
          background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 4px)',
        }} />

        {/* Vignette */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none', borderRadius: '8px',
          background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.65) 100%)',
        }} />

        {/* Digits */}
        <div style={{ position: 'relative', zIndex: 4, textAlign: 'center' }}>

          {/* Ghost + active stacked */}
          <div style={{ position: 'relative', display: 'inline-block', lineHeight: 1 }}>
            {/* Ghost segments */}
            <div className="dseg" style={{
              fontSize: 'clamp(72px, 14vw, 120px)',
              color: 'rgba(245,168,0,0.13)',
              letterSpacing: '4px',
              userSelect: 'none',
            }}>
              888.8
            </div>
            {/* Active digits */}
            <div className="dseg" style={{
              position: 'absolute', inset: 0,
              fontSize: 'clamp(72px, 14vw, 120px)',
              color: digits ? '#F5A800' : 'transparent',
              letterSpacing: '4px',
              filter: digits ? 'drop-shadow(0 0 6px rgba(245,168,0,0.55)) drop-shadow(0 0 18px rgba(245,140,0,0.3))' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {digits ?? ''}
            </div>
          </div>

          {/* Unit label */}
          {digits && (
            <div style={{
              color: 'rgba(245,168,0,0.5)',
              fontSize: '13px',
              letterSpacing: '5px',
              textTransform: 'uppercase',
              marginTop: '10px',
              fontWeight: 600,
            }}>
              MPH — SCALE 1:64
            </div>
          )}

          {/* READY */}
          <div className={`dseg ${ready ? 'ready-blink' : ''}`} style={{
            fontSize: '20px',
            letterSpacing: '14px',
            color: '#F5A800',
            marginTop: digits ? '20px' : '12px',
            opacity: ready ? 1 : 0.2,
            filter: ready ? 'drop-shadow(0 0 4px rgba(245,168,0,0.5))' : 'none',
          }}>
            READY
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
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
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column' }}>

      {/* Top stripe */}
      <div className="stripe-bar" style={{ height: '3px', flexShrink: 0 }} />

      {/* Header */}
      <header style={{ padding: '18px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <Image src="/logo.png" alt="N1 Racing" width={90} height={32} style={{ objectFit: 'contain' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className={connected ? 'live-dot' : ''} style={{ width: '7px', height: '7px', borderRadius: '50%', background: connected ? '#F5B800' : '#333' }} />
            <span style={{ color: '#555', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 600 }}>
              {connected ? 'Live' : 'Offline'}
            </span>
          </div>
          <Link href="/history" style={{ color: '#444', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', textDecoration: 'none', fontWeight: 600 }}
            onMouseEnter={e => (e.currentTarget.style.color = '#F5B800')}
            onMouseLeave={e => (e.currentTarget.style.color = '#444')}>
            History
          </Link>
        </div>
      </header>

      {/* Main */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 28px 48px', gap: '40px' }}>

        {!latest ? (
          /* ── IDLE STATE ─────────────────────────────────────── */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px', width: '100%', maxWidth: '560px' }}>

            {/* Wipe-reveal logo — explicit size so overflow:hidden clips cleanly */}
            <div style={{ position: 'relative', width: '260px', height: '92px', overflow: 'hidden' }}>
              {/* Thin glowing stripe at the reveal leading edge */}
              <div className="wipe-stripe" style={{
                position: 'absolute', top: 0, height: '92px', width: '3px',
                background: 'linear-gradient(180deg, #F5B800, #F07000, #C8290A)',
                boxShadow: '0 0 10px rgba(245,184,0,0.9), 0 0 24px rgba(240,112,0,0.6)',
                zIndex: 2, pointerEvents: 'none',
              }} />
              {/* Logo clipping in */}
              <div className="logo-reveal" style={{ position: 'absolute', inset: 0 }}>
                <Image src="/logo.png" alt="N1 Racing" width={260} height={92} style={{ objectFit: 'contain', display: 'block' }} />
              </div>
            </div>

            {/* Retro display — idle */}
            <div style={{ width: '100%' }}>
              <RetroDisplay ready={true} />
            </div>
          </div>

        ) : (
          /* ── RUN STATE ──────────────────────────────────────── */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', width: '100%', maxWidth: '600px' }}>

            {/* Run label */}
            <div style={{ alignSelf: 'stretch', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="stripe-bar" style={{ width: '3px', height: '18px', borderRadius: '2px' }} />
                <span style={{ color: '#555', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 600 }}>Scale Speed · 1:64</span>
              </div>
              <span style={{ color: '#2a2a2a', fontSize: '11px', fontFamily: 'monospace', letterSpacing: '2px' }}>RUN #{latest.run_id}</span>
            </div>

            {/* Retro display — live speed */}
            <div style={{ width: '100%' }}>
              <RetroDisplay speed={latest.scale_mph} ready={false} />
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', width: '100%' }}>
              {[
                { label: 'Time',       value: (latest.elapsed_ms / 1000).toFixed(3), unit: 'seconds'   },
                { label: 'Actual mph', value: latest.speed_mph.toFixed(2),           unit: 'real scale' },
                { label: 'Actual km/h',value: latest.speed_kmh.toFixed(2),           unit: 'real scale' },
              ].map(({ label, value, unit }) => (
                <div key={label} style={{ background: '#111', borderRadius: '14px', padding: '18px', border: '1px solid #1c1c1c' }}>
                  <p style={{ color: '#3a3a3a', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>{label}</p>
                  <p className="dseg" style={{ color: '#888', fontSize: '26px', lineHeight: 1 }}>{value}</p>
                  <p style={{ color: '#2a2a2a', fontSize: '11px', marginTop: '6px' }}>{unit}</p>
                </div>
              ))}
            </div>

            <p style={{ color: '#1c1c1c', fontSize: '11px', fontFamily: 'monospace', letterSpacing: '2px' }}>
              {new Date(latest.timestamp).toLocaleTimeString()}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
