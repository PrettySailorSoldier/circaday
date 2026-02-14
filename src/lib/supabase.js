import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

// ============ AUTH ============

export async function signInWithOtp(email) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin
    }
  })
  return { data, error }
}

export async function verifyOtp(email, token) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email'
  })
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// ============ PROFILES ============

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching profile:', error)
  }
  return data
}

export async function createProfile(userId, archetypeId, quizAnswers) {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      archetype_id: archetypeId,
      quiz_answers: quizAnswers
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating profile:', error)
  }
  return { data, error }
}

export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating profile:', error)
  }
  return { data, error }
}

// ============ DAILY INTENTIONS ============

export async function getTodayIntention(userId) {
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('daily_intentions')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching intention:', error)
  }
  return data
}

export async function saveIntention(userId, framework, content) {
  const today = new Date().toISOString().split('T')[0]

  // Try to upsert (insert or update)
  const { data, error } = await supabase
    .from('daily_intentions')
    .upsert({
      user_id: userId,
      date: today,
      framework,
      content
    }, {
      onConflict: 'user_id,date'
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving intention:', error)
  }
  return { data, error }
}

// ============ HABITS ============

export async function getHabits(userId) {
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching habits:', error)
  }
  return data || []
}

export async function createHabit(userId, name, color) {
  const { data, error } = await supabase
    .from('habits')
    .insert({
      user_id: userId,
      name,
      color
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating habit:', error)
  }
  return { data, error }
}

export async function deleteHabit(habitId) {
  const { error } = await supabase
    .from('habits')
    .delete()
    .eq('id', habitId)

  if (error) {
    console.error('Error deleting habit:', error)
  }
  return { error }
}

// ============ HABIT LOGS ============

export async function getHabitLogs(userId, days = 35) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  const startDateStr = startDate.toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('habit_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('logged_date', startDateStr)

  if (error) {
    console.error('Error fetching habit logs:', error)
  }
  return data || []
}

export async function toggleHabitLog(userId, habitId, date) {
  // Check if log exists
  const { data: existing } = await supabase
    .from('habit_logs')
    .select('id')
    .eq('habit_id', habitId)
    .eq('logged_date', date)
    .single()

  if (existing) {
    // Delete existing log
    const { error } = await supabase
      .from('habit_logs')
      .delete()
      .eq('id', existing.id)
    return { deleted: true, error }
  } else {
    // Create new log
    const { data, error } = await supabase
      .from('habit_logs')
      .insert({
        user_id: userId,
        habit_id: habitId,
        logged_date: date
      })
      .select()
      .single()
    return { data, deleted: false, error }
  }
}

// ============ SYSTEMS ============

export async function getSystems(userId) {
  const { data, error } = await supabase
    .from('systems')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching systems:', error)
  }
  return data || []
}

export async function createSystem(userId, ruleText, category) {
  const { data, error } = await supabase
    .from('systems')
    .insert({
      user_id: userId,
      rule_text: ruleText,
      category
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating system:', error)
  }
  return { data, error }
}

export async function updateSystemActive(systemId, isActive) {
  const { data, error } = await supabase
    .from('systems')
    .update({ is_active: isActive })
    .eq('id', systemId)
    .select()
    .single()

  if (error) {
    console.error('Error updating system:', error)
  }
  return { data, error }
}

export async function deleteSystem(systemId) {
  const { error } = await supabase
    .from('systems')
    .delete()
    .eq('id', systemId)

  if (error) {
    console.error('Error deleting system:', error)
  }
  return { error }
}

export default supabase
