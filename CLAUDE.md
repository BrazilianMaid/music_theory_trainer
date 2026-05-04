# CLAUDE.md — Music Theory Trainer

## What This App Does
Next.js app (deployed on Vercel) that teaches the Circle of Fifths via 4 sequential 20-question quizzes. Users progress through a learning path and build key identification skills. No backend.

## File Structure
app/          ← Next.js App Router pages
components/   ← UI components
lib/
  modules/    ← Core logic/data

## Tech Stack
- Next.js (App Router)
- Tailwind CSS
- Deployed: Vercel
- Router: next/navigation (built in — do not install react-router-dom)

## Current Sprint: v2 — Adaptive Engine + Dashboard (DESIGN_V2.md)

### Phase 1 — Adaptive Engine + Dashboard Shell  [in progress]
- `lib/adaptive.ts` — Leitner box state in localStorage (key `mtt_adaptive_v1`)
- `Question.conceptKey` drives per-concept weighting in `generateQuestion()`
- `AppShell.tsx` toggles between Dashboard and Quiz views (no router)
- `Dashboard.tsx` shows overall stats + per-module accuracy cards; clicking a card starts a focused quiz
- Home button on `QuizApp` returns to the dashboard without a page reload — solves prior Task 1
- Task 2 (Circle of Fifths show/hide toggle) is already implemented as the collapsible reference panel — done

### Phase 2+ (later)
- Scales module (`lib/modules/scale-id.ts`)
- Harmony module (`lib/modules/harmonize.ts`)
- Trend indicators + weakest-concepts list on dashboard
- ARIA pass + sanitize `dangerouslySetInnerHTML`

## Rules
- No new features beyond current sprint tasks
- Read a component file before editing it — do not assume its structure
- Do not modify quiz question data unless explicitly instructed
- Do not install new dependencies without explicit developer approval
- If anything is unclear, stop and ask — do not assume