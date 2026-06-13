import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import gsap from 'gsap';

type SkillResult = { skill: string; required: boolean; critical: boolean; passed: boolean };

const OUTCOME_COLOR: Record<string, string> = {
  SUCCESS: 'var(--ck-green)',
  PARTIAL: 'var(--ck-gold)',
  FAILURE: 'var(--ck-red)',
};

const OUTCOME_ICON: Record<string, string> = {
  SUCCESS: '⚡',
  PARTIAL: '◎',
  FAILURE: '✖',
};

export default function JobSequenceOverlay({ onDismiss }: { onDismiss: () => void }) {
  const cinematic   = useGameStore(s => s.cinematic);
  const mySessionId = useGameStore(s => s.mySessionId);

  const [visible,    setVisible]    = useState(false);
  const [showSkills, setShowSkills] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Only show for the player who attempted the job
  const isMyJob =
    cinematic.active &&
    cinematic.type === 'JOB_RESULT' &&
    cinematic.payload.sessionId === mySessionId;

  const jobName     = (cinematic.payload.jobName as string | undefined) ?? 'CONTRACT';
  const outcome     = (cinematic.payload.outcome as string | undefined) ?? 'FAILURE';
  const skillResults = (cinematic.payload.skillResults as SkillResult[] | undefined) ?? [];
  const reward      = cinematic.payload.reward as { credits: number; fame: number } | undefined;

  const outcomeColor = OUTCOME_COLOR[outcome] ?? 'var(--ck-val)';

  const earnedCredits =
    outcome === 'SUCCESS' ? (reward?.credits ?? 0) :
    outcome === 'PARTIAL' ? Math.floor((reward?.credits ?? 0) / 2) : 0;
  const earnedFame =
    outcome === 'SUCCESS' ? (reward?.fame ?? 0) :
    outcome === 'PARTIAL' ? Math.floor((reward?.fame ?? 0) / 2) : 0;

  useEffect(() => {
    if (!isMyJob) return;
    setVisible(true);
    setShowSkills(false);
    setShowResult(false);

    const t1 = setTimeout(() => setShowSkills(true), 350);
    const t2 = setTimeout(() => setShowResult(true), 1200 + skillResults.length * 100);
    const t3 = setTimeout(() => {
      if (wrapRef.current) gsap.to(wrapRef.current, { opacity: 0, duration: 0.35 });
      setTimeout(() => { setVisible(false); onDismiss(); }, 400);
    }, 5500);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [isMyJob, cinematic.type]);

  if (!visible) return null;

  return (
    <div
      ref={wrapRef}
      style={S.backdrop}
      onClick={showResult ? onDismiss : undefined}
    >
      <div style={S.scanline} />
      <div style={S.card}>
        <div style={{ ...S.topBar, background: outcomeColor }} />
        <div style={S.body}>

          <div style={S.sectionLabel}>JOB CONTRACT</div>
          <div style={S.jobName}>{jobName}</div>

          {showSkills && skillResults.length > 0 && (
            <div style={S.skillList}>
              <div style={S.skillsHeader}>SKILL CHECKS</div>
              {skillResults.map((r, i) => (
                <div
                  key={i}
                  style={{ ...S.skillRow, animationDelay: `${i * 0.08}s` }}
                  className="ck-anim-fade"
                >
                  <span style={{ color: r.passed ? 'var(--ck-green)' : 'var(--ck-red)', fontSize: '1.05rem', lineHeight: 1 }}>
                    {r.passed ? '✓' : '✗'}
                  </span>
                  <span style={{ ...S.skillName, color: r.critical ? 'var(--ck-gold)' : 'var(--ck-val)' }}>
                    {r.skill}
                  </span>
                  {r.critical && <span style={S.critTag}>CRITICAL</span>}
                  <span style={{ marginLeft: 'auto', color: r.passed ? 'var(--ck-green)' : 'var(--ck-red)', fontFamily: "'Orbitron',sans-serif", fontSize: 8, letterSpacing: '.1em' }}>
                    {r.passed ? 'PASS' : 'FAIL'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {showResult && (
            <div style={S.resultBlock} className="ck-anim-fade">
              <div style={{ ...S.verdict, color: outcomeColor, borderColor: outcomeColor, boxShadow: `0 0 24px ${outcomeColor}22` }}>
                {OUTCOME_ICON[outcome]} {outcome}
              </div>

              {(earnedCredits > 0 || earnedFame > 0) && (
                <div style={S.rewards}>
                  {earnedCredits > 0 && (
                    <div style={S.rewardChip}>
                      <span style={S.rewardLabel}>CREDITS</span>
                      <span style={{ color: 'var(--ck-gold)', fontSize: '.95rem' }}>+{earnedCredits.toLocaleString()}</span>
                    </div>
                  )}
                  {earnedFame > 0 && (
                    <div style={S.rewardChip}>
                      <span style={S.rewardLabel}>FAME</span>
                      <span style={{ color: 'var(--ck-accent)', fontSize: '.95rem' }}>+{earnedFame}</span>
                    </div>
                  )}
                </div>
              )}

              <div style={S.hint}>CLICK TO DISMISS</div>
            </div>
          )}
        </div>
        <div style={{ ...S.topBar, background: outcomeColor }} />
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  backdrop: {
    position: 'absolute',
    inset: 0,
    zIndex: 205,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'rgba(6,13,24,.82)',
    fontFamily: "'Share Tech Mono', monospace",
    animation: 'ck-fade .3s ease',
  },
  scanline: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.04) 3px,rgba(0,0,0,0.04) 4px)',
  },
  card: {
    position: 'relative',
    zIndex: 1,
    background: 'var(--ck-panel)',
    border: '1px solid var(--ck-border)',
    borderRadius: 6,
    minWidth: 360,
    maxWidth: 480,
    overflow: 'hidden',
    animation: 'ck-fade .35s ease',
  },
  topBar: { height: 3, opacity: .85 },
  body: {
    padding: '1.75rem 2rem',
  },
  sectionLabel: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: 8,
    color: 'var(--ck-dim)',
    letterSpacing: '.15em',
    marginBottom: '.4rem',
  },
  jobName: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '1rem',
    color: 'var(--ck-val)',
    letterSpacing: '.1em',
    marginBottom: '1.2rem',
  },
  skillList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    marginBottom: '1.2rem',
  },
  skillsHeader: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: 8,
    color: 'var(--ck-dim)',
    letterSpacing: '.14em',
    marginBottom: 4,
  },
  skillRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 10px',
    background: 'var(--ck-panel2)',
    border: '1px solid var(--ck-border)',
    borderRadius: 4,
    animation: 'ck-fade .25s ease both',
  },
  skillName: {
    fontSize: '.8rem',
    letterSpacing: '.04em',
  },
  critTag: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: 7,
    color: 'var(--ck-gold)',
    border: '1px solid var(--ck-gold)',
    borderRadius: 2,
    padding: '1px 4px',
    letterSpacing: '.08em',
    opacity: .8,
  },
  resultBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    animation: 'ck-fade .3s ease',
  },
  verdict: {
    padding: '.65rem',
    textAlign: 'center',
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '1.15rem',
    letterSpacing: '.25em',
    border: '1px solid',
    borderRadius: 4,
  },
  rewards: {
    display: 'flex',
    gap: 8,
    justifyContent: 'center',
  },
  rewardChip: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    padding: '6px 16px',
    background: 'var(--ck-panel2)',
    border: '1px solid var(--ck-border)',
    borderRadius: 4,
  },
  rewardLabel: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: 7,
    color: 'var(--ck-dim)',
    letterSpacing: '.1em',
  },
  hint: {
    textAlign: 'center',
    padding: '.6rem',
    fontFamily: "'Orbitron', sans-serif",
    fontSize: 8,
    color: 'var(--ck-dim)',
    letterSpacing: '.1em',
    borderTop: '1px solid var(--ck-border)',
  },
};
