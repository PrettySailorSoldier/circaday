import { motion, AnimatePresence } from 'framer-motion'

export default function PhaseCard({ phase }) {
  if (!phase) return null

  return (
    <div style={styles.container}>
      <AnimatePresence mode="wait">
        <motion.div
          key={phase.label}
          style={{
            ...styles.card,
            borderLeftColor: phase.color
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <div style={styles.header}>
            <span style={styles.phaseIcon}>◆</span>
            <span style={styles.currentLabel}>CURRENT PHASE</span>
          </div>

          <h3 style={{ ...styles.phaseName, color: phase.color }}>
            {phase.label}
          </h3>

          <p style={styles.tip}>{phase.tip}</p>

          <div style={styles.timeIndicator}>
            <span style={styles.timeText}>
              {formatHour(phase.startHour)} – {formatHour(phase.endHour)}
            </span>
            <span style={styles.remainingTime}>
              {calculateRemaining(phase.endHour)}
            </span>
          </div>


        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function formatHour(hour) {
  if (hour === 0 || hour === 24) return '12AM'
  if (hour === 12) return '12PM'
  if (hour < 12) return `${hour}AM`
  return `${hour - 12}PM`
}

function calculateRemaining(endHour) {
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()

  let remaining
  if (endHour > currentHour) {
    remaining = (endHour - currentHour) * 60 - currentMinute
  } else {
    remaining = (24 - currentHour + endHour) * 60 - currentMinute
  }

  if (remaining <= 0) return ''
  if (remaining < 60) return `${remaining}m remaining`
  const hours = Math.floor(remaining / 60)
  const mins = remaining % 60
  if (mins === 0) return `${hours}h remaining`
  return `${hours}h ${mins}m`
}

const styles = {
  container: {
    width: '100%',
    maxWidth: '340px',
    marginTop: '24px'
  },
  card: {
    backgroundColor: 'var(--bg-surface)',
    borderRadius: '16px',
    padding: '20px',
    borderLeft: '3px solid',
    position: 'relative'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '8px'
  },
  phaseIcon: {
    fontSize: '8px',
    color: 'var(--accent)'
  },
  currentLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '10px',
    letterSpacing: '0.08em',
    color: 'var(--text-muted)'
  },
  phaseName: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '8px'
  },
  tip: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    marginBottom: '16px'
  },
  timeIndicator: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    paddingTop: '12px',
    borderTop: '1px solid var(--border)'
  },
  timeText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '12px',
    color: 'var(--text-muted)'
  },
  remainingTime: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '12px',
    color: 'var(--accent)',
    fontWeight: '500'
  },
  actionButton: {
    width: '100%',
    padding: '14px 20px',
    backgroundColor: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    cursor: 'pointer'
  },
  playIcon: {
    fontSize: '10px',
    color: 'var(--accent)'
  }
}
