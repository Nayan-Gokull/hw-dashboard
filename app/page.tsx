'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column' }}>

      {/* Top stripe */}
      <div className="stripe-bar" style={{ height: '3px', width: '100%', flexShrink: 0 }} />

      {/* Header */}
      <header style={{ padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ background: 'white', borderRadius: '10px', padding: '7px 14px', display: 'inline-flex' }}>
          <Image src="/logo.png" alt="N1 Racing" width={88} height={30} style={{ objectFit: 'contain' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className={connected ? 'live-dot' : ''} style={{ width: '8px', height: '8px', borderRadius: '50%', background: connected ? '#F5B800' : '#333' }} />
          <span style={{ color: '#555', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 600 }}>
            {connected ? 'Live' : 'Offline'}
          </span>
          <span style={{ color: '#222', margin: '0 4px' }}>·</span>
          <Link href="/history" style={{ color: '#444', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#F5B800')}
            onMouseLeave={e => (e.currentTarget.style.color = '#444')}>
            History
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 32px 48px' }}>

        {latest ? (
          <div style={{ width: '100%', maxWidth: '700px' }}>

            {/* Run label */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="stripe-bar" style={{ width: '4px', height: '20px', borderRadius: '2px' }} />
                <span style={{ color: '#555', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 600 }}>Scale Speed · 1:64</span>
              </div>
              <span style={{ color: '#2a2a2a', fontSize: '12px', fontFamily: 'monospace', letterSpacing: '2px' }}>RUN #{latest.run_id}</span>
            </div>

            {/* Hero speed */}
            <div style={{ textAlign: 'center', marginBottom: '12px' }}>
              <div className="dseg speed-gradient" style={{ fontSize: 'clamp(96px, 18vw, 160px)', lineHeight: 0.9, letterSpacing: '-4px' }}>
                {latest.scale_mph.toFixed(1)}
              </div>
              <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                <span style={{ color: '#f0f0f0', fontSize: '22px', fontWeight: 800, letterSpacing: '6px', textTransform: 'uppercase' }}>MPH</span>
                <div className="stripe-bar" style={{ width: '1px', height: '20px' }} />
                <span style={{ color: '#444', fontSize: '20px', fontWeight: 500 }}>{latest.scale_kmh.toFixed(1)} km/h</span>
              </div>
            </div>

            {/* Divider */}
            <div style={{ margin: '40px 0', height: '1px', background: 'linear-gradient(90deg, transparent, #2a2a2a 20%, #2a2a2a 80%, transparent)' }} />

            {/* Stats cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div style={{ background: '#141414', borderRadius: '16px', padding: '22px 20px', border: '1px solid #1e1e1e' }}>
                <p style={{ color: '#444', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>Time</p>
                <p className="dseg" style={{ color: '#f0f0f0', fontSize: '30px', lineHeight: 1 }}>{(latest.elapsed_ms / 1000).toFixed(3)}</p>
                <p style={{ color: '#333', fontSize: '11px', marginTop: '8px' }}>seconds</p>
              </div>
              <div style={{ background: '#141414', borderRadius: '16px', padding: '22px 20px', border: '1px solid #1e1e1e' }}>
                <p style={{ color: '#444', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>Actual mph</p>
                <p className="dseg" style={{ color: '#f0f0f0', fontSize: '30px', lineHeight: 1 }}>{latest.speed_mph.toFixed(2)}</p>
                <p style={{ color: '#333', fontSize: '11px', marginTop: '8px' }}>real scale</p>
              </div>
              <div style={{ background: '#141414', borderRadius: '16px', padding: '22px 20px', border: '1px solid #1e1e1e' }}>
                <p style={{ color: '#444', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>Actual km/h</p>
                <p className="dseg" style={{ color: '#f0f0f0', fontSize: '30px', lineHeight: 1 }}>{latest.speed_kmh.toFixed(2)}</p>
                <p style={{ color: '#333', fontSize: '11px', marginTop: '8px' }}>real scale</p>
              </div>
            </div>

            <p style={{ textAlign: 'center', color: '#1e1e1e', fontSize: '11px', marginTop: '28px', fontFamily: 'monospace', letterSpacing: '2px' }}>
              {new Date(latest.timestamp).toLocaleTimeString()}
            </p>

          </div>
        ) : (
          <div style={{ textAlign: 'center', position: 'relative', overflow: 'hidden', padding: '20px 0' }}>
            {/* Sweeping shimmer */}
            <div className="stripe-sweep" />

            {/* Big glowing logo */}
            <div className="logo-glow" style={{ display: 'inline-block', background: 'white', borderRadius: '24px', padding: '24px 40px', marginBottom: '40px' }}>
              <Image src="/logo.png" alt="N1 Racing" width={200} height={70} style={{ objectFit: 'contain', display: 'block' }} />
            </div>

            {/* Stripe accent */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '28px' }}>
              {['#F5B800','#F07000','#C8290A'].map(c => (
                <div key={c} style={{ width: '32px', height: '3px', borderRadius: '2px', background: c, opacity: 0.6 }} />
              ))}
            </div>

            {/* DSEG ready */}
            <div className="dseg ready-blink" style={{ fontSize: '22px', letterSpacing: '12px', textTransform: 'uppercase', color: '#F5B800' }}>
              READY
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
