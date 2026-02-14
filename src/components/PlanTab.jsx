import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase, getTodayIntention, saveIntention } from '../lib/supabase'
import { frameworks, frameworkOrder } from '../data/frameworks'

export default function PlanTab() {
  const [activeFramework, setActiveFramework] = useState('smart')
  const [formData, setFormData] = useState({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const framework = frameworks[activeFramework]

  useEffect(() => {
    loadTodayIntention()
  }, [])

  async function loadTodayIntention() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const intention = await getTodayIntention(user.id)
    if (intention) {
      setActiveFramework(intention.framework)
      setFormData(intention.content || {})
    }
  }

  async function handleSave() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setSaving(true)
    await saveIntention(user.id, activeFramework, formData)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleInputChange(key, value) {
    setFormData(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  function handleFrameworkChange(fw) {
    setActiveFramework(fw)
    // Clear form when switching frameworks
    setFormData({})
    setSaved(false)
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backButton}>←</button>
        <h1 style={styles.title}>Set Intention</h1>
        <button style={styles.closeButton}>×</button>
      </div>

      {/* Day selector pills */}
      <div style={styles.daySelector}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <button
            key={i}
            style={{
              ...styles.dayPill,
              backgroundColor: i === new Date().getDay() ? 'var(--accent)' : 'transparent',
              color: i === new Date().getDay() ? '#fff' : 'var(--text-muted)'
            }}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Section label */}
      <div style={styles.sectionLabel}>SPECIFIC</div>

      {/* Main content card */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>
          Let's make it <span style={styles.accentText}>Specific.</span>
        </h2>
        <p style={styles.cardSubtext}>
          To manifest effectively, clarity is key. What exactly do you wish to achieve in this cycle?
        </p>

        {/* Framework toggle */}
        <div style={styles.frameworkToggle}>
          {frameworkOrder.map(fw => (
            <button
              key={fw}
              style={{
                ...styles.frameworkButton,
                backgroundColor: activeFramework === fw ? 'var(--accent)' : 'transparent',
                color: activeFramework === fw ? '#fff' : 'var(--text-muted)'
              }}
              onClick={() => handleFrameworkChange(fw)}
            >
              {fw.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Form fields */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFramework}
            style={styles.formFields}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel}>THE GOAL</label>
              <input
                type="text"
                placeholder="I intend to..."
                value={formData['goal'] || ''}
                onChange={(e) => handleInputChange('goal', e.target.value)}
                style={styles.textInput}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel}>THE DETAILS</label>
              <textarea
                placeholder="Who, where, and why?"
                value={formData['details'] || ''}
                onChange={(e) => handleInputChange('details', e.target.value)}
                style={styles.textArea}
                rows={3}
              />
            </div>

            {/* Framework-specific fields */}
            {framework.fields.map(field => (
              <div key={field.key} style={styles.frameworkField}>
                <div style={styles.fieldChip}>
                  <span style={styles.chipLetter}>{field.key}</span>
                </div>
                <input
                  type="text"
                  placeholder={field.placeholder}
                  value={formData[field.key] || ''}
                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                  style={styles.fieldInput}
                />
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Tip */}
        <div style={styles.tipBox}>
          <span style={styles.tipIcon}>✦</span>
          <p style={styles.tipText}>
            "A specific goal has a much greater chance of being accomplished than a general goal."
          </p>
        </div>

        {/* Save button */}
        <motion.button
          style={styles.saveButton}
          onClick={handleSave}
          disabled={saving}
          whileTap={{ scale: 0.98 }}
        >
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Intention'}
          <span style={styles.arrowIcon}>→</span>
        </motion.button>
      </div>
    </div>
  )
}

const styles = {
  container: {
    padding: '20px',
    minHeight: '100%'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px'
  },
  backButton: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '20px',
    color: 'var(--text-secondary)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px'
  },
  title: {
    fontFamily: "'Fraunces', serif",
    fontSize: '18px',
    fontWeight: '500',
    color: 'var(--text-primary)'
  },
  closeButton: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '24px',
    color: 'var(--text-secondary)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px'
  },
  daySelector: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '24px'
  },
  dayPill: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: 'none',
    fontFamily: "'Inter', sans-serif",
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  sectionLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '10px',
    letterSpacing: '0.08em',
    color: 'var(--accent)',
    marginBottom: '12px'
  },
  card: {
    backgroundColor: 'var(--bg-surface)',
    borderRadius: '16px',
    padding: '24px 20px'
  },
  cardTitle: {
    fontFamily: "'Fraunces', serif",
    fontSize: '22px',
    fontWeight: '500',
    color: 'var(--text-primary)',
    marginBottom: '8px'
  },
  accentText: {
    color: 'var(--accent)',
    fontStyle: 'italic'
  },
  cardSubtext: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    marginBottom: '24px'
  },
  frameworkToggle: {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
    flexWrap: 'wrap'
  },
  frameworkButton: {
    padding: '8px 16px',
    borderRadius: '20px',
    border: '1px solid var(--border)',
    fontFamily: "'Inter', sans-serif",
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '0.05em',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  formFields: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginBottom: '24px'
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  fieldLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '10px',
    letterSpacing: '0.08em',
    color: 'var(--text-muted)'
  },
  textInput: {
    padding: '14px 16px',
    backgroundColor: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    color: 'var(--text-primary)'
  },
  textArea: {
    padding: '14px 16px',
    backgroundColor: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    color: 'var(--text-primary)',
    resize: 'none',
    lineHeight: '1.5'
  },
  frameworkField: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  fieldChip: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: 'var(--accent-soft)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  chipLetter: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--accent)'
  },
  fieldInput: {
    flex: 1,
    padding: '12px 14px',
    backgroundColor: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    color: 'var(--text-primary)'
  },
  tipBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '14px',
    backgroundColor: 'var(--bg-elevated)',
    borderRadius: '10px',
    marginBottom: '20px'
  },
  tipIcon: {
    color: 'var(--accent)',
    fontSize: '12px',
    marginTop: '2px'
  },
  tipText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '12px',
    color: 'var(--text-secondary)',
    fontStyle: 'italic',
    lineHeight: '1.5',
    margin: 0
  },
  saveButton: {
    width: '100%',
    padding: '16px',
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
    border: 'none'
  },
  arrowIcon: {
    fontSize: '16px'
  }
}
