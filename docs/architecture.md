# Architecture — Circle of Fifths Trainer
Date: 2026-04-07
Version: 1.0
Based on: project-brief.md v1.1

## System Overview
A fully client-side React application with no backend, no database, and no authentication. The app presents a structured set of flashcard-style quiz sessions drawn from a static question bank. All state is managed in-memory within the React component tree and is reset on page refresh. Deployment is static hosting via Vercel.

## Component Map

| Component | Responsibility |
|---|---|
| `App.jsx` | Root component. Manages top-level view state: home / quiz / summary. No router needed. |
| `Layout.jsx` | Responsive wrapper. Consistent max-width, padding, centering across breakpoints. |
| `Header.jsx` | App title and current topic label. |
| `CircleOfFifths.jsx` | Custom SVG diagram. Displays all 12 major keys, relative minors, and sharp/flat counts. Always visible during an active quiz session. |
| `LearningPath.jsx` | Displays the recommended topic sequence. Allows user to select a topic. Does not enforce order. |
| `QuizCard.jsx` | Renders the current question text and question number (e.g., "Question 7 of 20"). |
| `QuizOptions.jsx` | Renders multiple choice answer buttons. Disabled after selection. |
| `QuizFeedback.jsx` | Shown immediately after answer selection. Indicates correct/incorrect and displays the right answer. |
| `QuizProgress.jsx` | Visual progress indicator (e.g., progress bar or step counter: 7/20). |
| `QuizSummary.jsx` | End-of-session screen. Shows correct count, incorrect count, percentage score, and option to restart or choose a new topic. |
| `useQuiz.js` | Custom hook. Owns all quiz session state: current question index, user answers, score, session complete flag. |
| `quizEngine.js` | Pure utility. Selects and shuffles 20 questions for a given topic. Checks answers. Computes final score. |
| `questions.js` | Static data file. All questions, correct answers, distractor options, and topic tags. |
| `learningPath.js` | Static data file. Ordered array of topic names defining the recommended learning sequence. |

## Data Flow

1. User lands on home screen → `LearningPath.jsx` renders recommended topic order from `learningPath.js`
2. User selects a topic → `quizEngine.js` pulls and shuffles 20 questions for that topic from `questions.js`
3. `useQuiz.js` initialises session state (question index = 0, score = 0, answers = [])
4. `QuizCard.jsx` + `QuizOptions.jsx` render the current question
5. User selects an answer → `useQuiz.js` records answer, `quizEngine.js` checks correctness
6. `QuizFeedback.jsx` displays result immediately (correct/incorrect + correct answer shown)
7. User advances → index increments, next question renders
8. After question 20 → `useQuiz.js` sets session complete → `QuizSummary.jsx` renders
9. No data is written to storage. All state is lost on page refresh or navigation away.

## Tech Stack (Confirmed)

| Technology | Rationale |
|---|---|
| React 18 + Vite | Component-based, fast dev/build cycle, ideal for interactive UI |
| Tailwind CSS v3 | Utility-first styling, consistent responsive design without custom CSS overhead |
| No backend | All logic is client-side; no data persistence required in v1 |
| No React Router | View state (home/quiz/summary) managed with `useState` in `App.jsx`; a router would be over-engineering for 3 views |
| Vercel | Zero-config static hosting for Vite/React; free tier sufficient |

## Folder Structure

```
/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Layout.jsx
│   │   │   └── Header.jsx
│   │   ├── circle/
│   │   │   └── CircleOfFifths.jsx
│   │   ├── quiz/
│   │   │   ├── QuizCard.jsx
│   │   │   ├── QuizOptions.jsx
│   │   │   ├── QuizFeedback.jsx
│   │   │   ├── QuizProgress.jsx
│   │   │   └── QuizSummary.jsx
│   │   └── LearningPath.jsx
│   ├── data/
│   │   ├── questions.js
│   │   └── learningPath.js
│   ├── hooks/
│   │   └── useQuiz.js
│   ├── utils/
│   │   └── quizEngine.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── docs/
├── .env.example
├── index.html
├── tailwind.config.js
├── vite.config.js
└── package.json
```

## Environment Variables

None required for v1. The application is fully client-side with no API calls, no authentication, and no external services.

## External Dependencies Requiring Approval

None. All functionality is self-contained. No third-party APIs, no credentials, no external services required.

- **Vercel account** required for deployment — free tier. No credentials stored in repo.

## Technical Risks

1. **Question bank size:** Each topic requires enough unique questions to fill a 20-question session without obvious repetition. If the bank per topic is too small, the same questions will recur within a session. Agent 4 must ensure a minimum of 25–30 unique questions per topic to allow for shuffling variety.

2. **Circle of Fifths SVG complexity:** Building a fully labelled, accurate SVG diagram is non-trivial. Scope is kept tight by treating it as a static reference (no interactivity, no highlighting) in v1. Agent 4 should not add interactive SVG features without developer approval.

## Architecture Decisions Log

1. **No React Router** — Three views (home, quiz, summary) are managed with `useState` in `App.jsx`. Adding a router for 3 views would introduce unnecessary complexity.

2. **Custom SVG for Circle of Fifths** — No third-party diagram library used. A custom SVG component gives full control over labels, layout, and responsive scaling while keeping dependencies minimal.

3. **Static JS data files** — Questions and learning path stored as plain JS arrays/objects, not fetched from an API. Appropriate for this scope; easy to extend in a future version.

4. **No state persistence** — `localStorage` or session storage not used in v1. Matches the out-of-scope decision on progress tracking. Can be added in v2 without architectural changes.
