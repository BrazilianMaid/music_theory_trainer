import type { Question, QuizModule } from './types'
import type { AdaptiveState } from './adaptive'
import { conceptPriority } from './adaptive'
import { sigToKeyModule }     from './modules/sig-to-key'
import { keyToSigModule }     from './modules/key-to-sig'
import { circleFifthsModule } from './modules/circle-fifths'
import { chordNameModule }    from './modules/chord-name'
import { romanNumeralModule } from './modules/roman-numeral'
import { chordFunctionModule } from './modules/chord-function'
import { scaleIdModule }      from './modules/scale-id'
import { harmonizeModule }    from './modules/harmonize'

// ── Module registry ────────────────────────────────────────────────────────
// To add a new quiz type: create a file in lib/modules/, then add it here.
const MODULE_REGISTRY: QuizModule[] = [
  sigToKeyModule,
  keyToSigModule,
  circleFifthsModule,
  chordNameModule,
  romanNumeralModule,
  chordFunctionModule,
  scaleIdModule,
  harmonizeModule,
]

export { type Question, type QuizModule }

export const QUIZ_MODES = [
  { id: 'all', label: 'All Types' },
  ...MODULE_REGISTRY.map((m) => ({ id: m.id, label: m.label })),
]

export interface QuestionFilter {
  weakOnly?: boolean
  moduleIds?: string[]
}

// ── Engine ─────────────────────────────────────────────────────────────────

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

const CANDIDATE_COUNT = 6

function pickModule(mode: string, recentTypes: string[], filter?: QuestionFilter): QuizModule {
  let pool = mode === 'all'
    ? MODULE_REGISTRY.map((m) => m.id)
    : [mode]

  if (filter?.moduleIds && filter.moduleIds.length > 0) {
    pool = pool.filter((id) => filter.moduleIds!.includes(id))
  }
  if (pool.length === 0) {
    pool = MODULE_REGISTRY.map((m) => m.id)
  }

  if (pool.length > 1 && recentTypes.length >= 2) {
    const last2 = recentTypes.slice(-2)
    if (last2[0] === last2[1]) {
      const filtered = pool.filter((id) => id !== last2[0])
      if (filtered.length > 0) pool = filtered
    }
  }

  const chosenId = pick(pool)
  return MODULE_REGISTRY.find((m) => m.id === chosenId)!
}

/**
 * Generate a question for the given mode. The adaptive state biases candidate
 * selection toward concepts the user has been getting wrong; if no adaptive
 * state is provided we fall back to plain random (preserves previous behavior).
 *
 * recentTypes is used to avoid the same module appearing twice in a row when
 * the mode is 'all'.
 */
export function generateQuestion(
  mode: string,
  recentTypes: string[],
  adaptive?: AdaptiveState,
  filter?: QuestionFilter,
): Question {
  // No adaptive state — preserve original random behavior.
  if (!adaptive) {
    const mod = pickModule(mode, recentTypes, filter)
    return mod.generate()
  }

  const recentConcepts = new Set(recentTypes.slice(-2))

  // Generate a small pool of candidates and pick the highest-priority one.
  // Each candidate may come from a different module, so the module-level
  // recency rule still applies.
  const candidates: Array<{ q: Question; score: number }> = []
  for (let i = 0; i < CANDIDATE_COUNT; i++) {
    const mod = pickModule(mode, recentTypes, filter)
    const q = mod.generate()
    let score = conceptPriority(q.conceptKey, adaptive)

    if (filter?.weakOnly) {
      const card = adaptive.cards[q.conceptKey]
      if (card && card.box > 2) score = 0
    }

    // Soft anti-repeat: penalize seeing the same concept three times in a row.
    if (recentConcepts.has(q.conceptKey)) score *= 0.25

    candidates.push({ q, score })
  }

  candidates.sort((a, b) => b.score - a.score)

  const top = candidates[0]
  if (top.score > 0) return top.q

  // No due / qualifying concepts — never block the user, just take the first.
  return candidates[0].q
}

/**
 * Delegate deep-dive HTML generation to the module that owns the question type.
 */
export function getDeepDive(question: Question): string {
  const mod = MODULE_REGISTRY.find((m) => m.id === question.type)
  return mod?.deepDive(question) ?? '<p>No deep dive available.</p>'
}
