import { motion } from 'framer-motion'

// --- USER CUSTOMIZATION PREP ---
const BLOCK_CONFIG = {
  rest: {
    color: '#7B6FD4', // soft blue-purple
    icon: '🌙'
  },
  creative: {
    color: '#D4728A', // rose/coral
    icon: '✨'
  },
  admin: {
    color: '#C4A35A', // muted amber
    icon: '📋'
  },
  shallow_work: {
    color: '#5AB4B4', // teal
    icon: '📑'
  },
  // Mapping existing types to new config
  deep_work: {
    color: '#7B6FD4', // using rest/focus color (blue-purple) or custom? 
    // Wait, request said Rest is #7B6FD4. 
    // Let's stick to the requested palette strictly for the new types, 
    // and map existing ones to the closest match.
    // "Rest — #7B6FD4"
    // "Creative — #D4728A"
    // "Admin — #C4A35A"
    // "Shallow Work — #5AB4B4"
    
    // Existing types: focus, deep_work, social, general, windDown
    // Let's map them:
    color: '#7B6FD4', // fallback or similar
    icon: '🧠'
  },
  focus: {
    color: '#7B6FD4', // using similar to Rest/Deep
    icon: '🧠'
  },
  social: {
    color: '#C4A35A', // map to Admin/Social-ish
    icon: '💬'
  },
  general: {
    color: '#8b7fd4', // default
    icon: '●'
  },
  windDown: {
    color: '#7B6FD4',
    icon: '🌙'
  }
}

// Helper to get config safely
const getConfig = (type) => {
  if (BLOCK_CONFIG[type]) return BLOCK_CONFIG[type]
  if (type === 'deep_work') return BLOCK_CONFIG.focus // fallback
  return BLOCK_CONFIG.general
}

function formatHour(hour) {
  if (hour === 0 || hour === 24) return '12AM'
  if (hour === 12) return '12PM'
  if (hour < 12) return `${hour}AM`
  return `${hour - 12}PM`
}

export default function DaySchedule({ arcSchedule, currentPhase, onEndSession }) {
  const sortedSchedule = [...(arcSchedule || [])].sort((a, b) => a.startHour - b.startHour)

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Today's Rhythm</h3>
      
      <div style={styles.list}>
        {sortedSchedule.map((phase) => {
          const isCurrent = currentPhase?.id === phase.id
          
          // Determine config based on type
          let typeKey = phase.type
          if (phase.type === 'deep_work') typeKey = 'focus' 
          // Check if specific type exists in config, else default
          const config = BLOCK_CONFIG[typeKey] || BLOCK_CONFIG.general
          
          // If strictly following the requested palette:
          // Check label or type to map strictly to the 4 categories if possible?
          // The prompt says: "Assign each block type a distinct accent color... Use this palette:"
          // So let's try to match phase.type to these.
          
          let color = config.color
          let icon = config.icon

          // Override for spec compliance if type matches exactly
          if (phase.type === 'rest') { color = '#7B6FD4'; icon = '🌙' }
          if (phase.type === 'creative') { color = '#D4728A'; icon = '✨' }
          if (phase.type === 'admin') { color = '#C4A35A'; icon = '📋' }
          if (phase.type === 'shallow_work' || phase.type === 'shallow') { color = '#5AB4B4'; icon = '📑' }

          return (
            <motion.div
              key={phase.id}
              style={{
                ...styles.row,
                borderLeft: `4px solid ${color}`,
                backgroundColor: `rgba(${hexToRgb(color)}, 0.1)`, // 10% opacity tint
                borderColor: isCurrent ? color : 'transparent' // visual highlight for current? or just badge?
                // Request said: "very subtle background tint (the color at about 10% opacity)"
              }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div style={styles.rowContent}>
                <div style={styles.labelContainer}>
                   <span style={styles.icon}>{icon}</span>
                   <span style={{ ...styles.phaseName, color: color }}>
                     {phase.label}
                   </span>
                </div>
                <span style={styles.timeRange}>
                  {formatHour(phase.startHour)} – {formatHour(phase.endHour)}
                </span>
              </div>
              
              {isCurrent && (
                <div style={{ ...styles.badge, color: color, backgroundColor: `rgba(${hexToRgb(color)}, 0.2)` }}>
                  NOW
                </div>
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

// Helper for RGBA
function hexToRgb(hex) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
    return r + r + g + g + b + b;
  });
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
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
    paddingRight: '4px'
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid transparent' // Placeholder for structure
  },
  rowContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  labelContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  icon: {
    fontSize: '14px'
  },
  phaseName: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '15px', // Slightly larger
    fontWeight: '600',
    letterSpacing: '-0.01em'
  },
  timeRange: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '11px', // Smaller
    color: 'var(--text-muted)', // Dimmer
    opacity: 0.8,
    marginLeft: '24px' // Indent to align with text
  },
  badge: {
    fontSize: '10px',
    fontWeight: '700',
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
