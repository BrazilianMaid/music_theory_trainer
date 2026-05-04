// Scale definitions + spelling utilities. Designed so modes, pentatonic, and
// blues can be added later by appending to SCALE_TYPES with the appropriate
// category — quiz modules filter by category to gate which scales appear.

export type ScaleCategory = 'diatonic' | 'pentatonic' | 'blues' | 'mode'

export interface ScaleDefinition {
  id: string
  label: string
  pattern: number[] // semitone offsets from the root, e.g. [0, 2, 4, 5, 7, 9, 11]
  category: ScaleCategory
  description: string // one-line summary used by deep-dive headers
}

export const SCALE_TYPES: ScaleDefinition[] = [
  {
    id: 'major',
    label: 'Major',
    pattern: [0, 2, 4, 5, 7, 9, 11],
    category: 'diatonic',
    description: 'The foundation — W W H W W W H',
  },
  {
    id: 'naturalMinor',
    label: 'Natural Minor',
    pattern: [0, 2, 3, 5, 7, 8, 10],
    category: 'diatonic',
    description: 'The relative minor — W H W W H W W',
  },
  {
    id: 'harmonicMinor',
    label: 'Harmonic Minor',
    pattern: [0, 2, 3, 5, 7, 8, 11],
    category: 'diatonic',
    description: 'Natural minor with a raised 7th — creates the V chord in minor keys',
  },
  {
    id: 'melodicMinor',
    label: 'Melodic Minor',
    pattern: [0, 2, 3, 5, 7, 9, 11],
    category: 'diatonic',
    description: 'Natural minor with raised 6th and 7th ascending',
  },
]

// Roots that produce clean (no double-accidental) spellings for all four
// diatonic scales above. Db is excluded because Db natural minor needs Bbb;
// C# is included as the sharp-side equivalent.
export const SCALE_ROOTS = [
  'C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'F', 'Bb', 'Eb', 'Ab',
]

export const CHROMATIC_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
export const CHROMATIC_FLAT  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const
const LETTER_PITCH: Record<string, number> = {
  C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11,
}

interface ParsedNote {
  letter: string
  semitone: number
}

function parseNote(note: string): ParsedNote {
  const letter = note[0].toUpperCase()
  const accidental = note.slice(1)
  let semitone = LETTER_PITCH[letter]
  for (const ch of accidental) {
    if (ch === '#') semitone += 1
    else if (ch === 'b') semitone -= 1
  }
  semitone = ((semitone % 12) + 12) % 12
  return { letter, semitone }
}

function noteName(letter: string, accidental: number): string {
  if (accidental === 0) return letter
  if (accidental === 1) return letter + '#'
  if (accidental === -1) return letter + 'b'
  if (accidental === 2) return letter + '##'
  if (accidental === -2) return letter + 'bb'
  return letter // unreachable for standard scales
}

/**
 * Spell a scale starting from `root`, using proper letter sequence so each
 * scale degree gets a distinct letter (the conventional spelling). For 7-note
 * scales we walk C-D-E-F-G-A-B and add accidentals to hit the target pitch;
 * for non-7-note scales we fall back to chromatic spelling matching the
 * sharp/flat preference of the root (used for future pentatonic/blues).
 */
export function spellScale(root: string, scale: ScaleDefinition): string[] {
  const { letter: rootLetter, semitone: rootSemitone } = parseNote(root)

  if (scale.pattern.length === 7) {
    const rootLetterIdx = LETTERS.indexOf(rootLetter as typeof LETTERS[number])
    return scale.pattern.map((interval, i) => {
      const targetLetter = LETTERS[(rootLetterIdx + i) % 7]
      const naturalSemitone = LETTER_PITCH[targetLetter]
      const targetSemitone = (rootSemitone + interval) % 12
      let diff = targetSemitone - naturalSemitone
      if (diff > 6) diff -= 12
      if (diff < -6) diff += 12
      return noteName(targetLetter, diff)
    })
  }

  const useFlats = root.includes('b') || root === 'F'
  const chromatic = useFlats ? CHROMATIC_FLAT : CHROMATIC_SHARP
  return scale.pattern.map((interval) => chromatic[(rootSemitone + interval) % 12])
}

export function getScaleById(id: string): ScaleDefinition | undefined {
  return SCALE_TYPES.find((s) => s.id === id)
}
