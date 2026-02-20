Good, I have what I need. Here's the full spec and the Antigravity prompts.

---

## The Mirror — Feature Spec

### What it tracks (per work session)

Every log entry captures: start time, end time (or duration), task type (creative / analytical / administrative / learning / maintenance), environment (where + sound situation), energy level going in (1-5), perceived output quality coming out (1-5), whether it was planned or spontaneous, and whether it was interrupted. That's it. No journaling, no essays. Taps and sliders.

### What it surfaces over time

After enough sessions (minimum ~10 to start showing patterns), the Mirror tab shifts from "log" mode to "insight" mode. It shows: your actual peak output times plotted on a 24-hour arc, your real average focus duration vs. what you estimated, your best-output conditions (time + environment + energy-in combinations), and the planned vs. spontaneous breakdown. Crucially, it will eventually answer: "do you actually do better work under pressure, or does it just feel that way?"

### Data model (Appwrite collection: `work_sessions`)
```
user_id        string
started_at     datetime
ended_at       datetime
duration_min   integer
task_type      enum: creative | analytical | admin | learning | maintenance
environment    enum: silent | ambient_music | content_audio | noisy | variable
energy_in      integer 1-5
quality_out    integer 1-5
was_planned    boolean
was_interrupted boolean
notes          string (optional, max 200 chars)
```

### UI structure
Two modes that live in the same tab:

**Log mode** (default, daily use): A large "Start Session" button. When tapped, a minimal timer starts. When you stop it, a quick 4-tap form appears: task type (icon grid), environment (icon grid), energy in (5 dots), quality out (5 dots). Done. Under that, today's sessions shown as a simple timeline.

**Insights mode** (accessed by toggling): Pattern cards that appear once enough data exists. Each card answers one question. No dashboards. No overwhelming charts. Just: "Your best work happens between 9 PM and 1 AM" or "Sessions you rated 4-5 quality averaged 67 minutes. Sessions under pressure averaged 43 minutes and rated 2.9."

---

## Antigravity Prompts

These are written so Antigravity has complete context without needing to ask questions. Copy each one as a standalone session.

---

### PROMPT 1 — The Mirror: Database Schema + Log Mode UI

```
I'm building a feature called "The Mirror" for Circaday, a React + Appwrite PWA for neurodivergent users. The Mirror is a behavior audit tool — it lets users log work sessions and eventually reveals actual vs. perceived patterns (e.g., "you think you work best under pressure, but your logged data says otherwise").

TECH STACK:
- React 18 + Vite (no TypeScript, plain JSX)
- Appwrite for backend (already configured in src/lib/db.js)
- Framer Motion for animations
- React Router for navigation
- All styles are inline JS objects — NO CSS files, NO Tailwind, NO CSS modules
- The app has a dark theme with CSS variables: --bg-primary, --bg-elevated, --text-primary, --text-secondary, --border, --accent (violet/indigo)

EXISTING STRUCTURE:
- src/lib/db.js — all Appwrite database calls live here
- src/components/ — all components
- The app has a bottom tab nav with: Today, Mirror, Plan, Profile tabs
- The Mirror tab currently renders a placeholder

---

TASK: Build the Mirror feature in two parts — database layer first, then the Log Mode UI.

PART 1 — APPWRITE SCHEMA (output as documentation I can manually create in Appwrite console)

Create the schema for a new collection called `work_sessions` with these attributes:
- user_id (string, required)
- started_at (string, required — ISO datetime)
- ended_at (string, required — ISO datetime)
- duration_min (integer, required)
- task_type (string, required — enum values: creative, analytical, admin, learning, maintenance)
- environment (string, required — enum values: silent, ambient_music, content_audio, noisy, variable)
- energy_in (integer, required — 1 to 5)
- quality_out (integer, required — 1 to 5)
- was_planned (boolean, required)
- was_interrupted (boolean, required)
- notes (string, optional — max 200 chars)

Output the schema as a table I can reference when creating it in the Appwrite console.

PART 2 — DATABASE FUNCTIONS (add to src/lib/db.js)

Add these functions to the existing db.js file:
1. createWorkSession(userId, sessionData) — creates a new document in work_sessions
2. getWorkSessions(userId, limitDays = 30) — fetches sessions from last N days, ordered by started_at descending
3. deleteWorkSession(sessionId) — deletes a session

PART 3 — THE MIRROR TAB: LOG MODE UI (create src/components/MirrorTab.jsx)

Build the Log Mode UI. This is the default view of the Mirror tab.

VISUAL DESIGN:
- Dark, minimal, calm. Matches the existing Circaday aesthetic (deep dark backgrounds, violet/indigo accents, subtle animations)
- No charts yet — this is the logging interface only
- Generous spacing, large tap targets (neurodivergent-friendly)

STATES:
The component has three states managed with useState:

STATE 1 — IDLE (no active session):
- A large centered "Start Session" button (pill shape, accent color glow)
- Below it, today's logged sessions as a simple vertical list — each card shows: time range, task type icon, duration, and two small dot indicators for energy-in and quality-out
- If no sessions today, show a gentle empty state: "Nothing logged yet today."

STATE 2 — ACTIVE SESSION (timer running):
- Show a large running timer (HH:MM:SS) in the center
- Small text showing what time it started
- A "Stop Session" button (same size as start button, different color — muted red)
- No other UI clutter — the timer should feel like the whole screen

STATE 3 — LOG FORM (after stopping):
- A bottom-sheet style modal slides up (Framer Motion animation)
- Shows the session duration at the top ("47 minutes")
- Then 4 quick-select sections:

  TASK TYPE (icon grid, pick one):
  - 🎨 Creative
  - 🔍 Analytical  
  - 📋 Admin
  - 📚 Learning
  - 🔧 Maintenance

  ENVIRONMENT (icon grid, pick one):
  - 🔇 Silent
  - 🎵 Music
  - 🎙️ Content (podcast/show)
  - 🔊 Noisy
  - 🔀 Variable

  ENERGY IN (dot scale 1-5, labeled "How were you going in?")
  QUALITY OUT (dot scale 1-5, labeled "How did it go?")

  Optional notes field (single line, placeholder: "anything worth noting?")

  Two buttons: "Save Session" (accent) and "Discard" (ghost)

  Also include a toggle: "Was this planned?" (default: true) and "Were you interrupted?" (default: false) — these can be small toggles below the dot scales, not prominent

COMPONENT REQUIREMENTS:
- Use React useState for: activeSession (null or {startTime}), showLogForm (bool), formData (object), sessions (array)
- Sessions load from Appwrite on mount via getWorkSessions()
- Timer runs via useEffect with setInterval — updates every second
- Save calls createWorkSession() then refreshes sessions list
- Discard just closes the form, does not save
- All Framer Motion animations should be subtle — no flashy entrances
- Error states should be silent (console.error only, no UI errors that shame the user)

DO NOT add charts, insights, or patterns yet. This is logging only. Keep it focused.
```

---

### PROMPT 2 — The Mirror: Insights Mode

```
This is a follow-up to The Mirror logging feature already built in Circaday. The MirrorTab.jsx now has a working Log Mode. I need to add Insights Mode to the same tab.

CONTEXT:
The Mirror is a behavior audit tool for neurodivergent users. The core premise: users often have inaccurate beliefs about their own productivity patterns ("I work best under pressure", "I'm a morning person"). Insights Mode shows them what their actual logged data reveals — without judgment.

TECH STACK: Same as before — React 18, Appwrite, Framer Motion, inline JS styles only, dark theme with CSS variables.

---

TASK: Add Insights Mode to the existing MirrorTab.jsx

TOGGLE:
Add a mode toggle at the top of the Mirror tab — two pills: "Log" and "Insights". Default is Log. Switching to Insights shows the insights view. Use Framer Motion for a smooth fade transition between modes.

INSIGHTS MODE UI:

Show one of two states:

STATE A — NOT ENOUGH DATA (fewer than 10 sessions logged):
- A calm, non-judgmental empty state
- Circular progress indicator showing sessions logged out of 10 needed (e.g., "6 / 10 sessions")
- Text: "The Mirror needs a bit more data before patterns emerge. Keep logging sessions and check back."
- No pressure language. No "you need to" — just informational.

STATE B — PATTERNS AVAILABLE (10+ sessions):
Show a vertical stack of "insight cards". Each card answers exactly one question in plain language. No axis labels, no chart jargon.

BUILD THESE 5 INSIGHT CARDS:

CARD 1 — Peak Time
Title: "When you're sharpest"
Logic: Group sessions by hour of day (use started_at). Calculate average quality_out per hour block (group into 3-hour blocks: 6-9, 9-12, 12-15, 15-18, 18-21, 21-24, 0-3, 3-6). Find the block with highest average quality. 
Display: A simple 24-hour arc (half circle, not a full chart) with the peak block highlighted in accent color. Below it: plain text like "Your highest-quality work tends to happen between 9 PM and midnight."

CARD 2 — Real Focus Duration
Title: "How long you actually focus"
Logic: Calculate median duration_min across all sessions. Also calculate median for high-quality sessions (quality_out >= 4) vs lower quality.
Display: Two numbers side by side — "All sessions: 52 min avg" and "Best sessions: 71 min avg". If best sessions are longer, add: "Your best work happens in longer sessions." If shorter: "Your best work tends to come in shorter bursts."

CARD 3 — Pressure Test
Title: "Do you work better under pressure?"
Logic: Compare quality_out for was_planned: true vs was_planned: false sessions. Also look at sessions that started in last 20% of estimated available time (this requires notes or we approximate by looking at sessions tagged a certain way — for now just use planned vs unplanned as the proxy).
Display: Two quality averages — "Planned sessions: 3.4/5" and "Spontaneous sessions: 3.8/5". Plain language interpretation below. If planned > spontaneous: "Your planned sessions actually tend to go better." If spontaneous > planned: "Your spontaneous work sessions rate higher — you may thrive with less structure." If close (within 0.3): "Not much difference — both approaches seem to work for you."

CARD 4 — Energy Correlation
Title: "Does starting energy matter?"
Logic: Split sessions into low energy-in (1-2), medium (3), high (4-5). Calculate average quality_out for each group.
Display: Three horizontal bars (simple, CSS-only, no charting library) showing quality averages. Plain text insight below.

CARD 5 — Best Environment
Title: "Where you do your best work"
Logic: Group by environment field. Find which environment has highest average quality_out (minimum 3 sessions in that category to qualify).
Display: The winning environment in large text with its icon, average quality below it. E.g., "🎙️ Content audio — 4.1/5 average quality". If not enough data per category, show what's available without declaring a winner.

CARD DESIGN:
- Each card: bg-elevated background, rounded corners (16px), padding 20px, margin-bottom 16px
- Card title in text-secondary, small caps or slightly muted
- Main insight in text-primary, larger font
- Subtle left border in accent color
- No red/green coloring — all neutral. This is information, not judgment.
- Cards should only appear if they have enough data to be meaningful (at least 5 sessions for most, 3 per category for environment)

DATA COMPUTATION:
- All computation happens in the component via useMemo — no backend computation needed
- Pass the sessions array (already loaded in Log mode) into the insights computation
- Helper functions should be clean and readable — put them in a local utils section at the top of the file

Keep the existing Log Mode completely intact. Insights Mode is additive only.
```

---

### PROMPT 3 — Sleep Tracker (Chronotype Verification)

```
I need to add a Sleep Tracker to Circaday, the React + Appwrite PWA. This is NOT a general sleep tracker — it has a specific purpose: to verify and refine the user's chronotype assignment from their onboarding quiz.

CONTEXT:
When users complete the Circaday quiz, they receive a provisional chronotype (Lion / Bear / Wolf / Dolphin). The sleep tracker runs for 14 days and either confirms or corrects that assignment based on actual behavior. After 14 days, the app recalculates chronotype using real data and can update the user's profile.

The key metric is MSFsc — midpoint of sleep on free days, corrected for sleep debt. We're approximating this by: asking whether each day was a "free day" (no obligations, no alarm), and using the actual sleep midpoint on those days.

TECH STACK: React 18, Appwrite, Framer Motion, inline JS styles, dark theme CSS variables. No TypeScript.

---

PART 1 — APPWRITE SCHEMA (output as documentation)

New collection: `sleep_logs`
Attributes:
- user_id (string, required)
- log_date (string, required — YYYY-MM-DD)
- bedtime (string, required — HH:MM in 24h)
- wake_time (string, required — HH:MM in 24h)
- used_alarm (boolean, required)
- is_free_day (boolean, required — no obligations, slept naturally)
- sleep_quality (integer, required — 1 to 5)
- morning_feel (integer, required — 1 to 5, how they felt 1 hour after waking)
- notes (string, optional — max 150 chars)

PART 2 — DATABASE FUNCTIONS (add to src/lib/db.js)

1. createSleepLog(userId, logData) — creates document, prevents duplicate log_date per user
2. getSleepLogs(userId, limitDays = 30) — fetch recent logs ordered by log_date desc
3. updateSleepLog(logId, updates) — for editing today's entry
4. calculateChronotype(sleepLogs) — pure function, takes array of logs, returns chronotype string

calculateChronotype logic:
- Filter to is_free_day: true logs only (need at least 3 to calculate)
- For each free day log: calculate sleep midpoint in decimal hours
  - Example: bedtime 01:30, wake 09:00 → midpoint = 01.5 + (9 - 1.5) / 2 = 01.5 + 3.75 = 5.25 (5:15 AM)
  - Handle crossing midnight: if bedtime hour > wake hour, add 24 to wake before calculating
- Average the midpoints across all free days = MSFsc approximation
- Classify:
  - MSFsc before 3:30 AM → Lion (early type)
  - MSFsc 3:30–5:00 AM → Bear (intermediate)
  - MSFsc 5:00–6:30 AM → Wolf (late type)
  - MSFsc after 6:30 AM → Dolphin (irregular/very late)
- Return: { chronotype: 'wolf', confidence: 'high'|'medium'|'low', freeDaysUsed: N, msfsc: X.XX }
- Confidence: high = 7+ free days, medium = 4-6, low = 3 (minimum)
- If fewer than 3 free days: return { chronotype: null, confidence: 'insufficient', freeDaysUsed: N }

PART 3 — SLEEP TRACKER UI (create src/components/SleepTracker.jsx)

This component lives inside the Profile tab, in a section called "Sleep Calibration". It's not a full tab — it's a section within Profile.

VISUAL DESIGN: Calm, dark, consistent with Circaday. Think of it as a quiet nightly ritual, not a data entry form.

STATES:

STATE 1 — NO LOG YET TODAY:
- Section header: "Sleep Calibration" with subtitle "Tracking day X of 14"
- A single large card prompting tonight's log
- Shows: "Last night's sleep" with a quick-add form (see below)
- Progress bar showing days logged out of 14 (use accent color fill)

STATE 2 — LOG FORM:
A clean form with these fields in order:
1. "What time did you go to bed?" — time picker (two dropdowns: hour and minute, 15-min increments, 24h format)
2. "What time did you wake up?" — same format
3. "Did you use an alarm?" — two large pill buttons: Yes / No
4. "Was this a free day?" (label: "No obligations, slept as long as you wanted") — Yes / No pills
5. "Sleep quality" — 5-dot scale
6. "How did you feel an hour after waking?" — 5-dot scale  
7. Optional notes — single line input

Save button: "Log Sleep"
Keep it vertical, one field at a time feeling. Generous spacing.

STATE 3 — LOGGED TODAY:
- Show a summary card of last night's entry (bedtime, wake time, duration calculated, quality dots)
- Small "Edit" link in corner if they need to correct something
- Below: last 7 days as a small visual — 7 dots in a row, each colored by quality (1-2: muted, 3: medium, 4-5: accent glow), tooltip on tap showing the date

STATE 4 — CALIBRATION COMPLETE (14+ days logged):
- A gentle reveal: "Your sleep pattern is clearer now"
- Show the calculated chronotype with confidence level
- If different from quiz result: "Your logged sleep suggests you might be more [Wolf] than [Bear]. Your profile has been updated."
- If same: "Your sleep data confirms your [Wolf] chronotype."
- Option to continue logging (button: "Keep tracking") or stop ("That's enough for now")
- This should feel like a discovery, not a report. Calm, curious language.

CHRONOTYPE UPDATE LOGIC:
- When calibration completes, call a callback prop: onChronotypeUpdate(newChronotype)
- The parent component handles updating the user's profile in Appwrite
- Don't do the profile update inside SleepTracker — keep it decoupled

HELPER: calculateSleepDuration(bedtime, wakeTime) — returns duration in hours and minutes as string ("7h 23m"). Handle midnight crossing.

Only log one entry per calendar day. If today already has a log, go straight to STATE 3.
```

---

Those three prompts are fully self-contained — Antigravity can execute each one independently. Run them in order since Prompt 2 depends on the sessions data structure from Prompt 1, and Prompt 3 is standalone but references the profile tab.

Want me to write Prompt 4 next — the Initiation Support feature (the "push the boulder" moment, which based on your assessment is the single highest-value thing Circaday can do for you specifically)?