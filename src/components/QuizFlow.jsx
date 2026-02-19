import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { quizQuestions, calculateArchetype } from '../data/archetypes'
import { getCurrentUser, createProfile } from '../lib/db'

export default function QuizFlow({ onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState([])
  const [selectedOption, setSelectedOption] = useState(null)

  const question = quizQuestions[currentQuestion]
  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100

  const handleSelect = async (optionId) => {
    setSelectedOption(optionId)

    const newAnswers = [
      ...answers,
      { questionId: question.id, answerId: optionId }
    ]
    setAnswers(newAnswers)

    // Auto-advance after delay
    setTimeout(async () => {
      if (currentQuestion < quizQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedOption(null)
      } else {
        // Quiz complete - calculate archetype
        const archetype = calculateArchetype(newAnswers)

        // Save to Database
        const { data: { user } } = await getCurrentUser()
        if (user) {
          await createProfile(user.id, archetype.id, newAnswers)
        }

        onComplete(archetype)
      }
    }, 300)
  }

  return (
    <div style={styles.container}>
      {/* Progress bar */}
      <div style={styles.progressContainer}>
        <div style={styles.progressTrack}>
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              style={{
                ...styles.progressSegment,
                backgroundColor: i <= currentQuestion ? 'var(--accent)' : 'var(--border)'
              }}
            />
          ))}
        </div>
        <div style={styles.stepIndicator}>
          STEP {currentQuestion + 1} OF {quizQuestions.length}
        </div>
        <button style={styles.skipButton}>Skip</button>
      </div>

      {/* Question content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          style={styles.questionContainer}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <h2 style={styles.questionText}>{question.question}</h2>
          <p style={styles.subtext}>{question.subtext}</p>

          {/* Options grid */}
          <div style={styles.optionsGrid}>
            {question.options.map((option, index) => (
              <motion.button
                key={option.id}
                style={{
                  ...styles.optionCard,
                  borderColor: selectedOption === option.id ? 'var(--accent)' : 'var(--border)',
                  backgroundColor: selectedOption === option.id ? 'var(--accent-soft)' : 'var(--bg-elevated)'
                }}
                onClick={() => handleSelect(option.id)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileTap={{ scale: 0.98 }}
              >
                <span style={styles.optionIcon}>{option.icon}</span>
                <span style={styles.optionLabel}>{option.label}</span>
                {option.subtext && (
                  <span style={styles.optionSubtext}>{option.subtext}</span>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Continue button (for manual navigation if needed) */}
      <div style={styles.bottomArea}>
        <motion.button
          style={styles.continueButton}
          whileTap={{ scale: 0.98 }}
          disabled={!selectedOption}
        >
          Continue
          <span style={styles.arrowIcon}>→</span>
        </motion.button>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: 'var(--bg-base)',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 20px'
  },
  progressContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '48px'
  },
  progressTrack: {
    display: 'flex',
    gap: '4px',
    flex: 1
  },
  progressSegment: {
    height: '3px',
    flex: 1,
    borderRadius: '2px',
    transition: 'background-color 0.3s ease'
  },
  stepIndicator: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '10px',
    letterSpacing: '0.08em',
    color: 'var(--text-muted)',
    marginLeft: '16px'
  },
  skipButton: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '13px',
    color: 'var(--text-muted)',
    background: 'none',
    border: 'none',
    marginLeft: '16px',
    cursor: 'pointer'
  },
  questionContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: '420px',
    margin: '0 auto',
    width: '100%'
  },
  questionText: {
    fontFamily: "'Fraunces', serif",
    fontSize: '24px',
    fontWeight: '500',
    color: 'var(--text-primary)',
    textAlign: 'center',
    marginBottom: '12px',
    lineHeight: '1.3'
  },
  subtext: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    color: 'var(--text-secondary)',
    textAlign: 'center',
    marginBottom: '40px',
    lineHeight: '1.5'
  },
  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    width: '100%'
  },
  optionCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
    borderRadius: '12px',
    border: '1px solid',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minHeight: '100px'
  },
  optionIcon: {
    fontSize: '24px',
    marginBottom: '8px'
  },
  optionLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--text-primary)',
    textAlign: 'center'
  },
  optionSubtext: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '11px',
    color: 'var(--text-muted)',
    marginTop: '4px'
  },
  bottomArea: {
    padding: '24px 0',
    marginTop: 'auto'
  },
  continueButton: {
    width: '100%',
    padding: '16px 24px',
    backgroundColor: 'var(--accent)',
    color: '#fff',
    borderRadius: '12px',
    fontFamily: "'Inter', sans-serif",
    fontSize: '15px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'pointer',
    border: 'none',
    opacity: 0.5
  },
  arrowIcon: {
    fontSize: '16px'
  }
}
