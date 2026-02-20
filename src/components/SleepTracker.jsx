import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { account } from '../lib/appwrite'
import { createSleepLog, getSleepLogs, updateSleepLog, calculateChronotype, formatDuration } from '../lib/db'

// ─── Config ────────────────────────────────────────────────────────────────────

const CALIBRATION_DAYS = 14
const HOURS_24 = Array.from({ length: 24 }, (_, i) => i)
const MINUTES_15 = [0, 15, 30, 45]

const CHRONOTYPE_LABELS = {
  lion:    { label: 'Lion',    emoji: '🦁', description: 'Early riser — you peak in the morning.' },
  bear:    { label: 'Bear',    emoji: '🐻', description: 'Intermediate — you follow the solar cycle.' },
  wolf:    { label: 'Wolf',    emoji: '🐺', description: 'Night owl — you peak late evening.' },
  dolphin: { label: 'Dolphin', emoji: '🐬', description: 'Light sleeper — irregular, often late.' },
}

const EMPTY_FORM = {
  bedtimeH:     23,
  bedtimeM:     0,
  wakeH:        7,
  wakeM:        0,
  usedAlarm:    null,  // null = not chosen yet
  isFreday:    null,
  sleepQuality: 0,
  morningFeel:  0,
  notes:        '',
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function todayStr() {
  return new Date().toISOString().slice(0, 10) // YYYY-MM-DD
}

function pad2(n) {
  return String(n).padStart(2, '0')
}

function formatHM(h, m) {
  const suffix = h < 12 ? 'AM' : 'PM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${pad2(m)} ${suffix}`
}


function qualityColor(q) {
  if (q >= 4) return 'var(--accent)'
  if (q >= 3) return 'rgba(99,102,241,0.5)'
  return 'var(--border)'
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function DotScale({ value, onChange, max = 5 }) {
  return (
    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
      {Array.from({ length: max }, (_, i) => i + 1).map(n => (
        <button
          key={n}
          onClick={() => onChange(n)}
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: value >= n ? 'none' : '2px solid var(--border)',
            backgroundColor: value >= n ? 'var(--accent)' : 'transparent',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: value === n ? '0 0 10px rgba(99,102,241,0.5)' : 'none',
          }}
        />
      ))}
    </div>
  )
}

function PillChoice({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '10px' }}>
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            flex: 1,
            padding: '14px',
            borderRadius: '14px',
            border: value === opt.value ? '2px solid var(--accent)' : '2px solid var(--border)',
            backgroundColor: value === opt.value ? 'rgba(99,102,241,0.12)' : 'var(--bg-elevated)',
            color: value === opt.value ? 'var(--accent)' : 'var(--text-secondary)',
            fontFamily: "'Inter', sans-serif",
            fontSize: '14px',
            fontWeight: value === opt.value ? '600' : '400',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function TimeDropdown({ hour, minute, onHourChange, onMinuteChange }) {
  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <select
        value={hour}
        onChange={e => onHourChange(Number(e.target.value))}
        style={styles.select}
      >
        {HOURS_24.map(h => (
          <option key={h} value={h}>{pad2(h)}:00</option>
        ))}
      </select>
      <span style={styles.colonLabel}>:</span>
      <select
        value={minute}
        onChange={e => onMinuteChange(Number(e.target.value))}
        style={styles.select}
      >
        {MINUTES_15.map(m => (
          <option key={m} value={m}>{pad2(m)}</option>
        ))}
      </select>
      <span style={styles.timeSuffix}>{formatHM(hour, minute).slice(-2)}</span>
    </div>
  )
}

function FormField({ label, sublabel, children }) {
  return (
    <div style={styles.formField}>
      <p style={styles.fieldLabel}>{label}</p>
      {sublabel && <p style={styles.fieldSublabel}>{sublabel}</p>}
      {children}
    </div>
  )
}

function WeekDots({ logs }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toISOString().slice(0, 10)
    const log = logs.find(l => l.log_date === dateStr)
    return { dateStr, log, dayLabel: d.toLocaleDateString('en', { weekday: 'short' }) }
  })

  return (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '16px' }}>
      {days.map(({ dateStr, log, dayLabel }) => (
        <div key={dateStr} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <div style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: log ? qualityColor(log.sleep_quality) : 'var(--border)',
            boxShadow: log && log.sleep_quality >= 4 ? '0 0 8px rgba(99,102,241,0.5)' : 'none',
          }} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '9px', color: 'var(--text-secondary)' }}>
            {dayLabel[0]}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function SleepTracker({ currentArchetypeId, onChronotypeUpdate }) {
  const [userId, setUserId] = useState(null)
  const [logs, setLogs] = useState([])           // last 30 days
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [editingLog, setEditingLog] = useState(null)  // log doc if editing today's entry

  useEffect(() => {
    async function init() {
      try {
        const user = await account.get()
        setUserId(user.$id)
        const { data } = await getSleepLogs(user.$id, 30)
        if (data) setLogs(data)
      } catch (e) {
        console.error('SleepTracker init:', e)
      }
    }
    init()
  }, [])

  const today = todayStr()
  const todayLog = logs.find(l => l.log_date === today) ?? null
  const daysLogged = logs.length
  const calibrationComplete = daysLogged >= CALIBRATION_DAYS

  // Chronotype calculation (only when calibration is complete)
  const chronotypeResult = calibrationComplete ? calculateChronotype(logs) : null

  function startForm(prefill = null) {
    if (prefill) {
      const [bedH, bedM] = prefill.bedtime.split(':').map(Number)
      const [wakeH, wakeM] = prefill.wake_time.split(':').map(Number)
      setFormData({
        bedtimeH: bedH, bedtimeM: bedM,
        wakeH, wakeM,
        usedAlarm: prefill.used_alarm,
        isFreday: prefill.is_free_day,
        sleepQuality: prefill.sleep_quality,
        morningFeel: prefill.morning_feel,
        notes: prefill.notes ?? '',
      })
      setEditingLog(prefill)
    } else {
      setFormData(EMPTY_FORM)
      setEditingLog(null)
    }
    setShowForm(true)
  }

  async function handleSave() {
    const isValid = formData.usedAlarm !== null &&
      formData.isFreday !== null &&
      formData.sleepQuality > 0 &&
      formData.morningFeel > 0

    if (!isValid || !userId) return

    setSaving(true)
    const payload = {
      log_date:      today,
      bedtime:       `${pad2(formData.bedtimeH)}:${pad2(formData.bedtimeM)}`,
      wake_time:     `${pad2(formData.wakeH)}:${pad2(formData.wakeM)}`,
      used_alarm:    formData.usedAlarm,
      is_free_day:   formData.isFreday,
      sleep_quality: formData.sleepQuality,
      morning_feel:  formData.morningFeel,
      notes:         formData.notes.trim() || null,
    }

    let result
    if (editingLog) {
      result = await updateSleepLog(editingLog.$id, payload)
    } else {
      result = await createSleepLog(userId, payload)
    }

    if (!result.error) {
      const { data: refreshed } = await getSleepLogs(userId, 30)
      if (refreshed) setLogs(refreshed)

      // Check if calibration just completed and trigger callback
      if (!calibrationComplete && refreshed && refreshed.length >= CALIBRATION_DAYS) {
        const ct = calculateChronotype(refreshed)
        if (ct.chronotype && onChronotypeUpdate) {
          onChronotypeUpdate(ct.chronotype)
        }
      }
    } else {
      console.error('Failed to save sleep log:', result.error)
    }

    setShowForm(false)
    setSaving(false)
  }

  const isFormValid = formData.usedAlarm !== null &&
    formData.isFreday !== null &&
    formData.sleepQuality > 0 &&
    formData.morningFeel > 0

  // ── STATE 4: Calibration complete ────────────────────────────────────────────
  if (calibrationComplete && chronotypeResult?.chronotype) {
    const ct = CHRONOTYPE_LABELS[chronotypeResult.chronotype]
    const changed = currentArchetypeId && currentArchetypeId !== chronotypeResult.chronotype

    return (
      <div style={styles.section}>
        <p style={styles.sectionHeader}>Sleep Calibration</p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.calibrationCard}
        >
          <span style={{ fontSize: '40px', display: 'block', marginBottom: '12px' }}>{ct.emoji}</span>
          <p style={styles.calibrationTitle}>
            Your sleep pattern is clearer now.
          </p>
          {changed ? (
            <p style={styles.calibrationBody}>
              Your logged sleep suggests you might be more <strong>{ct.label}</strong> than expected.
              {chronotypeResult.confidence === 'high' ? ' Your profile has been updated.' : ' Keep logging to increase confidence.'}
            </p>
          ) : (
            <p style={styles.calibrationBody}>
              Your sleep data confirms your <strong>{ct.label}</strong> chronotype. {ct.description}
            </p>
          )}
          <p style={styles.calibrationMeta}>
            {chronotypeResult.freeDaysUsed} free days · confidence: {chronotypeResult.confidence}
          </p>
          <button
            onClick={() => startForm()}
            style={styles.keepTrackingBtn}
          >
            Keep tracking
          </button>
        </motion.div>
      </div>
    )
  }

  // ── STATE 3: Logged today ─────────────────────────────────────────────────────
  if (todayLog && !showForm) {
    const duration = todayLog.duration_min 
      ? formatDuration(todayLog.duration_min)
      : '—'

    return (
      <div style={styles.section}>
        <div style={styles.sectionHeaderRow}>
          <p style={styles.sectionHeader}>Sleep Calibration</p>
          <p style={styles.dayCount}>Day {Math.min(daysLogged, CALIBRATION_DAYS)} of {CALIBRATION_DAYS}</p>
        </div>

        {/* Progress bar */}
        <div style={styles.progressBar}>
          <div style={{
            ...styles.progressFill,
            width: `${Math.min(100, (daysLogged / CALIBRATION_DAYS) * 100)}%`,
          }} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.todayCard}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={styles.todayCardTitle}>Last night</p>
              <p style={styles.todayCardTimes}>
                {formatHM(...todayLog.bedtime.split(':').map(Number))} → {formatHM(...todayLog.wake_time.split(':').map(Number))}
              </p>
              <p style={styles.todayCardDuration}>{duration}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', gap: '3px' }}>
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} style={{
                    width: 7, height: 7, borderRadius: '50%',
                    backgroundColor: i < todayLog.sleep_quality ? 'var(--accent)' : 'var(--border)',
                  }} />
                ))}
              </div>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', color: 'var(--text-secondary)' }}>quality</span>
            </div>
          </div>
          <button onClick={() => startForm(todayLog)} style={styles.editLink}>Edit</button>
        </motion.div>

        <WeekDots logs={logs} />
      </div>
    )
  }

  // ── STATE 1 + 2: No log today / form ─────────────────────────────────────────
  return (
    <div style={styles.section}>
      <div style={styles.sectionHeaderRow}>
        <p style={styles.sectionHeader}>Sleep Calibration</p>
        <p style={styles.dayCount}>Day {Math.min(daysLogged, CALIBRATION_DAYS)} of {CALIBRATION_DAYS}</p>
      </div>

      {/* Progress bar */}
      <div style={styles.progressBar}>
        <div style={{
          ...styles.progressFill,
          width: `${Math.min(100, (daysLogged / CALIBRATION_DAYS) * 100)}%`,
        }} />
      </div>

      {!showForm ? (
        /* STATE 1 — prompt card */
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.promptCard}
        >
          <p style={styles.promptTitle}>Log last night's sleep</p>
          <p style={styles.promptSub}>Takes about 30 seconds.</p>
          <button
            onClick={() => startForm()}
            style={styles.logBtn}
          >
            Log Sleep
          </button>
        </motion.div>
      ) : (
        /* STATE 2 — form */
        <AnimatePresence>
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={styles.form}
          >
            <FormField label="What time did you go to bed?">
              <TimeDropdown
                hour={formData.bedtimeH}
                minute={formData.bedtimeM}
                onHourChange={v => setFormData(f => ({ ...f, bedtimeH: v }))}
                onMinuteChange={v => setFormData(f => ({ ...f, bedtimeM: v }))}
              />
            </FormField>

            <FormField label="What time did you wake up?">
              <TimeDropdown
                hour={formData.wakeH}
                minute={formData.wakeM}
                onHourChange={v => setFormData(f => ({ ...f, wakeH: v }))}
                onMinuteChange={v => setFormData(f => ({ ...f, wakeM: v }))}
              />
              <p style={styles.durationHint}>
                {formatDuration((() => {
                  const b = formData.bedtimeH * 60 + formData.bedtimeM
                  const w = formData.wakeH * 60 + formData.wakeM
                  return (w < b ? w + 1440 : w) - b
                })())} of sleep
              </p>
            </FormField>

            <FormField label="Did you use an alarm?">
              <PillChoice
                options={[{ label: 'Yes', value: true }, { label: 'No', value: false }]}
                value={formData.usedAlarm}
                onChange={v => setFormData(f => ({ ...f, usedAlarm: v }))}
              />
            </FormField>

            <FormField
              label="Was this a free day?"
              sublabel="No obligations, slept as long as you wanted"
            >
              <PillChoice
                options={[{ label: 'Yes', value: true }, { label: 'No', value: false }]}
                value={formData.isFreday}
                onChange={v => setFormData(f => ({ ...f, isFreday: v }))}
              />
            </FormField>

            <FormField label="Sleep quality">
              <DotScale
                value={formData.sleepQuality}
                onChange={v => setFormData(f => ({ ...f, sleepQuality: v }))}
              />
            </FormField>

            <FormField label="How did you feel an hour after waking?">
              <DotScale
                value={formData.morningFeel}
                onChange={v => setFormData(f => ({ ...f, morningFeel: v }))}
              />
            </FormField>

            <FormField label="Anything to note?">
              <input
                type="text"
                maxLength={150}
                placeholder="optional"
                value={formData.notes}
                onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))}
                style={styles.notesInput}
              />
            </FormField>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <motion.button
                style={{
                  ...styles.saveBtn,
                  opacity: isFormValid ? 1 : 0.4,
                }}
                onClick={handleSave}
                disabled={saving || !isFormValid}
                whileTap={{ scale: 0.97 }}
              >
                {saving ? 'Saving…' : 'Log Sleep'}
              </motion.button>
              <button
                onClick={() => setShowForm(false)}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = {
  section: {
    width: '100%',
    padding: '0 0 24px',
    borderTop: '1px solid var(--border)',
    marginTop: '24px',
    paddingTop: '24px',
  },
  sectionHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: '12px',
  },
  sectionHeader: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '11px',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--text-secondary)',
    margin: 0,
    fontWeight: '500',
  },
  dayCount: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '11px',
    color: 'var(--text-secondary)',
    margin: 0,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'var(--border)',
    overflow: 'hidden',
    marginBottom: '20px',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: 'var(--accent)',
    transition: 'width 0.4s ease',
  },
  promptCard: {
    backgroundColor: 'var(--bg-elevated)',
    borderRadius: '16px',
    padding: '24px 20px',
    border: '1px solid var(--border)',
    textAlign: 'center',
  },
  promptTitle: {
    fontFamily: "'Fraunces', serif",
    fontSize: '20px',
    color: 'var(--text-primary)',
    margin: '0 0 6px 0',
    fontWeight: '400',
  },
  promptSub: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '13px',
    color: 'var(--text-secondary)',
    margin: '0 0 20px 0',
  },
  logBtn: {
    backgroundColor: 'var(--accent)',
    color: 'white',
    border: 'none',
    borderRadius: '999px',
    padding: '12px 32px',
    fontFamily: "'Inter', sans-serif",
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    boxShadow: '0 0 16px rgba(99,102,241,0.25)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
  },
  formField: {
    marginBottom: '24px',
  },
  fieldLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '15px',
    color: 'var(--text-primary)',
    margin: '0 0 6px 0',
    fontWeight: '500',
  },
  fieldSublabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '12px',
    color: 'var(--text-secondary)',
    margin: '0 0 10px 0',
  },
  select: {
    backgroundColor: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '10px 14px',
    fontFamily: "'Inter', sans-serif",
    fontSize: '15px',
    color: 'var(--text-primary)',
    outline: 'none',
    cursor: 'pointer',
    appearance: 'none',
    minWidth: '80px',
  },
  colonLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '18px',
    color: 'var(--text-secondary)',
  },
  timeSuffix: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginLeft: '4px',
  },
  durationHint: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '12px',
    color: 'var(--accent)',
    margin: '8px 0 0 0',
    opacity: 0.8,
  },
  notesInput: {
    width: '100%',
    backgroundColor: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '12px 14px',
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    color: 'var(--text-primary)',
    outline: 'none',
    boxSizing: 'border-box',
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
  cancelBtn: {
    backgroundColor: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    padding: '14px',
    fontFamily: "'Inter', sans-serif",
    fontSize: '15px',
    cursor: 'pointer',
  },
  // Logged today card
  todayCard: {
    backgroundColor: 'var(--bg-elevated)',
    borderRadius: '16px',
    padding: '18px 20px',
    border: '1px solid var(--border)',
    position: 'relative',
  },
  todayCardTitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '11px',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--text-secondary)',
    margin: '0 0 4px 0',
  },
  todayCardTimes: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '16px',
    color: 'var(--text-primary)',
    margin: '0 0 2px 0',
    fontWeight: '500',
  },
  todayCardDuration: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '13px',
    color: 'var(--text-secondary)',
    margin: 0,
  },
  editLink: {
    position: 'absolute',
    bottom: '14px',
    right: '16px',
    background: 'none',
    border: 'none',
    color: 'var(--accent)',
    fontFamily: "'Inter', sans-serif",
    fontSize: '13px',
    cursor: 'pointer',
    padding: 0,
    opacity: 0.8,
  },
  // Calibration complete card
  calibrationCard: {
    backgroundColor: 'var(--bg-elevated)',
    borderRadius: '20px',
    padding: '28px 24px',
    border: '1px solid var(--border)',
    borderLeft: '3px solid var(--accent)',
    textAlign: 'center',
  },
  calibrationTitle: {
    fontFamily: "'Fraunces', serif",
    fontSize: '22px',
    color: 'var(--text-primary)',
    margin: '0 0 12px 0',
    fontWeight: '400',
  },
  calibrationBody: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '15px',
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
    margin: '0 0 12px 0',
  },
  calibrationMeta: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '11px',
    color: 'var(--text-secondary)',
    margin: '0 0 20px 0',
    opacity: 0.6,
  },
  keepTrackingBtn: {
    backgroundColor: 'transparent',
    color: 'var(--accent)',
    border: '1px solid var(--accent)',
    borderRadius: '999px',
    padding: '10px 28px',
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    cursor: 'pointer',
  },
}
