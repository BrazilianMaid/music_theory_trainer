// Leitner-box adaptive engine. Persists per-concept mastery in localStorage so
// the engine can weight questions toward weak material across sessions.

export type Box = 1 | 2 | 3 | 4 | 5

export interface ConceptCard {
  conceptKey: string
  moduleId: string
  box: Box
  lastSeen: number
  totalCorrect: number
  totalWrong: number
}

export interface SessionEntry {
  date: string // ISO date "YYYY-MM-DD"
  results: Record<string, { correct: number; wrong: number }>
}

export interface AdaptiveState {
  cards: Record<string, ConceptCard>
  sessionHistory: SessionEntry[]
}

const STORAGE_KEY = 'mtt_adaptive_v1'
const HISTORY_DAYS = 30

export const BOX_INTERVALS_MS: Record<Box, number> = {
  1: 0,
  2: 4 * 60 * 60 * 1000,
  3: 24 * 60 * 60 * 1000,
  4: 3 * 24 * 60 * 60 * 1000,
  5: 7 * 24 * 60 * 60 * 1000,
}

function emptyState(): AdaptiveState {
  return { cards: {}, sessionHistory: [] }
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

function trimHistory(history: SessionEntry[]): SessionEntry[] {
  const cutoff = Date.now() - HISTORY_DAYS * 24 * 60 * 60 * 1000
  return history.filter((entry) => {
    const t = Date.parse(entry.date)
    return Number.isFinite(t) && t >= cutoff
  })
}

export function loadState(): AdaptiveState {
  if (!isBrowser()) return emptyState()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyState()
    const parsed = JSON.parse(raw) as AdaptiveState
    if (!parsed || typeof parsed !== 'object') return emptyState()
    const cards = parsed.cards && typeof parsed.cards === 'object' ? parsed.cards : {}
    const history = Array.isArray(parsed.sessionHistory) ? parsed.sessionHistory : []
    return { cards, sessionHistory: trimHistory(history) }
  } catch {
    return emptyState()
  }
}

export function saveState(state: AdaptiveState): void {
  if (!isBrowser()) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Quota exceeded or storage disabled — fail silently; quiz still works.
  }
}

function newCard(conceptKey: string, moduleId: string): ConceptCard {
  return {
    conceptKey,
    moduleId,
    box: 1,
    lastSeen: 0,
    totalCorrect: 0,
    totalWrong: 0,
  }
}

function updateSessionHistory(
  state: AdaptiveState,
  moduleId: string,
  correct: boolean,
): void {
  const date = todayISO()
  let entry = state.sessionHistory.find((e) => e.date === date)
  if (!entry) {
    entry = { date, results: {} }
    state.sessionHistory.push(entry)
  }
  const bucket = entry.results[moduleId] ?? { correct: 0, wrong: 0 }
  if (correct) bucket.correct++
  else bucket.wrong++
  entry.results[moduleId] = bucket
  state.sessionHistory = trimHistory(state.sessionHistory)
}

export function recordResult(
  conceptKey: string,
  moduleId: string,
  correct: boolean,
): AdaptiveState {
  const state = loadState()
  const existing = state.cards[conceptKey] ?? newCard(conceptKey, moduleId)
  const card: ConceptCard = { ...existing, moduleId }

  if (correct) {
    card.box = Math.min(card.box + 1, 5) as Box
    card.totalCorrect++
  } else {
    card.box = 1
    card.totalWrong++
  }
  card.lastSeen = Date.now()

  state.cards[conceptKey] = card
  updateSessionHistory(state, moduleId, correct)
  saveState(state)
  return state
}

// A card is "due" when enough time has passed since its last review for its
// current box interval. Box-1 cards are always due.
export function isDue(card: ConceptCard, now: number = Date.now()): boolean {
  if (card.box === 1) return true
  return now - card.lastSeen >= BOX_INTERVALS_MS[card.box]
}

export type Tier = 'box1' | 'box2_3' | 'unseen' | 'box4_5'

const TIER_WEIGHTS: Record<Tier, number> = {
  box1: 50,
  box2_3: 30,
  unseen: 15,
  box4_5: 5,
}

// Soft, weighted preference. Returns a score >= 0; higher = more preferred.
export function conceptPriority(
  conceptKey: string,
  state: AdaptiveState,
  now: number = Date.now(),
): number {
  const card = state.cards[conceptKey]
  if (!card) return TIER_WEIGHTS.unseen
  if (!isDue(card, now)) return 0
  if (card.box === 1) return TIER_WEIGHTS.box1
  if (card.box === 2 || card.box === 3) return TIER_WEIGHTS.box2_3
  return TIER_WEIGHTS.box4_5
}

// Stats helpers used by the dashboard.

export interface ModuleAccuracy {
  moduleId: string
  totalCorrect: number
  totalWrong: number
  accuracy: number // 0..1, NaN-safe (returns 0 when no attempts)
  totalAttempts: number
}

export function moduleAccuracy(state: AdaptiveState, moduleId: string): ModuleAccuracy {
  let totalCorrect = 0
  let totalWrong = 0
  for (const card of Object.values(state.cards)) {
    if (card.moduleId !== moduleId) continue
    totalCorrect += card.totalCorrect
    totalWrong += card.totalWrong
  }
  const totalAttempts = totalCorrect + totalWrong
  const accuracy = totalAttempts === 0 ? 0 : totalCorrect / totalAttempts
  return { moduleId, totalCorrect, totalWrong, accuracy, totalAttempts }
}

export interface OverallStats {
  totalAnswered: number
  totalCorrect: number
  accuracy: number
  activeDays: number
}

export function overallStats(state: AdaptiveState): OverallStats {
  let totalCorrect = 0
  let totalWrong = 0
  for (const card of Object.values(state.cards)) {
    totalCorrect += card.totalCorrect
    totalWrong += card.totalWrong
  }
  const totalAnswered = totalCorrect + totalWrong
  const accuracy = totalAnswered === 0 ? 0 : totalCorrect / totalAnswered
  const activeDays = new Set(state.sessionHistory.map((e) => e.date)).size
  return { totalAnswered, totalCorrect, accuracy, activeDays }
}
