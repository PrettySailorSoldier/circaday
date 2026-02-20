import { databases, account, DB, COL, ID_GEN, Query } from './appwrite'

// ============ HELPERS ============

/**
 * Calculates duration in minutes between two HH:MM strings.
 * Handles midnight crossing (e.g., 23:00 to 07:00 = 480 mins).
 */
export function calculateDuration(startTime: string, endTime: string): number {
  const [startH, startM] = startTime.split(':').map(Number)
  const [endH, endM] = endTime.split(':').map(Number)
  
  let startTotal = startH * 60 + startM
  let endTotal = endH * 60 + endM
  
  if (startTotal > endTotal) {
    endTotal += 24 * 60
  }
  
  return endTotal - startTotal
}

/**
 * Formats minutes into "7h 15m" or similar.
 */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

// ============ AUTH HELPERS ============

export async function getCurrentUser() {
  try {
    const user = await account.get()
    return { data: { user: { ...user, id: user.$id } } }
  } catch (error) {
    return { data: { user: null }, error }
  }
}

export async function signOut() {
  try {
    await account.deleteSession('current')
    return { error: null }
  } catch (error) {
    return { error }
  }
}

// ─── Sleep Logs ───────────────────────────────────────────────────────────────

export async function createSleepLog(userId: string, logData: any) {
  try {
    const duration_min = calculateDuration(logData.bedtime, logData.wake_time)
    const data = await databases.createDocument(DB as string, COL.sleepLogs as string, ID_GEN.unique(), {
      user_id: userId,
      ...logData,
      duration_min,
    })
    return { data, error: null }
  } catch (error) {
    console.error('Error creating sleep log:', error)
    return { data: null, error }
  }
}

export async function getSleepLogs(userId, limitDays = 30) {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - limitDays)
  const cutoffStr = cutoff.toISOString().slice(0, 10) // YYYY-MM-DD
  try {
    const response = await databases.listDocuments(DB, COL.sleepLogs, [
      Query.equal('user_id', userId),
      Query.greaterThanEqual('log_date', cutoffStr),
      Query.orderDesc('log_date'),
      Query.limit(100),
    ])
    return { data: response.documents, error: null }
  } catch (error) {
    console.error('Error fetching sleep logs:', error)
    return { data: [], error }
  }
}

export async function updateSleepLog(logId: string, updates: any) {
  try {
    const payload = { ...updates }
    if (updates.bedtime && updates.wake_time) {
      payload.duration_min = calculateDuration(updates.bedtime, updates.wake_time)
    }
    const data = await databases.updateDocument(DB as string, COL.sleepLogs as string, logId, payload)
    return { data, error: null }
  } catch (error) {
    console.error('Error updating sleep log:', error)
    return { data: null, error }
  }
}

// Pure function — no Appwrite calls, safe to use client-side too
export function calculateChronotype(sleepLogs) {
  const freeDays = sleepLogs.filter(l => l.is_free_day)

  if (freeDays.length < 3) {
    return { chronotype: null, confidence: 'insufficient', freeDaysUsed: freeDays.length, msfsc: null }
  }

  const midpoints = freeDays.map(log => {
    const [bedH, bedM] = log.bedtime.split(':').map(Number)
    const [wakeH, wakeM] = log.wake_time.split(':').map(Number)
    const bedDecimal = bedH + bedM / 60
    let wakeDecimal = wakeH + wakeM / 60
    // Handle crossing midnight
    if (bedDecimal > wakeDecimal) wakeDecimal += 24
    return bedDecimal + (wakeDecimal - bedDecimal) / 2
  })

  const msfsc = midpoints.reduce((a, b) => a + b, 0) / midpoints.length
  // Normalise to 0-24
  const normalised = ((msfsc % 24) + 24) % 24

  let chronotype
  if (normalised < 3.5) chronotype = 'lion'
  else if (normalised < 5.0) chronotype = 'bear'
  else if (normalised < 6.5) chronotype = 'wolf'
  else chronotype = 'dolphin'

  const confidence = freeDays.length >= 7 ? 'high' : freeDays.length >= 4 ? 'medium' : 'low'

  return { chronotype, confidence, freeDaysUsed: freeDays.length, msfsc: Math.round(normalised * 100) / 100 }
}
// ============ PROFILES ============

export async function getProfile(userId) {
  try {
    const data = await databases.getDocument(DB, COL.profiles, userId)
    return data
  } catch (error) {
    // Appwrite throws 404 if not found
    if (error.code === 404) return null
    console.error('Error fetching profile:', error)
    return null
  }
}

export async function createProfile(userId, archetypeId, quizAnswers) {
  try {
    // Stores quiz_answers as string if it's an object, to match Supabase styling
    const answersStr = typeof quizAnswers === 'object' ? JSON.stringify(quizAnswers) : quizAnswers

    const data = await databases.createDocument(DB, COL.profiles, userId, {
      archetype_id: archetypeId,
      quiz_answers: answersStr
    })
    return { data, error: null }
  } catch (error) {
    console.error('Error creating profile:', error)
    return { data: null, error }
  }
}

export async function updateProfile(userId, updates) {
  try {
    const data = await databases.updateDocument(DB, COL.profiles, userId, updates)
    return { data, error: null }
  } catch (error) {
    console.error('Error updating profile:', error)
    return { data: null, error }
  }
}

export async function updateProfileDimensions(userId: string, scores: Record<string, unknown>) {
  const fields = [
    'chronotype_score', 'productivity_style', 'procrastination_type',
    'habit_tendency', 'social_jetlag', 'demand_avoidance',
    'initiation_difficulty', 'hyperfocus_tendency', 'sensory_sensitivity',
    'structure_preference', 'archetype_id',
  ]
  const payload: Record<string, unknown> = {}
  for (const key of fields) {
    if (scores[key] !== undefined) payload[key] = scores[key]
  }
  try {
    const data = await databases.updateDocument(DB, COL.profiles, userId, payload)
    return { data, error: null }
  } catch (error) {
    console.error('Error updating profile dimensions:', error)
    return { data: null, error }
  }
}

// ============ DAILY INTENTIONS ============

export async function getTodayIntention(userId) {
  const today = new Date().toISOString().split('T')[0]
  try {
    const response = await databases.listDocuments(DB, COL.intentions, [
      Query.equal('user_id', userId),
      Query.equal('date', today)
    ])
    return response.documents[0] || null
  } catch (error) {
    console.error('Error fetching intention:', error)
    return null
  }
}

export async function saveIntention(userId, framework, content) {
  const today = new Date().toISOString().split('T')[0]
  const contentStr = typeof content === 'object' ? JSON.stringify(content) : content

  try {
    // Check if exists first for upsert behavior
    const existing = await getTodayIntention(userId)
    
    if (existing) {
      const data = await databases.updateDocument(DB, COL.intentions, existing.$id, {
        framework,
        content: contentStr
      })
      return { data, error: null }
    } else {
      const data = await databases.createDocument(DB, COL.intentions, ID_GEN.unique(), {
        user_id: userId,
        date: today,
        framework,
        content: contentStr
      })
      return { data, error: null }
    }
  } catch (error) {
    console.error('Error saving intention:', error)
    return { data: null, error }
  }
}

// ============ HABITS ============

export async function getHabits(userId) {
  try {
    const response = await databases.listDocuments(DB, COL.habits, [
      Query.equal('user_id', userId),
      Query.orderAsc('$createdAt')
    ])
    return response.documents
  } catch (error) {
    console.error('Error fetching habits:', error)
    return []
  }
}

export async function createHabit(userId, name, color) {
  try {
    const data = await databases.createDocument(DB, COL.habits, ID_GEN.unique(), {
      user_id: userId,
      name,
      color
    })
    return { data, error: null }
  } catch (error) {
    console.error('Error creating habit:', error)
    return { data: null, error }
  }
}

export async function deleteHabit(habitId) {
  try {
    await databases.deleteDocument(DB, COL.habits, habitId)
    return { error: null }
  } catch (error) {
    console.error('Error deleting habit:', error)
    return { error }
  }
}

// ============ HABIT LOGS ============

export async function getHabitLogs(userId, days = 35) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  const startDateStr = startDate.toISOString().split('T')[0]

  try {
    const response = await databases.listDocuments(DB, COL.habitLogs, [
      Query.equal('user_id', userId),
      Query.greaterThanEqual('logged_date', startDateStr)
    ])
    return response.documents
  } catch (error) {
    console.error('Error fetching habit logs:', error)
    return []
  }
}

export async function toggleHabitLog(userId, habitId, date) {
  try {
    const response = await databases.listDocuments(DB, COL.habitLogs, [
      Query.equal('habit_id', habitId),
      Query.equal('logged_date', date)
    ])
    const existing = response.documents[0]

    if (existing) {
      await databases.deleteDocument(DB, COL.habitLogs, existing.$id)
      return { deleted: true, error: null }
    } else {
      const data = await databases.createDocument(DB, COL.habitLogs, ID_GEN.unique(), {
        user_id: userId,
        habit_id: habitId,
        logged_date: date
      })
      return { data, deleted: false, error: null }
    }
  } catch (error) {
    console.error('Error toggling habit log:', error)
    return { error }
  }
}

// ============ SYSTEMS ============

export async function getSystems(userId) {
  try {
    const response = await databases.listDocuments(DB, COL.systems, [
      Query.equal('user_id', userId),
      Query.orderAsc('$createdAt')
    ])
    return response.documents
  } catch (error) {
    console.error('Error fetching systems:', error)
    return []
  }
}

export async function createSystem(userId, ruleText, category) {
  try {
    const data = await databases.createDocument(DB, COL.systems, ID_GEN.unique(), {
      user_id: userId,
      rule_text: ruleText,
      category,
      is_active: true
    })
    return { data, error: null }
  } catch (error) {
    console.error('Error creating system:', error)
    return { data: null, error }
  }
}

export async function updateSystemActive(systemId, isActive) {
  try {
    const data = await databases.updateDocument(DB, COL.systems, systemId, {
      is_active: isActive
    })
    return { data, error: null }
  } catch (error) {
    console.error('Error updating system:', error)
    return { data: null, error }
  }
}

export async function deleteSystem(systemId) {
  try {
    await databases.deleteDocument(DB, COL.systems, systemId)
    return { error: null }
  } catch (error) {
    console.error('Error deleting system:', error)
    return { error }
  }
}

// ============ WORK SESSIONS (Mirror feature) ============
// NOTE for Insights Mode (Prompt 2): limitDays defaults to 30.
// Pattern detection may need 60–90 days — override at the call site when building Insights.

export async function createWorkSession(userId, sessionData) {
  try {
    const data = await databases.createDocument(DB, COL.workSessions, ID_GEN.unique(), {
      user_id: userId,
      started_at: sessionData.started_at,
      ended_at: sessionData.ended_at,
      duration_min: sessionData.duration_min,
      task_type: sessionData.task_type,
      environment: sessionData.environment,
      energy_in: sessionData.energy_in,
      quality_out: sessionData.quality_out,
      was_planned: sessionData.was_planned,
      was_interrupted: sessionData.was_interrupted,
      notes: sessionData.notes || null
    })
    return { data, error: null }
  } catch (error) {
    console.error('Error creating work session:', error)
    return { data: null, error }
  }
}

export async function getWorkSessions(userId, limitDays = 30) {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - limitDays)
  const cutoffStr = cutoff.toISOString()

  try {
    const response = await databases.listDocuments(DB, COL.workSessions, [
      Query.equal('user_id', userId),
      Query.greaterThanEqual('started_at', cutoffStr),
      Query.orderDesc('started_at'),
      Query.limit(200)
    ])
    return response.documents
  } catch (error) {
    console.error('Error fetching work sessions:', error)
    return []
  }
}

export async function deleteWorkSession(sessionId) {
  try {
    await databases.deleteDocument(DB, COL.workSessions, sessionId)
    return { error: null }
  } catch (error) {
    console.error('Error deleting work session:', error)
    return { error }
  }
}

