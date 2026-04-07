# UI Design — Circle of Fifths Trainer
Date: 2026-04-07
Version: 1.1
Based on: project-brief.md v1.1, architecture.md v1.0

## Design Principle
Every element on screen has a job — nothing exists for decoration, and nothing competes with the question the user is trying to answer.

---

## User Flow

1. User arrives at the Home screen
2. User reads short app description (1–2 sentences)
3. User sees the Learning Path — a list of topics in recommended order
4. User selects a topic
5. Quiz screen loads — Circle of Fifths diagram visible, Question 1 of 20 displayed
6. User reads the question
7. User selects one of 4 multiple choice answers
8. All answer buttons become disabled immediately on selection
9. Selected answer is highlighted green (correct) or red (incorrect)
10. If incorrect: the correct answer is also highlighted green
11. Feedback message appears below the options: "Correct!" or "Incorrect — the answer is [X]"
12. "Next Question" button appears below the feedback
13. User clicks "Next Question" → next question loads, feedback clears, options re-enable
14. Steps 6–13 repeat until Question 20 is answered
15. After Question 20: "Next Question" label changes to "See Results"
16. User clicks "See Results" → Summary screen loads
17. Summary displays: score (X/20), percentage, correct count, incorrect count
18. Two buttons: "Try Again" (restarts same topic) and "Choose Another Topic" (returns to Home)

---

## Screen / View Inventory

### Screen 1: Home (Topic Selection)
- **Purpose:** Let the user understand the app and choose a quiz topic.
- **User story satisfied:** Story 5 (structured learning path visible to user)
- **Entry point:** App load / "Choose Another Topic" from Summary
- **Exit point:** Selecting a topic → Quiz screen

### Screen 2: Quiz
- **Purpose:** Present questions, accept answers, show immediate feedback, track progress.
- **User stories satisfied:** Stories 1, 2, 3, 4, 5 (Circle of Fifths visible; all quiz types; progress indicator)
- **Entry point:** Selecting a topic from Home
- **Exit point:** Completing Question 20 → Summary screen

### Screen 3: Summary
- **Purpose:** Show the user their session score and offer next actions.
- **User story satisfied:** Story 6 (session score summary)
- **Entry point:** Completing Question 20 on Quiz screen
- **Exit point:** "Try Again" → Quiz screen (same topic) / "Choose Another Topic" → Home screen

---

## Component Inventory

### Header
- **What it does:** Displays the app name. On the Quiz screen, also displays the current topic name.
- **Screens:** All screens
- **States:** Default (Home/Summary) | With topic label (Quiz)

### LearningPath
- **What it does:** Renders the ordered list of quiz topics. Each topic is a selectable card.
- **Screens:** Home
- **States:** Default (all topics available and selectable)

### TopicCard
- **What it does:** Displays a single topic with its number in the recommended sequence, topic name, and a one-line description of what it covers.
- **Screens:** Home (rendered inside LearningPath)
- **States:** Default | Hover

### CircleOfFifths
- **What it does:** Renders a static SVG diagram showing all 12 major keys on the outer ring, relative minors on the inner ring, and sharp/flat counts per segment. No interactivity. Reference only.
- **Screens:** Quiz
- **States:** Default only (static, no hover/active states)

### QuizProgress
- **What it does:** Shows the user's position in the session (e.g., "Question 7 of 20") and a horizontal progress bar that fills as questions are completed.
- **Screens:** Quiz
- **States:** Updates on each question advance

### QuizCard
- **What it does:** Displays the current question text. Large, prominent, centred above the answer options.
- **Screens:** Quiz
- **States:** Default | Updates on each question advance

### QuizOptions
- **What it does:** Renders 4 answer buttons vertically stacked. Disabled immediately on selection. Correct answer highlighted green. Selected wrong answer highlighted red.
- **Screens:** Quiz
- **States:**
  - Default: neutral border, white background, hover state active
  - Selected correct: green border, green-tinted background
  - Selected incorrect: red border, red-tinted background
  - Correct answer (when user answered wrong): green border, green-tinted background
  - All options disabled after any selection (no further clicks accepted)

### QuizFeedback
- **What it does:** Appears below QuizOptions after an answer is selected. Shows "Correct!" (green) or "Incorrect — the answer is [X]" (red), followed by a short theory explanation relevant to the question (e.g., "D major has 2 sharps: F# and C#"). Hidden before any answer is selected.
- **Screens:** Quiz
- **States:** Hidden | Correct (green header + explanation) | Incorrect (red header + explanation)
- **Data requirement:** Each question in `questions.js` must include an `explanation` string. Agent 4 must write an explanation for every question in the bank.

### NextButton
- **What it does:** Appears below QuizFeedback after an answer is selected. Labelled "Next Question" for questions 1–19. Labelled "See Results" on question 20.
- **Screens:** Quiz
- **States:** Hidden (before answer selected) | Visible | Hover | Active

### QuizSummary
- **What it does:** Displays end-of-session results and navigation options.
- **Screens:** Summary
- **States:** Default (renders once with final score)

---

## Wireframe Descriptions

### Home Screen

```
┌─────────────────────────────────────────┐
│  HEADER                                 │
│  Circle of Fifths Trainer               │
├─────────────────────────────────────────┤
│                                         │
│  Build your music theory foundation.   │
│  Choose a topic below to begin.         │
│                                         │
│  LEARNING PATH                          │
│  ┌─────────────────────────────────┐    │
│  │ 1  Key Signatures               │    │
│  │    Identify keys by sharps/flats│    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │ 2  Sharps & Flats Count         │    │
│  │    How many sharps/flats per key│    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │ 3  Relative Minors              │    │
│  │    Find the relative minor key  │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │ 4  Chord Relationships          │    │
│  │    Tonic, dominant, subdominant │    │
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

- Header spans full width. App name in bold. No navigation links.
- Intro text: 2 lines max, muted colour, below header.
- Topic cards stack vertically on all breakpoints (single column on mobile, centred single column with max-width on desktop).
- Each card: left-aligned number badge, topic name in bold, description in muted text below. Full-width clickable area. Hover state: border colour change + slight shadow.
- No "Start" button — clicking the card itself begins the quiz.

---

### Quiz Screen — Desktop (≥1024px)

```
┌──────────────────────────────────────────────────────┐
│  HEADER: Circle of Fifths Trainer  |  Key Signatures  │
├─────────────────────┬────────────────────────────────┤
│                     │  Question 7 of 20              │
│  CIRCLE OF FIFTHS   │  ████████░░░░░░░░  (progress)  │
│  (SVG diagram)      │                                │
│                     │  How many sharps does          │
│  ~40% width         │  D major contain?              │
│  Centred vertically │                                │
│                     │  ┌──────────────────────────┐  │
│                     │  │  1                       │  │
│                     │  └──────────────────────────┘  │
│                     │  ┌──────────────────────────┐  │
│                     │  │  2                       │  │
│                     │  └──────────────────────────┘  │
│                     │  ┌──────────────────────────┐  │
│                     │  │  3  ✓ (correct, selected)│  │
│                     │  └──────────────────────────┘  │
│                     │  ┌──────────────────────────┐  │
│                     │  │  4                       │  │
│                     │  └──────────────────────────┘  │
│                     │                                │
│                     │  ✓ Correct!                    │
│                     │  D major has 2 sharps: F#,C#  │
│                     │                                │
│                     │  [ Next Question →  ]          │
└─────────────────────┴────────────────────────────────┘
```

- Two-column layout. Left column (~40%): Circle of Fifths SVG, vertically centred. Right column (~60%): all quiz content.
- Circle of Fifths is always visible and never obscured by quiz content.
- Right column (top to bottom): progress text, progress bar, question text, 4 option buttons, feedback message, next button.

---

### Quiz Screen — Mobile (<768px)

```
┌──────────────────────────────┐
│  HEADER                      │
│  Key Signatures              │
├──────────────────────────────┤
│  [Circle of Fifths SVG]      │
│  Smaller, full width         │
├──────────────────────────────┤
│  Question 7 of 20            │
│  ████████░░░░ (progress bar) │
│                              │
│  How many sharps does        │
│  D major contain?            │
│                              │
│  ┌──────────────────────┐    │
│  │  1                   │    │
│  └──────────────────────┘    │
│  ┌──────────────────────┐    │
│  │  2                   │    │
│  └──────────────────────┘    │
│  ┌──────────────────────┐    │
│  │  3  ✓                │    │
│  └──────────────────────┘    │
│  ┌──────────────────────┐    │
│  │  4                   │    │
│  └──────────────────────┘    │
│                              │
│  ✓ Correct!                  │
│  D major has 2 sharps:       │
│  F# and C#                   │
│                              │
│  [ Next Question → ]         │
└──────────────────────────────┘
```

- Single column. Circle of Fifths SVG sits above the quiz content, full width, reduced height.
- All quiz content below the diagram in the same vertical flow as desktop right column.

---

### Summary Screen

```
┌──────────────────────────────────────┐
│  HEADER                              │
│  Circle of Fifths Trainer            │
├──────────────────────────────────────┤
│                                      │
│         Session Complete             │
│                                      │
│              16 / 20                 │
│               80%                   │
│                                      │
│   ✅ Correct:    16                  │
│   ❌ Incorrect:   4                  │
│                                      │
│   [ Try Again ]  [ Choose a Topic ]  │
│                                      │
└──────────────────────────────────────┘
```

- Centred layout, single column.
- Large score number (X/20) is the most prominent element.
- Percentage directly below score.
- Correct/incorrect breakdown below percentage.
- Two equal-width buttons side by side (stack vertically on small mobile).

---

## Design System

### Colors
- Primary: `#7C3AED` (violet — focused, musical)
- Primary hover: `#6D28D9`
- Secondary: `#0EA5E9` (sky blue — accent)
- Background: `#F9FAFB` (near-white)
- Surface: `#FFFFFF` (card/component backgrounds)
- Border default: `#E5E7EB`
- Text primary: `#111827`
- Text secondary: `#6B7280`
- Success: `#22C55E`
- Success background: `#F0FDF4`
- Success border: `#86EFAC`
- Error: `#EF4444`
- Error background: `#FEF2F2`
- Error border: `#FCA5A5`

### Typography
- Font family: `Inter, system-ui, -apple-system, sans-serif`
- H1 (app title): `2rem` / `700`
- H2 (screen titles, score display): `1.5rem` / `700`
- H3 (topic names, question text): `1.25rem` / `600`
- Body: `1rem` / `400`
- Small / label: `0.875rem` / `400`
- Progress label: `0.875rem` / `500`

### Spacing
- Base unit: `4px`
- Common values: `4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px`
- Card padding: `24px`
- Section gap: `32px`
- Button padding: `12px 24px`

### Interactive States

**Topic Card (Home):**
- Default: white background, `#E5E7EB` border, no shadow
- Hover: `#7C3AED` border, subtle box-shadow (`0 2px 8px rgba(0,0,0,0.08)`)
- Cursor: pointer

**Answer Option Button (Quiz):**
- Default: white background, `#E5E7EB` border, `#111827` text
- Hover (pre-selection only): `#F3F4F6` background, `#7C3AED` border
- Selected correct: `#F0FDF4` background, `#86EFAC` border, `#15803D` text
- Selected incorrect: `#FEF2F2` background, `#FCA5A5` border, `#DC2626` text
- Correct answer revealed (user was wrong): `#F0FDF4` background, `#86EFAC` border
- Disabled (post-selection, non-relevant options): `#F9FAFB` background, `#E5E7EB` border, `#9CA3AF` text, cursor: default

**Next / See Results Button:**
- Default: `#7C3AED` background, white text, rounded
- Hover: `#6D28D9` background
- Active: `#5B21B6` background

**Try Again / Choose a Topic Buttons (Summary):**
- "Try Again": Primary style (violet, filled)
- "Choose a Topic": Secondary style (white background, violet border, violet text)
- Hover states: filled darkens; outlined fills with light violet tint

---

## Responsive Behavior

| Breakpoint | Layout |
|---|---|
| Mobile < 768px | Single column. Circle of Fifths full-width, reduced height (~200px). Topic cards full width. Summary buttons stack vertically. |
| Tablet 768px–1023px | Single column, wider. Circle of Fifths full-width at comfortable size (~280px). Content max-width centred. |
| Desktop ≥ 1024px | Quiz screen: two-column (40% SVG / 60% quiz). Home and Summary remain single-column centred with max-width 640px. |

The Circle of Fifths SVG must scale cleanly at all sizes using `viewBox` and `width: 100%`.

---

## Edge Cases & Empty States

**During quiz — no async operations, so no loading state needed.**

**Answer not yet selected:**
- Feedback component: hidden (display: none, not just invisible — no space reserved)
- Next button: hidden

**After answer selected:**
- Feedback and Next button: visible
- Feedback shows: correct/incorrect label + theory explanation text
- All option buttons: disabled, cursor returns to default

**Question 20 answered:**
- Next button label changes to "See Results"
- Clicking transitions to Summary screen

**No questions available for a topic (defensive):**
- Show a centred message: "No questions available for this topic yet."
- Show a "Back to Topics" button
- Do not render a broken quiz interface

---

## What Is Not Designed (Out of Scope — v1)
- User account, login, or registration screens
- Progress tracking dashboard or history view
- Audio playback controls of any kind
- Ear training interface
- Composition or notation tools
- Settings or preferences screen
- Any form of onboarding tutorial or walkthrough overlay
