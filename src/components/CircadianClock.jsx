import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function CircadianClock({ arcSchedule, currentHour, currentMinute, isSessionActive }) {
  const [time, setTime] = useState({ hour: currentHour, minute: currentMinute })

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTime({ hour: now.getHours(), minute: now.getMinutes() })
    }

    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  // Calculate current phase
  const currentPhase = arcSchedule?.find(phase => {
    if (phase.endHour > phase.startHour) {
      return time.hour >= phase.startHour && time.hour < phase.endHour
    } else {
      return time.hour >= phase.startHour || time.hour < phase.endHour
    }
  })

  // Calculate hand angle (24-hour clock, 0 = top)
  const totalMinutes = time.hour * 60 + time.minute
  const handAngle = (totalMinutes / (24 * 60)) * 360 - 90

  // Format time display
  const formatTime = () => {
    const h = time.hour % 12 || 12
    const m = time.minute.toString().padStart(2, '0')
    return `${h}:${m}`
  }

  // Generate 24 hour tick marks
  const ticks = Array.from({ length: 24 }, (_, i) => {
    const angle = (i / 24) * 360 - 90
    const radian = (angle * Math.PI) / 180
    const innerRadius = 145
    const outerRadius = 158
    const x1 = 200 + innerRadius * Math.cos(radian)
    const y1 = 200 + innerRadius * Math.sin(radian)
    const x2 = 200 + outerRadius * Math.cos(radian)
    const y2 = 200 + outerRadius * Math.sin(radian)
    return { x1, y1, x2, y2, hour: i }
  })

  // Calculate hand endpoint
  const handRadian = (handAngle * Math.PI) / 180
  const handLength = 135
  const handX = 200 + handLength * Math.cos(handRadian)
  const handY = 200 + handLength * Math.sin(handRadian)

  // --- ARC LOGIC ---
  const PHASE_COLORS = {
    focus: '#6366f1',   // Indigo
    social: '#f59e0b',  // Gold
    rest: '#2dd4bf',    // Teal
    admin: '#f43f5e',   // Rose
    general: '#a78bfa', // Lavender (Wind down / default)
    windDown: '#a78bfa'
  }

  const getArcPath = (startHour, endHour) => {
    // Convert hours to angles (0h = -90deg, 6h = 0deg, 12h = 90deg, 18h = 180deg)
    // 24h clock: 360deg / 24h = 15deg per hour
    
    // Normalize hours to 0-24
    let start = startHour
    let end = endHour
    
    // Calculate angles
    const startAngle = (start / 24) * 360 - 90
    let endAngle = (end / 24) * 360 - 90
    
    // Handle wrapping (e.g. 23:00 to 07:00)
    if (end < start) {
      endAngle = ((end + 24) / 24) * 360 - 90
    }
    
    const radius = 175 // Outside the clock ticks (158) with gap
    
    // Convert to radians
    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180
    
    const x1 = 200 + radius * Math.cos(startRad)
    const y1 = 200 + radius * Math.sin(startRad)
    const x2 = 200 + radius * Math.cos(endRad)
    const y2 = 200 + radius * Math.sin(endRad)
    
    // SVG Path command
    // M = move to start
    // A = arc to end (rx ry x-axis-rotation large-arc-flag sweep-flag x y)
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"
    
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`
  }

  // Current time marker on the arc ring
  const timeMarkerAngle = handAngle
  const timeMarkerRad = (timeMarkerAngle * Math.PI) / 180
  const timeMarkerRadius = 175
  const timeMarkerX = 200 + timeMarkerRadius * Math.cos(timeMarkerRad)
  const timeMarkerY = 200 + timeMarkerRadius * Math.sin(timeMarkerRad)


  return (
    <div style={styles.container}>
      {/* Background glow */}
      <div style={styles.glowContainer}>
        <div style={styles.glowOuter} />
        <div style={styles.glowInner} />
      </div>

      <svg
        viewBox="0 0 400 400"
        style={styles.svg}
      >
        <defs>
          <radialGradient id="clockGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8b7fd4" stopOpacity="0.08" />
            <stop offset="70%" stopColor="#5b4fa6" stopOpacity="0.03" />
            <stop offset="100%" stopColor="#0d0d14" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* CLOCK ARCS (Only when session is active) */}
        {isSessionActive && arcSchedule?.map((phase, i) => {
           const isCurrent = currentPhase?.id === phase.id
           return (
             <motion.path
               key={`arc-${i}`}
               d={getArcPath(phase.startHour, phase.endHour)}
               fill="none"
               stroke={PHASE_COLORS[phase.type] || PHASE_COLORS.general}
               strokeWidth="6"
               strokeLinecap="round"
               initial={{ pathLength: 0, opacity: 0 }}
               animate={{ 
                 pathLength: 1, 
                 opacity: isCurrent ? 1 : 0.4
               }}
               transition={{ duration: 1, delay: i * 0.1 }}
             />
           )
        })}

        {/* Current Time Marker on Arc Ring (Only when session is active) */}
        {isSessionActive && (
          <motion.circle 
            cx={timeMarkerX}
            cy={timeMarkerY}
            r="4"
            fill={PHASE_COLORS[currentPhase?.type] || '#fff'}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.3 }}
          />
        )}


        {/* Subtle background glow circle */}
        <circle cx="200" cy="200" r="180" fill="url(#clockGlow)" />

        {/* Hour tick marks */}
        {ticks.map((tick, i) => (
          <motion.line
            key={i}
            x1={tick.x1}
            y1={tick.y1}
            x2={tick.x2}
            y2={tick.y2}
            stroke="#e8e8f0"
            strokeWidth={tick.hour % 6 === 0 ? 2 : 1}
            strokeOpacity={tick.hour % 6 === 0 ? 0.4 : 0.2}
            strokeLinecap="round"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.02, duration: 0.3 }}
          />
        ))}

        {/* Sweep hand */}
        <motion.line
          x1="200"
          y1="200"
          x2={handX}
          y2={handY}
          stroke="#e8e8f0"
          strokeWidth={1.5}
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        />

        {/* Center dot */}
        <circle cx="200" cy="200" r="4" fill="#e8e8f0" />
      </svg>

      {/* Center content overlay */}
      <div style={styles.centerContent}>
        <motion.div
          style={styles.timeDisplay}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {formatTime()}
        </motion.div>
        <motion.div
          style={styles.phaseLabel}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {currentPhase?.label || 'LOADING'}
        </motion.div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    position: 'relative',
    width: '280px',
    height: '280px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  glowContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  glowOuter: {
    position: 'absolute',
    width: '320px',
    height: '320px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(91, 79, 166, 0.15) 0%, rgba(91, 79, 166, 0.05) 40%, transparent 70%)',
    filter: 'blur(30px)'
  },
  glowInner: {
    position: 'absolute',
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139, 127, 212, 0.1) 0%, transparent 60%)',
    filter: 'blur(20px)'
  },
  svg: {
    width: '100%',
    height: '100%',
    position: 'relative',
    zIndex: 1,
    overflow: 'visible' // Important for arcs extending beyond viewbox if needed, though they are within 400x400
  },
  centerContent: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2
  },
  timeDisplay: {
    fontFamily: "'Fraunces', serif",
    fontSize: '42px',
    fontWeight: '400',
    color: 'var(--text-primary)',
    letterSpacing: '-0.02em'
  },
  phaseLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '10px',
    fontWeight: '500',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    marginTop: '4px'
  }
}
