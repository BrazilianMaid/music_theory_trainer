# Music Theory Trainer v2 — Technical Design Document

**Author:** Davis Hester
**Date:** 2026-05-03
**Status:** Draft
**Codebase:** `music-theory-trainer/` (Next.js 14 / TypeScript / Tailwind / Vercel)

---

## 0. Current Architecture Summary

The app is a single-page quiz engine with zero backend. All state lives in React `useState` hooks inside `QuizApp.tsx`. Nothing persists between sessions.

**Core pattern:** Each quiz type is a `QuizModule` (`lib/types.ts`) with `id`, `label`, `generate()`, and `deepDive()`. Modules register in `MODULE_REGISTRY` (`lib/quiz-engine.ts`). The engine picks a module, calls `generate()`, returns a `Question` object. The UI renders it via `QuizCard.tsx`. After answering, `DeepDive.tsx` shows the explanation HTML.

**Existing modules (6):**

| Module ID | File | What it tests |
|---|---|---|
| `sigToKey` | `sig-to-key.ts` | "3 sharps → what key?" |
| `keyToSig` | `key-to-sig.ts` | "A major → how many sharps?" |
| `fifths` | `circle-fifths.ts` | "Clockwise from D → ?" |
| `chordName` | `chord-name.ts` | "IV in G major → what chord?" |
| `romanNumeral` | `roman-numeral.ts` | "Am in C major → what numeral?" |
| `chordFunction` | `chord-function.ts` | "V chord → what function?" |

**Key data structures** (`lib/theory-data.ts`):
- `CIRCLE_DATA` — 12 entries with major/minor/sig
- `ALL_KEYS` — 15 major keys
- `KEY_SIGS` — maps key name → `{ type, count }`
- `KEY_CHORDS` — maps 12 keys → array of 6 diatonic triads
- `DEGREES`, `QUALITIES`, `FUNCTIONS` — parallel arrays for I through vi

**Current `Question` interface:**
```typescript
interface Question {
  type: string          // module id
  modeBadge: string     // display label
  modeClass: string     // badge color class key
  answer: string
  options: string[]
  questionText: string  // HTML string
  explanation: string   // HTML string
  meta?: Record<string, unknown>
}
```

**Open issues from CLAUDE.md:**
1. No home button — only exit is finishing or refreshing
2. Circle of Fifths toggle requested but already implemented as collapsible
3. `dangerouslySetInnerHTML` used in `QuizCard.tsx` (lines 58-59, 79-80) and `DeepDive.tsx` (line 34)

---

## 1. Adaptive Difficulty Engine

### 1.1 Design Philosophy

SM-2 is overkill for a single-user quiz app with ~100 discrete concepts. Leitner boxes are the right mental model: simple, intuitive, and the bucket metaphor maps cleanly to "how well do you know this specific thing."

### 1.2 Concept Identification

Each question maps to a **concept key** — a string that uniquely identifies the specific piece of knowledge being tested. This is more granular than the module `type`.

```typescript
// New field on Question interface
interface Question {
  // ... existing fields ...
  conceptKey: string  // e.g. "sigToKey:A:3sharp", "chordName:G:IV"
}
```

Each module's `generate()` function will return a `conceptKey` derived from the specific question parameters. Examples:

| Module | conceptKey format | Example |
|---|---|---|
| `sigToKey` | `sigToKey:{key}` | `sigToKey:A` |
| `keyToSig` | `keyToSig:{key}` | `keyToSig:Eb` |
| `fifths` | `fifths:{fromKey}:{dir}` | `fifths:D:up` |
| `chordName` | `chordName:{key}:{degree}` | `chordName:G:IV` |
| `romanNumeral` | `romanNumeral:{key}:{chord}` | `romanNumeral:C:Am` |
| `chordFunction` | `chordFunction:{degree}` | `chordFunction:V` |
| `scaleId` (new) | `scaleId:{root}:{type}` | `scaleId:A:harmonicMinor` |
| `scaleSpell` (new) | `scaleSpell:{root}:{type}` | `scaleSpell:C:major` |
| `harmonize` (new) | `harmonize:{key}:{degree}` | `harmonize:G:iii` |

### 1.3 Leitner Box Storage

Five boxes. New concepts start in Box 1. Correct → move up one box. Wrong → back to Box 1. Each box has a different review interval.

```typescript
// lib/adaptive.ts

interface ConceptCard {
  conceptKey: string
  moduleId: string        // for filtering by quiz type
  box: 1 | 2 | 3 | 4 | 5
  lastSeen: number        // Date.now() timestamp
  totalCorrect: number
  totalWrong: number
}

interface AdaptiveState {
  cards: Record<string, ConceptCard>  // keyed by conceptKey
  sessionHistory: SessionEntry[]       // last 30 days, trimmed on load
}

interface SessionEntry {
  date: string            // ISO date "2026-05-03"
  results: Record<string, { correct: number; wrong: number }>  // per moduleId
}

const BOX_INTERVALS_MS: Record<number, number> = {
  1: 0,                    // immediate — always eligible
  2: 4 * 60 * 60 * 1000,  // 4 hours
  3: 24 * 60 * 60 * 1000, // 1 day
  4: 3 * 24 * 60 * 60 * 1000, // 3 days
  5: 7 * 24 * 60 * 60 * 1000, // 7 days
}
```

**localStorage key:** `mtt_adaptive_v1`

**Size estimate:** ~100 concepts × ~80 bytes each = ~8KB. `sessionHistory` at 30 days × ~200 bytes = ~6KB. Total well under localStorage limits.

### 1.4 Question Selection Algorithm

Replace the current random selection in `generateQuestion()` with a weighted pick:

```typescript
// lib/quiz-engine.ts — updated generateQuestion()

export function generateQuestion(
  mode: string,
  recentTypes: string[],
  adaptive: AdaptiveState   // new parameter
): Question {
  // 1. Pick module (same logic as current, respecting mode + recentTypes)
  const mod = pickModule(mode, recentTypes)

  // 2. Generate a candidate question
  const question = mod.generate()

  // 3. Check if this concept is "due" based on Leitner box
  //    If not due, generate up to 5 more candidates, preferring due ones
  //    Fallback: use any question (don't block the user)

  // 4. Record the concept as "seen"
  return question
}
```

The selection priority:
1. **Due concepts in Box 1** (stuff you got wrong) — 50% weight
2. **Due concepts in Box 2-3** (shaky knowledge) — 30% weight
3. **Unseen concepts** (never encountered) — 15% weight
4. **Mastered concepts due for review** (Box 4-5) — 5% weight

This is a soft weighting, not a hard filter. The user should still see variety — never the same concept three times in a row.

### 1.5 Recording Results

After each answer in `QuizApp.tsx`:

```typescript
// Inside handleAnswer()
const correct = answer === currentQuestion.answer
recordResult(currentQuestion.conceptKey, currentQuestion.type, correct)
// recordResult updates the AdaptiveState in localStorage
```

```typescript
// lib/adaptive.ts
export function recordResult(
  conceptKey: string,
  moduleId: string,
  correct: boolean
): void {
  const state = loadState()
  const card = state.cards[conceptKey] ?? newCard(conceptKey, moduleId)

  if (correct) {
    card.box = Math.min(card.box + 1, 5) as ConceptCard['box']
    card.totalCorrect++
  } else {
    card.box = 1
    card.totalWrong++
  }
  card.lastSeen = Date.now()

  state.cards[conceptKey] = card
  updateSessionHistory(state, moduleId, correct)
  saveState(state)
}
```

### 1.6 Integration with Existing generate() Pattern

**The modules themselves don't change their `generate()` signature.** Each module still returns a `Question`. The only addition: each module's `generate()` now also sets `conceptKey` on the returned object.

The adaptive logic lives in `quiz-engine.ts` and `adaptive.ts`, wrapping the existing module calls. This means:
- Existing modules need a one-line addition each (setting `conceptKey`)
- New modules include `conceptKey` from the start
- If `conceptKey` is missing (defensive), fall back to `type` as the concept key

### 1.7 Targeted Practice Mode

For the dashboard's "focus practice" feature, `generateQuestion` accepts an optional concept filter:

```typescript
export function generateQuestion(
  mode: string,
  recentTypes: string[],
  adaptive: AdaptiveState,
  filter?: { weakOnly: boolean; moduleIds?: string[] }
): Question
```

When `weakOnly` is true, only generate from concepts in Box 1-2. When `moduleIds` is provided, only use those modules.

---

## 2. New Quiz Modules

### 2.1 Scale Data

New file: `lib/scale-data.ts`

```typescript
export interface ScaleDefinition {
  id: string              // e.g. "major", "naturalMinor", "harmonicMinor"
  label: string           // display name
  pattern: number[]       // intervals in semitones from root [0, 2, 4, 5, 7, 9, 11]
  category: 'diatonic' | 'pentatonic' | 'blues' | 'mode'  // for future filtering
  description: string     // one-line description for deep dives
}

export const SCALE_TYPES: ScaleDefinition[] = [
  {
    id: 'major',
    label: 'Major',
    pattern: [0, 2, 4, 5, 7, 9, 11],
    category: 'diatonic',
    description: 'The foundation — W W H W W W H',
  },
  {
    id: 'naturalMinor',
    label: 'Natural Minor',
    pattern: [0, 2, 3, 5, 7, 8, 10],
    category: 'diatonic',
    description: 'The relative minor — W H W W H W W',
  },
  {
    id: 'harmonicMinor',
    label: 'Harmonic Minor',
    pattern: [0, 2, 3, 5, 7, 8, 11],
    category: 'diatonic',
    description: 'Natural minor with a raised 7th — creates the V chord in minor keys',
  },
  {
    id: 'melodicMinor',
    label: 'Melodic Minor',
    pattern: [0, 2, 3, 5, 7, 9, 11],
    category: 'diatonic',
    description: 'Natural minor with raised 6th and 7th ascending',
  },
]

// Chromatic note names for spelling scales from any root
export const CHROMATIC_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
export const CHROMATIC_FLAT  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

export function spellScale(root: string, scaleType: ScaleDefinition): string[] {
  // Use sharp or flat chromatic based on the key signature of the root
  // Returns array of note names: ["A", "B", "C#", "D", "E", "F#", "G#"]
}
```

**Extensibility:** Adding pentatonic, blues, or modes later = push new entries to `SCALE_TYPES` with the appropriate `category`. The quiz modules filter by category, so you can gate which scales appear in quizzes.

### 2.2 Scale Identification Module

New file: `lib/modules/scale-id.ts`

Two question formats:
1. **"Identify this scale"** — given the notes, name the scale type
2. **"What notes are in X scale"** — given root + type, pick the correct note set

```typescript
// lib/modules/scale-id.ts

export const scaleIdModule: QuizModule = {
  id: 'scaleId',
  label: 'Scale ID',
  generate,
  deepDive,
}

function generate(): Question {
  const root = pick(SCALE_ROOTS)         // subset of ALL_KEYS suitable for scales
  const scale = pick(SCALE_TYPES.filter(s => s.category === 'diatonic'))
  const notes = spellScale(root, scale)
  const format = Math.random() < 0.5 ? 'identify' : 'spell'

  if (format === 'identify') {
    // Show notes, ask for scale type
    return {
      type: 'scaleId',
      conceptKey: `scaleId:${root}:${scale.id}`,
      modeBadge: 'Scale ID',
      modeClass: 'scales',          // new badge class
      answer: scale.label,
      options: shuffle([scale.label, ...wrongScaleTypes]),
      questionText: `The notes <strong>${notes.join(' – ')}</strong> form what type of scale?`,
      explanation: `...`,
    }
  } else {
    // Name root + type, ask for correct notes
    return {
      type: 'scaleId',
      conceptKey: `scaleSpell:${root}:${scale.id}`,
      modeBadge: 'Scale Spell',
      modeClass: 'scales',
      answer: notes.join(' – '),
      options: shuffle([notes.join(' – '), ...wrongNoteSequences]),
      questionText: `What are the notes in <strong>${root} ${scale.label}</strong>?`,
      explanation: `...`,
    }
  }
}
```

**Deep dive:** Guitar-contextualized. Show the scale pattern on a single string (fret numbers), explain the interval formula, connect to the Circle of Fifths where relevant.

### 2.3 Harmony Module

New file: `lib/modules/harmonize.ts`

Question format: "What is the iii chord in G major?" — but for both major and minor keys, with quality included.

```typescript
// lib/harmony-data.ts

export interface HarmonyDefinition {
  keyType: 'major' | 'naturalMinor' | 'harmonicMinor'
  degrees: string[]     // ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']
  qualities: string[]   // ['major', 'minor', 'minor', 'major', 'major', 'minor', 'dim']
}

export const HARMONY_TYPES: HarmonyDefinition[] = [
  {
    keyType: 'major',
    degrees: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'],
    qualities: ['major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished'],
  },
  {
    keyType: 'naturalMinor',
    degrees: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'],
    qualities: ['minor', 'diminished', 'major', 'minor', 'minor', 'major', 'major'],
  },
]
```

This adds `vii°` (diminished) which the current app omits — the existing `DEGREES` array only goes to `vi`. The harmonize module handles all 7 degrees.

```typescript
// lib/modules/harmonize.ts

export const harmonizeModule: QuizModule = {
  id: 'harmonize',
  label: 'Harmonize',
  generate,
  deepDive,
}

function generate(): Question {
  const harmony = pick(HARMONY_TYPES)
  const key = pick(validKeys)
  const degIdx = Math.floor(Math.random() * 7)  // all 7 degrees
  const degree = harmony.degrees[degIdx]
  const quality = harmony.qualities[degIdx]
  const chord = buildChord(key, harmony.keyType, degIdx)

  return {
    type: 'harmonize',
    conceptKey: `harmonize:${key}:${harmony.keyType}:${degree}`,
    modeBadge: 'Harmonize',
    modeClass: 'chords',
    answer: `${chord} (${quality})`,
    options: shuffle([...]),
    questionText: `In <strong>${key} ${harmony.keyType === 'major' ? 'major' : 'natural minor'}</strong>, what is the <strong>${degree}</strong> chord?`,
    explanation: `...`,
    meta: { keyType: harmony.keyType, degreeIndex: degIdx },
  }
}
```

**Future extensibility for 7th chords, borrowed chords, secondary dominants:**

```typescript
// Later additions to HARMONY_TYPES or a separate ADVANCED_HARMONY array:
{
  keyType: 'major7th',
  degrees: ['Imaj7', 'ii7', 'iii7', 'IVmaj7', 'V7', 'vi7', 'viiø7'],
  qualities: ['major 7th', 'minor 7th', 'minor 7th', 'major 7th', 'dominant 7th', 'minor 7th', 'half-dim 7th'],
}
```

Borrowed chords and secondary dominants would be separate modules that import from `harmony-data.ts` but have their own `generate()` logic. The data layer is shared; the question logic is per-module. No rearchitecting needed.

### 2.4 Module Registration

Both new modules register the same way as existing ones:

```typescript
// lib/quiz-engine.ts — add to MODULE_REGISTRY
import { scaleIdModule }   from './modules/scale-id'
import { harmonizeModule } from './modules/harmonize'

const MODULE_REGISTRY: QuizModule[] = [
  // ... existing 6 ...
  scaleIdModule,
  harmonizeModule,
]
```

### 2.5 New Badge Class

Add to `BADGE_CLASSES` in `QuizCard.tsx`:

```typescript
scales: 'bg-[#1a1a2e] text-[#9b9bde] border-[#2d2d61]',
```

---

## 3. Performance Dashboard

### 3.1 Component: `Dashboard.tsx`

New top-level view. The app gains a simple two-view navigation: **Quiz** and **Dashboard**. This also solves the CLAUDE.md "home button" task — the home screen becomes the dashboard, with a "Start Quiz" button.

### 3.2 Navigation Model

```
┌──────────────────────────┐
│  App Shell (layout)      │
│  ┌────────────────────┐  │
│  │ Dashboard (home)   │──│── "Start Quiz" / "Focus Practice" →
│  └────────────────────┘  │
│  ┌────────────────────┐  │
│  │ QuizApp            │──│── "Home" button (top-left) →
│  └────────────────────┘  │
└──────────────────────────┘
```

State management: a `view` state in a parent component (`AppShell.tsx`) that toggles between `'dashboard'` and `'quiz'`. No router needed — this is a single-page app and adding routes would be over-engineering.

```typescript
// components/AppShell.tsx
'use client'
import { useState } from 'react'
import Dashboard from './Dashboard'
import QuizApp from './QuizApp'

type View = 'dashboard' | 'quiz'
interface QuizConfig { mode: string; filter?: { weakOnly: boolean; moduleIds?: string[] } }

export default function AppShell() {
  const [view, setView] = useState<View>('dashboard')
  const [quizConfig, setQuizConfig] = useState<QuizConfig>({ mode: 'all' })

  if (view === 'quiz') {
    return <QuizApp
      config={quizConfig}
      onHome={() => setView('dashboard')}
    />
  }
  return <Dashboard
    onStartQuiz={(config) => { setQuizConfig(config); setView('quiz') }}
  />
}
```

This solves **CLAUDE.md Task 1 (Home Button)** — `QuizApp` receives an `onHome` callback and renders a home button in the top-left.

**CLAUDE.md Task 2 (Circle Toggle)** is already implemented as the collapsible reference panel. The task description in CLAUDE.md says "toggle to show/hide" which is exactly what the current `circleOpen` state does. This task appears done — just needs to be marked complete in CLAUDE.md.

### 3.3 Dashboard Layout

```
┌─────────────────────────────────────────────┐
│  Circle of Fifths Trainer                   │
│  (subtitle)                                 │
│                                             │
│  ┌─────────────────────────────────────────┐│
│  │ Overall Stats Bar                       ││
│  │ Total Qs | Accuracy | Best Streak | Days││
│  └─────────────────────────────────────────┘│
│                                             │
│  ┌─────────────────────────────────────────┐│
│  │ Module Breakdown                        ││
│  │ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐      ││
│  │ │SigKy│ │KySig│ │Fifths│ │Chord│ ...  ││
│  │ │ 82% │ │ 74% │ │ 91% │ │ 65% │      ││
│  │ │  ▲  │ │  ─  │ │  ▲  │ │  ▼  │      ││
│  │ └─────┘ └─────┘ └─────┘ └─────┘      ││
│  └─────────────────────────────────────────┘│
│                                             │
│  ┌─────────────────────────────────────────┐│
│  │ Weakest Concepts (Box 1-2)             ││
│  │ • chordName G:IV — 2/7 (29%)          ││
│  │ • sigToKey Db — 1/5 (20%)             ││
│  │ • romanNumeral E:C#m — 0/3 (0%)       ││
│  │                                         ││
│  │ [Focus Practice: Weak Areas]            ││
│  └─────────────────────────────────────────┘│
│                                             │
│  [Start Quiz — All Types]                   │
│  [mode selector buttons for specific types] │
└─────────────────────────────────────────────┘
```

### 3.4 Trend Indicators

Each module card shows a trend arrow based on comparing accuracy in the last 7 sessions vs. the 7 before that:

```typescript
type Trend = 'improving' | 'stable' | 'declining'

function getTrend(moduleId: string, history: SessionEntry[]): Trend {
  // Split history into recent (last 7 sessions) and prior (7 before that)
  // Compare accuracy rates
  // >5% improvement = improving, >5% decline = declining, else stable
}
```

Trend arrows: `▲` (green/correct color), `─` (dim), `▼` (red/wrong color).

### 3.5 Styling

Follows existing theme from `tailwind.config.ts`:
- Background: `bg` (#0d0d0d)
- Cards: `surface` (#111111) with `border` (#252525)
- Accent: `gold` (#c9a84c)
- Positive: `correct` (#5cb85c)
- Negative: `wrong` (#c0392b)
- Text hierarchy: `text-primary` → `text-muted` → `text-dim` → `text-faint` → `text-ghost`

No new colors. No new fonts. No charts library — the module breakdown cards are simple styled divs with percentage text and a thin progress bar using the gold gradient from `StreakBar.tsx`.

---

## 4. Architecture Notes

### 4.1 Fixing dangerouslySetInnerHTML

**The problem:** `QuizCard.tsx` and `DeepDive.tsx` render raw HTML strings from quiz modules. The HTML is developer-authored (not user input), so the XSS risk is minimal — but it's still bad practice and makes the content harder to style/test.

**The fix:** Migrate to structured content. Instead of HTML strings, modules return React-renderable data:

```typescript
// Phase 1: Minimal change — sanitize with a lightweight parser
// Add to package.json: no new dep needed, use a simple regex sanitizer
// since all HTML is developer-authored and follows a known pattern

function sanitizeExplanation(html: string): string {
  // Allow only: <strong>, <em>, <br>, <p>, <h4>, <div class="guitar-tip">
  // Strip everything else
  return html.replace(/<(?!\/?(?:strong|em|br|p|h4|div)\b)[^>]+>/gi, '')
}

// Phase 2 (later): Replace HTML strings with structured content
interface ExplanationContent {
  paragraphs: Array<{
    text: string            // with **bold** and *italic* markdown
    type: 'text' | 'guitarTip'
  }>
  heading?: string
}
```

Phase 1 is a one-file utility + updating the two `dangerouslySetInnerHTML` call sites to use it. Phase 2 is a larger refactor that touches every module's `explanation` and `deepDive` return values.

**Recommendation:** Do Phase 1 now (30 min), defer Phase 2 until a module refactor is already happening.

### 4.2 Home Button (CLAUDE.md Task 1)

Solved by the `AppShell.tsx` navigation model in Section 3.2. The `onHome` callback passed to `QuizApp` renders a button:

```tsx
// Inside QuizApp.tsx, at the top of the <main> element:
<button
  onClick={onHome}
  className="absolute top-4 left-4 text-text-dim hover:text-gold text-[0.7rem] font-mono uppercase tracking-widest transition-colors"
  aria-label="Return to dashboard"
>
  ← Home
</button>
```

Scores for the current quiz session are passed back to the dashboard on navigation (or just re-read from localStorage). No page reload.

### 4.3 Circle of Fifths Toggle (CLAUDE.md Task 2)

Already implemented. The collapsible `circleOpen` state in `QuizApp.tsx` (line 28) with the toggle button (lines 74-93) is exactly the requested feature. Visible by default (starts closed but the button is prominent). Recommend: update CLAUDE.md to mark this done.

### 4.4 Advanced Topics — Future Plugin Points

The architecture supports these without rearchitecting:

**7th chords:** Add a `HarmonyDefinition` entry in `harmony-data.ts` with 7th chord degrees/qualities. Create `lib/modules/seventh-chords.ts` following the same `QuizModule` pattern. Register in `MODULE_REGISTRY`. Extend `KEY_CHORDS` or create a parallel `KEY_CHORDS_7TH` in `theory-data.ts`.

**Borrowed chords:** New module `lib/modules/borrowed-chords.ts`. Needs new data: a mapping of common borrowed chords per key (e.g., bVII in C major = Bb). This is a new data file, not a modification of existing data.

**Secondary dominants:** New module `lib/modules/secondary-dominants.ts`. "What is the V/V in C major?" → D major. Needs a `secondaryDominants(key)` utility function, not new data tables.

Each of these is a new file + one line in `MODULE_REGISTRY`. The engine, UI, adaptive system, and dashboard all work automatically with any registered module.

### 4.5 Gamification Hooks (Not Now)

The adaptive system's `ConceptCard` and `SessionEntry` structures already contain everything needed for future gamification:

| Future Feature | Data Source | Hook Point |
|---|---|---|
| **Streaks** (consecutive days) | `sessionHistory[].date` | Dashboard component |
| **Badges** ("Master of Key Sigs") | `cards` filtered by moduleId, all in Box 5 | New `Badges.tsx` component |
| **XP** | `totalCorrect` across all cards | Dashboard overall stats |
| **Accuracy milestones** | Per-module accuracy from `sessionHistory` | Dashboard module cards |
| **Leitner completion** | Count of cards in Box 4-5 vs total | Dashboard progress bar |

No code changes needed now. These all read from existing `AdaptiveState` data.

### 4.6 Accessibility Improvements

**ARIA labels — specific changes needed:**

```tsx
// QuizCard.tsx — answer buttons
<button
  aria-label={`Answer: ${option}`}
  aria-pressed={selectedAnswer === option}
  role="option"
  // ... existing props
>

// QuizCard.tsx — wrap options grid
<div role="listbox" aria-label="Answer choices" className="grid grid-cols-2 ...">

// ModeSelector.tsx — mode buttons
<button
  aria-pressed={currentMode === mode.id}
  aria-label={`Quiz mode: ${mode.label}`}
  // ... existing props
>

// DeepDive.tsx — toggle
<button
  aria-expanded={open}
  aria-controls="deep-dive-content"
  // ... existing props
>
<div id="deep-dive-content" role="region" aria-label="Detailed explanation">

// CircleOfFifths.tsx — SVG
<svg aria-label="Circle of Fifths diagram" role="img">
  <title>Circle of Fifths showing all major and minor keys</title>
```

**Color-blind safe feedback:**

Current correct/wrong feedback relies solely on green (#5cb85c) and red (#c0392b). Add secondary indicators:

```tsx
// QuizCard.tsx — after answer, show icon alongside color
{option === question.answer && answered && <span aria-hidden="true"> ✓</span>}
{option === selectedAnswer && option !== question.answer && answered && <span aria-hidden="true"> ✗</span>}
```

Also add `aria-live="polite"` to the explanation region so screen readers announce feedback after answering.

---

## 5. Implementation Roadmap

### Phase 1 — Adaptive Engine + Dashboard Shell
**Effort:** ~2 working sessions (4-6 hours)
**Value:** The app remembers what you know and shows you where you're weak. This alone transforms it from a random quiz into a learning tool.

| Task | Files | Est. |
|---|---|---|
| Create `lib/adaptive.ts` (Leitner logic + localStorage) | New file | 1 hr |
| Add `conceptKey` to all 6 existing modules | 6 module files | 30 min |
| Update `generateQuestion()` to use adaptive weighting | `quiz-engine.ts` | 45 min |
| Wire `recordResult()` into `QuizApp.tsx` `handleAnswer` | `QuizApp.tsx` | 15 min |
| Create `AppShell.tsx` with view switching | New file | 30 min |
| Create basic `Dashboard.tsx` (stats + module accuracy) | New file | 1.5 hr |
| Add Home button to `QuizApp.tsx` | `QuizApp.tsx` | 15 min |
| Update `app/page.tsx` to use `AppShell` | `page.tsx` | 5 min |
| Update CLAUDE.md (mark Task 2 done, update sprint) | `CLAUDE.md` | 5 min |

**Definition of done:** User can quiz, leave, come back, and see their stats. Weak concepts appear more often. Dashboard shows per-module accuracy.

### Phase 2 — Scales Module
**Effort:** ~1 working session (2-3 hours)
**Value:** Major new quiz content. Scales are the next logical step after key signatures and chords.

| Task | Files | Est. |
|---|---|---|
| Create `lib/scale-data.ts` (4 scale types + spellScale utility) | New file | 45 min |
| Create `lib/modules/scale-id.ts` (identify + spell formats) | New file | 1 hr |
| Write deep dives (guitar-contextualized) | Inside module | 30 min |
| Add badge class for scales | `QuizCard.tsx` | 5 min |
| Register in `MODULE_REGISTRY` | `quiz-engine.ts` | 5 min |
| Test with adaptive engine | Manual | 15 min |

**Definition of done:** Two new question types working in quiz flow with adaptive tracking and deep dives.

### Phase 3 — Harmony Module
**Effort:** ~1 working session (2-3 hours)
**Value:** Bridges the gap between "name chords" and "understand harmony." Covers major and natural minor diatonic harmonization including vii°.

| Task | Files | Est. |
|---|---|---|
| Create `lib/harmony-data.ts` | New file | 30 min |
| Create `lib/modules/harmonize.ts` | New file | 1 hr |
| Write deep dives for each chord quality | Inside module | 45 min |
| Register and test | `quiz-engine.ts` + manual | 15 min |

**Definition of done:** "What's the iii chord in G major?" works for both major and natural minor keys with full explanations.

### Phase 4 — Dashboard Polish + Accessibility
**Effort:** ~1 working session (2-3 hours)
**Value:** Makes the dashboard actually useful for self-directed practice. Makes the app usable with assistive tech.

| Task | Files | Est. |
|---|---|---|
| Add trend indicators to dashboard module cards | `Dashboard.tsx` | 45 min |
| Add "Weakest Concepts" list with focus practice button | `Dashboard.tsx` | 45 min |
| Wire focus practice → filtered quiz mode | `AppShell.tsx`, `QuizApp.tsx` | 30 min |
| ARIA labels on all interactive elements | Multiple components | 30 min |
| Color-blind safe answer feedback (✓/✗ icons) | `QuizCard.tsx` | 15 min |
| Sanitize `dangerouslySetInnerHTML` (Phase 1 fix) | New utility + 2 components | 30 min |

**Definition of done:** Dashboard shows trends, weak concepts are clickable to start targeted practice, screen reader can navigate the full quiz flow.

### Phase 5 (Future) — Advanced Harmony
**Effort:** ~2 working sessions each
**Not scheduled — do when the foundation feels solid.**

- 7th chord harmonization module
- Borrowed chords module
- Secondary dominants module
- Modes (Dorian, Mixolydian, etc.) added to scale data
- Pentatonic/blues scales added to scale data
- Gamification layer (badges, streaks, XP)

Each of these is independently valuable and plugs into the existing architecture with no refactoring.

---

## Appendix: File Map After All Phases

```
lib/
  adaptive.ts          ← NEW: Leitner box logic + localStorage
  quiz-engine.ts       ← MODIFIED: adaptive weighting in generateQuestion()
  types.ts             ← MODIFIED: add conceptKey to Question
  theory-data.ts       ← UNCHANGED
  scale-data.ts        ← NEW: scale definitions + spellScale()
  harmony-data.ts      ← NEW: harmony definitions for major/minor
  sanitize.ts          ← NEW: HTML sanitizer for explanations
  modules/
    sig-to-key.ts      ← MODIFIED: add conceptKey
    key-to-sig.ts      ← MODIFIED: add conceptKey
    circle-fifths.ts   ← MODIFIED: add conceptKey
    chord-name.ts      ← MODIFIED: add conceptKey
    roman-numeral.ts   ← MODIFIED: add conceptKey
    chord-function.ts  ← MODIFIED: add conceptKey
    scale-id.ts        ← NEW: scale identification + spelling
    harmonize.ts       ← NEW: diatonic harmonization

components/
  AppShell.tsx         ← NEW: view switching (dashboard ↔ quiz)
  Dashboard.tsx        ← NEW: performance dashboard
  QuizApp.tsx          ← MODIFIED: onHome prop, adaptive integration
  QuizCard.tsx         ← MODIFIED: ARIA, sanitized HTML, new badge class
  DeepDive.tsx         ← MODIFIED: ARIA, sanitized HTML
  Scoreboard.tsx       ← UNCHANGED
  ModeSelector.tsx     ← MODIFIED: ARIA labels
  StreakBar.tsx         ← UNCHANGED
  CircleOfFifths.tsx   ← MODIFIED: ARIA label + title

app/
  page.tsx             ← MODIFIED: render AppShell instead of QuizApp
  globals.css          ← UNCHANGED (possibly add .scale-diagram styles)
```
