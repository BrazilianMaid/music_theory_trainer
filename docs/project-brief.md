# Project Brief — Circle of Fifths Trainer
Date: 2026-04-07
Version: 1.1

## Problem Statement
Musicians who play by ear or feel lack the music theory foundation to confidently read and interpret sheet music. Specifically, they struggle with key signatures, understanding sharps and flats, and seeing how chord relationships connect via the Circle of Fifths. Existing tools either cover too much ground (full theory courses) or offer poor UX that doesn't serve this specific learner. This product solves that with a tighter focus and a more deliberate learning path.

## User Definition
A beginner-to-intermediate musician who can already play an instrument by ear or feel but lacks formal theory knowledge and wants to build confidence specifically around key signatures, sharps/flats, and the Circle of Fifths.

## Success Metrics
1. After 10 minutes of use, a user can identify a key signature and its associated number of sharps or flats.
2. After 10 minutes of use, a user can identify the relative minor of a given major key.
3. A user completes a full quiz session without abandoning it mid-way.
4. A user can correctly answer Circle of Fifths flashcard questions at an improving rate within a single session.

## Product Scope — MVP
- Visual Circle of Fifths reference (always accessible during quizzing)
- Flashcard-style quizzes covering:
  - Key signatures (identify the key from sharps/flats count)
  - Sharps/flats count (given a key, how many sharps or flats?)
  - Relative minors (given a major key, what is its relative minor?)
  - Basic chord relationships (tonic, dominant, subdominant)
- A structured learning path — concepts introduced in a defined order, building on each other
- Immediate per-answer feedback (correct/incorrect + the right answer shown)
- Session score summary at the end of each quiz

## Out of Scope — v1
- Ear training
- Audio playback of any kind
- Composition tools
- User accounts or authentication
- Progress tracking or history across sessions
- Any music theory topics beyond the Circle of Fifths
- Mobile-native app (web only)

## User Stories

1. **As a musician, I want to see a visual Circle of Fifths** so that I can understand how keys relate to each other spatially.
   - Acceptance criteria: The Circle of Fifths diagram is visible and legible during quiz sessions.
   - Acceptance criteria: The diagram labels all 12 major keys and their relative minors.

2. **As a musician, I want to be quizzed on key signatures** so that I can practice identifying them quickly.
   - Acceptance criteria: Given a number of sharps or flats, I can select the correct key from multiple choice options.
   - Acceptance criteria: I receive immediate feedback after each answer.

3. **As a musician, I want to be quizzed on the number of sharps/flats in a key** so that I can read key signatures on sheet music.
   - Acceptance criteria: Given a key name, I can identify how many sharps or flats it contains.
   - Acceptance criteria: I receive immediate feedback after each answer.

4. **As a musician, I want to be quizzed on relative minors** so that I can understand the relationship between major and minor keys.
   - Acceptance criteria: Given a major key, I can identify its relative minor.
   - Acceptance criteria: I receive immediate feedback after each answer.

5. **As a musician, I want to follow a structured learning path** so that concepts build on each other rather than being presented randomly.
   - Acceptance criteria: Quiz topics are introduced in a defined sequence (e.g., sharps/flats count before key identification).
   - Acceptance criteria: The current position in the learning path is visible to the user.

6. **As a musician, I want a score summary at the end of each session** so that I can see how I performed.
   - Acceptance criteria: Summary shows number correct, number incorrect, and percentage score.
   - Acceptance criteria: Summary is shown after question 20 (final question of a session).

## Recommended Tech Stack
- **React (Vite):** Component-based UI, fast development cycle, well-suited for interactive flashcard logic.
- **Tailwind CSS:** Consistent, rapid styling without a heavy design system overhead.
- **No backend:** All quiz logic is client-side. No database needed for v1 (no accounts, no persistence).
- **Vercel:** Static hosting, zero-config deployment for Vite/React.

## External Dependencies
- None required for v1. No third-party APIs, no authentication providers, no external services.
- Vercel account required for deployment (free tier sufficient).

## Open Questions
All resolved:
1. **Session length:** 20 questions per session.
2. **Learning path:** Recommended sequence — not enforced. Users can navigate freely but a suggested order is presented.
3. **Platform:** Equal responsive treatment for desktop and mobile.

## Go / No-Go
**Conditional Go.** The brief is well-defined and the scope is appropriate for a v1 build. Ready to hand off to Agent 2 once the three Open Questions above are resolved — they affect component architecture and quiz flow logic, so Agent 2 will need answers before finalizing the design.
