// Diatonic harmonization definitions for major and natural minor keys.
//
// Designed so 7th chords, borrowed chords, and secondary dominants can be
// added later without rearchitecting:
//   * 7th chords → push a new HarmonyDefinition with degrees like
//     ['Imaj7', 'ii7', ...] and qualities like ['major7', 'minor7', ...].
//     The ChordQuality union and QUALITY_SUFFIX map extend to cover them.
//   * Borrowed chords / secondary dominants → live as separate sibling
//     modules that import HARMONY_TYPES + buildChord from here. Data layer
//     is shared; the question logic is per-module.

import { spellScale, getScaleById } from './scale-data'

export type HarmonyKeyType = 'major' | 'naturalMinor'

export type ChordQuality = 'major' | 'minor' | 'diminished'

export interface HarmonyDefinition {
  keyType: HarmonyKeyType
  scaleId: string // links to ScaleDefinition.id in scale-data.ts
  degrees: string[] // 7-element roman numeral array, indexed by scale degree
  qualities: ChordQuality[] // 7-element parallel array
}

export const HARMONY_TYPES: HarmonyDefinition[] = [
  {
    keyType: 'major',
    scaleId: 'major',
    degrees: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'],
    qualities: ['major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished'],
  },
  {
    keyType: 'naturalMinor',
    scaleId: 'naturalMinor',
    degrees: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'],
    qualities: ['minor', 'diminished', 'major', 'minor', 'minor', 'major', 'major'],
  },
]

export const QUALITY_SUFFIX: Record<ChordQuality, string> = {
  major: '',
  minor: 'm',
  diminished: '°',
}

export const KEY_TYPE_LABEL: Record<HarmonyKeyType, string> = {
  major: 'major',
  naturalMinor: 'natural minor',
}

/**
 * Build the chord at degree index `degIdx` (0-6) of `key` under `harmony`.
 * Spells the underlying scale via scale-data's spellScale so each chord
 * uses the correct enharmonic letter (e.g. F# in G major, not Gb).
 */
export function buildChord(
  key: string,
  harmony: HarmonyDefinition,
  degIdx: number,
): string {
  const scale = getScaleById(harmony.scaleId)
  if (!scale) throw new Error(`Unknown scale id: ${harmony.scaleId}`)
  const notes = spellScale(key, scale)
  return notes[degIdx] + QUALITY_SUFFIX[harmony.qualities[degIdx]]
}

export function getHarmonyByType(keyType: HarmonyKeyType): HarmonyDefinition | undefined {
  return HARMONY_TYPES.find((h) => h.keyType === keyType)
}
