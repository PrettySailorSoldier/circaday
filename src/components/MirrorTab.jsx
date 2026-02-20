import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { account } from '../lib/appwrite'
import { createWorkSession, getWorkSessions, deleteWorkSession } from '../lib/db'

// ─── Config ────────────────────────────────────────────────────────────────────

const TASK_TYPES = [
  { id: 'creative',    label: 'Creative',    icon: '🎨' },
  { id: 'analytical',  label: 'Analytical',  icon: '🔍' },
  { id: 'admin',       label: 'Admin',        icon: '📋' },
  { id: 'learning',    label: 'Learning',    icon: '📚' },
  { id: 'maintenance', label: 'Maintenance', icon: '🔧' },
]

const ENVIRONMENTS = [
  { id: 'silent',        label: 'Silent',   icon: '🔇' },
  { id: 'ambient_music', label: 'Music',    icon: '🎵' },
  { id: 'content_audio', label: 'Content',  icon: '🎙️' },
  { id: 'noisy',         label: 'Noisy',    icon: '🔊' },
  { id: 'variable',      label: 'Variable', icon: '🔀' },
]

const EMPTY_FORM = {
  taskType: '',
  environment: '',
  energyIn: 0,
  qualityOut: 0,
  wasPlanned: true,
  wasInterrupted: false,
  notes: '',
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatElapsed(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return [h, m, s].map(n => String(n).padStart(2, '0')).join(':')
}

function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDuration(minutes) {
  if (minutes < 1) return 'less than a minute'
  if (minutes === 1) return '1 minute'
  return `${minutes} minutes`
}

function isToday(isoString) {
  const d = new Date(isoString)
  const now = new Date()
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}

function getTaskIcon(taskType) {
  return TASK_TYPES.find(t => t.id === taskType)?.icon ?? '◉'
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function DotScale({ value, onChange, max = 5 }) {
  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      {Array.from({ length: max }, (_, i) => i + 1).map(n => (
        <button
          key={n}
          onClick={() => onChange(n)}
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: value >= n ? 'none' : '2px solid var(--border)',
            backgroundColor: value >= n ? 'var(--accent)' : 'transparent',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: value === n ? '0 0 8px rgba(99,102,241,0.5)' : 'none',
          }}
        />
      ))}
    </div>
  )
}

function IconGrid({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
      {options.map(opt => {
        const isSelected = value === opt.id
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              padding: '12px 10px',
              borderRadius: '14px',
              border: isSelected ? '2px solid var(--accent)' : '2px solid var(--border)',
              backgroundColor: isSelected ? 'rgba(99,102,241,0.12)' : 'var(--bg-elevated)',
              cursor: 'pointer',
              minWidth: '60px',
              flex: '1 1 60px',
              transition: 'all 0.15s ease',
            }}
          >
            <span style={{ fontSize: '22px', lineHeight: 1 }}>{opt.icon}</span>
            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '10px',
              color: isSelected ? 'var(--accent)' : 'var(--text-secondary)',
              fontWeight: isSelected ? '600' : '400',
              textAlign: 'center',
            }}>{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}

function SmallToggle({ label, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: '13px',
        color: 'var(--text-secondary)',
      }}>{label}</span>
      <button
        onClick={() => onChange(!value)}
        style={{
          width: 44,
          height: 24,
          borderRadius: '12px',
          border: 'none',
          backgroundColor: value ? 'var(--accent)' : 'var(--border)',
          cursor: 'pointer',
          position: 'relative',
          transition: 'background-color 0.2s ease',
          flexShrink: 0,
        }}
      >
        <div style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          backgroundColor: 'white',
          position: 'absolute',
          top: '3px',
          left: value ? '23px' : '3px',
          transition: 'left 0.2s ease',
        }} />
      </button>
    </div>
  )
}

function SessionCard({ session, onDelete }) {
  const icon = getTaskIcon(session.task_type)
  const timeRange = `${formatTime(session.started_at)} – ${formatTime(session.ended_at)}`

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      style={styles.sessionCard}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
        <span style={{ fontSize: '24px', flexShrink: 0 }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <div style={styles.sessionCardTime}>{timeRange}</div>
          <div style={styles.sessionCardDuration}>{formatDuration(session.duration_min)}</div>
        </div>
        {/* Energy / Quality dots */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: '3px' }}>
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} style={{
                width: 6, height: 6, borderRadius: '50%',
                backgroundColor: i < session.energy_in ? '#a78bfa' : 'var(--border)',
              }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: '3px' }}>
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} style={{
                width: 6, height: 6, borderRadius: '50%',
                backgroundColor: i < session.quality_out ? '#34d399' : 'var(--border)',
              }} />
            ))}
          </div>
        </div>
      </div>
      <button
        onClick={() => onDelete(session.$id)}
        style={styles.deleteBtn}
        aria-label="Delete session"
      >✕</button>
    </motion.div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function MirrorTab() {
  const [userId, setUserId] = useState(null)
  const [sessions, setSessions] = useState([])
  const [activeSession, setActiveSession] = useState(null) // { startTime: Date }
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [showLogForm, setShowLogForm] = useState(false)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const intervalRef = useRef(null)

  // Load user + today's sessions on mount
  useEffect(() => {
    async function init() {
      try {
        const user = await account.get()
        setUserId(user.$id)
        const data = await getWorkSessions(user.$id, 30)
        setSessions(data)
      } catch (e) {
        console.error('MirrorTab init error:', e)
      }
    }
    init()
  }, [])

  // Timer while session is active
  useEffect(() => {
    if (activeSession) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - activeSession.startTime.getTime()) / 1000))
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
      setElapsedSeconds(0)
    }
    return () => clearInterval(intervalRef.current)
  }, [activeSession])

  function handleStart() {
    setActiveSession({ startTime: new Date() })
  }

  function handleStop() {
    setShowLogForm(true)
  }

  function handleDiscard() {
    setActiveSession(null)
    setShowLogForm(false)
    setFormData(EMPTY_FORM)
  }

  async function handleSave() {
    if (!userId || !activeSession) return
    if (!formData.taskType || !formData.environment || !formData.energyIn || !formData.qualityOut) return

    setSaving(true)
    const endedAt = new Date()
    const durationMin = Math.round((endedAt.getTime() - activeSession.startTime.getTime()) / 60000)

    const payload = {
      started_at: activeSession.startTime.toISOString(),
      ended_at: endedAt.toISOString(),
      duration_min: Math.max(0, durationMin),
      task_type: formData.taskType,
      environment: formData.environment,
      energy_in: formData.energyIn,
      quality_out: formData.qualityOut,
      was_planned: formData.wasPlanned,
      was_interrupted: formData.wasInterrupted,
      notes: formData.notes.trim() || null,
    }

    const { error } = await createWorkSession(userId, payload)
    if (!error) {
      // Refresh session list
      const updated = await getWorkSessions(userId, 30)
      setSessions(updated)
    } else {
      console.error('Failed to save session:', error)
    }

    setActiveSession(null)
    setShowLogForm(false)
    setFormData(EMPTY_FORM)
    setSaving(false)
  }

  async function handleDelete(sessionId) {
    await deleteWorkSession(sessionId)
    setSessions(prev => prev.filter(s => s.$id !== sessionId))
  }

  const todaySessions = sessions.filter(s => isToday(s.started_at))
  const durationMin = activeSession
    ? Math.round((Date.now() - activeSession.startTime.getTime()) / 60000)
    : 0

  // ── STATE 2: ACTIVE SESSION ──────────────────────────────────────────────────
  if (activeSession && !showLogForm) {
    return (
      <div style={styles.container}>
        <div style={styles.timerScreen}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            style={styles.timerBlock}
          >
            <p style={styles.timerStartedAt}>started at {formatTime(activeSession.startTime.toISOString())}</p>
            <div style={styles.timerDisplay}>{formatElapsed(elapsedSeconds)}</div>
          </motion.div>

          <motion.button
            style={styles.stopBtn}
            onClick={handleStop}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            Stop Session
          </motion.button>
        </div>
      </div>
    )
  }

  // ── STATE 1 + 3: IDLE (with optional log form overlay) ──────────────────────
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>The Mirror</h2>
        <p style={styles.subtitle}>Log what you actually did.</p>
      </div>

      {/* Start button */}
      <motion.button
        style={styles.startBtn}
        onClick={handleStart}
        whileTap={{ scale: 0.97 }}
        whileHover={{ boxShadow: '0 0 24px rgba(99,102,241,0.35)' }}
      >
        Start Session
      </motion.button>

      {/* Today's sessions */}
      <div style={styles.sessionList}>
        <p style={styles.sectionLabel}>TODAY</p>
        <AnimatePresence>
          {todaySessions.length === 0 ? (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={styles.emptyState}
            >
              Nothing logged yet today.
            </motion.p>
          ) : (
            todaySessions.map(s => (
              <SessionCard key={s.$id} session={s} onDelete={handleDelete} />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* ── STATE 3: LOG FORM BOTTOM SHEET ── */}
      <AnimatePresence>
        {showLogForm && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={styles.backdrop}
              onClick={handleDiscard}
            />

            {/* Sheet */}
            <motion.div
              key="sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 38 }}
              style={styles.sheet}
            >
              {/* Duration header */}
              <div style={styles.sheetHandle} />
              <p style={styles.durationLabel}>{formatDuration(durationMin)}</p>

              {/* Task type */}
              <div style={styles.formSection}>
                <p style={styles.formSectionLabel}>What were you doing?</p>
                <IconGrid
                  options={TASK_TYPES}
                  value={formData.taskType}
                  onChange={v => setFormData(f => ({ ...f, taskType: v }))}
                />
              </div>

              {/* Environment */}
              <div style={styles.formSection}>
                <p style={styles.formSectionLabel}>Environment?</p>
                <IconGrid
                  options={ENVIRONMENTS}
                  value={formData.environment}
                  onChange={v => setFormData(f => ({ ...f, environment: v }))}
                />
              </div>

              {/* Energy in */}
              <div style={styles.formSection}>
                <p style={styles.formSectionLabel}>How were you going in?</p>
                <DotScale
                  value={formData.energyIn}
                  onChange={v => setFormData(f => ({ ...f, energyIn: v }))}
                />
              </div>

              {/* Quality out */}
              <div style={styles.formSection}>
                <p style={styles.formSectionLabel}>How did it go?</p>
                <DotScale
                  value={formData.qualityOut}
                  onChange={v => setFormData(f => ({ ...f, qualityOut: v }))}
                />
              </div>

              {/* Toggles */}
              <div style={styles.toggleSection}>
                <SmallToggle
                  label="Was this planned?"
                  value={formData.wasPlanned}
                  onChange={v => setFormData(f => ({ ...f, wasPlanned: v }))}
                />
                <SmallToggle
                  label="Were you interrupted?"
                  value={formData.wasInterrupted}
                  onChange={v => setFormData(f => ({ ...f, wasInterrupted: v }))}
                />
              </div>

              {/* Notes */}
              <input
                type="text"
                maxLength={200}
                placeholder="anything worth noting?"
                value={formData.notes}
                onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))}
                style={styles.notesInput}
              />

              {/* Actions */}
              <div style={styles.sheetActions}>
                <motion.button
                  style={{
                    ...styles.saveBtn,
                    opacity: (formData.taskType && formData.environment && formData.energyIn && formData.qualityOut) ? 1 : 0.4,
                  }}
                  onClick={handleSave}
                  disabled={saving || !formData.taskType || !formData.environment || !formData.energyIn || !formData.qualityOut}
                  whileTap={{ scale: 0.97 }}
                >
                  {saving ? 'Saving…' : 'Save Session'}
                </motion.button>
                <motion.button
                  style={styles.discardBtn}
                  onClick={handleDiscard}
                  whileTap={{ scale: 0.97 }}
                >
                  Discard
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = {
  container: {
    padding: '24px 20px 40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '100%',
    position: 'relative',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
    width: '100%',
  },
  title: {
    fontFamily: "'Fraunces', serif",
    fontSize: '26px',
    fontWeight: '500',
    color: 'var(--text-primary)',
    margin: '0 0 6px 0',
  },
  subtitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '13px',
    color: 'var(--text-secondary)',
    margin: 0,
    letterSpacing: '0.01em',
  },
  startBtn: {
    backgroundColor: 'var(--accent)',
    color: 'white',
    border: 'none',
    borderRadius: '999px',
    padding: '18px 48px',
    fontFamily: "'Inter', sans-serif",
    fontSize: '17px',
    fontWeight: '500',
    cursor: 'pointer',
    boxShadow: '0 0 20px rgba(99,102,241,0.25)',
    letterSpacing: '0.01em',
    marginBottom: '40px',
    transition: 'box-shadow 0.2s ease',
  },
  sessionList: {
    width: '100%',
    maxWidth: '480px',
  },
  sectionLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '10px',
    letterSpacing: '0.1em',
    color: 'var(--text-secondary)',
    marginBottom: '12px',
    marginTop: 0,
  },
  emptyState: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    color: 'var(--text-secondary)',
    textAlign: 'center',
    padding: '32px 0',
    margin: 0,
    opacity: 0.6,
  },
  sessionCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'var(--bg-elevated)',
    borderRadius: '14px',
    padding: '14px 16px',
    marginBottom: '10px',
    border: '1px solid var(--border)',
  },
  sessionCardTime: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '13px',
    color: 'var(--text-primary)',
    marginBottom: '3px',
  },
  sessionCardDuration: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '11px',
    color: 'var(--text-secondary)',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '4px 6px',
    opacity: 0.4,
    flexShrink: 0,
  },
  // Active session (timer screen)
  timerScreen: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: 'calc(100vh - 160px)',
    gap: '48px',
  },
  timerBlock: {
    textAlign: 'center',
  },
  timerStartedAt: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '12px',
    color: 'var(--text-secondary)',
    letterSpacing: '0.04em',
    marginBottom: '12px',
  },
  timerDisplay: {
    fontFamily: "'Fraunces', serif",
    fontSize: '64px',
    fontWeight: '300',
    color: 'var(--text-primary)',
    letterSpacing: '-0.02em',
    lineHeight: 1,
  },
  stopBtn: {
    backgroundColor: 'rgba(220,38,38,0.12)',
    color: '#f87171',
    border: '1px solid rgba(220,38,38,0.25)',
    borderRadius: '999px',
    padding: '18px 48px',
    fontFamily: "'Inter', sans-serif",
    fontSize: '17px',
    fontWeight: '500',
    cursor: 'pointer',
    letterSpacing: '0.01em',
  },
  // Bottom sheet
  backdrop: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 40,
  },
  sheet: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'var(--bg-elevated)',
    borderRadius: '24px 24px 0 0',
    padding: '12px 24px 40px',
    zIndex: 50,
    overflowY: 'auto',
    maxHeight: '90vh',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'var(--border)',
    margin: '0 auto 20px',
  },
  durationLabel: {
    fontFamily: "'Fraunces', serif",
    fontSize: '28px',
    fontWeight: '500',
    color: 'var(--text-primary)',
    textAlign: 'center',
    margin: '0 0 28px 0',
  },
  formSection: {
    marginBottom: '24px',
  },
  formSectionLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '12px',
    letterSpacing: '0.06em',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    marginBottom: '12px',
    marginTop: 0,
  },
  toggleSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    marginBottom: '24px',
    padding: '16px',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: '12px',
    border: '1px solid var(--border)',
  },
  notesInput: {
    width: '100%',
    backgroundColor: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '14px 16px',
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    color: 'var(--text-primary)',
    outline: 'none',
    marginBottom: '24px',
    boxSizing: 'border-box',
  },
  sheetActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  saveBtn: {
    backgroundColor: 'var(--accent)',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    padding: '16px',
    fontFamily: "'Inter', sans-serif",
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'opacity 0.15s ease',
  },
  discardBtn: {
    backgroundColor: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    padding: '16px',
    fontFamily: "'Inter', sans-serif",
    fontSize: '16px',
    cursor: 'pointer',
  },
}
