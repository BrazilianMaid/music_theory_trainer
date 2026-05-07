import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  conceptPriority,
  isDue,
  moduleAccuracy,
  moduleTrend,
  overallStats,
  recordResult,
  weakModules,
  type AdaptiveState,
  type ConceptCard,
  type SessionEntry,
} from '../adaptive'

// localStorage stub — vitest's node environment has no DOM, so define a
// minimal in-memory shim that adaptive.ts can use via window.localStorage.
class MemoryStorage implements Storage {
  private store: Map<string, string> = new Map()
  get length(): number { return this.store.size }
  clear(): void { this.store.clear() }
  getItem(key: string): string | null { return this.store.get(key) ?? null }
  key(i: number): string | null { return Array.from(this.store.keys())[i] ?? null }
  removeItem(key: string): void { this.store.delete(key) }
  setItem(key: string, value: string): void { this.store.set(key, value) }
}

beforeEach(() => {
  // adaptive.ts checks `typeof window !== 'undefined'` and uses
  // `window.localStorage`. Plant both for each test.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(globalThis as any).window = { localStorage: new MemoryStorage() }
})

function makeCard(overrides: Partial<ConceptCard> = {}): ConceptCard {
  return {
    conceptKey: 'fifths:C:up',
    moduleId: 'fifths',
    box: 1,
    lastSeen: 0,
    totalCorrect: 0,
    totalWrong: 0,
    ...overrides,
  }
}

function makeState(cards: ConceptCard[] = [], sessionHistory: SessionEntry[] = []): AdaptiveState {
  return {
    cards: Object.fromEntries(cards.map((c) => [c.conceptKey, c])),
    sessionHistory,
  }
}

describe('recordResult', () => {
  it('creates a fresh card on first answer (correct)', () => {
    const state = recordResult('fifths:C:up', 'fifths', true)
    const card = state.cards['fifths:C:up']
    expect(card.box).toBe(2) // box 1 → 2 on correct
    expect(card.totalCorrect).toBe(1)
    expect(card.totalWrong).toBe(0)
    expect(card.moduleId).toBe('fifths')
    expect(card.lastSeen).toBeGreaterThan(0)
  })

  it('creates a fresh card on first answer (wrong)', () => {
    const state = recordResult('fifths:C:up', 'fifths', false)
    const card = state.cards['fifths:C:up']
    expect(card.box).toBe(1) // wrong always resets to 1
    expect(card.totalCorrect).toBe(0)
    expect(card.totalWrong).toBe(1)
  })

  it('promotes an existing box-1 card on correct', () => {
    recordResult('chordName:C:V', 'chordName', false) // box stays 1
    const after = recordResult('chordName:C:V', 'chordName', true)
    expect(after.cards['chordName:C:V'].box).toBe(2)
    expect(after.cards['chordName:C:V'].totalCorrect).toBe(1)
    expect(after.cards['chordName:C:V'].totalWrong).toBe(1)
  })

  it('clamps box at 5 on consecutive correct answers', () => {
    recordResult('keyToSig:G', 'keyToSig', true) // 1 → 2
    recordResult('keyToSig:G', 'keyToSig', true) // 2 → 3
    recordResult('keyToSig:G', 'keyToSig', true) // 3 → 4
    recordResult('keyToSig:G', 'keyToSig', true) // 4 → 5
    const state = recordResult('keyToSig:G', 'keyToSig', true) // 5 → 5 (clamped)
    expect(state.cards['keyToSig:G'].box).toBe(5)
    expect(state.cards['keyToSig:G'].totalCorrect).toBe(5)
  })

  it('resets a high-box card to box 1 on wrong', () => {
    recordResult('keyToSig:G', 'keyToSig', true)
    recordResult('keyToSig:G', 'keyToSig', true)
    recordResult('keyToSig:G', 'keyToSig', true) // box 4
    const state = recordResult('keyToSig:G', 'keyToSig', false)
    expect(state.cards['keyToSig:G'].box).toBe(1)
    expect(state.cards['keyToSig:G'].totalWrong).toBe(1)
  })

  it('updates session history for the answered module', () => {
    recordResult('fifths:C:up', 'fifths', true)
    const state = recordResult('fifths:C:up', 'fifths', false)
    expect(state.sessionHistory).toHaveLength(1)
    expect(state.sessionHistory[0].results.fifths).toEqual({ correct: 1, wrong: 1 })
  })
})

describe('conceptPriority', () => {
  const NOW = 1_700_000_000_000
  const HOUR = 60 * 60 * 1000
  const DAY = 24 * HOUR

  it('returns the unseen tier for an unrecorded concept', () => {
    const state = makeState()
    expect(conceptPriority('chordName:C:V', state, NOW)).toBe(15)
  })

  it('returns the box-1 tier for a due box-1 card', () => {
    const state = makeState([makeCard({ box: 1, lastSeen: NOW - HOUR })])
    expect(conceptPriority('fifths:C:up', state, NOW)).toBe(50)
  })

  it('returns 0 when a higher box card is not yet due', () => {
    const state = makeState([makeCard({ box: 3, lastSeen: NOW - 1000 })])
    expect(conceptPriority('fifths:C:up', state, NOW)).toBe(0)
  })

  it('returns the box-2/3 tier when due', () => {
    const state = makeState([makeCard({ box: 3, lastSeen: NOW - 2 * DAY })])
    expect(conceptPriority('fifths:C:up', state, NOW)).toBe(30)
  })

  it('returns the box-4/5 tier when due (mastered material)', () => {
    const state = makeState([makeCard({ box: 5, lastSeen: NOW - 30 * DAY })])
    expect(conceptPriority('fifths:C:up', state, NOW)).toBe(5)
  })
})

describe('isDue', () => {
  const NOW = 1_700_000_000_000
  it('always reports box-1 as due', () => {
    expect(isDue(makeCard({ box: 1, lastSeen: NOW }), NOW)).toBe(true)
  })

  it('reports box-2 as not due before its 4-hour interval', () => {
    expect(isDue(makeCard({ box: 2, lastSeen: NOW - 1000 }), NOW)).toBe(false)
  })

  it('reports box-2 as due after its 4-hour interval', () => {
    expect(isDue(makeCard({ box: 2, lastSeen: NOW - 5 * 60 * 60 * 1000 }), NOW)).toBe(true)
  })
})

describe('weakModules', () => {
  it('returns empty array when no modules meet minAttempts', () => {
    const state = makeState([
      makeCard({ conceptKey: 'fifths:C:up', moduleId: 'fifths', totalCorrect: 0, totalWrong: 1 }),
    ])
    expect(weakModules(state, 5, 3)).toHaveLength(0)
  })

  it('aggregates per-concept totals into per-module stats', () => {
    const state = makeState([
      makeCard({ conceptKey: 'chordName:C:V', moduleId: 'chordName', totalCorrect: 1, totalWrong: 2 }),
      makeCard({ conceptKey: 'chordName:F:ii', moduleId: 'chordName', totalCorrect: 1, totalWrong: 1 }),
    ])
    const result = weakModules(state, 5, 3)
    expect(result).toHaveLength(1)
    expect(result[0].moduleId).toBe('chordName')
    expect(result[0].totalCorrect).toBe(2)
    expect(result[0].totalWrong).toBe(3)
    expect(result[0].totalAttempts).toBe(5)
    expect(result[0].accuracy).toBeCloseTo(0.4)
  })

  it('sorts by accuracy ascending, ties broken by totalAttempts descending', () => {
    const state = makeState([
      // fifths: 0% accuracy, 4 attempts
      makeCard({ conceptKey: 'fifths:C:up', moduleId: 'fifths', totalCorrect: 0, totalWrong: 4 }),
      // chordName: 33% accuracy, 6 attempts
      makeCard({ conceptKey: 'chordName:C:V', moduleId: 'chordName', totalCorrect: 2, totalWrong: 4 }),
      // sigToKey: 50% accuracy, 4 attempts
      makeCard({ conceptKey: 'sigToKey:G', moduleId: 'sigToKey', totalCorrect: 2, totalWrong: 2 }),
      // keyToSig: 50% accuracy, 8 attempts (same accuracy, more data → ranks higher in weakness)
      makeCard({ conceptKey: 'keyToSig:G', moduleId: 'keyToSig', totalCorrect: 4, totalWrong: 4 }),
    ])
    const result = weakModules(state, 4, 3)
    expect(result.map((r) => r.moduleId)).toEqual(['fifths', 'chordName', 'keyToSig', 'sigToKey'])
  })

  it('honors limit parameter', () => {
    const state = makeState([
      makeCard({ conceptKey: 'a:1', moduleId: 'a', totalCorrect: 0, totalWrong: 5 }),
      makeCard({ conceptKey: 'b:1', moduleId: 'b', totalCorrect: 1, totalWrong: 5 }),
      makeCard({ conceptKey: 'c:1', moduleId: 'c', totalCorrect: 2, totalWrong: 5 }),
      makeCard({ conceptKey: 'd:1', moduleId: 'd', totalCorrect: 3, totalWrong: 5 }),
    ])
    const result = weakModules(state, 2, 3)
    expect(result).toHaveLength(2)
    expect(result.map((r) => r.moduleId)).toEqual(['a', 'b'])
  })

  it('excludes modules below minAttempts even if their accuracy is the lowest', () => {
    const state = makeState([
      // 0% accuracy but only 2 attempts — must be excluded
      makeCard({ conceptKey: 'fifths:C:up', moduleId: 'fifths', totalCorrect: 0, totalWrong: 2 }),
      // 50% accuracy, 4 attempts — included
      makeCard({ conceptKey: 'chordName:C:V', moduleId: 'chordName', totalCorrect: 2, totalWrong: 2 }),
    ])
    const result = weakModules(state, 5, 3)
    expect(result.map((r) => r.moduleId)).toEqual(['chordName'])
  })
})

describe('moduleTrend', () => {
  function fakeHistory(deltas: { correct: number; wrong: number }[], moduleId = 'm'): SessionEntry[] {
    return deltas.map((d, i) => ({
      date: `2026-01-${String(i + 1).padStart(2, '0')}`,
      results: { [moduleId]: { correct: d.correct, wrong: d.wrong } },
    }))
  }

  it('returns "unknown" when fewer than 14 sessions exist', () => {
    const state = makeState([], fakeHistory(Array(13).fill({ correct: 5, wrong: 5 })))
    expect(moduleTrend(state, 'm')).toBe('unknown')
  })

  it('returns "improving" when recent 7 are >5% better than prior 7', () => {
    // prior 7: 50% (5/10 each), recent 7: 90% (9/10 each)
    const state = makeState(
      [],
      [...fakeHistory(Array(7).fill({ correct: 5, wrong: 5 })),
       ...fakeHistory(Array(7).fill({ correct: 9, wrong: 1 }))]
        .map((e, i) => ({ ...e, date: `2026-01-${String(i + 1).padStart(2, '0')}` })),
    )
    expect(moduleTrend(state, 'm')).toBe('improving')
  })

  it('returns "declining" when recent 7 are >5% worse than prior 7', () => {
    const state = makeState(
      [],
      [...fakeHistory(Array(7).fill({ correct: 9, wrong: 1 })),
       ...fakeHistory(Array(7).fill({ correct: 3, wrong: 7 }))]
        .map((e, i) => ({ ...e, date: `2026-01-${String(i + 1).padStart(2, '0')}` })),
    )
    expect(moduleTrend(state, 'm')).toBe('declining')
  })

  it('returns "stable" when accuracy is within ±5%', () => {
    const state = makeState(
      [],
      fakeHistory(Array(14).fill({ correct: 5, wrong: 5 })),
    )
    expect(moduleTrend(state, 'm')).toBe('stable')
  })

  it('ignores sessions that don\'t include the target module', () => {
    // History entries with no results for the queried module are skipped.
    const state = makeState([], [
      ...fakeHistory(Array(14).fill({ correct: 5, wrong: 5 }), 'other'),
    ])
    expect(moduleTrend(state, 'm')).toBe('unknown')
  })
})

describe('moduleAccuracy', () => {
  it('returns 0 accuracy for a module with no cards', () => {
    const state = makeState()
    const result = moduleAccuracy(state, 'fifths')
    expect(result.accuracy).toBe(0)
    expect(result.totalAttempts).toBe(0)
  })

  it('aggregates correct/wrong across cards in a module', () => {
    const state = makeState([
      makeCard({ conceptKey: 'fifths:A', moduleId: 'fifths', totalCorrect: 3, totalWrong: 1 }),
      makeCard({ conceptKey: 'fifths:B', moduleId: 'fifths', totalCorrect: 2, totalWrong: 2 }),
      // Different module — should be ignored
      makeCard({ conceptKey: 'chordName:X', moduleId: 'chordName', totalCorrect: 99, totalWrong: 0 }),
    ])
    const result = moduleAccuracy(state, 'fifths')
    expect(result.totalCorrect).toBe(5)
    expect(result.totalWrong).toBe(3)
    expect(result.accuracy).toBeCloseTo(0.625)
    expect(result.totalAttempts).toBe(8)
  })
})

describe('overallStats', () => {
  it('returns zeros for empty state', () => {
    const result = overallStats(makeState())
    expect(result.totalAnswered).toBe(0)
    expect(result.accuracy).toBe(0)
    expect(result.activeDays).toBe(0)
  })

  it('counts active days as unique date entries in session history', () => {
    const state = makeState([], [
      { date: '2026-01-01', results: { fifths: { correct: 1, wrong: 0 } } },
      { date: '2026-01-02', results: { fifths: { correct: 1, wrong: 0 } } },
      { date: '2026-01-02', results: { chordName: { correct: 1, wrong: 0 } } }, // duplicate date
    ])
    expect(overallStats(state).activeDays).toBe(2)
  })
})
