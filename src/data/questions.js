// src/data/questions.js
// All 20 questions for the Circaday multi-dimensional assessment.
// Questions are grouped into 5 sections: Chronotype, Productivity, Procrastination, Habit, Neurodivergent.

export const questions = [
  // ─── SECTION 1: CHRONOTYPE ────────────────────────────────────────────────

  {
    id: 'chrono_1',
    dimension: 'chronotype',
    section: 'CHRONOTYPE',
    sectionIndex: 1,
    sectionTotal: 5,
    question: 'On a completely free day with no obligations, what time would you naturally wake up?',
    subtext: null,
    format: 'single_select',
    options: [
      { id: 'A', label: 'Before 6 AM', value: 1 },
      { id: 'B', label: '6–7:30 AM', value: 2 },
      { id: 'C', label: '7:30–9 AM', value: 3 },
      { id: 'D', label: '9–10:30 AM', value: 4 },
      { id: 'E', label: 'After 10:30 AM', value: 5 },
    ],
  },

  {
    id: 'chrono_2',
    dimension: 'chronotype',
    section: 'CHRONOTYPE',
    sectionIndex: 2,
    sectionTotal: 5,
    question: 'When do you feel most mentally sharp?',
    subtext: null,
    format: 'single_select',
    options: [
      { id: 'A', label: 'Early morning (before 9 AM)', value: 1 },
      { id: 'B', label: 'Late morning (9 AM–noon)', value: 2 },
      { id: 'C', label: 'Afternoon (noon–5 PM)', value: 3 },
      { id: 'D', label: 'Evening (5–9 PM)', value: 4 },
      { id: 'E', label: 'Late night (after 9 PM)', value: 5 },
    ],
  },

  {
    id: 'chrono_3',
    dimension: 'chronotype',
    section: 'CHRONOTYPE',
    sectionIndex: 3,
    sectionTotal: 5,
    question: 'If you had to do your hardest mental work, when would you choose?',
    subtext: null,
    format: 'single_select',
    options: [
      { id: 'A', label: 'Early morning', value: 1 },
      { id: 'B', label: 'Mid-morning', value: 2 },
      { id: 'C', label: 'Afternoon', value: 3 },
      { id: 'D', label: 'Evening', value: 4 },
      { id: 'E', label: 'Late night', value: 5 },
    ],
  },

  {
    id: 'chrono_4',
    dimension: 'chronotype',
    section: 'CHRONOTYPE',
    sectionIndex: 4,
    sectionTotal: 5,
    question: 'How difficult is it for you to function in the early morning?',
    subtext: 'Think about your actual experience, not what you wish were true.',
    format: 'slider',
    sliderMin: 'Not at all difficult',
    sliderMax: 'Extremely difficult',
    min: 1,
    max: 5,
  },

  {
    id: 'chrono_5',
    dimension: 'chronotype',
    section: 'CHRONOTYPE',
    sectionIndex: 5,
    sectionTotal: 5,
    question: 'On a typical work or school day vs. a free day, how different are your sleep times?',
    subtext: 'This helps us spot if your schedule and your biology are fighting each other.',
    format: 'single_select',
    options: [
      { id: 'A', label: 'Pretty similar (less than 1 hour difference)', social_jetlag: 0 },
      { id: 'B', label: 'Somewhat different (1–2 hours)', social_jetlag: 60 },
      { id: 'C', label: 'Noticeably different (2–3 hours)', social_jetlag: 150 },
      { id: 'D', label: 'Very different (3+ hours)', social_jetlag: 210 },
    ],
  },

  // ─── SECTION 2: PRODUCTIVITY STYLE ───────────────────────────────────────

  {
    id: 'prod_1',
    dimension: 'productivity_style',
    section: 'PRODUCTIVITY STYLE',
    sectionIndex: 1,
    sectionTotal: 4,
    question: 'You have a big project to start. What do you do first?',
    subtext: null,
    format: 'single_select',
    options: [
      { id: 'A', label: 'Define the goal and highest-value outcome', value: 'prioritizer' },
      { id: 'B', label: 'Map out a step-by-step plan', value: 'planner' },
      { id: 'C', label: 'Think about who needs to be involved', value: 'arranger' },
      { id: 'D', label: 'Try to understand the big picture first', value: 'visualizer' },
    ],
  },

  {
    id: 'prod_2',
    dimension: 'productivity_style',
    section: 'PRODUCTIVITY STYLE',
    sectionIndex: 2,
    sectionTotal: 4,
    question: 'Does having a meeting scheduled later in the day make it hard to focus before it?',
    subtext: 'Even if the meeting is hours away.',
    format: 'single_select',
    options: [
      { id: 'A', label: 'Yes, it fragments my whole day', value: 'maker_schedule' },
      { id: 'B', label: 'Not really, I just note it and keep working', value: 'manager_schedule' },
      { id: 'C', label: 'Only if it\'s something I\'m anxious about', value: 'anxiety_related' },
      { id: 'D', label: 'I forget about it until right before', value: 'time_blindness' },
    ],
  },

  {
    id: 'prod_3',
    dimension: 'productivity_style',
    section: 'PRODUCTIVITY STYLE',
    sectionIndex: 3,
    sectionTotal: 4,
    question: 'Do you produce better work under deadline pressure, or does pressure make you anxious?',
    subtext: null,
    format: 'single_select',
    options: [
      { id: 'A', label: 'Definitely better — I need the urgency', value: 'sprinter' },
      { id: 'B', label: 'Worse — pressure makes me freeze or spiral', value: 'marathoner' },
      { id: 'C', label: 'Better in the moment but I regret waiting', value: 'mixed' },
      { id: 'D', label: 'It depends entirely on whether I care about the task', value: 'interest_based' },
    ],
  },

  {
    id: 'prod_4',
    dimension: 'productivity_style',
    section: 'PRODUCTIVITY STYLE',
    sectionIndex: 4,
    sectionTotal: 4,
    question: 'When something unexpected disrupts your plan, what\'s your gut reaction?',
    subtext: 'Not what you think you should feel — what you actually feel.',
    format: 'single_select',
    options: [
      { id: 'A', label: 'Significant distress, hard to recover', value: 'structured_high' },
      { id: 'B', label: 'Mild frustration, I adapt fairly quickly', value: 'structured_moderate' },
      { id: 'C', label: 'Honestly kind of relieved — a reason to pivot', value: 'fluid' },
      { id: 'D', label: 'Both: I hate it AND I secretly welcome it', value: 'audhd_signal' },
    ],
  },

  // ─── SECTION 3: PROCRASTINATION TYPE ─────────────────────────────────────

  {
    id: 'proc_1',
    dimension: 'procrastination_type',
    section: 'PROCRASTINATION TYPE',
    sectionIndex: 1,
    sectionTotal: 4,
    question: 'You have an important project due in two weeks. What most likely happens?',
    subtext: null,
    format: 'single_select',
    options: [
      { id: 'A', label: 'I start right away but keep revising endlessly', value: 'perfectionist' },
      { id: 'B', label: 'I feel weirdly energized as the deadline gets close', value: 'thrill_seeker' },
      { id: 'C', label: 'I think about starting constantly but feel too overwhelmed to begin', value: 'overwhelmed' },
      { id: 'D', label: 'I forget about it until something reminds me', value: 'interest_blocked' },
      { id: 'E', label: 'I feel anxious every time I think about it', value: 'anxious' },
      { id: 'F', label: 'I resent that I have to do it at all', value: 'rebellious' },
    ],
  },

  {
    id: 'proc_2',
    dimension: 'procrastination_type',
    section: 'PROCRASTINATION TYPE',
    sectionIndex: 2,
    sectionTotal: 4,
    question: 'My motivation depends on whether I find something interesting, not on how important it is.',
    subtext: 'Answer honestly — there\'s no wrong answer here.',
    format: 'scale_5',
    scaleMin: 'Strongly disagree',
    scaleMax: 'Strongly agree',
  },

  {
    id: 'proc_3',
    dimension: 'procrastination_type',
    section: 'PROCRASTINATION TYPE',
    sectionIndex: 3,
    sectionTotal: 4,
    question: 'I avoid tasks because I\'m afraid the result won\'t be good enough.',
    subtext: null,
    format: 'scale_5',
    scaleMin: 'Strongly disagree',
    scaleMax: 'Strongly agree',
  },

  {
    id: 'proc_4',
    dimension: 'procrastination_type',
    section: 'PROCRASTINATION TYPE',
    sectionIndex: 4,
    sectionTotal: 4,
    question: 'Being told I \'have to\' do something makes me want to do it less — even if I chose it myself.',
    subtext: null,
    format: 'scale_5',
    scaleMin: 'Strongly disagree',
    scaleMax: 'Strongly agree',
  },

  // ─── SECTION 4: HABIT TENDENCY ────────────────────────────────────────────

  {
    id: 'habit_1',
    dimension: 'habit_tendency',
    section: 'HABIT TENDENCY',
    sectionIndex: 1,
    sectionTotal: 3,
    question: 'Have you ever kept a habit or resolution that only YOU knew about — no one checking on you?',
    subtext: null,
    format: 'single_select',
    options: [
      { id: 'A', label: 'Yes, easily — I do what I set out to do', value: 'upholder' },
      { id: 'B', label: 'Sometimes, if I\'m completely convinced it\'s worth it', value: 'questioner' },
      { id: 'C', label: 'Rarely — I need someone else to know or I lose momentum', value: 'obliger' },
      { id: 'D', label: 'The concept of keeping a resolution feels like a trap', value: 'rebel' },
    ],
  },

  {
    id: 'habit_2',
    dimension: 'habit_tendency',
    section: 'HABIT TENDENCY',
    sectionIndex: 2,
    sectionTotal: 3,
    question: 'When asked to do something you think is pointless, what do you do?',
    subtext: null,
    format: 'single_select',
    options: [
      { id: 'A', label: 'Do it anyway — it\'s expected', value: 'upholder' },
      { id: 'B', label: 'Ask why and push back if the answer isn\'t satisfying', value: 'questioner' },
      { id: 'C', label: 'Do it to avoid conflict, and quietly resent it', value: 'obliger' },
      { id: 'D', label: 'Find a way around it, or just don\'t do it', value: 'rebel' },
    ],
  },

  {
    id: 'habit_3',
    dimension: 'habit_tendency',
    section: 'HABIT TENDENCY',
    sectionIndex: 3,
    sectionTotal: 3,
    question: 'What usually happens when you try a new productivity system?',
    subtext: null,
    format: 'single_select',
    options: [
      { id: 'A', label: 'I use it consistently for months', value: 'upholder' },
      { id: 'B', label: 'I\'m really excited at first, then stop using it within a few weeks', value: 'novelty' },
      { id: 'C', label: 'I use it sometimes and sometimes forget', value: 'inconsistent' },
      { id: 'D', label: 'I\'ve never found one that actually works for my brain', value: 'system_failure' },
    ],
  },

  // ─── SECTION 5: NEURODIVERGENT PATTERNS ──────────────────────────────────

  {
    id: 'nd_1',
    dimension: 'hyperfocus_tendency',
    section: 'YOUR PATTERNS',
    sectionIndex: 1,
    sectionTotal: 4,
    question: 'How often do you lose track of time without realizing it?',
    subtext: 'Starting a task and suddenly it\'s been 3 hours.',
    format: 'slider',
    sliderMin: 'Never',
    sliderMax: 'Constantly',
    min: 1,
    max: 5,
  },

  {
    id: 'nd_2',
    dimension: 'hyperfocus_tendency',
    section: 'YOUR PATTERNS',
    sectionIndex: 2,
    sectionTotal: 4,
    question: 'When you\'re deeply absorbed in something interesting, how hard is it to stop?',
    subtext: null,
    format: 'slider',
    sliderMin: 'Easy to stop',
    sliderMax: 'Nearly impossible',
    min: 1,
    max: 5,
  },

  {
    id: 'nd_3',
    dimension: 'sensory_sensitivity',
    section: 'YOUR PATTERNS',
    sectionIndex: 3,
    sectionTotal: 4,
    question: 'How sensitive are you to your environment — noise, light, temperature, textures?',
    subtext: null,
    format: 'slider',
    sliderMin: 'Not sensitive',
    sliderMax: 'Very sensitive',
    min: 1,
    max: 5,
  },

  {
    id: 'nd_4',
    dimension: 'environment',
    section: 'YOUR PATTERNS',
    sectionIndex: 4,
    sectionTotal: 4,
    question: 'What environment do you actually work best in?',
    subtext: null,
    format: 'single_select',
    options: [
      { id: 'A', label: 'Very quiet and calm', value: 'silent' },
      { id: 'B', label: 'Specific background sounds (music, white noise)', value: 'ambient_music' },
      { id: 'C', label: 'Content audio — podcasts, videos, something to listen to', value: 'content_audio' },
      { id: 'D', label: 'Some activity and buzz around me', value: 'noisy' },
      { id: 'E', label: 'It changes completely depending on my mood or task', value: 'variable' },
    ],
  },
]

// Total: 20 questions
export const totalQuestions = questions.length

// Group questions by section for progress display
export const sections = [
  { id: 'chronotype', label: 'CHRONOTYPE', count: 5 },
  { id: 'productivity_style', label: 'PRODUCTIVITY STYLE', count: 4 },
  { id: 'procrastination_type', label: 'PROCRASTINATION TYPE', count: 4 },
  { id: 'habit_tendency', label: 'HABIT TENDENCY', count: 3 },
  { id: 'patterns', label: 'YOUR PATTERNS', count: 4 },
]
