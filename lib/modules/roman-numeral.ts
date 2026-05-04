import type { QuizModule, Question } from '../types'
import { KEY_CHORDS, DEGREES, QUALITIES } from '../theory-data'

const DEEP_DIVE = `
  <h4>Why Roman Numerals Are the Real Language of Music</h4>
  <p>Chord names (G, Am, D) are <em>key-specific</em>. Roman numerals (I, vi, V) are <em>universal</em>. A I–vi–IV–V progression sounds identical in every key — same emotional shape, same tension and release, just transposed. This is why musicians communicate in Roman numerals: "it's a I–IV–V in whatever key the singer needs."</p>
  <p>Once you internalize Roman numerals, you can learn a song's <em>structure</em> once and play it in any key. You stop memorizing chord names and start memorizing relationships. That's the difference between a musician who plays songs and one who understands music.</p>
  <div class="guitar-tip">The I–vi–IV–V ("50s progression") is in thousands of songs: "Stand By Me," "Every Breath You Take," "Don't Stop Believin'." Learn the Roman numeral pattern once, play it in the key your band needs. No re-learning required.</div>`

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
    `In <strong>${key} major</strong>, <strong>${chord}</strong> is which Roman numeral?`,
    `You see <strong>${chord}</strong> in a chart in <strong>${key} major</strong>. What scale degree?`,
    `<strong>${key} major</strong> — what Roman numeral is <strong>${chord}</strong>?`,
  ]

  const explanation = `<strong>${chord}</strong> is the <strong>${degree}</strong> in ${key} major — ${quality}. Uppercase = major, lowercase = minor. Roman numerals describe <em>function</em>, not just name.`

  const wrongDegrees = shuffle(DEGREES.filter((d) => d !== degree)).slice(0, 3)

  return {
    type: 'romanNumeral',
    conceptKey: `romanNumeral:${key}:${chord}`,
    modeBadge: 'Roman Numeral',
    modeClass: 'roman',
    answer: degree,
    options: shuffle([degree, ...wrongDegrees]),
    questionText: pick(questions),
    explanation,
  }
}

function deepDive(): string {
  return DEEP_DIVE
}

export const romanNumeralModule: QuizModule = {
  id: 'romanNumeral',
  label: 'Roman Numeral',
  generate,
  deepDive,
}
