import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getCurrentUser, getSystems, createSystem, updateSystemActive } from '../lib/db'

const CATEGORIES = [
  { id: 'focus', label: 'Focus', color: '#5b7fa6' },
  { id: 'rest', label: 'Rest', color: '#4a8a6a' },
  { id: 'social', label: 'Social', color: '#8a7a50' },
  { id: 'admin', label: 'Admin', color: '#6a8a8a' },
  { id: 'general', label: 'General', color: '#7a6fa6' }
]

export default function SystemsTab() {
  const [systems, setSystems] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newRuleText, setNewRuleText] = useState('')
  const [newCategory, setNewCategory] = useState('general')
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    loadSystems()
  }, [])

  async function loadSystems() {
    const { data: { user } } = await getCurrentUser()
    if (!user) return

    const systemsData = await getSystems(user.id)
    setSystems(systemsData)
    setLoading(false)
  }

  async function handleAddSystem() {
    if (!newRuleText.trim()) return

    const { data: { user } } = await getCurrentUser()
    if (!user) return

    const { data } = await createSystem(user.id, newRuleText.trim(), newCategory)

    if (data) {
      setSystems([...systems, data])
      setNewRuleText('')
      setNewCategory('general')
      setShowAddForm(false)
    }
  }

  async function handleToggleActive(systemId, currentActive) {
    const { data } = await updateSystemActive(systemId, !currentActive)
    if (data) {
      setSystems(systems.map(s => s.id === systemId ? data : s))
    }
  }

  function getCategoryColor(categoryId) {
    return CATEGORIES.find(c => c.id === categoryId)?.color || '#7a6fa6'
  }

  const filteredSystems = activeFilter === 'all'
    ? systems
    : systems.filter(s => s.category === activeFilter)

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <span style={styles.loadingText}>Loading rules...</span>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <h1 style={styles.title}>My Operating Rules</h1>
          <div style={styles.headerRight}>
            <span style={styles.activeTag}>Active protocols for today</span>
          </div>
        </div>

        {/* Filter pills */}
        <div style={styles.filterRow}>
          <button
            style={{
              ...styles.filterPill,
              backgroundColor: activeFilter === 'all' ? 'var(--accent)' : 'transparent',
              color: activeFilter === 'all' ? '#fff' : 'var(--text-muted)'
            }}
            onClick={() => setActiveFilter('all')}
          >
            Focus Mode
          </button>
          <span style={styles.dateTag}>Oct 24</span>
        </div>
      </div>

      {/* Category sections */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>CIRCADIAN ESSENTIALS</h3>
        <div style={styles.systemsList}>
          {filteredSystems.filter(s => ['focus', 'rest'].includes(s.category)).map(system => (
            <SystemCard
              key={system.id}
              system={system}
              color={getCategoryColor(system.category)}
              onToggle={() => handleToggleActive(system.id, system.is_active)}
            />
          ))}
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>DEEP WORK PROTOCOLS</h3>
        <div style={styles.systemsList}>
          {filteredSystems.filter(s => ['admin', 'social', 'general'].includes(s.category)).map(system => (
            <SystemCard
              key={system.id}
              system={system}
              color={getCategoryColor(system.category)}
              onToggle={() => handleToggleActive(system.id, system.is_active)}
            />
          ))}
        </div>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            style={styles.addForm}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <textarea
              placeholder="Write your operating rule..."
              value={newRuleText}
              onChange={(e) => setNewRuleText(e.target.value)}
              style={styles.ruleInput}
              rows={2}
            />

            <div style={styles.categoryPicker}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  style={{
                    ...styles.categoryOption,
                    backgroundColor: newCategory === cat.id ? cat.color : 'var(--bg-elevated)',
                    color: newCategory === cat.id ? '#fff' : 'var(--text-secondary)'
                  }}
                  onClick={() => setNewCategory(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div style={styles.formActions}>
              <button
                style={styles.cancelButton}
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
              <button
                style={styles.confirmButton}
                onClick={handleAddSystem}
                disabled={!newRuleText.trim()}
              >
                Create Rule
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add button */}
      <motion.button
        style={styles.addButton}
        onClick={() => setShowAddForm(!showAddForm)}
        whileTap={{ scale: 0.98 }}
      >
        <span style={styles.plusIcon}>+</span>
      </motion.button>
    </div>
  )
}

function SystemCard({ system, color, onToggle }) {
  return (
    <motion.div
      style={{
        ...styles.systemCard,
        borderTopColor: `${color}66`
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div style={styles.cardLeft}>
        <div
          style={{
            ...styles.categoryDot,
            backgroundColor: color
          }}
        />
        <span style={{
          ...styles.ruleText,
          opacity: system.is_active ? 1 : 0.5
        }}>
          {system.rule_text}
        </span>
      </div>

      <button
        style={{
          ...styles.toggle,
          backgroundColor: system.is_active ? 'var(--accent)' : 'var(--bg-elevated)'
        }}
        onClick={onToggle}
      >
        <motion.div
          style={styles.toggleKnob}
          animate={{
            x: system.is_active ? 18 : 2
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </motion.div>
  )
}

const styles = {
  container: {
    padding: '24px 20px',
    position: 'relative',
    minHeight: '100%'
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '300px'
  },
  loadingText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    color: 'var(--text-muted)'
  },
  header: {
    marginBottom: '24px'
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px'
  },
  title: {
    fontFamily: "'Fraunces', serif",
    fontSize: '24px',
    fontWeight: '500',
    color: 'var(--text-primary)',
    margin: 0
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center'
  },
  activeTag: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '11px',
    color: 'var(--text-muted)'
  },
  filterRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  filterPill: {
    padding: '8px 14px',
    borderRadius: '20px',
    border: '1px solid var(--border)',
    fontFamily: "'Inter', sans-serif",
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  dateTag: {
    padding: '6px 12px',
    backgroundColor: 'var(--bg-surface)',
    borderRadius: '16px',
    fontFamily: "'Inter', sans-serif",
    fontSize: '11px',
    color: 'var(--text-muted)'
  },
  section: {
    marginBottom: '24px'
  },
  sectionTitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '10px',
    letterSpacing: '0.08em',
    color: 'var(--text-muted)',
    marginBottom: '12px'
  },
  systemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  systemCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    backgroundColor: 'var(--bg-surface)',
    borderRadius: '12px',
    borderTop: '1px solid'
  },
  cardLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1
  },
  categoryDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0
  },
  ruleText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    color: 'var(--text-primary)',
    lineHeight: '1.4'
  },
  toggle: {
    width: '44px',
    height: '26px',
    borderRadius: '13px',
    border: '1px solid var(--border)',
    position: 'relative',
    cursor: 'pointer',
    flexShrink: 0
  },
  toggleKnob: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: '#fff',
    position: 'absolute',
    top: '2px'
  },
  addForm: {
    backgroundColor: 'var(--bg-surface)',
    borderRadius: '14px',
    padding: '16px',
    marginBottom: '16px',
    overflow: 'hidden'
  },
  ruleInput: {
    width: '100%',
    padding: '12px 14px',
    backgroundColor: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    color: 'var(--text-primary)',
    marginBottom: '14px',
    resize: 'none',
    lineHeight: '1.5'
  },
  categoryPicker: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '16px'
  },
  categoryOption: {
    padding: '8px 14px',
    borderRadius: '20px',
    border: 'none',
    fontFamily: "'Inter', sans-serif",
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  formActions: {
    display: 'flex',
    gap: '10px'
  },
  cancelButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    color: 'var(--text-secondary)',
    cursor: 'pointer'
  },
  confirmButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: 'var(--accent)',
    border: 'none',
    borderRadius: '10px',
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    fontWeight: '500',
    color: '#fff',
    cursor: 'pointer'
  },
  addButton: {
    position: 'fixed',
    bottom: '100px',
    right: '20px',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: 'var(--accent)',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(139, 127, 212, 0.3)'
  },
  plusIcon: {
    fontSize: '28px',
    color: '#fff',
    fontWeight: '300'
  }
}
