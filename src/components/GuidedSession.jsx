import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function GuidedSession({ archetype, quizAnswers, onClose, onStartSession }) {
  const [step, setStep] = useState(1)
  const [energyLevel, setEnergyLevel] = useState(null)
  const [intentionText, setIntentionText] = useState('')
  const [intentionCategory, setIntentionCategory] = useState(null)
  const [frictionAnswer, setFrictionAnswer] = useState('') // For Step 3 interactive parts
  
  // Parse friction point from quiz answers
  // quizAnswers structure: [{ questionId: 'friction', answerId: 'overwhelm' }, ...]
  const frictionPoint = quizAnswers?.find(a => a.questionId === 'friction')?.answerId || 'default'

  // Helper to get next step state
  const canProceed = () => {
    if (step === 1) return energyLevel !== null
    if (step === 2) return intentionText.trim().length > 0 || intentionCategory !== null
    if (step === 3) return true // Friction step is mostly reflective or simple input
    return true
  }

  const handleNext = () => {
    if (step < 4) setStep(step + 1)
    else {
      onStartSession({
        energyLevel,
        intention: intentionText || intentionCategory,
        category: intentionCategory,
        // Calculate recommended phase based on energy/intention
        recommendedPhase: intentionCategory === 'deep_work' ? 'focus' : (energyLevel <= 1 ? 'rest' : 'general')
      })
    }
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
    else onClose()
  }

  // Content for Step 1 based on Archetype
  const getCheckInQuestion = () => {
    const name = archetype?.name || 'Traveler'
    if (name.includes('Dolphin')) return "On a scale of 1-3, how deep is your focus capability right now?"
    if (name.includes('Bear')) return "On a scale of 1-3, how is your energy reserve looking?"
    if (name.includes('Wolf')) return "On a scale of 1-3, how sharp does your mind feel?"
    if (name.includes('Lion')) return "On a scale of 1-3, how ready are you to tackle the day?"
    return "On a scale of 1-3, how is your energy right now?"
  }

  // Content for Step 3 based on Friction
  const renderFrictionStep = () => {
    // frictionPoint logic
    if (frictionPoint === 'overwhelm' || frictionPoint === 'unsure') {
      return (
        <div style={styles.stepContainer}>
          <h2 style={styles.prompt}>Let's break it down.</h2>
          <p style={styles.subPrompt}>You mentioned feeling overwhelmed. What is the very first, tiny step?</p>
          <input 
            style={styles.input} 
            placeholder="e.g. Open the document"
            value={frictionAnswer}
            onChange={(e) => setFrictionAnswer(e.target.value)}
          />
        </div>
      )
    }
    if (frictionPoint === 'boring') {
       return (
        <div style={styles.stepContainer}>
          <h2 style={styles.prompt}>Make it interesting.</h2>
          <p style={styles.subPrompt}>Boredom kills focus. How can we make this 10% more fun?</p>
          <div style={styles.suggestionList}>
             <div style={styles.suggestionItem}>Put on a movie soundtrack</div>
             <div style={styles.suggestionItem}>Set a 15 min timer race</div>
             <div style={styles.suggestionItem}>Reward yourself with a tea after</div>
          </div>
        </div>
      )
    }
    if (frictionPoint === 'worried') {
       return (
        <div style={styles.stepContainer}>
          <h2 style={styles.prompt}>Aim for "Good Enough".</h2>
          <p style={styles.subPrompt}>Perfectionism is a trap. What does 70% done look like?</p>
           <textarea 
            style={{...styles.input, height: '80px', resize: 'none'}} 
            placeholder="A rough draft, a quick sketch..."
            value={frictionAnswer}
            onChange={(e) => setFrictionAnswer(e.target.value)}
          />
        </div>
      )
    }
    // Default / "Forgot"
    return (
        <div style={styles.stepContainer}>
          <h2 style={styles.prompt}>Clear your mind.</h2>
          <p style={styles.subPrompt}>What are 3 things vying for your attention?</p>
           <input style={styles.input} placeholder="1. ..." />
           <input style={{...styles.input, marginTop: 8}} placeholder="2. ..." />
           <input style={{...styles.input, marginTop: 8}} placeholder="3. ..." />
        </div>
      )
  }

  return (
    <motion.div 
      style={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div style={styles.progressBar}>
        <div style={{ ...styles.progressFill, width: `${(step / 4) * 100}%` }} />
      </div>

      <div style={styles.content}>
        <AnimatePresence mode="wait">
          
          {/* STEP 1: CHECK IN */}
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              style={styles.stepContainer}
            >
              <h2 style={styles.prompt}>{getCheckInQuestion()}</h2>
              <div style={styles.energyGrid}>
                {[1, 2, 3].map((level) => (
                  <button
                    key={level}
                    style={{
                      ...styles.energyButton,
                      backgroundColor: energyLevel === level ? 'var(--accent)' : 'var(--bg-elevated)',
                      color: energyLevel === level ? 'white' : 'var(--text-secondary)'
                    }}
                    onClick={() => setEnergyLevel(level)}
                  >
                    {level === 1 && 'Low'}
                    {level === 2 && 'Medium'}
                    {level === 3 && 'High'}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 2: INTENTION */}
          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              style={styles.stepContainer}
            >
              <h2 style={styles.prompt}>What matters today?</h2>
              <p style={styles.subPrompt}>One thing that would make today worthwhile.</p>
              
              <input
                style={styles.input}
                placeholder="I want to..."
                value={intentionText}
                onChange={(e) => {
                  setIntentionText(e.target.value)
                  if (e.target.value) setIntentionCategory(null) // Clear category if typing
                }}
              />

              <p style={{...styles.subPrompt, marginTop: '24px'}}>Or choose a mode:</p>
              <div style={styles.categoryGrid}>
                {[
                  { id: 'deep_work', label: '🧠 Deep Work' },
                  { id: 'admin', label: '📋 Admin' },
                  { id: 'rest', label: '🌱 Rest' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    style={{
                      ...styles.categoryButton,
                      borderColor: intentionCategory === cat.id ? 'var(--accent)' : 'transparent',
                      backgroundColor: intentionCategory === cat.id ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-elevated)'
                    }}
                    onClick={() => {
                        setIntentionCategory(cat.id)
                        setIntentionText('') // Clear text if choosing category
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 3: FRICTION */}
          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              style={styles.stepContainer}
            >
              {renderFrictionStep()}
            </motion.div>
          )}

          {/* STEP 4: SUMMARY */}
          {step === 4 && (
             <motion.div 
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              style={styles.stepContainer}
            >
              <h2 style={styles.prompt}>Ready to begin.</h2>
              <div style={styles.summaryCard}>
                 <div style={styles.summaryItem}>
                    <span style={styles.summaryLabel}>Energy</span>
                    <span style={styles.summaryValue}>
                        {energyLevel === 1 ? 'Low' : energyLevel === 2 ? 'Medium' : 'High'}
                    </span>
                 </div>
                 <div style={styles.summaryItem}>
                    <span style={styles.summaryLabel}>Focus</span>
                    <span style={styles.summaryValue}>
                        {intentionText || (
                            intentionCategory === 'deep_work' ? 'Deep Work' :
                            intentionCategory === 'admin' ? 'Admin & Errands' : 'Rest'
                        )}
                    </span>
                 </div>
                 {frictionAnswer && (
                     <div style={{...styles.summaryItem, borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 12}}>
                        <span style={styles.summaryLabel}>First Step</span>
                        <span style={styles.summaryValue}>{frictionAnswer}</span>
                     </div>
                 )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <div style={styles.footer}>
        <button onClick={handleBack} style={styles.backButton}>
          Back
        </button>
        <button 
            onClick={handleNext} 
            style={{
                ...styles.nextButton,
                opacity: canProceed() ? 1 : 0.5,
                pointerEvents: canProceed() ? 'auto' : 'none'
            }}
        >
          {step === 4 ? 'Begin Session' : 'Next'}
        </button>
      </div>
    </motion.div>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100vh',
    backgroundColor: 'var(--bg-base)',
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column'
  },
  progressBar: {
    height: '4px',
    backgroundColor: 'var(--bg-surface)',
    width: '100%'
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'var(--accent)',
    transition: 'width 0.3s ease'
  },
  content: {
    flex: 1,
    padding: '40px 24px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    maxWidth: '500px',
    margin: '0 auto',
    width: '100%'
  },
  stepContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  prompt: {
    fontFamily: "'Fraunces', serif",
    fontSize: '28px',
    color: 'var(--text-primary)',
    marginBottom: '8px'
  },
  subPrompt: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '16px',
    color: 'var(--text-secondary)',
    marginBottom: '24px'
  },
  energyGrid: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px'
  },
  energyButton: {
    flex: 1,
    padding: '24px 12px',
    borderRadius: '12px',
    border: 'none',
    fontFamily: "'Inter', sans-serif",
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  input: {
    width: '100%',
    padding: '16px',
    backgroundColor: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    fontFamily: "'Inter', sans-serif",
    fontSize: '16px',
    color: 'var(--text-primary)',
    outline: 'none'
  },
  categoryGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  categoryButton: {
    padding: '16px',
    borderRadius: '12px',
    borderWidth: '1px',
    borderStyle: 'solid',
    textAlign: 'left',
    fontFamily: "'Inter', sans-serif",
    fontSize: '16px',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  suggestionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  suggestionItem: {
    padding: '12px 16px',
    backgroundColor: 'var(--bg-surface)',
    borderRadius: '8px',
    color: 'var(--text-secondary)',
    fontSize: '14px'
  },
  summaryCard: {
    backgroundColor: 'var(--bg-elevated)',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid var(--border)'
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  summaryLabel: {
    color: 'var(--text-muted)',
    fontSize: '14px'
  },
  summaryValue: {
    color: 'var(--text-primary)',
    fontWeight: '500'
  },
  footer: {
    padding: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid var(--border)'
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '12px'
  },
  nextButton: {
    backgroundColor: 'var(--accent)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '16px 32px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'opacity 0.2s ease'
  }
}
