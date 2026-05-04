import type { QuizModule, Question } from '../types'
import { CIRCLE_KEYS } from '../theory-data'

const DEEP_DIVES = {
  up: `
    <h4>What a Perfect Fifth Actually Is</h4>
    <p>A perfect fifth is 7 semitones — 7 half-steps. On guitar, that's the same note as the open string directly below any fretted note (the reason guitar tuning works). Play the 5th fret of any string and it matches the open string below — that interval is a perfect fifth.</p>
    <p>The V chord of any key is a fifth above the root. Going clockwise on the circle is literally moving to the V chord's key. This is why keys that are "close" on the circle share many chords — G major and D major differ by only one note (F vs F#).</p>
    <div class="guitar-tip">Barre chord shortcut: the V chord of any key is the same chord shape, 2 frets up. A major → E major shape at the 7th fret = E major. E's V chord is B — barre at the 7th fret on the A string. The circle lives in your barre chord hand.</div>`,

  down: `
    <h4>Moving Counter-Clockwise — The Subdominant Direction</h4>
    <p>Going counter-clockwise (down a fifth) gives you the IV chord's key. This direction adds flats and moves toward "flatter," warmer-sounding territory. Songs that modulate counter-clockwise often feel like they're settling or broadening — think of a gospel outro or a rock song going to the IV for the big finish.</p>
    <p>The IV relationship is so fundamental that many songs never leave I and IV — the whole song just toggles between home and one step counter-clockwise. Countless blues songs are essentially I → IV → I with a V turnaround.</p>
    <div class="guitar-tip">In any key, your IV chord is the chord whose root is on the same string one string down, same fret. G major's IV is C — and C barre at the 3rd fret is one string below G at the 3rd fret. The geometry of the fretboard mirrors the circle.</div>`,
}

const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5)
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

function generate(): Question {
  const fromKey = pick(CIRCLE_KEYS)
  const idx = CIRCLE_KEYS.indexOf(fromKey)
  const dir = Math.random() < 0.5 ? 'up' : 'down'
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
          `The <strong>IV chord of ${fromKey} major</strong> — what key does it belong to?`,
        ]

  const explanation =
    dir === 'up'
      ? `Clockwise from ${fromKey} = <strong>${toKey}</strong>. Each step clockwise adds one sharp. ${toKey} is also the V chord of ${fromKey}.`
      : `Counter-clockwise from ${fromKey} = <strong>${toKey}</strong>. Each step counter-clockwise adds one flat. ${toKey} is also the IV chord of ${fromKey}.`

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

export const circleFifthsModule: QuizModule = {
  id: 'fifths',
  label: 'Circle Steps',
  generate,
  deepDive,
}
