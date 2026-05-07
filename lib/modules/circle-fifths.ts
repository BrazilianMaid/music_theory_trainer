import type { QuizModule, Question, Instrument } from '../types'
import { CIRCLE_KEYS, KEY_SIGS } from '../theory-data'

type Dir = 'up' | 'down'

const DEEP_DIVES: Record<Dir, string> = {
  up: `
    <h4>What a Perfect Fifth Actually Is</h4>
    <p>A perfect fifth is 7 semitones — 7 half-steps. The V chord of any key is a fifth above the root. Going clockwise on the circle is literally moving to the V chord's key. This is why keys that are "close" on the circle share many chords — G major and D major differ by only one note (F vs F#).</p>
    <p>Each clockwise step on the circle <em>is</em> a V→I relationship, which is why the circle is the single most useful diagram in tonal music: it maps the strongest chord-resolution pull there is.</p>`,

  down: `
    <h4>Moving Counter-Clockwise — The Subdominant Direction</h4>
    <p>Going counter-clockwise (down a fifth) gives you the IV chord's key. This direction adds flats and moves toward "flatter," warmer-sounding territory. Songs that modulate counter-clockwise often feel like they're settling or broadening — think of a gospel outro or a rock song going to the IV for the big finish.</p>
    <p>The IV relationship is so fundamental that many songs never leave I and IV — the whole song just toggles between home and one step counter-clockwise. Countless blues songs are essentially I → IV → I with a V turnaround.</p>`,
}

const GUITAR_TIPS: Record<Dir, string> = {
  up: `Barre chord shortcut: the V chord of any key is the same chord shape, 2 frets up. A major → E major shape at the 7th fret = E major. E's V chord is B — barre at the 7th fret on the A string. The circle lives in your barre chord hand.`,
  down: `In any key, your IV chord is the chord whose root is on the same string one string down, same fret. G major's IV is C — and C barre at the 3rd fret is one string below G at the 3rd fret. The geometry of the fretboard mirrors the circle.`,
}

const PIANO_TIPS: Record<Dir, string> = {
  up: `Going clockwise on the circle is moving the root up 7 semitones (a perfect fifth). On piano, count up 7 keys (white and black combined) — C→G, G→D, D→A. Each step adds one sharp to the key signature, and that new sharp is always a half-step below the new tonic. Once you can count 7 in your head, the entire clockwise circle is just an exercise in arithmetic across the keyboard.`,
  down: `Going counter-clockwise on the circle is moving the root down 7 semitones (or equivalently up 5). On piano: C→F, F→Bb, Bb→Eb. Each step adds one flat. Notice that the flat keys cluster around the same set of black keys — once your hand learns the shape of a flat-key tonic, the next flat key counter-clockwise just shifts by 5 keys.`,
}

const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5)
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

function signatureChangePhrase(from: string, to: string): string {
  const f = KEY_SIGS[from]
  const t = KEY_SIGS[to]
  if (!f || !t) return ''

  if (f.type === t.type || f.type === 'none' || t.type === 'none') {
    if (t.count > f.count) return `adds one ${t.type === 'sharp' ? 'sharp' : 'flat'}`
    if (t.count < f.count) return `removes one ${f.type === 'sharp' ? 'sharp' : 'flat'}`
    return ''
  }

  return 'crosses the enharmonic boundary'
}

function generate(): Question {
  const fromKey = pick(CIRCLE_KEYS)
  const idx = CIRCLE_KEYS.indexOf(fromKey)
  const dir: Dir = Math.random() < 0.5 ? 'up' : 'down'
  const toIdx = dir === 'up' ? (idx + 1) % 12 : (idx + 11) % 12
  const toKey = CIRCLE_KEYS[toIdx]

  const questions =
    dir === 'up'
      ? [
          `Go <strong>clockwise one step</strong> from <strong>${fromKey}</strong> on the Circle of Fifths. What key?`,
          `What is the key a <strong>perfect fifth above ${fromKey}</strong>?`,
          `The <strong>V chord of ${fromKey} major</strong> gives you a new key. What is it?`,
        ]
      : [
          `Go <strong>counter-clockwise one step</strong> from <strong>${fromKey}</strong>. What key?`,
          `What key is a <strong>perfect fifth below ${fromKey}</strong>?`,
          `What key shares its name with the <strong>IV chord of ${fromKey} major</strong>?`,
        ]

  const change = signatureChangePhrase(fromKey, toKey)
  const isBoundary = change === 'crosses the enharmonic boundary'
  const dirWord = dir === 'up' ? 'Clockwise' : 'Counter-clockwise'
  const dirAdverb = dir === 'up' ? 'clockwise' : 'counter-clockwise'
  const degree = dir === 'up' ? 'V' : 'IV'
  const fifthClause = isBoundary
    ? `(${toKey} is enharmonically the same pitch as the ${degree} of ${fromKey}.)`
    : `${toKey} is also the ${degree} chord of ${fromKey}.`
  const explanation = `${dirWord} from ${fromKey} = <strong>${toKey}</strong>. Each step ${dirAdverb} ${change}. ${fifthClause}`

  const wrongs = shuffle(CIRCLE_KEYS.filter((k) => k !== toKey)).slice(0, 3)

  return {
    type: 'fifths',
    conceptKey: `fifths:${fromKey}:${dir}`,
    modeBadge: 'Circle Steps',
    modeClass: '',
    answer: toKey,
    options: shuffle([toKey, ...wrongs]),
    questionText: pick(questions),
    explanation,
    meta: { dir },
  }
}

function deepDive(question: Question): string {
  return question.meta?.dir === 'up' ? DEEP_DIVES.up : DEEP_DIVES.down
}

function describe(conceptKey: string): string | null {
  const m = conceptKey.match(/^fifths:(.+):(up|down)$/)
  if (!m) return null
  const fromKey = m[1]
  const dir = m[2] as 'up' | 'down'
  const idx = CIRCLE_KEYS.indexOf(fromKey)
  if (idx < 0) return `${fromKey} ${dir === 'up' ? 'clockwise' : 'counter-clockwise'}`
  const toIdx = dir === 'up' ? (idx + 1) % 12 : (idx + 11) % 12
  const toKey = CIRCLE_KEYS[toIdx]
  return `${fromKey} → ${toKey} (${dir === 'up' ? 'clockwise' : 'counter-clockwise'})`
}

function getTip(question: Question, instrument: Instrument): string | null {
  const dir = (question.meta?.dir === 'down' ? 'down' : 'up') as Dir
  if (instrument === 'guitar') return `<div class="guitar-tip">${GUITAR_TIPS[dir]}</div>`
  if (instrument === 'piano') return `<div class="piano-tip">${PIANO_TIPS[dir]}</div>`
  return null
}

export const circleFifthsModule: QuizModule = {
  id: 'fifths',
  label: 'Circle Steps',
  generate,
  deepDive,
  describe,
  getTip,
}
