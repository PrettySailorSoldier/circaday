// Quiz questions for determining archetype
export const quizQuestions = [
  {
    id: 'chronotype',
    question: 'When do you feel most mentally sharp?',
    subtext: 'Aligning with your peak hours helps us optimize your schedule.',
    options: [
      { id: 'A', label: 'Early Morning', subtext: '6AM - 9AM', icon: '🌅' },
      { id: 'B', label: 'Late Morning', subtext: '9AM - 12PM', icon: '☀️' },
      { id: 'C', label: 'Afternoon', subtext: '12PM - 5PM', icon: '⚡' },
      { id: 'D', label: 'Evening', subtext: '6PM - 10PM', icon: '🌙' }
    ]
  },
  {
    id: 'energy',
    question: 'How does your energy move through the day?',
    subtext: 'Understanding your natural rhythm helps us place tasks wisely.',
    options: [
      { id: 'A', label: 'High early, crashes after lunch', subtext: '', icon: '📉' },
      { id: 'B', label: 'Slow build, peaks mid-afternoon', subtext: '', icon: '📈' },
      { id: 'C', label: 'Steady and consistent', subtext: '', icon: '➡️' },
      { id: 'D', label: 'Unpredictable, comes in waves', subtext: '', icon: '🌊' }
    ]
  },
  {
    id: 'procrastination',
    question: 'When you avoid a task, it\'s usually because...',
    subtext: 'Knowing your friction points helps us work with your brain, not against it.',
    options: [
      { id: 'A', label: 'It feels boring or unstimulating', subtext: '', icon: '😴' },
      { id: 'B', label: 'It feels overwhelming, unsure where to start', subtext: '', icon: '🏔️' },
      { id: 'C', label: 'I\'m worried I\'ll do it wrong', subtext: '', icon: '🎯' },
      { id: 'D', label: 'I genuinely forgot it existed', subtext: '', icon: '💭' }
    ]
  },
  {
    id: 'workStyle',
    question: 'You do your best thinking when...',
    subtext: 'We\'ll structure your deep work around how your mind operates.',
    options: [
      { id: 'A', label: 'You have a long uninterrupted block', subtext: '', icon: '🧱' },
      { id: 'B', label: 'You work in short bursts with breaks', subtext: '', icon: '⏱️' },
      { id: 'C', label: 'You\'re under a bit of time pressure', subtext: '', icon: '🔥' },
      { id: 'D', label: 'You have no fixed structure at all', subtext: '', icon: '🌀' }
    ]
  },
  {
    id: 'recovery',
    question: 'After intense focus, you recharge by...',
    subtext: 'Rest is part of the rhythm. We\'ll protect your recovery time.',
    options: [
      { id: 'A', label: 'Complete quiet and solitude', subtext: '', icon: '🧘' },
      { id: 'B', label: 'Light physical movement', subtext: '', icon: '🚶' },
      { id: 'C', label: 'Creative or low-effort activity', subtext: '', icon: '🎨' },
      { id: 'D', label: 'Social interaction (even brief)', subtext: '', icon: '💬' }
    ]
  }
]

// Arc phase colors
const PHASE_COLORS = {
  deepFocus: '#5b7fa6',
  shallowWork: '#7a6fa6',
  rest: '#4a8a6a',
  creative: '#a6756a',
  admin: '#6a8a8a',
  social: '#8a7a50'
}

// Base type schedules (chronotype-based)
const baseSchedules = {
  // Lion (Early Bird + High early energy)
  lion: [
    { label: 'Rest', startHour: 0, endHour: 5, color: PHASE_COLORS.rest, tip: 'Deep sleep fuels your early surge.' },
    { label: 'Deep Focus', startHour: 5, endHour: 9, color: PHASE_COLORS.deepFocus, tip: 'Your cognitive peak. Tackle your hardest work now.' },
    { label: 'Shallow Work', startHour: 9, endHour: 11, color: PHASE_COLORS.shallowWork, tip: 'Meetings and collaboration work well here.' },
    { label: 'Admin', startHour: 11, endHour: 13, color: PHASE_COLORS.admin, tip: 'Handle logistics before your energy dips.' },
    { label: 'Rest', startHour: 13, endHour: 15, color: PHASE_COLORS.rest, tip: 'Your natural dip. Don\'t fight it—rest or walk.' },
    { label: 'Creative', startHour: 15, endHour: 18, color: PHASE_COLORS.creative, tip: 'Lighter creative work suits your afternoon.' },
    { label: 'Social', startHour: 18, endHour: 20, color: PHASE_COLORS.social, tip: 'Connect with others while you still have energy.' },
    { label: 'Rest', startHour: 20, endHour: 24, color: PHASE_COLORS.rest, tip: 'Early to bed protects tomorrow\'s peak.' }
  ],
  // Bear (Morning Riser + Slow build)
  bear: [
    { label: 'Rest', startHour: 0, endHour: 8, color: PHASE_COLORS.rest, tip: 'Sleep is non-negotiable for bear types.' },
    { label: 'Shallow Work', startHour: 8, endHour: 10, color: PHASE_COLORS.shallowWork, tip: 'Warm up with low-stakes tasks.' },
    { label: 'Deep Focus', startHour: 10, endHour: 14, color: PHASE_COLORS.deepFocus, tip: 'Your cognitive peak. Guard this time.' },
    { label: 'Admin', startHour: 14, endHour: 16, color: PHASE_COLORS.admin, tip: 'Post-peak is perfect for email and logistics.' },
    { label: 'Creative', startHour: 16, endHour: 19, color: PHASE_COLORS.creative, tip: 'Second wind. Great for generative thinking.' },
    { label: 'Social', startHour: 19, endHour: 21, color: PHASE_COLORS.social, tip: 'Evening energy suits connection.' },
    { label: 'Rest', startHour: 21, endHour: 24, color: PHASE_COLORS.rest, tip: 'Wind down. Protect your next day.' }
  ],
  // Wolf (Afternoon Peak + Steady energy)
  wolf: [
    { label: 'Rest', startHour: 0, endHour: 9, color: PHASE_COLORS.rest, tip: 'Wolves need their sleep. Don\'t rush the morning.' },
    { label: 'Admin', startHour: 9, endHour: 11, color: PHASE_COLORS.admin, tip: 'Use slow mornings for routine tasks.' },
    { label: 'Shallow Work', startHour: 11, endHour: 13, color: PHASE_COLORS.shallowWork, tip: 'Build momentum with lighter work.' },
    { label: 'Deep Focus', startHour: 13, endHour: 18, color: PHASE_COLORS.deepFocus, tip: 'Your afternoon peak. This is your time.' },
    { label: 'Creative', startHour: 18, endHour: 21, color: PHASE_COLORS.creative, tip: 'Evening creativity flows naturally for you.' },
    { label: 'Social', startHour: 21, endHour: 23, color: PHASE_COLORS.social, tip: 'Late evening suits wolf social rhythms.' },
    { label: 'Rest', startHour: 23, endHour: 24, color: PHASE_COLORS.rest, tip: 'Begin winding down, even if it feels early.' }
  ],
  // Dolphin (Night Owl + Wave energy)
  dolphin: [
    { label: 'Rest', startHour: 0, endHour: 3, color: PHASE_COLORS.rest, tip: 'Dolphins sleep light. Quality over quantity.' },
    { label: 'Creative', startHour: 3, endHour: 6, color: PHASE_COLORS.creative, tip: 'Early morning waves can spark insight.' },
    { label: 'Rest', startHour: 6, endHour: 10, color: PHASE_COLORS.rest, tip: 'Second sleep window. Take it if you need it.' },
    { label: 'Admin', startHour: 10, endHour: 12, color: PHASE_COLORS.admin, tip: 'Use stable mid-morning for routine tasks.' },
    { label: 'Shallow Work', startHour: 12, endHour: 15, color: PHASE_COLORS.shallowWork, tip: 'Ride the afternoon steadiness.' },
    { label: 'Deep Focus', startHour: 15, endHour: 19, color: PHASE_COLORS.deepFocus, tip: 'Late afternoon focus often surprises you.' },
    { label: 'Social', startHour: 19, endHour: 21, color: PHASE_COLORS.social, tip: 'Evening social energy tends to peak here.' },
    { label: 'Deep Focus', startHour: 21, endHour: 24, color: PHASE_COLORS.deepFocus, tip: 'Night owl second wind. Use it wisely.' }
  ]
}

// All 16 archetypes
export const archetypes = {
  // === LION VARIANTS ===
  novelty_seeking_lion: {
    id: 'novelty_seeking_lion',
    name: 'The Novelty-Seeking Lion',
    tagline: 'First light, fresh fire',
    description: 'You wake ready to conquer, but only if the work excites you. Your early hours are gold—spend them on what genuinely captivates, not what merely needs doing.',
    arcSchedule: baseSchedules.lion
  },
  deep_diving_lion: {
    id: 'deep_diving_lion',
    name: 'The Deep Diving Lion',
    tagline: 'Dawn clarity, depth preferred',
    description: 'Your mornings are remarkably clear, perfect for diving deep into complex problems. Break overwhelming tasks into morning-sized pieces to honor both your strengths.',
    arcSchedule: baseSchedules.lion
  },
  precision_lion: {
    id: 'precision_lion',
    name: 'The Precision Lion',
    tagline: 'Early excellence, high standards',
    description: 'You hold yourself to exacting standards and think clearest at dawn. Use your sharp mornings for work that demands precision—perfection is easier when the world is quiet.',
    arcSchedule: baseSchedules.lion
  },
  wandering_lion: {
    id: 'wandering_lion',
    name: 'The Wandering Lion',
    tagline: 'Bright starts, drifting paths',
    description: 'Your mornings blaze with energy, but tasks slip from memory as the day progresses. Front-load your important work and build gentle reminder systems for later hours.',
    arcSchedule: baseSchedules.lion
  },

  // === BEAR VARIANTS ===
  novelty_seeking_bear: {
    id: 'novelty_seeking_bear',
    name: 'The Novelty-Seeking Bear',
    tagline: 'Slow ignition, seeking spark',
    description: 'You build momentum gradually but need genuine interest to sustain it. Let yourself warm up with intriguing tasks—the boring stuff can wait until you\'re rolling.',
    arcSchedule: baseSchedules.bear
  },
  deep_diving_bear: {
    id: 'deep_diving_bear',
    name: 'The Deep Diving Bear',
    tagline: 'Slow to start, unstoppable once in',
    description: 'Your late morning through early afternoon is remarkably powerful once you\'re warmed up. Protect this window fiercely and use it for work that rewards sustained attention.',
    arcSchedule: baseSchedules.bear
  },
  precision_bear: {
    id: 'precision_bear',
    name: 'The Precision Bear',
    tagline: 'Building toward careful work',
    description: 'Your careful nature pairs well with your steady build. Once your focus peaks mid-day, you produce remarkably precise work. Trust the slow ramp-up—it\'s part of your process.',
    arcSchedule: baseSchedules.bear
  },
  wandering_bear: {
    id: 'wandering_bear',
    name: 'The Wandering Bear',
    tagline: 'Gentle rhythm, gentle reminders',
    description: 'You follow the day\'s natural arc but tasks drift from awareness easily. Use your peak hours for what matters most, and build external cues to catch what slips.',
    arcSchedule: baseSchedules.bear
  },

  // === WOLF VARIANTS ===
  novelty_seeking_wolf: {
    id: 'novelty_seeking_wolf',
    name: 'The Novelty-Seeking Wolf',
    tagline: 'Afternoon fire, craving new',
    description: 'Your afternoons ignite when the work is fresh and interesting. Save your most stimulating challenges for when the sun is high—mundane mornings can hold routine.',
    arcSchedule: baseSchedules.wolf
  },
  deep_diving_wolf: {
    id: 'deep_diving_wolf',
    name: 'The Deep Diving Wolf',
    tagline: 'Patient approach, afternoon depth',
    description: 'You need time to approach big tasks, but your afternoons offer remarkable depth. Use mornings to circle the work, then dive when your focus naturally peaks.',
    arcSchedule: baseSchedules.wolf
  },
  precision_wolf: {
    id: 'precision_wolf',
    name: 'The Precision Wolf',
    tagline: 'Measured pace, high standards',
    description: 'Your exacting nature finds its home in the steady afternoon hours. Don\'t rush morning perfection—wait for your natural clarity window to do your most careful work.',
    arcSchedule: baseSchedules.wolf
  },
  wandering_wolf: {
    id: 'wandering_wolf',
    name: 'The Wandering Wolf',
    tagline: 'Afternoon focus, scattered trails',
    description: 'Your afternoons are strong but surrounded by forgetting. Build morning routines that set up afternoon success, and end-of-day reviews that capture tomorrow\'s tasks.',
    arcSchedule: baseSchedules.wolf
  },

  // === DOLPHIN VARIANTS ===
  novelty_seeking_dolphin: {
    id: 'novelty_seeking_dolphin',
    name: 'The Novelty-Seeking Dolphin',
    tagline: 'Riding waves, chasing shine',
    description: 'Your energy moves in unpredictable surges that respond to novelty. When a wave hits, surf it toward something that matters. Build a life that offers many entry points.',
    arcSchedule: baseSchedules.dolphin
  },
  deep_diving_dolphin: {
    id: 'deep_diving_dolphin',
    name: 'The Deep Diving Dolphin',
    tagline: 'Irregular tides, profound depths',
    description: 'Your focus comes in powerful but unpredictable waves. When you can dive deep, go all in. When the tide is out, rest without guilt—another wave is coming.',
    arcSchedule: baseSchedules.dolphin
  },
  precision_dolphin: {
    id: 'precision_dolphin',
    name: 'The Precision Dolphin',
    tagline: 'Waves of exactness',
    description: 'You hold high standards despite irregular rhythms—a challenging combination. Learn to recognize when precision is possible and when good enough serves better.',
    arcSchedule: baseSchedules.dolphin
  },
  wandering_dolphin: {
    id: 'wandering_dolphin',
    name: 'The Wandering Dolphin',
    tagline: 'Drifting through uncertain waters',
    description: 'Your energy fluctuates and tasks float away easily. This isn\'t failure—it\'s your neurotype. Build abundant external anchors and trust systems over memory.',
    arcSchedule: baseSchedules.dolphin
  }
}

// Determine archetype from quiz answers
export function calculateArchetype(answers) {
  // answers is an array of { questionId, answerId }
  const chronotype = answers.find(a => a.questionId === 'chronotype')?.answerId
  const energy = answers.find(a => a.questionId === 'energy')?.answerId
  const procrastination = answers.find(a => a.questionId === 'procrastination')?.answerId

  // Determine base type from chronotype + energy
  let baseType
  if (chronotype === 'A' && energy === 'A') baseType = 'lion'
  else if (chronotype === 'B' && energy === 'B') baseType = 'bear'
  else if (chronotype === 'C' && energy === 'C') baseType = 'wolf'
  else if (chronotype === 'D' && energy === 'D') baseType = 'dolphin'
  // Fallback mappings for mixed combinations
  else if (chronotype === 'A') baseType = 'lion'
  else if (chronotype === 'B') baseType = 'bear'
  else if (chronotype === 'C') baseType = 'wolf'
  else baseType = 'dolphin'

  // Determine modifier from procrastination style
  let modifier
  switch (procrastination) {
    case 'A': modifier = 'novelty_seeking'; break
    case 'B': modifier = 'deep_diving'; break
    case 'C': modifier = 'precision'; break
    case 'D': modifier = 'wandering'; break
    default: modifier = 'deep_diving'
  }

  const archetypeId = `${modifier}_${baseType}`
  return archetypes[archetypeId]
}

export default archetypes
