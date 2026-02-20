import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Static description tables ─────────────────────────────────────────────

const PRODUCTIVITY_DESC = {
  prioritizer: 'You think in outcomes. You cut through ambiguity by asking "what\'s the actual goal here?" You work best when you can focus on the highest-value task and ignore the rest.',
  planner: 'You think in sequences. You feel most productive when you have a clear map. Unexpected detours cost you more than most people.',
  arranger: 'You think in relationships. You organize by people and energy, not just tasks. Collaboration fuels you.',
  visualizer: 'You think in systems. You see the whole picture before others do, and struggle when forced to zoom in too early.',
}

const PROCRASTINATION_DESC = {
  perfectionist: 'You delay to avoid the gap between what you made and what you imagined. Starting is the hardest part because starting makes failure possible.',
  thrill_seeker: 'Urgency is your fuel. The research says you likely believe you do better work under pressure — the data is more mixed than it feels.',
  overwhelmed: 'The task feels too big to start, so your brain stalls at the threshold. This isn\'t laziness — it\'s your nervous system protecting you from an undefined threat.',
  interest_blocked: 'Your brain runs on dopamine, not deadlines. If something isn\'t interesting, urgent, challenging, or novel, motivation genuinely doesn\'t activate. This is neurological, not a character flaw.',
  anxious: 'Fear of judgment keeps you at the starting line. The task isn\'t the problem — the imagined audience is.',
  rebellious: 'Being told you have to do something (including by yourself) triggers resistance. Your autonomy is non-negotiable to your nervous system.',
}

const HABIT_DESC = {
  upholder: 'You meet expectations reliably — your own and others\'. This is a gift, but watch for rigidity and difficulty when systems break down.',
  questioner: 'You\'ll follow through when you understand why. Rules without reasons frustrate you. Build your own reasoning into every system.',
  obliger: 'You show up for others more reliably than for yourself. External accountability isn\'t weakness — it\'s your operating system. Build it deliberately.',
  rebel: 'You resist expectations as a core expression of identity. The trick is finding ways to frame goals as your own choice, not obligations.',
}

const STRUCTURE_DESC = {
  rigid: 'You work best with specific time blocks. Circaday will give you precise scheduling.',
  thematic: 'You work best with themed time zones, not rigid appointments. "This block is for creative work" beats "9:15: write email."',
  fluid: 'You work best when you can follow your energy. Circaday will offer anchors, not schedules.',
}

const CHRONOTYPE_STRATEGIES = {
  lion: { light: 'Get bright light immediately on waking. Avoid screens after 9 PM.', caffeine: 'Caffeine cutoff: 1 PM.', nap: 'If napping, keep it before 1 PM and under 20 minutes.' },
  bear: { light: 'Morning light within 30 minutes of waking helps regulate your cycle.', caffeine: 'Caffeine cutoff: 2–3 PM.', nap: 'Nap window: 1–3 PM, 20 minutes max.' },
  wolf: { light: 'Light therapy in the morning can help shift your rhythm earlier if needed.', caffeine: 'Caffeine cutoff: 4–5 PM.', nap: 'Nap window: 2–4 PM if needed.' },
  dolphin: { light: 'Consistent morning light is especially important for your irregular rhythm.', caffeine: 'Keep caffeine to morning only — your sleep is already fragile.', nap: 'Short naps (10 min) before 3 PM only if desperately needed.' },
}

const CHRONOTYPE_LABEL = { lion: '🦁 Lion', bear: '🐻 Bear', wolf: '🐺 Wolf', dolphin: '🐬 Dolphin' }

// ─── Helpers ───────────────────────────────────────────────────────────────

function ScoreBar({ label, value, max = 10 }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: 'var(--text-primary)' }}>{label}</span>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'var(--text-secondary)' }}>{value}/{max}</span>
      </div>
      <div style={{ height: '6px', backgroundColor: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
        <motion.div
          style={{ height: '100%', backgroundColor: 'var(--accent)', borderRadius: '3px' }}
          initial={{ width: 0 }}
          animate={{ width: `${(value / max) * 100}%` }}
          transition={{ duration: 0.8, delay: 0.3 }}
        />
      </div>
    </div>
  )
}

function SectionCard({ title, children }) {
  return (
    <div style={styles.sectionCard}>
      <h3 style={styles.sectionTitle}>{title}</h3>
      {children}
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function ProfileReveal({ archetype, scores, onContinue }) {
  const [screen, setScreen] = useState('reveal') // 'reveal' | 'dimensions'

  if (screen === 'dimensions') {
    return <DimensionalBreakdown archetype={archetype} scores={scores} onContinue={onContinue} />
  }

  return (
    <div style={styles.container}>
      <motion.div
        style={styles.content}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.p
          style={styles.tagline}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {archetype.tagline}
        </motion.p>

        <motion.h1
          style={styles.name}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          {archetype.name}
        </motion.h1>

        <motion.p
          style={styles.description}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          {archetype.description}
        </motion.p>

        <motion.div
          style={styles.decorLine}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        />

        <motion.button
          style={styles.ctaButton}
          onClick={() => setScreen('dimensions')}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          See My Full Profile <span style={styles.arrow}>→</span>
        </motion.button>
      </motion.div>

      <div style={styles.bgGlow} />
    </div>
  )
}

// ─── Dimensional Breakdown Screen ──────────────────────────────────────────

function DimensionalBreakdown({ archetype, scores, onContinue }) {
  const s = scores || {}
  const chronoKey = s.chronotype_key ?? 'bear'
  const strategy = CHRONOTYPE_STRATEGIES[chronoKey] ?? CHRONOTYPE_STRATEGIES.bear
  const jetlagHours = s.social_jetlag ? (s.social_jetlag / 60).toFixed(1) : null

  return (
    <motion.div
      style={styles.breakdownContainer}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div style={styles.breakdownInner}>

        {/* A — CHRONOTYPE */}
        <SectionCard title="A — Your Chronotype">
          <div style={styles.chronotypeBadge}>{CHRONOTYPE_LABEL[chronoKey]}</div>
          {s.chronotype_score !== undefined && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={styles.dimLabel}>Early bird</span>
                <span style={styles.dimLabel}>Night owl</span>
              </div>
              <div style={{ height: '6px', backgroundColor: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                <motion.div
                  style={{ height: '100%', backgroundColor: 'var(--accent)', borderRadius: '3px' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${s.chronotype_score}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </div>
          )}
          {jetlagHours && Number(jetlagHours) > 0 && (
            <p style={styles.insightText}>Your schedule runs about {jetlagHours} hours {jetlagHours > 0 ? 'ahead of' : 'behind'} your biology.</p>
          )}
          <div style={styles.strategyGrid}>
            <p style={styles.strategyItem}>💡 {strategy.light}</p>
            <p style={styles.strategyItem}>☕ {strategy.caffeine}</p>
            <p style={styles.strategyItem}>😴 {strategy.nap}</p>
          </div>
        </SectionCard>

        {/* B — HOW YOU WORK BEST */}
        {s.productivity_style && (
          <SectionCard title="B — How You Work Best">
            <span style={styles.pill}>{s.productivity_style}</span>
            <p style={styles.bodyText}>{PRODUCTIVITY_DESC[s.productivity_style] ?? ''}</p>
          </SectionCard>
        )}

        {/* C — PROCRASTINATION PATTERN */}
        {s.procrastination_type && (
          <SectionCard title="C — Your Procrastination Pattern">
            <span style={styles.pill}>{s.procrastination_type.replace('_', ' ')}</span>
            <p style={styles.bodyText}>{PROCRASTINATION_DESC[s.procrastination_type] ?? ''}</p>
            {s.demand_avoidance >= 6 && (
              <div style={styles.noteBox}>
                <p style={styles.noteText}>You also show signs of demand avoidance — the more something feels mandatory, the harder it becomes, even if you want to do it. Framing tasks as choices rather than obligations helps.</p>
              </div>
            )}
          </SectionCard>
        )}

        {/* D — HABIT TENDENCY */}
        {s.habit_tendency && (
          <SectionCard title="D — How You Build Habits">
            <span style={styles.pill}>{s.habit_tendency}</span>
            <p style={styles.bodyText}>{HABIT_DESC[s.habit_tendency] ?? ''}</p>
          </SectionCard>
        )}

        {/* E — INITIATION & FOCUS */}
        <SectionCard title="E — Initiation & Focus Profile">
          <ScoreBar label="Initiation difficulty" value={s.initiation_difficulty ?? 0} />
          <ScoreBar label="Hyperfocus tendency" value={s.hyperfocus_tendency ?? 0} />
          <ScoreBar label="Sensory sensitivity" value={s.sensory_sensitivity ?? 0} />
          {s.initiation_difficulty >= 7 && (
            <p style={styles.insightText}>Starting tasks is a significant friction point for you. The app will prioritize getting you to the starting line, not just tracking what's planned.</p>
          )}
          {s.hyperfocus_tendency >= 7 && (
            <p style={styles.insightText}>You're prone to deep absorption. This is a superpower and a liability — you'll need time boundaries, not just task lists.</p>
          )}
          {s.sensory_sensitivity >= 7 && (
            <p style={styles.insightText}>Your environment is a major factor in your performance. Treat it as a tool, not an afterthought.</p>
          )}
        </SectionCard>

        {/* F — SCHEDULE PREFERENCE */}
        {s.structure_preference && (
          <SectionCard title="F — What This Means For Your Schedule">
            <span style={styles.pill}>{s.structure_preference}</span>
            <p style={styles.bodyText}>{STRUCTURE_DESC[s.structure_preference] ?? ''}</p>
          </SectionCard>
        )}

        <button style={styles.enterBtn} onClick={onContinue}>
          Enter Circaday →
        </button>
      </div>
    </motion.div>
  )
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = {
  // Original reveal screen
  container: {
    minHeight: '100vh',
    backgroundColor: 'var(--bg-base)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 24px',
    position: 'relative',
    overflow: 'hidden',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    maxWidth: '360px',
    zIndex: 1,
  },
  tagline: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '11px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    marginBottom: '16px',
  },
  name: {
    fontFamily: "'Fraunces', serif",
    fontSize: '36px',
    fontWeight: '500',
    color: 'var(--text-primary)',
    marginBottom: '24px',
    lineHeight: '1.2',
  },
  description: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '15px',
    lineHeight: '1.7',
    color: 'var(--text-secondary)',
    marginBottom: '40px',
  },
  decorLine: {
    width: '60px',
    height: '1px',
    backgroundColor: 'var(--border)',
    marginBottom: '40px',
    transformOrigin: 'center',
  },
  ctaButton: {
    width: '100%',
    padding: '18px 32px',
    backgroundColor: 'var(--accent)',
    color: '#fff',
    borderRadius: '12px',
    fontFamily: "'Inter', sans-serif",
    fontSize: '15px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    cursor: 'pointer',
    border: 'none',
    transition: 'transform 0.2s ease',
  },
  arrow: { fontSize: '18px' },
  bgGlow: {
    position: 'absolute',
    top: '30%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '400px',
    height: '400px',
    background: 'radial-gradient(circle, rgba(139, 127, 212, 0.1) 0%, transparent 60%)',
    filter: 'blur(60px)',
    pointerEvents: 'none',
  },
  // Breakdown screen
  breakdownContainer: {
    minHeight: '100vh',
    backgroundColor: 'var(--bg-base)',
    overflowY: 'auto',
  },
  breakdownInner: {
    maxWidth: '480px',
    margin: '0 auto',
    padding: '40px 24px 60px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  sectionCard: {
    backgroundColor: 'var(--bg-elevated)',
    borderRadius: '16px',
    padding: '20px',
    borderLeft: '3px solid var(--accent)',
  },
  sectionTitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '11px',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--text-secondary)',
    marginBottom: '12px',
    margin: '0 0 12px 0',
  },
  chronotypeBadge: {
    fontFamily: "'Fraunces', serif",
    fontSize: '24px',
    fontWeight: '500',
    color: 'var(--text-primary)',
    marginBottom: '16px',
  },
  insightText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
    margin: '8px 0 0 0',
  },
  strategyGrid: {
    marginTop: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  strategyItem: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: 1.4,
    margin: 0,
  },
  pill: {
    display: 'inline-block',
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    color: 'var(--accent)',
    borderRadius: '20px',
    padding: '4px 12px',
    fontFamily: "'Inter', sans-serif",
    fontSize: '12px',
    fontWeight: '500',
    letterSpacing: '0.04em',
    marginBottom: '10px',
  },
  bodyText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
    margin: 0,
  },
  noteBox: {
    marginTop: '12px',
    backgroundColor: 'rgba(99, 102, 241, 0.06)',
    borderRadius: '10px',
    padding: '12px',
    border: '1px solid rgba(99, 102, 241, 0.15)',
  },
  noteText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
    margin: 0,
  },
  dimLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  enterBtn: {
    width: '100%',
    padding: '18px',
    backgroundColor: 'var(--accent)',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    fontSize: '17px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
    boxShadow: '0 6px 16px rgba(99, 102, 241, 0.25)',
    marginTop: '8px',
  },
}
