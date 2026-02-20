import { motion } from 'framer-motion'
import SleepTracker from './SleepTracker'

const CHRONOTYPE_LABEL = { lion: '🦁 Lion', bear: '🐻 Bear', wolf: '🐺 Wolf', dolphin: '🐬 Dolphin' }

function ScoreBar({ label, value, max = 10 }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
        <span style={styles.barLabel}>{label}</span>
        <span style={styles.barValue}>{value ?? '—'}/{max}</span>
      </div>
      <div style={styles.barTrack}>
        <motion.div
          style={styles.barFill}
          initial={{ width: 0 }}
          animate={{ width: `${((value ?? 0) / max) * 100}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

export default function ProfileTab({ archetype, profile, onChronotypeUpdate }) {
  const chronoKey = profile?.chronotype_key ?? null
  const productivityStyle = profile?.productivity_style
  const procrastinationType = profile?.procrastination_type
  const habitTendency = profile?.habit_tendency

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <p style={styles.tagline}>{archetype?.tagline}</p>
        <h1 style={styles.name}>{archetype?.name}</h1>
      </div>

      {/* Chronotype badge */}
      {chronoKey && (
        <div style={styles.card}>
          <p style={styles.cardLabel}>Chronotype</p>
          <div style={styles.chronotypeBadge}>
            {CHRONOTYPE_LABEL[chronoKey] ?? chronoKey}
          </div>
          {profile?.chronotype_score !== undefined && (
            <div style={styles.chronoBar}>
              <span style={styles.chronoEdge}>Early bird</span>
              <div style={styles.chronoTrack}>
                <motion.div
                  style={{ ...styles.chronoFill, width: `${profile.chronotype_score}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${profile.chronotype_score}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
              <span style={styles.chronoEdge}>Night owl</span>
            </div>
          )}
        </div>
      )}

      {/* Trait pills */}
      {(productivityStyle || procrastinationType || habitTendency) && (
        <div style={styles.card}>
          <p style={styles.cardLabel}>Your Traits</p>
          <div style={styles.pillRow}>
            {productivityStyle && <span style={styles.pill}>{productivityStyle}</span>}
            {procrastinationType && <span style={styles.pill}>{procrastinationType.replace('_', ' ')}</span>}
            {habitTendency && <span style={styles.pill}>{habitTendency}</span>}
          </div>
        </div>
      )}

      {/* Scored bars */}
      {(profile?.initiation_difficulty || profile?.hyperfocus_tendency || profile?.sensory_sensitivity) && (
        <div style={styles.card}>
          <p style={styles.cardLabel}>Focus Profile</p>
          <ScoreBar label="Initiation difficulty" value={profile.initiation_difficulty} />
          <ScoreBar label="Hyperfocus tendency" value={profile.hyperfocus_tendency} />
          <ScoreBar label="Sensory sensitivity" value={profile.sensory_sensitivity} />
        </div>
      )}

      {/* Sleep calibration */}
      <SleepTracker
        currentArchetypeId={profile?.archetype_id}
        onChronotypeUpdate={onChronotypeUpdate}
      />

      {/* Retake */}
      <button style={styles.retakeBtn} onClick={() => window.location.href = '/quiz'}>
        Retake Assessment
      </button>
    </div>
  )
}

const styles = {
  container: {
    padding: '24px 20px 80px',
    maxWidth: '480px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  header: {
    textAlign: 'center',
    paddingBottom: '8px',
  },
  tagline: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '11px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    margin: '0 0 8px 0',
  },
  name: {
    fontFamily: "'Fraunces', serif",
    fontSize: '28px',
    fontWeight: '500',
    color: 'var(--text-primary)',
    margin: 0,
  },
  card: {
    backgroundColor: 'var(--bg-elevated)',
    borderRadius: '16px',
    padding: '16px',
  },
  cardLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '11px',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--text-secondary)',
    margin: '0 0 12px 0',
  },
  chronotypeBadge: {
    fontFamily: "'Fraunces', serif",
    fontSize: '22px',
    color: 'var(--text-primary)',
    marginBottom: '12px',
  },
  chronoBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  chronoEdge: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '10px',
    color: 'var(--text-muted)',
    whiteSpace: 'nowrap',
  },
  chronoTrack: {
    flex: 1,
    height: '5px',
    backgroundColor: 'var(--border)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  chronoFill: {
    height: '100%',
    backgroundColor: 'var(--accent)',
    borderRadius: '3px',
  },
  pillRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  pill: {
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    color: 'var(--accent)',
    borderRadius: '20px',
    padding: '5px 14px',
    fontFamily: "'Inter', sans-serif",
    fontSize: '12px',
    fontWeight: '500',
    letterSpacing: '0.03em',
  },
  barLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '13px',
    color: 'var(--text-primary)',
  },
  barValue: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  barTrack: {
    height: '5px',
    backgroundColor: 'var(--border)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: 'var(--accent)',
    borderRadius: '3px',
  },
  retakeBtn: {
    width: '100%',
    padding: '14px',
    backgroundColor: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    color: 'var(--text-secondary)',
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    cursor: 'pointer',
    marginTop: '4px',
  },
}
