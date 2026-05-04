import type { QuizModule, Question } from '../types'
import { ALL_KEYS, KEY_SIGS } from '../theory-data'

const DEEP_DIVE = `
  <h4>Memorizing the Key Signatures</h4>
  <p>The fastest path isn't memorizing all 15 separately — it's internalizing the two sequences and the rules. Sharp keys go clockwise (G D A E B F# C#), each adding one sharp. Flat keys go counter-clockwise (F Bb Eb Ab Db Gb Cb), each adding one flat.</p>
  <p>Count your steps from C on the circle to get the number. G is 1 step clockwise = 1 sharp. Bb is 2 steps counter-clockwise = 2 flats. The circle <em>is</em> the answer.</p>
  <div class="guitar-tip">The keys guitarists use most — E, A, D, G, B — are all sharp keys (4, 3, 2, 1, 5 sharps). That's not coincidence: those are the open string pitches, and musicians write in keys that suit their instrument.</div>`

const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5)
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

const sigLabel = (key: string): string => {
  const s = KEY_SIGS[key]
  return s.count === 0 ? 'No sharps or flats' : `${s.count} ${s.type}${s.count > 1 ? 's' : ''}`
}

function generate(): Question {
  const key = pick(ALL_KEYS)
  const sig = KEY_SIGS[key]
  const correct = sigLabel(key)

  const questions = [
    `<strong>${key} major</strong> — what is its key signature?`,
    `You're about to play in <strong>${key} major</strong>. How many sharps or flats?`,
    `Quick: what's the key signature for <strong>${key} major</strong>?`,
  ]

  const explanation =
    sig.count === 0
      ? `C major has no accidentals — it's the natural starting point.`
      : sig.type === 'sharp'
        ? `${key} major has ${sig.count} sharp${sig.count > 1 ? 's' : ''}. Sharp keys clockwise: G(1)→D(2)→A(3)→E(4)→B(5)→F#(6)→C#(7).`
        : `${key} major has ${sig.count} flat${sig.count > 1 ? 's' : ''}. Flat keys counter-clockwise: F(1)→Bb(2)→Eb(3)→Ab(4)→Db(5)→Gb(6)→Cb(7).`

  const wrongs = shuffle(ALL_KEYS.filter((k) => k !== key))
    .slice(0, 3)
    .map(sigLabel)

  return {
    type: 'keyToSig',
    conceptKey: `keyToSig:${key}`,
    modeBadge: 'Key → Sig',
    modeClass: 'reverse',
    answer: correct,
    options: shuffle([correct, ...wrongs]),
    questionText: pick(questions),
    explanation,
  }
}

function deepDive(): string {
  return DEEP_DIVE
}

export const keyToSigModule: QuizModule = {
  id: 'keyToSig',
  label: 'Key → Sig',
  generate,
  deepDive,
}
