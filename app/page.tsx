'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Run } from '@/lib/store';

const AMBER       = '#F5A800';
const AMBER_DIM   = 'rgba(245,168,0,0.10)';
const AMBER_LABEL = 'rgba(245,168,0,0.38)';

type TransPhase = 'idle' | 'in' | 'out';

function playBeep() {
  try {
    const ctx  = new AudioContext();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = 920;
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.22);
  } catch { /* autoplay policy blocked */ }
}

export default function LivePage() {
  const [latest,       setLatest]       = useState<Run | null>(null);
  const [displayed,    setDisplayed]    = useState<Run | null>(null);
  const [connected,    setConnected]    = useState(false);
  const [transPhase,   setTransPhase]   = useState<TransPhase>('idle');
  const [countedSpeed, setCountedSpeed] = useState(0);
  const [isNewBest,    setIsNewBest]    = useState(false);
  const [signalLost,   setSignalLost]   = useState(false);

  const prevRunId    = useRef<number | null>(null);
  const lastSuccess  = useRef<number>(Date.now());
  const animFrame    = useRef<number | null>(null);
  const newBestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const allRunsRef   = useRef<Run[]>([]);

  // ── Poll runs every 500 ms ─────────────────────────────────────────────────
  useEffect(() => {
    const poll = async () => {
      try {
        const res  = await fetch('/api/runs');
        const runs: Run[] = await res.json();
        setConnected(true);
        setSignalLost(false);
        lastSuccess.current = Date.now();
        allRunsRef.current  = runs;
        if (runs.length > 0)
          setLatest(prev => (prev?.run_id === runs[0].run_id ? prev : runs[0]));
      } catch {
        setConnected(false);
      }
    };
    poll();
    const id = setInterval(poll, 500);
    return () => clearInterval(id);
  }, []);

  // ── Signal-lost: browser can't reach API for > 10 s ───────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      if (Date.now() - lastSuccess.current > 10_000) setSignalLost(true);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Broadcast transition on new run_id ────────────────────────────────────
  useEffect(() => {
    const newId = latest?.run_id ?? null;
    if (newId === prevRunId.current) return;
    prevRunId.current = newId;

    playBeep();
    setTransPhase('in');
    const t1 = setTimeout(() => {
      setDisplayed(latest);
      setTransPhase('out');
    }, 600);
    const t2 = setTimeout(() => setTransPhase('idle'), 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [latest]);

  // ── Animated counter + new-best (fires when transition fully clears) ───────
  useEffect(() => {
    if (transPhase !== 'idle' || !displayed) return;

    const target   = Math.round(displayed.scale_mph);
    const prevBest = allRunsRef.current
      .filter(r => r.run_id !== displayed.run_id)
      .reduce((best, r) => Math.max(best, r.scale_mph), 0);

    if (displayed.scale_mph > prevBest) {
      setIsNewBest(true);
      if (newBestTimer.current) clearTimeout(newBestTimer.current);
      newBestTimer.current = setTimeout(() => setIsNewBest(false), 3500);
    } else {
      setIsNewBest(false);
    }

    if (animFrame.current) cancelAnimationFrame(animFrame.current);
    setCountedSpeed(0);
    const t0       = performance.now();
    const duration = 800;
    const step = (now: number) => {
      const pct   = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - pct, 3);
      setCountedSpeed(Math.round(eased * target));
      if (pct < 1) animFrame.current = requestAnimationFrame(step);
    };
    animFrame.current = requestAnimationFrame(step);
    return () => { if (animFrame.current) cancelAnimationFrame(animFrame.current); };
  }, [transPhase, displayed]);

  const digits = displayed ? countedSpeed.toString().padStart(3, '0') : null;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0a0a0a', overflow: 'hidden' }}>

      <div className="stripe-bar" style={{ height: '3px', flexShrink: 0 }} />

      <header style={{ flexShrink: 0, padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
          <Link href="/history"
            style={{ color: '#3a3a3a', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', textDecoration: 'none', fontWeight: 600 }}
            onMouseEnter={e => (e.currentTarget.style.color = AMBER)}
            onMouseLeave={e => (e.currentTarget.style.color = '#3a3a3a')}>
            History
          </Link>
        </div>
      </header>

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
          {/* CRT screen */}
          <div style={{
            height: '100%',
            background: '#080600',
            borderRadius: '12px',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'inset 0 0 80px rgba(0,0,0,0.85)',
          }}>
            <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
              background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.14) 0px, rgba(0,0,0,0.14) 1px, transparent 1px, transparent 4px)' }} />
            <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
              background: 'radial-gradient(ellipse 75% 60% at 50% 50%, transparent 40%, rgba(0,0,0,0.75) 100%)' }} />

            {/* ── IDLE STATE ── */}
            {!displayed && (
              <div style={{ position: 'relative', zIndex: 3, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>
                {signalLost ? (
                  <>
                    <div className="dseg" style={{ fontSize: 'clamp(20px, 3vw, 30px)', color: '#C8290A', letterSpacing: '8px' }}>SIGNAL</div>
                    <div className="dseg signal-lost-blink" style={{ fontSize: 'clamp(28px, 4.5vw, 44px)', color: '#C8290A', letterSpacing: '8px', filter: 'drop-shadow(0 0 10px #C8290A)' }}>LOST</div>
                  </>
                ) : (
                  <>
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
                    <div className="dseg" style={{ fontSize: 'clamp(64px, 10vw, 110px)', color: AMBER_DIM, letterSpacing: '6px', lineHeight: 1 }}>888</div>
                    <div className="dseg ready-blink" style={{ fontSize: '22px', letterSpacing: '14px', color: AMBER, filter: `drop-shadow(0 0 6px ${AMBER})` }}>READY</div>
                  </>
                )}
              </div>
            )}

            {/* ── RUN STATE ── */}
            {displayed && (
              <div style={{ position: 'relative', zIndex: 3, textAlign: 'center', width: '100%', padding: '0 48px' }}>
                <div style={{ color: '#222', fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '16px' }}>
                  RUN #{displayed.run_id}
                </div>
                <div className="dseg" style={{
                  fontSize: 'clamp(80px, 13vw, 150px)', color: AMBER,
                  letterSpacing: '8px', lineHeight: 1, marginBottom: '16px',
                  textShadow: `0 0 12px rgba(245,168,0,0.5), 0 0 30px rgba(245,140,0,0.2)`,
                }}>
                  {digits}
                </div>
                <div style={{ color: AMBER_LABEL, fontSize: '13px', letterSpacing: '6px', textTransform: 'uppercase' }}>
                  SCALE SPEED
                </div>
                {isNewBest && (
                  <div className="new-best-badge" style={{
                    marginTop: '22px', display: 'inline-block', padding: '5px 18px',
                    border: `1px solid ${AMBER}`, borderRadius: '4px',
                    color: AMBER, fontSize: '12px', letterSpacing: '6px',
                    textTransform: 'uppercase', fontWeight: 700,
                    filter: `drop-shadow(0 0 8px ${AMBER})`,
                  }}>
                    NEW BEST
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats strip */}
        {displayed && (
          <div style={{
            flexShrink: 0,
            display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '10px', padding: '10px 0',
          }}>
            {[
              { label: 'Time',        num: (displayed.elapsed_ms / 1000).toFixed(3),                                    unit: 's'   },
              { label: 'Actual mph',  num: displayed.speed_mph.toFixed(2),                                              unit: 'mph' },
              { label: 'Actual km/h', num: displayed.speed_kmh.toFixed(2),                                              unit: 'km/h'},
              { label: 'Track angle', num: displayed.track_angle != null ? displayed.track_angle.toFixed(1) : '--',     unit: '°'   },
              { label: 'Peak G',      num: displayed.peak_g      != null ? displayed.peak_g.toFixed(2)      : '--',     unit: 'g'   },
            ].map(({ label, num, unit }) => (
              <div key={label} style={{
                background: '#0f0f0f', border: '1px solid #1a1a1a', borderRadius: '12px',
                padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '6px',
              }}>
                <span style={{ color: '#333', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase' }}>{label}</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span className="dseg" style={{ color: '#666', fontSize: '22px', lineHeight: 1.2 }}>{num}</span>
                  <span style={{ color: '#333', fontSize: '11px', letterSpacing: '1px' }}>{unit}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TV Broadcast transition overlay */}
      {transPhase !== 'idle' && (
        <div className={transPhase === 'in' ? 'tv-wipe-in' : 'tv-wipe-out'} style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: '#ffffff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Image src="/logo.png" alt="N1 Racing" width={420} height={150} style={{ objectFit: 'contain' }} />
        </div>
      )}

    </div>
  );
}
