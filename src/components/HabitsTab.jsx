import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase, getHabits, getHabitLogs, createHabit, toggleHabitLog } from '../lib/supabase'

const HABIT_COLORS = [
  '#5b7fa6', // deepFocus blue
  '#7a6fa6', // shallowWork purple
  '#4a8a6a', // rest green
  '#a6756a', // creative coral
  '#6a8a8a', // admin teal
  '#8a7a50'  // social gold
]

export default function HabitsTab() {
  const [habits, setHabits] = useState([])
  const [logs, setLogs] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newHabitName, setNewHabitName] = useState('')
  const [newHabitColor, setNewHabitColor] = useState(HABIT_COLORS[0])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [habitsData, logsData] = await Promise.all([
      getHabits(user.id),
      getHabitLogs(user.id, 35)
    ])

    setHabits(habitsData)
    setLogs(logsData)
    setLoading(false)
  }

  async function handleAddHabit() {
    if (!newHabitName.trim()) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await createHabit(user.id, newHabitName.trim(), newHabitColor)
    if (data) {
      setHabits([...habits, data])
      setNewHabitName('')
      setNewHabitColor(HABIT_COLORS[0])
      setShowAddForm(false)
    }
  }

  async function handleToggleLog(habitId, date) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, deleted } = await toggleHabitLog(user.id, habitId, date)

    if (deleted) {
      setLogs(logs.filter(l => !(l.habit_id === habitId && l.logged_date === date)))
    } else if (data) {
      setLogs([...logs, data])
    }
  }

  // Generate last 35 days (5 weeks × 7 days)
  function getLast35Days() {
    const days = []
    const today = new Date()

    // Find the most recent Monday to align the grid
    const dayOfWeek = today.getDay()
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1

    for (let i = 34; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      days.push(date.toISOString().split('T')[0])
    }
    return days
  }

  const days = getLast35Days()
  const today = new Date().toISOString().split('T')[0]

  function isLogged(habitId, date) {
    return logs.some(l => l.habit_id === habitId && l.logged_date === date)
  }

  function getLogCount(habitId) {
    return logs.filter(l => l.habit_id === habitId).length
  }

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <span style={styles.loadingText}>Loading rhythms...</span>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Rhythm Tracker</h1>
        <p style={styles.subtitle}>No streaks. Just patterns.</p>
      </div>

      {/* Habits list */}
      <div style={styles.habitsList}>
        {habits.map(habit => (
          <motion.div
            key={habit.id}
            style={styles.habitCard}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div style={styles.habitHeader}>
              <div style={styles.habitInfo}>
                <div
                  style={{
                    ...styles.habitDot,
                    backgroundColor: habit.color
                  }}
                />
                <span style={styles.habitName}>{habit.name}</span>
              </div>
              <span style={styles.habitCount}>
                {getLogCount(habit.id)} of 35 days
              </span>
            </div>

            {/* Dot grid - 7 columns × 5 rows */}
            <div style={styles.dotGrid}>
              {days.map((date, i) => {
                const logged = isLogged(habit.id, date)
                const isToday = date === today

                return (
                  <motion.button
                    key={date}
                    style={{
                      ...styles.dot,
                      backgroundColor: logged ? habit.color : 'var(--border)',
                      opacity: logged ? 1 : 0.3,
                      boxShadow: isToday ? `0 0 0 2px ${habit.color}` : 'none'
                    }}
                    onClick={() => handleToggleLog(habit.id, date)}
                    whileTap={{ scale: 0.8 }}
                  />
                )
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add habit form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            style={styles.addForm}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <input
              type="text"
              placeholder="Habit name..."
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              style={styles.habitInput}
              autoFocus
            />

            <div style={styles.colorPicker}>
              {HABIT_COLORS.map(color => (
                <button
                  key={color}
                  style={{
                    ...styles.colorOption,
                    backgroundColor: color,
                    boxShadow: newHabitColor === color ? '0 0 0 2px var(--text-primary)' : 'none'
                  }}
                  onClick={() => setNewHabitColor(color)}
                />
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
                onClick={handleAddHabit}
                disabled={!newHabitName.trim()}
              >
                Add Rhythm
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
        Add Rhythm
      </motion.button>
    </div>
  )
}

const styles = {
  container: {
    padding: '24px 20px'
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
    marginBottom: '32px'
  },
  title: {
    fontFamily: "'Fraunces', serif",
    fontSize: '24px',
    fontWeight: '500',
    color: 'var(--text-primary)',
    marginBottom: '4px'
  },
  subtitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '13px',
    color: 'var(--text-muted)'
  },
  habitsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginBottom: '24px'
  },
  habitCard: {
    backgroundColor: 'var(--bg-surface)',
    borderRadius: '14px',
    padding: '16px'
  },
  habitHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '14px'
  },
  habitInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  habitDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%'
  },
  habitName: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--text-primary)'
  },
  habitCount: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '11px',
    color: 'var(--text-muted)'
  },
  dotGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '6px'
  },
  dot: {
    width: '100%',
    aspectRatio: '1',
    maxWidth: '32px',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  addForm: {
    backgroundColor: 'var(--bg-surface)',
    borderRadius: '14px',
    padding: '16px',
    marginBottom: '16px',
    overflow: 'hidden'
  },
  habitInput: {
    width: '100%',
    padding: '12px 14px',
    backgroundColor: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    color: 'var(--text-primary)',
    marginBottom: '14px'
  },
  colorPicker: {
    display: 'flex',
    gap: '10px',
    marginBottom: '16px'
  },
  colorOption: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    transition: 'transform 0.15s ease'
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
    width: '100%',
    padding: '14px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px dashed var(--border)',
    borderRadius: '12px',
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'pointer'
  },
  plusIcon: {
    fontSize: '18px',
    color: 'var(--accent)'
  }
}
