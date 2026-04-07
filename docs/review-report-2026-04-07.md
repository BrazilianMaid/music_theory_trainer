# Code Review Report — Circle of Fifths Trainer
Date: 2026-04-07
Reviewer: Agent 5
Branch reviewed: feature/agent4-circle-of-fifths

## Verdict: BLOCKED

## Summary
The build is substantially complete and well-structured — all 6 user stories are implemented, the question bank is thorough, and the component architecture cleanly matches the approved design. However, one Critical issue exists in `App.jsx`: a React state update is being triggered during the render phase, which is an explicit React anti-pattern that will cause bugs in Strict Mode and must be fixed before this ships.

---

## Findings

### Critical (must fix before ship — blocks pass)

- **Issue:** `QuizWrapper` in `App.jsx` (line 24–27) calls `onComplete()` — a function that sets state in the parent `App` component — directly inside the render function body, not inside a `useEffect`.
- **Location:** `src/App.jsx`, lines 19–30, `QuizWrapper` function
- **Risk:** React explicitly prohibits side effects (including state updates) during the render phase. In React 18 Strict Mode (enabled in `src/main.jsx`), render functions are intentionally invoked twice in development to surface exactly this class of bug. The result: `onComplete` fires twice per completion, calling `setSessionScore`, `setSelectedTopic`, and `setView` twice in rapid succession. This can produce unexpected state transitions and will generate React warnings in the console. In production (single render), the behaviour may appear to work, masking the underlying bug until a future React version or refactor surfaces it.
- **Required fix:** Move the completion check into a `useEffect` that depends on `quiz.isComplete`:

```jsx
import { useState, useEffect } from 'react'
// ...

function QuizWrapper({ topic, onComplete }) {
  const [sessionQuestions] = useState(() => buildSession(questions, topic.id))
  const quiz = useQuiz(sessionQuestions)

  useEffect(() => {
    if (quiz.isComplete) {
      const score = computeScore(sessionQuestions, quiz.answers)
      onComplete(score, sessionQuestions, topic)
    }
  }, [quiz.isComplete])

  return <QuizScreen quiz={quiz} />
}
```

---

### Major (should fix before ship — blocks pass)

None identified.

---

### Minor (recommended improvements — does not block pass)

- **Issue:** `TOTAL_QUESTIONS = 20` is defined as a constant in `QuizScreen.jsx` (line 7) and separately as `QUESTIONS_PER_SESSION = 20` in `quizEngine.js` (line 1). Two sources of truth for the same value.
- **Location:** `src/components/quiz/QuizScreen.jsx` line 7, `src/utils/quizEngine.js` line 1
- **Risk:** If the session length is ever changed in `quizEngine.js`, `QuizScreen.jsx` will silently show the wrong total in the progress indicator. Low risk in v1 but worth fixing.
- **Suggested fix:** Export `QUESTIONS_PER_SESSION` from `quizEngine.js` and import it in `QuizScreen.jsx`.

---

- **Issue:** `onChooseTopic` is destructured as a prop in `QuizWrapper` (line 19) but never used inside that component. It is accepted and then silently discarded.
- **Location:** `src/App.jsx`, line 19
- **Risk:** Dead prop — no functional impact, but creates a misleading function signature. A future developer reading the code would expect it to be wired up somewhere inside `QuizWrapper`.
- **Suggested fix:** Remove `onChooseTopic` from `QuizWrapper`'s prop destructuring. It is correctly passed directly to `QuizSummary` from `App` and does not need to pass through `QuizWrapper`.

---

- **Issue:** In `QuizOptions.jsx` (line 24), the `onClick` handler guards with `!isAnswered && onSelect(option)` while the button also has `disabled={isAnswered}`. The guard is redundant — a disabled button cannot fire click events.
- **Location:** `src/components/quiz/QuizOptions.jsx`, line 24
- **Risk:** None — purely redundant code. No functional impact.
- **Suggested fix:** Simplify to `onClick={() => onSelect(option)}` and rely on the `disabled` prop alone.

---

## User Story Coverage

| Story # | Description | Status | Notes |
|---|---|---|---|
| #1 | Visual Circle of Fifths always visible | ✅ Complete | SVG renders in left column on desktop, top on mobile. All 12 majors, minors, and counts labelled. |
| #2 | Quiz on key signatures | ✅ Complete | 26 questions in `key-signatures` topic. Feedback shown immediately. |
| #3 | Quiz on sharps/flats count | ✅ Complete | 26 questions in `sharps-flats-count` topic. |
| #4 | Quiz on relative minors | ✅ Complete | 24 questions in `relative-minors` topic. |
| #5 | Structured learning path | ✅ Complete | 4 topics in recommended order, user can select freely. Path visible on home screen. |
| #6 | Session score summary | ✅ Complete | Score (X/20), percentage, correct/incorrect breakdown all shown. Appears after question 20. |

---

## Architecture Conformance

Folder structure matches `docs/architecture.md` exactly. Data flow matches the approved design. No undocumented external dependencies introduced. `.env.example` is current (empty, as expected for v1). No React Router introduced — 3 views managed via `useState` as specified.

One noted deviation: `QuizScreen.jsx` was introduced as a composition wrapper component not explicitly listed in `architecture.md`'s component map, but this was logged as an approved implementation decision in `docs/build-log.md` and is consistent with the architecture's intent.

---

## What Agent 4 Did Well

1. **Question bank quality:** 112 questions across 4 topics, each with an accurate theory explanation. The distractors are pedagogically sound — nearby keys on the circle of fifths rather than random wrong answers. This is exactly what the learning goal requires.

2. **`useQuiz` hook design:** All quiz session state is cleanly encapsulated in a single custom hook. `getAnswerState()` returning a named string state (`'correct'`, `'incorrect'`, `'disabled'`) rather than booleans makes `QuizOptions.jsx` clean and easy to extend. The separation between hook logic and rendering is well done.

3. **SVG implementation:** The Circle of Fifths SVG is built with programmatic geometry (polar coordinates, `viewBox`, `width: 100%`) rather than hardcoded positions, making it scale correctly at all breakpoints without media query hacks.
