// Goal-setting framework definitions

export const frameworks = {
  smart: {
    id: 'smart',
    name: 'SMART',
    description: 'Specific, Measurable, Achievable, Relevant, Time-bound',
    fields: [
      { key: 'S', label: 'Specific', placeholder: 'What exactly will you accomplish?' },
      { key: 'M', label: 'Measurable', placeholder: 'How will you know when it\'s done?' },
      { key: 'A', label: 'Achievable', placeholder: 'What makes this realistic today?' },
      { key: 'R', label: 'Relevant', placeholder: 'Why does this matter right now?' },
      { key: 'T', label: 'Time-bound', placeholder: 'When will you complete this?' }
    ]
  },
  hard: {
    id: 'hard',
    name: 'HARD',
    description: 'Heartfelt, Animated, Required, Difficult',
    fields: [
      { key: 'H', label: 'Heartfelt', placeholder: 'Why do you genuinely care about this?' },
      { key: 'A', label: 'Animated', placeholder: 'What does success look like vividly?' },
      { key: 'R', label: 'Required', placeholder: 'What makes this necessary, not optional?' },
      { key: 'D', label: 'Difficult', placeholder: 'What challenge will stretch you?' }
    ]
  },
  woop: {
    id: 'woop',
    name: 'WOOP',
    description: 'Wish, Outcome, Obstacle, Plan',
    fields: [
      { key: 'W', label: 'Wish', placeholder: 'What is your wish for today?' },
      { key: 'O', label: 'Outcome', placeholder: 'What\'s the best possible outcome?' },
      { key: 'O2', label: 'Obstacle', placeholder: 'What inner obstacle might get in the way?' },
      { key: 'P', label: 'Plan', placeholder: 'If [obstacle], then I will...' }
    ]
  },
  okr: {
    id: 'okr',
    name: 'OKR',
    description: 'Objective and Key Results',
    fields: [
      { key: 'O', label: 'Objective', placeholder: 'What meaningful goal are you working toward?' },
      { key: 'KR1', label: 'Key Result 1', placeholder: 'First measurable result' },
      { key: 'KR2', label: 'Key Result 2', placeholder: 'Second measurable result' },
      { key: 'KR3', label: 'Key Result 3', placeholder: 'Third measurable result' }
    ]
  }
}

export const frameworkOrder = ['smart', 'hard', 'woop', 'okr']

export default frameworks
