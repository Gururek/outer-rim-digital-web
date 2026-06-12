import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { getDatabankCard } from '@outer-rim/shared';
import gsap from 'gsap';

export default function ContactRevealOverlay() {
  const cinematic = useGameStore(s => s.cinematic);
  const dismissCinematic = useGameStore(s => s.dismissCinematic);
  const [mounted, setMounted] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [textDone, setTextDone] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const typeRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (cinematic.active && cinematic.type === 'CONTACT_REVEALED') {
      setTypedText('');
      setTextDone(false);
      setMounted(true);
    }
  }, [cinematic.active, cinematic.type]);

  useEffect(() => {
    if (!mounted) return;

    const card = cardRef.current;
    const backdrop = backdropRef.current;
    if (!card || !backdrop) return;

    gsap.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.35 });
    gsap.fromTo(card,
      { y: 50, opacity: 0, scale: 0.93 },
      { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.3)', delay: 0.1 },
    );

    const db = getDatabankCard(Number(cinematic.payload.contactId ?? 0));
    const full = db?.description ?? 'Identity unknown. Proceed with caution.';
    let i = 0;
    clearInterval(typeRef.current);
    typeRef.current = setInterval(() => {
      i++;
      setTypedText(full.slice(0, i));
      if (i >= full.length) {
        clearInterval(typeRef.current);
        setTextDone(true);
      }
    }, 26);

    return () => clearInterval(typeRef.current);
  }, [mounted]);

  const dismiss = () => {
    clearInterval(typeRef.current);
    const card = cardRef.current;
    const backdrop = backdropRef.current;
    if (!card || !backdrop) { dismissCinematic(); return; }
    gsap.to(card, { y: 30, opacity: 0, scale: 0.95, duration: 0.22, ease: 'power2.in' });
    gsap.to(backdrop, {
      opacity: 0, duration: 0.28,
      onComplete: () => { setMounted(false); setTypedText(''); dismissCinematic(); },
    });
  };

  if (!mounted) return null;

  const db = getDatabankCard(Number(cinematic.payload.contactId ?? 0));

  return (
    <div ref={backdropRef} style={S.backdrop} onClick={dismiss}>
      <div ref={cardRef} style={S.card} onClick={e => e.stopPropagation()}>
        <div style={S.topBar} />

        <div style={S.body}>
          {/* Hex portrait frame */}
          <div style={S.portraitRow}>
            <div style={S.hexFrame}>
              <svg viewBox="0 0 80 80" width="80" height="80">
                <polygon
                  points="40,4 72,22 72,58 40,76 8,58 8,22"
                  fill="var(--ck-panel)"
                  stroke="var(--ck-green)"
                  strokeWidth="1.5"
                />
                <circle cx="40" cy="32" r="13" stroke="var(--ck-dim)" strokeWidth="1" fill="none" />
                <path d="M18 62 Q40 48 62 62" stroke="var(--ck-dim)" strokeWidth="1" fill="none" />
                <circle cx="40" cy="32" r="5" fill="var(--ck-dim)" opacity="0.4" />
              </svg>
              <div style={S.hexScanline} />
            </div>
          </div>

          <div className="ck-label" style={{ color: 'var(--ck-green)', letterSpacing: '.18em', marginBottom: 8 }}>
            CONTACT ESTABLISHED
          </div>

          {db && (
            <div style={S.name}>{db.name}</div>
          )}

          <div style={S.divider} />

          <p style={S.description}>
            {typedText}
            {!textDone && <span className="ck-anim-blink" style={{ color: 'var(--ck-green)' }}>▋</span>}
          </p>

          <div style={{ ...S.hint, opacity: textDone ? 1 : 0.3 }} onClick={dismiss}>
            ▸ ACKNOWLEDGE
          </div>
        </div>

        <div style={S.bottomBar} />
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 210,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(6,13,24,.82)',
    cursor: 'pointer',
    fontFamily: "'Share Tech Mono', monospace",
  },
  card: {
    background: 'var(--ck-panel)',
    border: '1px solid rgba(60,200,122,.25)',
    borderRadius: 6,
    width: 360,
    maxWidth: '90vw',
    overflow: 'hidden',
    cursor: 'default',
    boxShadow: '0 0 40px rgba(60,200,122,.08)',
  },
  topBar: {
    height: 3,
    background: 'var(--ck-green)',
    opacity: 0.85,
  },
  bottomBar: {
    height: 3,
    background: 'var(--ck-green)',
    opacity: 0.4,
  },
  body: {
    padding: '1.8rem 2rem',
    textAlign: 'center',
  },
  portraitRow: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '1rem',
  },
  hexFrame: {
    position: 'relative',
    width: 80,
    height: 80,
  },
  hexScanline: {
    position: 'absolute',
    inset: 0,
    background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(60,200,122,.04) 3px, rgba(60,200,122,.04) 4px)',
    pointerEvents: 'none',
  },
  name: {
    fontFamily: "'Orbitron',sans-serif",
    fontSize: '1.05rem',
    color: 'var(--ck-val)',
    letterSpacing: '.06em',
    marginBottom: '.3rem',
    fontWeight: 600,
  },
  divider: {
    height: 1,
    background: 'linear-gradient(90deg, transparent, rgba(60,200,122,.3), transparent)',
    margin: '.9rem 0',
  },
  description: {
    fontSize: '.82rem',
    color: 'var(--ck-text)',
    lineHeight: 1.6,
    minHeight: '3.5em',
    marginBottom: '1.2rem',
    textAlign: 'left',
  },
  hint: {
    fontFamily: "'Orbitron',sans-serif",
    fontSize: 8,
    color: 'var(--ck-green)',
    letterSpacing: '.15em',
    cursor: 'pointer',
    transition: 'opacity .3s',
    paddingTop: '.6rem',
    borderTop: '1px solid rgba(60,200,122,.15)',
  },
};
