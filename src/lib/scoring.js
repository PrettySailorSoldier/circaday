// src/lib/scoring.js
// Scoring engine for the Circaday multi-dimensional assessment.
// Takes raw answers array and returns a full scored profile object.

/**
 * @param {Array<{ questionId: string, answerId: string, value: any }>} answers
 * @returns {Object} scored profile
 */
export function scoreQuiz(answers) {
  const get = (id) => answers.find((a) => a.questionId === id)

  // ─── CHRONOTYPE SCORE (0–100) ──────────────────────────────────────────────
  const c1 = get('chrono_1')?.value ?? 3
  const c2 = get('chrono_2')?.value ?? 3
  const c3 = get('chrono_3')?.value ?? 3
  const c4 = get('chrono_4')?.value ?? 3 // slider: 1-5, higher = more evening

  // Average options 1-5 (higher = more evening), then add c4 as a modifier
  const rawAvg = (c1 + c2 + c3) / 3 // 1–5
  const eveningBias = (rawAvg - 1) / 4  // 0–1
  const difficultyBias = (c4 - 1) / 4   // 0–1 (harder mornings = more evening)
  const chronotype_score = Math.round((eveningBias * 0.7 + difficultyBias * 0.3) * 100)

  // ─── CHRONOTYPE CLASSIFICATION ───────────────────────────────────────────
  let chronotype_key
  if (chronotype_score <= 30)      chronotype_key = 'lion'
  else if (chronotype_score <= 50) chronotype_key = 'bear'
  else if (chronotype_score <= 75) chronotype_key = 'wolf'
  else                             chronotype_key = 'dolphin'

  // ─── SOCIAL JETLAG ───────────────────────────────────────────────────────
  const social_jetlag = get('chrono_5')?.social_jetlag ?? 0

  // ─── PRODUCTIVITY STYLE ───────────────────────────────────────────────────
  // Primary classification from prod_1
  const prod1Val = get('prod_1')?.value
  const productivity_style = prod1Val ?? 'prioritizer'

  // ─── PROCRASTINATION TYPE ─────────────────────────────────────────────────
  let procrastination_type = get('proc_1')?.value ?? 'overwhelmed'

  const proc2 = get('proc_2')?.value ?? 1  // interest scale
  const proc3 = get('proc_3')?.value ?? 1  // perfectionist scale
  const proc4 = get('proc_4')?.value ?? 1  // demand avoidance scale

  // Override rules
  if (proc2 >= 4) procrastination_type = 'interest_blocked'
  // Co-label perfectionist if both proc_1 is perfectionist and proc_3 is high
  if (proc3 >= 4 && procrastination_type !== 'perfectionist') {
    procrastination_type = 'perfectionist'
  }

  // ─── DEMAND AVOIDANCE ─────────────────────────────────────────────────────
  const demand_avoidance = Math.min(proc4 * 2, 10)

  // ─── HABIT TENDENCY ───────────────────────────────────────────────────────
  const habit_tendency = get('habit_1')?.value ?? 'questioner'

  // ─── NEURODIVERGENT SCORES ────────────────────────────────────────────────
  const nd1 = get('nd_1')?.value ?? 1
  const nd2 = get('nd_2')?.value ?? 1
  const nd3 = get('nd_3')?.value ?? 1

  const hyperfocus_tendency = Math.round(((nd1 + nd2) / 2) * 2)  // 0–10
  const sensory_sensitivity  = Math.round(nd3 * 2)                // 0–10

  // ─── INITIATION DIFFICULTY ───────────────────────────────────────────────
  let initiation_difficulty
  const isInitiationType = ['overwhelmed', 'interest_blocked'].includes(procrastination_type)
  if (isInitiationType && proc2 >= 4) {
    initiation_difficulty = Math.min(8 + Math.floor((proc2 + proc4) / 2 - 3), 10)
  } else {
    initiation_difficulty = Math.min(Math.round((proc2 + proc4) / 2 * 2), 10)
  }

  // ─── STRUCTURE PREFERENCE ─────────────────────────────────────────────────
  const prod4Val = get('prod_4')?.value
  let structure_preference
  if (prod4Val === 'structured_high')     structure_preference = 'rigid'
  else if (prod4Val === 'structured_moderate') structure_preference = 'thematic'
  else                                     structure_preference = 'fluid' // fluid / audhd_signal

  // ─── ARCHETYPE MODIFIER MAPPING ──────────────────────────────────────────
  const modifierMap = {
    perfectionist:    'precision',
    thrill_seeker:    'novelty_seeking',
    overwhelmed:      'wandering',
    interest_blocked: 'novelty_seeking',
    anxious:          'deep_diving',
    rebellious:       'wandering',
  }
  const archetype_modifier = modifierMap[procrastination_type] ?? 'deep_diving'

  // ─── ARCHETYPE ID ─────────────────────────────────────────────────────────
  const archetype_id = `${archetype_modifier}_${chronotype_key}`

  // ─── LEGACY COMPATIBILITY ─────────────────────────────────────────────────
  // Build answer format that calculateArchetype() can consume as fallback
  const chronoAnswerId = { lion: 'A', bear: 'B', wolf: 'C', dolphin: 'D' }[chronotype_key]
  const legacyAnswers = [
    { questionId: 'chronotype', answerId: chronoAnswerId },
    { questionId: 'procrastination', answerId: _modifierToLegacyId(archetype_modifier) },
  ]

  return {
    chronotype_score,
    chronotype_key,
    productivity_style,
    procrastination_type,
    habit_tendency,
    social_jetlag,
    demand_avoidance,
    initiation_difficulty,
    hyperfocus_tendency,
    sensory_sensitivity,
    structure_preference,
    archetype_modifier,
    archetype_id,
    _legacyAnswers: legacyAnswers,
  }
}

// Map new modifier names back to old quiz answer IDs for legacy compat
function _modifierToLegacyId(modifier) {
  const map = {
    novelty_seeking: 'A',
    deep_diving:     'B',
    precision:       'C',
    wandering:       'D',
  }
  return map[modifier] ?? 'B'
}
