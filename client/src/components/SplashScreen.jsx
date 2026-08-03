import { useState, useEffect } from 'react';

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState('logo');     // 'logo' | 'text' | 'exit'

  useEffect(() => {
    // Phase 1: show logo with scale-in bounce (0 → 500ms)
    // Phase 2: show text fade (500ms → 1000ms)
    // Phase 3: exit slide-up (1000ms → 1400ms)
    // Done: 1450ms

    const t1 = setTimeout(() => setPhase('text'), 500);
    const t2 = setTimeout(() => setPhase('exit'), 1050);
    const t3 = setTimeout(() => onDone(), 1450);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'linear-gradient(135deg, #0F172A 0%, #1e1a14 60%, #0F172A 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        transition: 'transform 400ms cubic-bezier(0.4,0,0.2,1), opacity 400ms ease',
        transform: phase === 'exit' ? 'translateY(-100%)' : 'translateY(0)',
        opacity: phase === 'exit' ? 0 : 1,
      }}
    >
      {/* Radial glow behind logo */}
      <div style={{
        position: 'absolute', width: 300, height: 300,
        background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.18) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      {/* Logo */}
      <div style={{
        width: 108, height: 108, borderRadius: 24,
        overflow: 'hidden', marginBottom: 20,
        boxShadow: '0 20px 60px rgba(212,175,55,0.25)',
        transform: phase === 'logo' ? 'scale(0.3)' : 'scale(1)',
        opacity: phase === 'logo' ? 0 : 1,
        transition: 'transform 400ms cubic-bezier(0.34,1.56,0.64,1), opacity 300ms ease',
      }}>
        <img
          src="/logo.png"
          alt="MerchStore"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Brand name */}
      <div style={{
        opacity: phase === 'text' || phase === 'exit' ? 1 : 0,
        transform: phase === 'text' || phase === 'exit' ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 300ms ease, transform 300ms ease',
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: "'Outfit', 'Inter', sans-serif",
          fontWeight: 800, fontSize: 26, letterSpacing: '-0.5px',
          background: 'linear-gradient(90deg, #fff 0%, #D4AF37 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: 4,
        }}>
          MerchStore
        </div>
        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 11, fontWeight: 600, letterSpacing: '0.22em',
          color: '#D4AF37', textTransform: 'uppercase',
        }}>
          Geeta University
        </div>
      </div>

      {/* Animated dots loader */}
      <div style={{
        display: 'flex', gap: 6, marginTop: 40,
        opacity: phase === 'text' ? 1 : 0,
        transition: 'opacity 300ms ease',
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: '50%',
            background: '#D4AF37',
            animation: `splash-bounce 0.8s ease-in-out ${i * 0.15}s infinite`,
          }} />
        ))}
      </div>

      <style>{`
        @keyframes splash-bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
