import type { QuizModule, Question } from '../types'
import { KEY_CHORDS, DEGREES, QUALITIES } from '../theory-data'

const DEEP_DIVE = `
  <h4>How to Find Any Chord in Any Key</h4>
  <p>Every major key produces the same quality pattern: <strong>I(maj) ii(min) iii(min) IV(maj) V(maj) vi(min)</strong>. This comes directly from the major scale — stack thirds on each scale degree and the quality falls out automatically.</p>
  <p>You don't need to memorize all 84 chords (12 keys × 7 degrees). You need to memorize the pattern once, and know the scale. If you know A major scale (A B C# D E F# G#), the ii chord is built on B = Bm, the IV is built on D = D major, the V is on E = E major. The pattern does the work.</p>
  <div class="guitar-tip">Quick field method: root note of the chord = scale degree. Major scale degrees 1, 4, 5 = major chords. Degrees 2, 3, 6 = minor chords. You already know the major scale shapes on guitar — map the degrees to those positions.</div>`

const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5)
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

const validKeys = Object.keys(KEY_CHORDS)

function generate(): Question {
  const key = pick(validKeys)
  const degIdx = Math.floor(Math.random() * 6)
  const degree = DEGREES[degIdx]
  const chord = KEY_CHORDS[key][degIdx]
  const quality = QUALITIES[degIdx]

  const questions = [
    `In <strong>${key} major</strong>, what is the <strong>${degree}</strong> chord?`,
    `<strong>${key} major</strong> — name the chord on scale degree <strong>${degree}</strong>.`,
    `You're in <strong>${key} major</strong>. Bandmate calls "<strong>${degree}</strong>." What do you play?`,
    `What chord does <strong>${degree}</strong> represent in <strong>${key} major</strong>?`,
  ]

  const explanation = `The ${degree} in ${key} major is always <strong>${quality}</strong>. Pattern: I(maj) ii(min) iii(min) IV(maj) V(maj) vi(min). ${degree} of ${key} = <strong>${chord}</strong>.`

  const otherChords = shuffle(validKeys.filter((k) => k !== key))
    .map((k) => KEY_CHORDS[k][degIdx])
    .filter((c) => c !== chord)
    .slice(0, 3)

  return {
    type: 'chordName',
    conceptKey: `chordName:${key}:${degree}`,
    modeBadge: 'Chord Name',
    modeClass: 'chords',
    answer: chord,
    options: shuffle([chord, ...otherChords]),
    questionText: pick(questions),
    explanation,
  }
}

function deepDive(): string {
  return DEEP_DIVE
}

export const chordNameModule: QuizModule = {
  id: 'chordName',
  label: 'Chord Name',
  generate,
  deepDive,
}
