# CLAUDE.md — Music Theory Trainer

> **Living document.** When you change anything in the "Architecture" or "Conventions" sections, update this file in the same PR. See [Living-doc rules](#living-doc-rules) at the bottom.

---

## What this app is

Next.js 14 (App Router) static SPA deployed on Vercel. Drills music theory via 8 quiz types (key signatures, chords, Roman numerals, scales, harmonization). Tracks per-concept mastery with a Leitner-box adaptive engine in localStorage; surfaces weak topics on a dashboard. **No backend, no accounts, no analytics.** Theming is light + dark via class-on-html. Deep dives include per-instrument tips (guitar / piano / none).

---

## Tech stack

- **Next.js 14** App Router, all client-side rendering (`dynamic({ ssr: false })` on the entry component because the engine reads localStorage at first paint).
- **TypeScript** strict mode.
- **Tailwind CSS** for utility classes; tokens point at CSS custom properties in `app/globals.css` so light/dark themes are a single class swap on `<html>`.
- **Fonts**: Inter (body) + Playfair Display (headings) + IBM Plex Mono (note names) via `next/font/google` (self-hosted at build time).
- **No router lib** — `AppShell` toggles between Dashboard and QuizApp via React state.
- **Deploy**: Vercel, security headers via `vercel.json` (CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy).

---

## File structure

```
app/
  layout.tsx          ← root <html>, font loading, FOUC-prevention script
  page.tsx            ← dynamic import of AppShell with ssr:false
  globals.css         ← CSS custom properties for both themes + tip-callout styles

components/
  AppShell.tsx        ← top-level Dashboard ↔ QuizApp toggle
  Dashboard.tsx       ← overall stats, module grid, Weakest Topics, start CTAs
  QuizApp.tsx         ← per-quiz state (current question, scores, mode/filter)
  QuizCard.tsx        ← question + options + answered "Why" panel
  DeepDive.tsx        ← collapsible explainer; renders sanitized HTML
  ModeSelector.tsx    ← chip row to switch quiz types
  Scoreboard.tsx      ← correct/wrong/streak/total counters
  StreakBar.tsx       ← streak progress bar (out of 10)
  CircleOfFifths.tsx  ← reference SVG (uses CSS-var fills for theming)
  ThemeToggle.tsx     ← sun/moon button, top-right
  InstrumentSelector.tsx ← guitar/piano/none dropdown, top-right

lib/
  types.ts            ← Question, QuizModule, Instrument types
  theory-data.ts      ← static data: CIRCLE_KEYS, KEY_SIGS, KEY_CHORDS, DEGREES, FUNCTIONS, etc.
  scale-data.ts       ← SCALE_TYPES + spelling utilities
  harmony-data.ts     ← HARMONY_TYPES (major / natural minor diatonic patterns)
  quiz-engine.ts      ← MODULE_REGISTRY, generateQuestion, getDeepDive
  adaptive.ts         ← Leitner-box state, recordResult, weakModules, moduleTrend
  theme.ts            ← useTheme hook (localStorage key: mtt_theme)
  instrument.ts       ← useInstrument hook + same-tab pub/sub (key: mtt_instrument)
  modules/
    sig-to-key.ts
    key-to-sig.ts
    circle-fifths.ts
    chord-name.ts
    roman-numeral.ts
    chord-function.ts
    scale-id.ts
    harmonize.ts
```

---

## Architecture

### Module registry pattern

Each quiz type lives in `lib/modules/*.ts` and exports a `QuizModule`:

```ts
{
  id: string,                                              // unique, used as conceptKey prefix
  label: string,                                           // shown in UI
  generate: () => Question,                                // produces a fresh question
  deepDive: (q: Question) => string,                      // narrative HTML for the "Why" panel
  describe?: (conceptKey: string) => string | null,       // human label for a concept
  getTip?: (q: Question, instrument: Instrument) => string | null,  // per-instrument callout
}
```

`lib/quiz-engine.ts` imports every module and adds it to `MODULE_REGISTRY`. Adding a new module is mechanical — see [Adding a new quiz module](#adding-a-new-quiz-module).

### Adaptive engine

`lib/adaptive.ts` persists per-concept Leitner state in localStorage under `mtt_adaptive_v1`:

```ts
{
  cards: Record<conceptKey, { box: 1-5, totalCorrect, totalWrong, lastSeen, moduleId }>,
  sessionHistory: { date: 'YYYY-MM-DD', results: { [moduleId]: { correct, wrong } } }[]
}
```

- `recordResult(conceptKey, moduleId, correct)` is called on every answer; bumps box up on correct, resets to 1 on wrong.
- `generateQuestion()` samples `CANDIDATE_COUNT = 6` (or 24 when `weakOnly`) candidates and picks the highest-priority by Leitner box (1 → 50, 2-3 → 30, unseen → 15, 4-5 → 5).
- `weakModules(state, limit, minAttempts)` aggregates per-concept totals into per-module accuracy, returns lowest-accuracy modules above the attempt threshold.
- `moduleTrend(state, moduleId)` compares recent 7 sessions vs. prior 7, returns `improving | stable | declining | unknown`.

### Theming

Two-layer system:

1. **CSS custom properties** in `app/globals.css`. `:root` holds the light palette; `.dark` overrides with the dark palette. Every color used anywhere lives in this file as a `--token`.
2. **Tailwind tokens** in `tailwind.config.ts` reference those CSS variables (e.g. `bg: 'var(--bg)'`). Use Tailwind classes (`bg-surface`, `text-accent`, `border-border-light`) — do NOT use `bg-[#xxxxxx]` arbitrary hex values.

Theme switch flow:
1. Inline FOUC-prevention script in `app/layout.tsx` reads `localStorage["mtt_theme"]` (or `prefers-color-scheme`) and adds `class="dark"` to `<html>` *before React hydrates*.
2. `useTheme()` hook reads the same value on mount and provides a `toggle()` setter that updates the class and persists to localStorage.
3. `<html suppressHydrationWarning>` to silence React's mismatch warning (intentional divergence).

### Per-instrument tips

Each module's `getTip(question, instrument)` returns an HTML string `<div class="guitar-tip">...</div>` (or `piano-tip`) or `null`. `getDeepDive(question, instrument)` calls the module's `deepDive()` for narrative, then appends the tip. Selector lives next to the theme toggle on Dashboard and QuizApp; persistence via `mtt_instrument` localStorage key.

The hook uses a same-tab pub/sub (small `Set<callback>`) so multiple `useInstrument()` callers (selector + QuizApp) stay in sync without React Context.

### Routing model

There is none in the URL sense. `AppShell` holds a `view: 'dashboard' | 'quiz'` state. `Dashboard.onStartQuiz(config)` switches to quiz; `QuizApp.onHome()` switches back. URL stays `/`. This is intentional — the app is a single-page drill, no shareable deep links needed.

### localStorage keys

| Key | Owner | Schema | Migration |
|---|---|---|---|
| `mtt_adaptive_v1` | `lib/adaptive.ts` | `AdaptiveState` | bump key + write a migrator if shape changes |
| `mtt_theme` | `lib/theme.ts` | `'light' \| 'dark'` | unlikely to change |
| `mtt_instrument` | `lib/instrument.ts` | `'guitar' \| 'piano' \| 'none'` | bump key if values change |

---

## Conventions

- **Read a component file before editing.** Don't assume its current structure from this doc — verify.
- **No new dependencies without explicit approval.** The 3-package tree is a feature.
- **Tailwind-only colors.** Use token classes (`bg-bg`, `text-accent`); arbitrary `bg-[#abc]` should not appear in components. If you need a new color, add a `--token` to `globals.css` and a Tailwind alias.
- **`dangerouslySetInnerHTML` only for developer-authored strings.** If user-provided content ever gets near `questionText` / `explanation` / `deepDive` / tip outputs, sanitize first (DOMPurify) — see DESIGN_V2.md §4.1.
- **Pure functions in `lib/`.** No DOM access, no `window`/`document` references except behind `isBrowser()` guards. Components handle the React state.
- **Types in `lib/types.ts`.** Don't redeclare `Question`/`QuizModule`/`Instrument` locally.

---

## Recipes

### Adding a new quiz module

1. Create `lib/modules/my-module.ts` exporting a `QuizModule`. The `id` becomes the prefix of every `conceptKey` it produces (e.g. `chordName:C:V`).
2. Implement at minimum `generate()` and `deepDive()`. `describe()` and `getTip()` are optional but recommended (concept labels and instrument tips both rely on them).
3. Register it in `lib/quiz-engine.ts`:
   ```ts
   import { myModuleModule } from './modules/my-module'
   const MODULE_REGISTRY: QuizModule[] = [..., myModuleModule]
   ```
4. The mode selector and dashboard auto-discover it. No further wiring required.
5. **Update `Recent shipped` below** in this file.

### Adding a new instrument

1. Add the literal to `Instrument` type in `lib/types.ts` (e.g. `'bass'`).
2. Add it to `VALID`, `INSTRUMENT_LABELS`, `INSTRUMENT_ICONS` in `lib/instrument.ts`.
3. Add `BASS_TIPS` lookups and the corresponding `getTip` branch to every module that has tips. (8 modules; some have multi-variant tips.)
4. Add `.bass-tip` CSS in `app/globals.css` (background, border, text, ::before icon prefix) and `--bass-bg`/`--bass-border`/`--bass-text` tokens for both `:root` and `.dark`.
5. Add the option to `ORDER` in `components/InstrumentSelector.tsx` (controls dropdown order).

### Adding a theme color

1. Add the token to both `:root` and `.dark` blocks in `app/globals.css`.
2. Add the Tailwind alias in `tailwind.config.ts` (e.g. `'my-color': 'var(--my-color)'`).
3. Use the Tailwind class (`text-my-color`) in components — never `text-[#xxx]`.

### Bumping the adaptive storage schema

If you change the shape of `ConceptCard` or `SessionEntry`:

1. Bump the key: `mtt_adaptive_v1` → `mtt_adaptive_v2`.
2. In `loadState()`, attempt to read the old key first; if found, migrate the shape, write to the new key, optionally clear the old.
3. **Update the storage table in this file.**

---

## Recent shipped (in chronological order)

- **Adaptive engine + dashboard shell** (initial v2) — Leitner-box state, AppShell view toggle, per-module accuracy cards, scales + harmonize modules.
- **Question content fixes** — IV-chord variant rewording, signature-change language across all 24 circle transitions.
- **Security headers** — CSP / X-Frame-Options / nosniff / Referrer-Policy / Permissions-Policy via `vercel.json`.
- **Light theme + dark toggle** — token-based palette swap, FOUC-prevention script, `--accent-text` for contrast in both modes.
- **Dashboard surfacing** — `describe()` per module, trend arrows on module cards.
- **Instrument tips** — per-module `getTip()` for guitar / piano / none, selector in header.
- **Weakest Topics rollup** — per-module accuracy aggregation for the dashboard's "where to focus" section.

---

## Known limitations / planned

- **No tests.** Adaptive engine math is the riskiest untested code (Leitner transitions, weakModules sort, signatureChangePhrase, moduleTrend window math).
- **No error boundary.** A throw in any module's `deepDive()` crashes the app.
- **`dangerouslySetInnerHTML` unsanitized.** Currently safe (dev-controlled content); fix before adding any user-supplied content.
- **A11y not audited.** Aria labels exist but no full screen-reader / keyboard pass.
- **Mobile not formally tested.** Layouts look responsive but unverified on small viewports.
- **localStorage `mtt_adaptive_v1` has no migration path** if schema changes.
- **`recordResult` is not concurrency-safe.** Two-tab usage can cause writes to overwrite each other.
- **`todayISO()` is UTC**, not local time — minor cosmetic effect on "active days" counts at midnight.
- **No PWA / offline support.** Drill app on a phone screams for offline use; not yet implemented.
- **No observability.** Zero analytics, zero error reporting.

---

## Living-doc rules

**Update this file in the same PR as the code change** if any of the following are true:

- File structure changes (new top-level dir, file moved/renamed/deleted)
- A new `QuizModule` is registered, or one is removed
- A new theme is added (e.g. high-contrast), or a new instrument is added
- The `localStorage` schema or key changes
- A core architectural pattern changes (e.g. switching from class-based to attribute-based theming, replacing the Leitner engine, introducing routing)
- A new section is added to the Dashboard or QuizApp shell
- A "Known limitation" listed above is fixed (move it to "Recent shipped")

If the change is content-only (new question variants, copy edits, new piano-tip prose), no update needed. The doc captures architecture and conventions, not content.

**When in doubt:** if a future Claude (or new contributor) walking in cold would be wrong about the codebase after reading this file as-is, update it.
