import { useState, useEffect, useRef, useMemo } from 'react'
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

const MIN_SESSIONS = 10          // threshold before showing insights

// ─── Helpers (shared) ─────────────────────────────────────────────────────────

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

function getEnvLabel(envId) {
  return ENVIRONMENTS.find(e => e.id === envId)?.label ?? envId
}

function getEnvIcon(envId) {
  return ENVIRONMENTS.find(e => e.id === envId)?.icon ?? '◉'
}

function avg(arr) {
  if (!arr.length) return 0
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

function median(arr) {
  if (!arr.length) return 0
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

function round1(n) {
  return Math.round(n * 10) / 10
}

// ─── Insight Computation (useMemo-friendly pure functions) ────────────────────

const TIME_BLOCKS = [
  { label: '6–9 AM',   start: 6,  end: 9  },
  { label: '9 AM–12',  start: 9,  end: 12 },
  { label: '12–3 PM',  start: 12, end: 15 },
  { label: '3–6 PM',   start: 15, end: 18 },
  { label: '6–9 PM',   start: 18, end: 21 },
  { label: '9 PM–12',  start: 21, end: 24 },
  { label: '12–3 AM',  start: 0,  end: 3  },
  { label: '3–6 AM',   start: 3,  end: 6  },
]

function getTimeBlock(hour) {
  return TIME_BLOCKS.find(b => {
    if (b.start < b.end) return hour >= b.start && hour < b.end
    return hour >= b.start || hour < b.end
  }) ?? TIME_BLOCKS[0]
}

function computeInsights(sessions) {
  if (sessions.length < 5) return null

  // ── Card 1: Peak Time ──
  const blockMap = {}
  sessions.forEach(s => {
    const hour = new Date(s.started_at).getHours()
    const block = getTimeBlock(hour)
    if (!blockMap[block.label]) blockMap[block.label] = []
    blockMap[block.label].push(s.quality_out)
  })

  const blockAvgs = Object.entries(blockMap)
    .filter(([, qs]) => qs.length >= 2)
    .map(([label, qs]) => ({ label, avg: avg(qs), count: qs.length }))
    .sort((a, b) => b.avg - a.avg)

  const peakBlock = blockAvgs[0] ?? null

  // ── Card 2: Real Focus Duration ──
  const allDurations = sessions.map(s => s.duration_min)
  const highQualDurations = sessions.filter(s => s.quality_out >= 4).map(s => s.duration_min)

  const medianAll = Math.round(median(allDurations))
  const medianHigh = highQualDurations.length >= 3 ? Math.round(median(highQualDurations)) : null

  let durationInsight = null
  if (medianHigh !== null) {
    if (medianHigh > medianAll + 5) durationInsight = 'Your best work happens in longer sessions.'
    else if (medianHigh < medianAll - 5) durationInsight = 'Your best work tends to come in shorter bursts.'
    else durationInsight = 'Session length doesn\'t seem to matter much — both work for you.'
  }

  // ── Card 3: Pressure Test ──
  const planned = sessions.filter(s => s.was_planned)
  const spontaneous = sessions.filter(s => !s.was_planned)

  const plannedAvg = planned.length >= 3 ? round1(avg(planned.map(s => s.quality_out))) : null
  const spontAvg = spontaneous.length >= 3 ? round1(avg(spontaneous.map(s => s.quality_out))) : null

  let pressureInsight = null
  if (plannedAvg !== null && spontAvg !== null) {
    const diff = plannedAvg - spontAvg
    if (diff > 0.3) pressureInsight = 'Your planned sessions actually tend to go better.'
    else if (diff < -0.3) pressureInsight = 'Your spontaneous work sessions rate higher — you may thrive with less structure.'
    else pressureInsight = 'Not much difference — both approaches seem to work for you.'
  }

  // ── Card 4: Energy Correlation ──
  const energyGroups = {
    low:    sessions.filter(s => s.energy_in <= 2),
    medium: sessions.filter(s => s.energy_in === 3),
    high:   sessions.filter(s => s.energy_in >= 4),
  }

  const energyAvgs = {
    low:    energyGroups.low.length    >= 2 ? round1(avg(energyGroups.low.map(s    => s.quality_out))) : null,
    medium: energyGroups.medium.length >= 2 ? round1(avg(energyGroups.medium.map(s => s.quality_out))) : null,
    high:   energyGroups.high.length   >= 2 ? round1(avg(energyGroups.high.map(s   => s.quality_out))) : null,
  }

  const energyValues = Object.values(energyAvgs).filter(v => v !== null)
  let energyInsight = null
  if (energyValues.length >= 2) {
    const max = Math.max(...energyValues)
    const min = Math.min(...(energyValues))
    if (max - min < 0.5) energyInsight = 'Your output quality stays consistent regardless of starting energy.'
    else if (energyAvgs.high !== null && energyAvgs.high === max) energyInsight = 'Higher starting energy correlates with better output for you.'
    else if (energyAvgs.low !== null && energyAvgs.low === max) energyInsight = 'Interestingly, your lower-energy sessions rate just as well — or better.'
    else energyInsight = 'Your output quality varies with energy, but not predictably — worth watching.'
  }

  // ── Card 5: Best Environment ──
  const envMap = {}
  sessions.forEach(s => {
    if (!envMap[s.environment]) envMap[s.environment] = []
    envMap[s.environment].push(s.quality_out)
  })

  const envAvgs = Object.entries(envMap)
    .filter(([, qs]) => qs.length >= 3)
    .map(([id, qs]) => ({ id, avg: round1(avg(qs)), count: qs.length }))
    .sort((a, b) => b.avg - a.avg)

  const bestEnv = envAvgs[0] ?? null
  const hasEnoughEnvData = envAvgs.length >= 2

  return {
    peakBlock,
    blockAvgs,
    medianAll,
    medianHigh,
    durationInsight,
    plannedAvg,
    spontAvg,
    pressureInsight,
    energyAvgs,
    energyInsight,
    bestEnv,
    hasEnoughEnvData,
    envAvgs,
  }
}

// ─── Sub-components (Log Mode) ─────────────────────────────────────────────────

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

// ─── Sub-components (Insights Mode) ───────────────────────────────────────────

function InsightCard({ title, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={styles.insightCard}
    >
      <p style={styles.insightCardTitle}>{title}</p>
      {children}
    </motion.div>
  )
}

function InsightText({ children, muted = false }) {
  return (
    <p style={{
      fontFamily: "'Inter', sans-serif",
      fontSize: muted ? '13px' : '17px',
      color: muted ? 'var(--text-secondary)' : 'var(--text-primary)',
      margin: '0 0 6px 0',
      lineHeight: 1.5,
    }}>{children}</p>
  )
}

function EnergyBar({ label, value, maxValue }) {
  const pct = maxValue > 0 ? (value / 5) * 100 : 0
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: 'var(--text-secondary)' }}>
          {label}
        </span>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: 'var(--text-primary)', fontWeight: '500' }}>
          {value}/5
        </span>
      </div>
      <div style={{ height: 6, borderRadius: 3, backgroundColor: 'var(--border)', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          borderRadius: 3,
          backgroundColor: 'var(--accent)',
          transition: 'width 0.6s ease',
        }} />
      </div>
    </div>
  )
}

// Simple SVG half-circle arc for peak time card
function TimeArc({ blocks, peakLabel }) {
  const W = 260
  const H = 140
  const cx = W / 2
  const cy = H - 10
  const r = 110

  // Place the 8 time blocks along the arc (left to right = earlier to later)
  const arcBlocks = [
    '6–9 AM', '9 AM–12', '12–3 PM', '3–6 PM',
    '6–9 PM', '9 PM–12', '12–3 AM', '3–6 AM',
  ]

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', margin: '8px auto 4px' }}>
      {/* Background arc */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke="var(--border)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Tick marks for each block */}
      {arcBlocks.map((label, i) => {
        const angle = Math.PI - (i / (arcBlocks.length - 1)) * Math.PI
        const x = cx + r * Math.cos(angle)
        const y = cy - r * Math.sin(angle)
        const isPeak = label === peakLabel
        return (
          <g key={label}>
            <circle
              cx={x}
              cy={y}
              r={isPeak ? 9 : 5}
              fill={isPeak ? 'var(--accent)' : 'var(--border)'}
              style={{ filter: isPeak ? 'drop-shadow(0 0 6px rgba(99,102,241,0.6))' : 'none' }}
            />
          </g>
        )
      })}
      {/* Labels at edges */}
      <text x={cx - r - 4} y={cy + 14} fontSize="9" fill="var(--text-secondary)" textAnchor="middle" fontFamily="Inter, sans-serif">6 AM</text>
      <text x={cx + r + 4} y={cy + 14} fontSize="9" fill="var(--text-secondary)" textAnchor="middle" fontFamily="Inter, sans-serif">6 AM</text>
      <text x={cx} y={16} fontSize="9" fill="var(--text-secondary)" textAnchor="middle" fontFamily="Inter, sans-serif">6 PM</text>
    </svg>
  )
}

function InsightsMode({ sessions }) {
  const insights = useMemo(() => computeInsights(sessions), [sessions])

  // Not enough data state
  if (sessions.length < MIN_SESSIONS) {
    const pct = (sessions.length / MIN_SESSIONS) * 100
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={styles.emptyInsights}
      >
        {/* Circular progress */}
        <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto 24px' }}>
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border)" strokeWidth="5" />
            <circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 42}`}
              strokeDashoffset={`${2 * Math.PI * 42 * (1 - pct / 100)}`}
              transform="rotate(-90 50 50)"
              style={{ transition: 'stroke-dashoffset 0.6s ease' }}
            />
          </svg>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: '22px', color: 'var(--text-primary)', lineHeight: 1 }}>
              {sessions.length}
            </span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', color: 'var(--text-secondary)' }}>
              / {MIN_SESSIONS}
            </span>
          </div>
        </div>

        <p style={styles.emptyInsightsTitle}>Almost there.</p>
        <p style={styles.emptyInsightsBody}>
          The Mirror needs a bit more data before patterns emerge. Keep logging sessions and check back.
        </p>
      </motion.div>
    )
  }

  // Patterns available — render insight cards
  return (
    <div style={{ width: '100%', maxWidth: '480px' }}>

      {/* Card 1 — Peak Time */}
      {insights.peakBlock && (
        <InsightCard title="When you're sharpest">
          <TimeArc blocks={insights.blockAvgs} peakLabel={insights.peakBlock.label} />
          <InsightText>
            Your highest-quality work tends to happen in the <strong>{insights.peakBlock.label}</strong> window.
          </InsightText>
          <InsightText muted>
            Average quality: {round1(insights.peakBlock.avg)}/5 across {insights.peakBlock.count} sessions.
          </InsightText>
        </InsightCard>
      )}

      {/* Card 2 — Real Focus Duration */}
      {insights.medianAll > 0 && (
        <InsightCard title="How long you actually focus">
          <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
            <div style={styles.durationStat}>
              <span style={styles.durationStatNumber}>{insights.medianAll}m</span>
              <span style={styles.durationStatLabel}>All sessions</span>
            </div>
            {insights.medianHigh && (
              <div style={styles.durationStat}>
                <span style={styles.durationStatNumber}>{insights.medianHigh}m</span>
                <span style={styles.durationStatLabel}>Best sessions</span>
              </div>
            )}
          </div>
          {insights.durationInsight && (
            <InsightText muted>{insights.durationInsight}</InsightText>
          )}
        </InsightCard>
      )}

      {/* Card 3 — Pressure Test */}
      {(insights.plannedAvg !== null || insights.spontAvg !== null) && (
        <InsightCard title="Do you work better under pressure?">
          <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
            {insights.plannedAvg !== null && (
              <div style={styles.durationStat}>
                <span style={styles.durationStatNumber}>{insights.plannedAvg}/5</span>
                <span style={styles.durationStatLabel}>Planned</span>
              </div>
            )}
            {insights.spontAvg !== null && (
              <div style={styles.durationStat}>
                <span style={styles.durationStatNumber}>{insights.spontAvg}/5</span>
                <span style={styles.durationStatLabel}>Spontaneous</span>
              </div>
            )}
          </div>
          {insights.pressureInsight && (
            <InsightText muted>{insights.pressureInsight}</InsightText>
          )}
          {(insights.plannedAvg === null || insights.spontAvg === null) && (
            <InsightText muted>Log more of both types to see the full picture.</InsightText>
          )}
        </InsightCard>
      )}

      {/* Card 4 — Energy Correlation */}
      {Object.values(insights.energyAvgs).some(v => v !== null) && (
        <InsightCard title="Does starting energy matter?">
          {insights.energyAvgs.low    !== null && <EnergyBar label="Low energy (1–2)"   value={insights.energyAvgs.low}    maxValue={5} />}
          {insights.energyAvgs.medium !== null && <EnergyBar label="Medium energy (3)"  value={insights.energyAvgs.medium} maxValue={5} />}
          {insights.energyAvgs.high   !== null && <EnergyBar label="High energy (4–5)"  value={insights.energyAvgs.high}   maxValue={5} />}
          {insights.energyInsight && (
            <InsightText muted style={{ marginTop: '8px' }}>{insights.energyInsight}</InsightText>
          )}
        </InsightCard>
      )}

      {/* Card 5 — Best Environment */}
      {(insights.bestEnv || insights.envAvgs.length > 0) && (
        <InsightCard title="Where you do your best work">
          {insights.bestEnv && insights.hasEnoughEnvData ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <span style={{ fontSize: '32px' }}>{getEnvIcon(insights.bestEnv.id)}</span>
                <div>
                  <p style={{ ...styles.durationStatNumber, margin: 0, fontSize: '18px' }}>
                    {getEnvLabel(insights.bestEnv.id)}
                  </p>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                    {insights.bestEnv.avg}/5 average quality
                  </p>
                </div>
              </div>
              <InsightText muted>Based on {insights.bestEnv.count} sessions in this environment.</InsightText>
            </>
          ) : (
            <>
              {insights.envAvgs.map(e => (
                <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'var(--text-primary)' }}>
                    {getEnvIcon(e.id)} {getEnvLabel(e.id)}
                  </span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {e.avg}/5 ({e.count} sessions)
                  </span>
                </div>
              ))}
              <InsightText muted>Log more sessions per environment to see a clearer winner.</InsightText>
            </>
          )}
        </InsightCard>
      )}

    </div>
  )
}

// ─── Mode Toggle ───────────────────────────────────────────────────────────────

function ModeToggle({ mode, onChange }) {
  return (
    <div style={styles.modeToggle}>
      {['log', 'insights'].map(m => (
        <button
          key={m}
          onClick={() => onChange(m)}
          style={{
            ...styles.modeToggleBtn,
            backgroundColor: mode === m ? 'var(--accent)' : 'transparent',
            color: mode === m ? 'white' : 'var(--text-secondary)',
            fontWeight: mode === m ? '500' : '400',
          }}
        >
          {m === 'log' ? 'Log' : 'Insights'}
        </button>
      ))}
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function MirrorTab({ initialActiveSession, onClearTrigger }) {
  const [userId, setUserId] = useState(null)
  const [sessions, setSessions] = useState([])
  const [mode, setMode] = useState('log')                 // 'log' | 'insights'
  const [activeSession, setActiveSession] = useState(null) // { startTime: Date }
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [showLogForm, setShowLogForm] = useState(false)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    async function init() {
      try {
        const user = await account.get()
        setUserId(user.$id)
        const data = await getWorkSessions(user.$id, 30)
        setSessions(data)

        // Handle momentum trigger
        if (initialActiveSession && !activeSession) {
          setActiveSession({ startTime: initialActiveSession.startTime })
          setFormData(prev => ({
            ...prev,
            notes: `Momentum win: ${initialActiveSession.goal} (${initialActiveSession.firstStep})`
          }))
          if (onClearTrigger) onClearTrigger()
        }
      } catch (e) {
        console.error('MirrorTab init error:', e)
      }
    }
    init()
  }, [initialActiveSession])

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

  // ── Active session screen — full display regardless of mode ──────────────────
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

  // ── Normal view (Log or Insights) ────────────────────────────────────────────
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>The Mirror</h2>
      </div>

      {/* Mode Toggle */}
      <ModeToggle mode={mode} onChange={setMode} />

      {/* Animated content switch */}
      <AnimatePresence mode="wait">
        {mode === 'log' ? (
          <motion.div
            key="log"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
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
          </motion.div>
        ) : (
          <motion.div
            key="insights"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <InsightsMode sessions={sessions} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Log form bottom sheet — stays above both modes */}
      <AnimatePresence>
        {showLogForm && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={styles.backdrop}
              onClick={handleDiscard}
            />

            <motion.div
              key="sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 38 }}
              style={styles.sheet}
            >
              <div style={styles.sheetHandle} />
              <p style={styles.durationLabel}>{formatDuration(durationMin)}</p>

              <div style={styles.formSection}>
                <p style={styles.formSectionLabel}>What were you doing?</p>
                <IconGrid
                  options={TASK_TYPES}
                  value={formData.taskType}
                  onChange={v => setFormData(f => ({ ...f, taskType: v }))}
                />
              </div>

              <div style={styles.formSection}>
                <p style={styles.formSectionLabel}>Environment?</p>
                <IconGrid
                  options={ENVIRONMENTS}
                  value={formData.environment}
                  onChange={v => setFormData(f => ({ ...f, environment: v }))}
                />
              </div>

              <div style={styles.formSection}>
                <p style={styles.formSectionLabel}>How were you going in?</p>
                <DotScale
                  value={formData.energyIn}
                  onChange={v => setFormData(f => ({ ...f, energyIn: v }))}
                />
              </div>

              <div style={styles.formSection}>
                <p style={styles.formSectionLabel}>How did it go?</p>
                <DotScale
                  value={formData.qualityOut}
                  onChange={v => setFormData(f => ({ ...f, qualityOut: v }))}
                />
              </div>

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

              <input
                type="text"
                maxLength={200}
                placeholder="anything worth noting?"
                value={formData.notes}
                onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))}
                style={styles.notesInput}
              />

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
    marginBottom: '20px',
    width: '100%',
  },
  title: {
    fontFamily: "'Fraunces', serif",
    fontSize: '26px',
    fontWeight: '500',
    color: 'var(--text-primary)',
    margin: 0,
  },
  // Mode toggle
  modeToggle: {
    display: 'flex',
    backgroundColor: 'var(--bg-elevated)',
    borderRadius: '999px',
    padding: '3px',
    marginBottom: '28px',
    border: '1px solid var(--border)',
  },
  modeToggleBtn: {
    borderRadius: '999px',
    border: 'none',
    padding: '8px 24px',
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.18s ease',
    letterSpacing: '0.01em',
  },
  // Log Mode
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
  // Active session / timer
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
  // Insights Mode
  insightCard: {
    backgroundColor: 'var(--bg-elevated)',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '16px',
    borderLeft: '3px solid var(--accent)',
    border: '1px solid var(--border)',
    borderLeftWidth: '3px',
    borderLeftColor: 'var(--accent)',
    width: '100%',
    boxSizing: 'border-box',
  },
  insightCardTitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '11px',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--text-secondary)',
    margin: '0 0 12px 0',
    fontWeight: '500',
  },
  durationStat: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: '10px',
    padding: '12px',
    alignItems: 'center',
  },
  durationStatNumber: {
    fontFamily: "'Fraunces', serif",
    fontSize: '26px',
    fontWeight: '400',
    color: 'var(--text-primary)',
    margin: 0,
  },
  durationStatLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '11px',
    color: 'var(--text-secondary)',
  },
  // Empty insights state
  emptyInsights: {
    textAlign: 'center',
    padding: '24px 0',
    maxWidth: '320px',
  },
  emptyInsightsTitle: {
    fontFamily: "'Fraunces', serif",
    fontSize: '22px',
    color: 'var(--text-primary)',
    margin: '0 0 12px 0',
    fontWeight: '400',
  },
  emptyInsightsBody: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '15px',
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
    margin: 0,
  },
}
