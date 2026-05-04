export const CIRCLE_DATA = [
  { major: 'C',      minor: 'Am',      sig: '0'    },
  { major: 'G',      minor: 'Em',      sig: '1♯'   },
  { major: 'D',      minor: 'Bm',      sig: '2♯'   },
  { major: 'A',      minor: 'F♯m',     sig: '3♯'   },
  { major: 'E',      minor: 'C♯m',     sig: '4♯'   },
  { major: 'B',      minor: 'G♯m',     sig: '5♯'   },
  { major: 'F♯/G♭', minor: 'D♯m/E♭m', sig: '6♯/♭' },
  { major: 'D♭',     minor: 'B♭m',     sig: '5♭'   },
  { major: 'A♭',     minor: 'Fm',      sig: '4♭'   },
  { major: 'E♭',     minor: 'Cm',      sig: '3♭'   },
  { major: 'B♭',     minor: 'Gm',      sig: '2♭'   },
  { major: 'F',      minor: 'Dm',      sig: '1♭'   },
]

export const ALL_KEYS = [
  'C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#',
  'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb',
]

export const SHARP_ORDER = ['F#', 'C#', 'G#', 'D#', 'A#', 'E#', 'B#']
export const FLAT_ORDER  = ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'Fb']

export const KEY_SIGS: Record<string, { type: 'none' | 'sharp' | 'flat'; count: number }> = {
  'C':  { type: 'none',  count: 0 },
  'G':  { type: 'sharp', count: 1 },
  'D':  { type: 'sharp', count: 2 },
  'A':  { type: 'sharp', count: 3 },
  'E':  { type: 'sharp', count: 4 },
  'B':  { type: 'sharp', count: 5 },
  'F#': { type: 'sharp', count: 6 },
  'C#': { type: 'sharp', count: 7 },
  'F':  { type: 'flat',  count: 1 },
  'Bb': { type: 'flat',  count: 2 },
  'Eb': { type: 'flat',  count: 3 },
  'Ab': { type: 'flat',  count: 4 },
  'Db': { type: 'flat',  count: 5 },
  'Gb': { type: 'flat',  count: 6 },
  'Cb': { type: 'flat',  count: 7 },
}

export const KEY_CHORDS: Record<string, string[]> = {
  'C':  ['C',  'Dm',  'Em',  'F',  'G',  'Am'],
  'G':  ['G',  'Am',  'Bm',  'C',  'D',  'Em'],
  'D':  ['D',  'Em',  'F#m', 'G',  'A',  'Bm'],
  'A':  ['A',  'Bm',  'C#m', 'D',  'E',  'F#m'],
  'E':  ['E',  'F#m', 'G#m', 'A',  'B',  'C#m'],
  'B':  ['B',  'C#m', 'D#m', 'E',  'F#', 'G#m'],
  'F#': ['F#', 'G#m', 'A#m', 'B',  'C#', 'D#m'],
  'F':  ['F',  'Gm',  'Am',  'Bb', 'C',  'Dm'],
  'Bb': ['Bb', 'Cm',  'Dm',  'Eb', 'F',  'Gm'],
  'Eb': ['Eb', 'Fm',  'Gm',  'Ab', 'Bb', 'Cm'],
  'Ab': ['Ab', 'Bbm', 'Cm',  'Db', 'Eb', 'Fm'],
  'Db': ['Db', 'Ebm', 'Fm',  'Gb', 'Ab', 'Bbm'],
}

export const DEGREES   = ['I', 'ii', 'iii', 'IV', 'V', 'vi']
export const QUALITIES = ['major', 'minor', 'minor', 'major', 'major', 'minor']
export const FUNCTIONS = ['tonic', 'supertonic', 'mediant', 'subdominant', 'dominant', 'submediant']

export const FUNC_DESC: Record<string, string> = {
  tonic:       'home base — the chord the song wants to resolve to',
  supertonic:  'mild tension — often leads to V or vii°',
  mediant:     'color chord — bridges tonic and subdominant areas',
  subdominant: 'pre-dominant — moves away from home before resolving',
  dominant:    'maximum tension — strongly wants to resolve back to I',
  submediant:  'relative minor feel — softer, emotional, often follows I',
}

// 12-key circle (enharmonic Db used instead of C#/F#/Gb for navigation)
export const CIRCLE_KEYS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F']
