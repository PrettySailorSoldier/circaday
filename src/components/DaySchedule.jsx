import { motion } from 'framer-motion'

const PHASE_COLORS = {
  deep_work: '#c084fc', // purple
  focus: '#c084fc',     // purple (mapped to deep_work color as per request if needed, or keep distinct?)
  // Request says: deep_work / focus -> '#c084fc'
  rest: '#60a5fa',      // blue
  creative: '#f472b6',  // pink
  admin: '#94a3b8',     // slate
  general: '#8b7fd4',   // default indigo
  social: '#f59e0b',    // gold (keeping existing just in case)
  windDown: '#a78bfa'   // lavender (keeping existing)
}

function formatHour(hour) {
  if (hour === 0 || hour === 24) return '12AM'
  if (hour === 12) return '12PM'
  if (hour < 12) return `${hour}AM`
  return `${hour - 12}PM`
}

export default function DaySchedule({ arcSchedule, currentPhase, onEndSession }) {
  // Sort schedule just in case, though it should be sorted
  const sortedSchedule = [...(arcSchedule || [])].sort((a, b) => a.startHour - b.startHour)

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Today's Rhythm</h3>
      
      <div style={styles.list}>
        {sortedSchedule.map((phase) => {
          const isCurrent = currentPhase?.id === phase.id
          
          // Map phase types to requested colors
          let color = PHASE_COLORS.general
          if (phase.type === 'focus' || phase.type === 'deep_work') color = PHASE_COLORS.deep_work
          else if (phase.type === 'rest') color = PHASE_COLORS.rest
          else if (phase.type === 'creative') color = PHASE_COLORS.creative
          else if (phase.type === 'admin') color = PHASE_COLORS.admin
          else if (PHASE_COLORS[phase.type]) color = PHASE_COLORS[phase.type]

          return (
            <motion.div
              key={phase.id}
              style={{
                ...styles.row,
                borderLeft: `4px solid ${color}`,
                backgroundColor: isCurrent ? 'var(--bg-elevated)' : 'transparent'
              }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div style={styles.rowContent}>
                <span style={styles.phaseName}>{phase.label}</span>
                <span style={styles.timeRange}>
                  {formatHour(phase.startHour)} – {formatHour(phase.endHour)}
                </span>
              </div>
              
              {isCurrent && (
                <div style={styles.badge}>NOW</div>
              )}
            </motion.div>
          )
        })}
      </div>

      <button onClick={onEndSession} style={styles.endButton}>
        End Session
      </button>
    </div>
  )
}

const styles = {
  container: {
    width: '100%',
    maxWidth: '340px',
    marginTop: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  title: {
    fontFamily: "'Fraunces', serif",
    fontSize: '18px',
    color: 'var(--text-primary)',
    textAlign: 'center',
    margin: 0
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxHeight: '300px',
    overflowY: 'auto',
    paddingRight: '4px' // Space for scrollbar
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid var(--border)'
  },
  rowContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  phaseName: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--text-primary)'
  },
  timeRange: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '12px',
    color: 'var(--text-muted)'
  },
  badge: {
    fontSize: '10px',
    fontWeight: '700',
    color: 'var(--accent)',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    padding: '4px 8px',
    borderRadius: '12px',
    letterSpacing: '0.05em'
  },
  endButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: 'transparent',
    border: '1px solid var(--text-muted)',
    color: 'var(--text-muted)',
    borderRadius: '10px',
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    transition: 'all 0.2s ease',
    marginTop: '8px'
  }
}
