import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { questions, totalQuestions } from '../data/questions'
import { scoreQuiz } from '../lib/scoring'

export default function QuizFlow({ userId, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState([])
  const [direction, setDirection] = useState(1) // 1 = forward, -1 = back
  const [pendingSelect, setPendingSelect] = useState(null) // for auto-advance delay

  const question = questions[currentIndex]
  const progress = (currentIndex / totalQuestions) * 100
  const currentAnswer = answers.find((a) => a.questionId === question.id)

  // Auto-advance single_select after 300ms
  useEffect(() => {
    if (pendingSelect === null) return
    const timer = setTimeout(() => {
      setPendingSelect(null)
      advance()
    }, 300)
    return () => clearTimeout(timer)
  }, [pendingSelect])

  function recordAnswer(payload) {
    setAnswers((prev) => {
      const existing = prev.findIndex((a) => a.questionId === payload.questionId)
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = payload
        return updated
      }
      return [...prev, payload]
    })
  }

  function handleSelect(option) {
    recordAnswer({
      questionId: question.id,
      answerId: option.id,
      value: option.value ?? option.social_jetlag ?? option.id,
      social_jetlag: option.social_jetlag,
    })
    if (question.format === 'single_select') {
      setPendingSelect(option.id)
    }
  }

  function handleSlider(val) {
    recordAnswer({
      questionId: question.id,
      answerId: 'slider',
      value: Number(val),
    })
  }

  function handleScale(val) {
    recordAnswer({
      questionId: question.id,
      answerId: String(val),
      value: Number(val),
    })
  }

  function advance() {
    if (currentIndex < totalQuestions - 1) {
      setDirection(1)
      setCurrentIndex((i) => i + 1)
    } else {
      finish()
    }
  }

  function goBack() {
    if (currentIndex > 0) {
      setDirection(-1)
      setCurrentIndex((i) => i - 1)
    }
  }

  function finish() {
    const scored = scoreQuiz(answers)
    onComplete(scored, answers)
  }

  const canProceed = !!currentAnswer
  const isLast = currentIndex === totalQuestions - 1

  const variants = {
    enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  }

  return (
    <div style={styles.container}>
      {/* Progress bar */}
      <div style={styles.progressTrack}>
        <motion.div
          style={styles.progressFill}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      {/* Back button */}
      <div style={styles.topBar}>
        {currentIndex > 0 && (
          <button style={styles.backBtn} onClick={goBack}>← Back</button>
        )}
        <span style={styles.counter}>{currentIndex + 1} / {totalQuestions}</span>
      </div>

      {/* Question screen */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={question.id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.28, ease: 'easeInOut' }}
          style={styles.questionPane}
        >
          <span style={styles.sectionLabel}>
            {question.section} · {question.sectionIndex} OF {question.sectionTotal}
          </span>

          <h2 style={styles.questionText}>{question.question}</h2>

          {question.subtext && (
            <p style={styles.subtext}>{question.subtext}</p>
          )}

          {/* Single select */}
          {question.format === 'single_select' && (
            <div style={styles.options}>
              {question.options.map((opt) => {
                const selected = currentAnswer?.answerId === opt.id
                const isPending = pendingSelect === opt.id
                return (
                  <motion.button
                    key={opt.id}
                    style={{
                      ...styles.optionCard,
                      ...(selected || isPending ? styles.optionSelected : {}),
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelect(opt)}
                  >
                    {opt.label}
                  </motion.button>
                )
              })}
            </div>
          )}

          {/* Slider */}
          {question.format === 'slider' && (
            <div style={styles.sliderWrap}>
              <input
                type="range"
                min={question.min}
                max={question.max}
                step={1}
                value={currentAnswer?.value ?? 3}
                onChange={(e) => handleSlider(e.target.value)}
                style={styles.slider}
              />
              <div style={styles.sliderLabels}>
                <span>{question.sliderMin}</span>
                <span>{question.sliderMax}</span>
              </div>
              <div style={styles.sliderValue}>
                {currentAnswer?.value ?? 3}
              </div>
              <button
                style={{ ...styles.nextBtn, marginTop: '32px' }}
                onClick={advance}
              >
                {isLast ? 'See My Profile' : 'Next →'}
              </button>
            </div>
          )}

          {/* Scale 1–5 */}
          {question.format === 'scale_5' && (
            <div style={styles.scaleWrap}>
              <div style={styles.scaleDots}>
                {[1, 2, 3, 4, 5].map((v) => {
                  const selected = currentAnswer?.value === v
                  return (
                    <motion.button
                      key={v}
                      style={{
                        ...styles.scaleDot,
                        ...(selected ? styles.scaleDotSelected : {}),
                      }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleScale(v)}
                    >
                      {v}
                    </motion.button>
                  )
                })}
              </div>
              <div style={styles.scaleLabels}>
                <span>{question.scaleMin}</span>
                <span>{question.scaleMax}</span>
              </div>
              <button
                style={{
                  ...styles.nextBtn,
                  marginTop: '32px',
                  opacity: canProceed ? 1 : 0.4,
                }}
                disabled={!canProceed}
                onClick={advance}
              >
                {isLast ? 'See My Profile' : 'Next →'}
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: 'var(--bg-base)',
    display: 'flex',
    flexDirection: 'column',
    padding: '0',
  },
  progressTrack: {
    width: '100%',
    height: '3px',
    backgroundColor: 'var(--border)',
    flexShrink: 0,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'var(--accent)',
    borderRadius: '2px',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px 0',
    minHeight: '44px',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    fontSize: '15px',
    cursor: 'pointer',
    padding: '4px 0',
  },
  counter: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginLeft: 'auto',
  },
  questionPane: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '32px 24px 48px',
    maxWidth: '480px',
    margin: '0 auto',
    width: '100%',
    boxSizing: 'border-box',
  },
  sectionLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '11px',
    letterSpacing: '0.1em',
    color: 'var(--accent)',
    marginBottom: '20px',
    display: 'block',
  },
  questionText: {
    fontFamily: "'Fraunces', serif",
    fontSize: '28px',
    fontWeight: '500',
    color: 'var(--text-primary)',
    lineHeight: 1.25,
    margin: '0 0 12px 0',
  },
  subtext: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
    margin: '0 0 28px 0',
  },
  options: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '8px',
  },
  optionCard: {
    width: '100%',
    minHeight: '60px',
    padding: '16px 20px',
    backgroundColor: 'var(--bg-elevated)',
    border: '1.5px solid var(--border)',
    borderRadius: '14px',
    color: 'var(--text-primary)',
    fontFamily: "'Inter', sans-serif",
    fontSize: '15px',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    lineHeight: 1.4,
  },
  optionSelected: {
    border: '1.5px solid var(--accent)',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  sliderWrap: {
    marginTop: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  slider: {
    width: '100%',
    accentColor: 'var(--accent)',
    cursor: 'pointer',
    height: '6px',
  },
  sliderLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontFamily: "'Inter', sans-serif",
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginTop: '8px',
  },
  sliderValue: {
    textAlign: 'center',
    fontSize: '32px',
    fontFamily: "'Fraunces', serif",
    color: 'var(--accent)',
    marginTop: '16px',
  },
  scaleWrap: {
    marginTop: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  scaleDots: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
  },
  scaleDot: {
    flex: 1,
    minHeight: '60px',
    border: '1.5px solid var(--border)',
    borderRadius: '14px',
    backgroundColor: 'var(--bg-elevated)',
    color: 'var(--text-primary)',
    fontSize: '20px',
    fontFamily: "'Fraunces', serif",
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  scaleDotSelected: {
    border: '1.5px solid var(--accent)',
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    color: 'var(--accent)',
  },
  scaleLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontFamily: "'Inter', sans-serif",
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginTop: '8px',
  },
  nextBtn: {
    width: '100%',
    padding: '18px',
    backgroundColor: 'var(--accent)',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    fontSize: '17px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 6px 16px rgba(99, 102, 241, 0.25)',
    fontFamily: "'Inter', sans-serif",
  },
}
