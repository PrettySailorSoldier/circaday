import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function MomentumTool({ onClose, onStartWorkSession }) {
  const [step, setStep] = useState(1) // 1: Hook, 2: Wedge, 3: Push, 4: Victory
  const [goal, setGoal] = useState('')
  const [firstStep, setFirstStep] = useState('')
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes in seconds
  const [isActive, setIsActive] = useState(false)

  // Timer logic for Step 3
  useEffect(() => {
    let interval = null
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      setIsActive(false)
      setStep(4)
    }
    return () => clearInterval(interval)
  }, [isActive, timeLeft])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleStartTimer = () => {
    setIsActive(true)
  }

  const handleDone = () => {
    setIsActive(false)
    setStep(4)
  }

  const progress = ((300 - timeLeft) / 300) * 100

  return (
    <motion.div
      style={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div style={styles.container}>
        <AnimatePresence mode="wait">
          {/* STATE 1: THE HOOK */}
          {step === 1 && (
            <motion.div
              key="step1"
              style={styles.step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h2 style={styles.title}>Let's push the boulder.</h2>
              <p style={styles.subtitle}>What are we starting?</p>
              <input
                style={styles.input}
                placeholder="The big scary thing..."
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                autoFocus
              />
              <button
                style={{ ...styles.btn, opacity: goal.trim() ? 1 : 0.5 }}
                disabled={!goal.trim()}
                onClick={() => setStep(2)}
              >
                Next
              </button>
            </motion.div>
          )}

          {/* STATE 2: THE WEDGE */}
          {step === 2 && (
            <motion.div
              key="step2"
              style={styles.step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 style={styles.title}>Make it tiny.</h2>
              <p style={styles.subtitle}>What is the absolute first physical action? (e.g., 'Open the file', 'Stand up')</p>
              <input
                style={styles.input}
                placeholder="First step..."
                value={firstStep}
                onChange={(e) => setFirstStep(e.target.value)}
                autoFocus
              />
              <button
                style={{ ...styles.btn, opacity: firstStep.trim() ? 1 : 0.5 }}
                disabled={!firstStep.trim()}
                onClick={() => {
                  setStep(3)
                  handleStartTimer()
                }}
              >
                I'm ready
              </button>
            </motion.div>
          )}

          {/* STATE 3: THE PUSH */}
          {step === 3 && (
            <motion.div
              key="step3"
              style={styles.step}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
            >
              <p style={styles.firstStepLabel}>FIRST STEP</p>
              <h2 style={styles.firstStepText}>{firstStep}</h2>

              <div style={styles.timerContainer}>
                <svg width="200" height="200" style={styles.svg}>
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke="var(--border)"
                    strokeWidth="4"
                  />
                  <motion.circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="565.48" // 2 * Math.PI * 90
                    animate={{ strokeDashoffset: 565.48 * (1 - progress / 100) }}
                    transition={{ duration: 1, ease: 'linear' }}
                    style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                  />
                </svg>
                <div style={styles.timerDisplay}>{formatTime(timeLeft)}</div>
              </div>

              <div style={styles.btnRow}>
                <button style={styles.btn} onClick={handleDone}>Done!</button>
                <button style={styles.ghostBtn} onClick={onClose}>Quit</button>
              </div>
            </motion.div>
          )}

          {/* STATE 4: THE VICTORY */}
          {step === 4 && (
            <motion.div
              key="step4"
              style={styles.step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</span>
              <h2 style={styles.title}>Momentum achieved.</h2>
              <p style={styles.subtitle}>You've broken the seal. The hardest part is over.</p>
              
              <div style={styles.btnRowStacked}>
                <button 
                  style={styles.btn} 
                  onClick={() => onStartWorkSession({ goal, firstStep })}
                >
                  Keep going (Start Session)
                </button>
                <button style={styles.ghostBtn} onClick={onClose}>
                  Take the win & stop
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'var(--bg-base)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  container: {
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
  },
  step: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  title: {
    fontFamily: "'Fraunces', serif",
    fontSize: '32px',
    color: 'var(--text-primary)',
    marginBottom: '8px',
  },
  subtitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '16px',
    color: 'var(--text-secondary)',
    marginBottom: '32px',
    lineHeight: 1.5,
  },
  input: {
    width: '100%',
    padding: '16px',
    backgroundColor: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    color: 'var(--text-primary)',
    fontSize: '18px',
    marginBottom: '32px',
    textAlign: 'center',
    outline: 'none',
  },
  btn: {
    width: '100%',
    padding: '18px',
    backgroundColor: 'var(--accent)',
    color: 'white',
    border: 'none',
    borderRadius: '16px',
    fontSize: '18px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 8px 16px rgba(99, 102, 241, 0.2)',
  },
  ghostBtn: {
    width: '100%',
    padding: '18px',
    backgroundColor: 'transparent',
    color: 'var(--text-secondary)',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
  },
  firstStepLabel: {
    fontSize: '12px',
    letterSpacing: '0.1em',
    color: 'var(--text-secondary)',
    marginBottom: '8px',
  },
  firstStepText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '24px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginBottom: '40px',
  },
  timerContainer: {
    position: 'relative',
    width: '200px',
    height: '200px',
    marginBottom: '48px',
  },
  svg: {
    display: 'block',
  },
  timerDisplay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontFamily: 'monospace',
    color: 'var(--text-primary)',
  },
  btnRow: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  btnRowStacked: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '24px',
  },
}
