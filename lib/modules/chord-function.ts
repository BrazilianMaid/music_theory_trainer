import type { QuizModule, Question, Instrument } from '../types'
import { KEY_CHORDS, DEGREES, FUNCTIONS, FUNC_DESC } from '../theory-data'

const DEEP_DIVES: Record<string, string> = {
  tonic: `
    <h4>The Tonic — Home Base</h4>
    <p>The <strong>I chord</strong> is the tonal center of the key. Every other chord in the key is heard <em>in relation to it</em>. When you land on the I chord, the music feels resolved — like you've arrived home after a journey.</p>
    <p>Think of it as gravitational center. Other chords create tension that pulls <em>toward</em> the I. That's why almost every song ends on the I chord — the ear wants to land there.</p>`,

  dominant: `
    <h4>The Dominant — Maximum Tension</h4>
    <p>The <strong>V chord</strong> is the most harmonically tense chord in the key. It contains a tritone interval (the most dissonant interval in Western music) that <em>desperately wants to resolve</em> to the I chord. This V→I movement is called an <strong>authentic cadence</strong> and it's the single most common chord movement in all of Western music.</p>
    <p>The dominant is also why the Circle of Fifths exists — each clockwise step <em>is</em> a dominant relationship. G is the V of C. D is the V of G. That's literally what the circle maps.</p>`,

  subdominant: `
    <h4>The Subdominant — Away From Home</h4>
    <p>The <strong>IV chord</strong> is the "pre-dominant" — it moves <em>away</em> from the tonic rather than toward it. While V pulls hard back to I, IV creates a softer departure. The classic I → IV movement sounds like the music opening up or lifting.</p>
    <p>The IV is one step <em>counter-clockwise</em> on the Circle of Fifths from the I. That's why it's called "sub" dominant — it's a fifth below, not above. Subdominant → Dominant → Tonic (IV → V → I) is the foundational three-chord progression in all of popular music.</p>`,

  supertonic: `
    <h4>The Supertonic — Mild Tension</h4>
    <p>The <strong>ii chord</strong> is a minor chord built on the second scale degree. It's a <em>pre-dominant</em> chord like IV, but with a more sophisticated, jazz-inflected sound. In the ii → V → I progression (the most common movement in jazz), the ii sets up the dominant which resolves to tonic.</p>
    <p>The ii and IV share two out of three notes — they're closely related and often interchangeable. But ii → V → I sounds <em>smoother</em> than IV → V → I because of how the notes lead into each other (voice leading).</p>`,

  mediant: `
    <h4>The Mediant — The Color Chord</h4>
    <p>The <strong>iii chord</strong> is the least common of the six diatonic chords, which is exactly why it's useful — it sounds surprising and emotional. It sits between the tonic and subdominant areas, which gives it an ambiguous, floating quality.</p>
    <p>The iii shares two notes with the I chord, making it a close relative of the tonic — but its minor quality darkens the sound. It often appears as a passing chord between I and IV, or creates a descending bassline when used as I → iii → IV.</p>`,

  submediant: `
    <h4>The Submediant — The Relative Minor</h4>
    <p>The <strong>vi chord</strong> is the relative minor of the key — it shares <em>all the same notes</em> as the major key but centers on a different root. This is exactly what the inner ring of the Circle of Fifths shows. In C major, the vi chord is Am, and Am is also the tonic of A minor.</p>
    <p>This dual identity is powerful. A song can start in C major, shift emphasis to Am, and suddenly sound minor — without changing a single note. Many songs toggle between a major key and its relative minor. "While My Guitar Gently Weeps," "Stairway to Heaven," countless others.</p>`,
}

const GUITAR_TIPS: Record<string, string> = {
  tonic: `In G major, the I chord is G. Play G → C → D → G and notice how the final G feels like rest. That's tonic function in action.`,
  dominant: `In E major: B chord (V) → E chord (I). Play it. Hear how the B chord feels unfinished, unstable — and how E resolves it completely? That pull is dominant function.`,
  subdominant: `I–IV–V–I in A: A → D → E → A. That's the backbone of nearly every blues and rock song you've played. D is the subdominant, E is the dominant, A is home.`,
  supertonic: `In C major: Dm → G → C (ii → V → I). This is the backbone of thousands of jazz standards and appears constantly in pop — you've heard it without knowing it.`,
  mediant: `In G major: G → Bm → C (I → iii → IV). The Bm creates a smooth stepwise descent in the bass (G → F# → E) that sounds rich and intentional. Listen for this in folk and singer-songwriter music.`,
  submediant: `In G major, the vi is Em — which you know as E minor. Play G major scale noodling, then center your phrases on E instead of G. The whole mood shifts darker without touching a single accidental. That's relative minor.`,
}

const PIANO_TIPS: Record<string, string> = {
  tonic: `On piano, the I chord uses scale degrees 1–3–5 of the major scale. In C major: C–E–G (all white keys). Play I → IV → V → I in any key and listen for the way the final I feels settled — that pull toward home is the gravitational center the ear wants to find.`,
  dominant: `On piano, V → I in any major key has two half-step motions hidden inside it: the leading tone (degree 7) rises a half-step to tonic (degree 1), and the 4th of V (or 7th of V7) falls a half-step to the 3rd of I. In C major: B → C and F → E. Those two half-steps are the engine of dominant resolution.`,
  subdominant: `On piano, IV → I sounds like the church "amen" — softer than V → I, with the bass moving down a fifth (or up a fourth). In C major: F–A–C → C–E–G. The shared C ties the two chords together, and the F → E motion gives the resolution.`,
  supertonic: `On piano, the ii chord shares two notes with IV — that's why ii → V → I sounds like a smoother, jazzier version of IV → V → I. In C major: Dm (D–F–A) → G (G–B–D) → C (C–E–G). The hand barely moves between ii and IV; the ear hears a more sophisticated voice leading.`,
  mediant: `On piano, iii in C major is Em (E–G–B), and it shares two notes (E and G) with the C chord (I). That overlap is what makes iii feel ambiguous — it sounds tonic-adjacent but slightly darker. Slide one finger up two degrees from I and you've landed on iii.`,
  submediant: `On piano, vi shares two of its three notes with the I chord. In C major, vi is Am (A–C–E), and A–C–E overlaps with C–E–G (I) by two notes. This makes vi the most natural detour from home — a one-finger move that totally changes the mood from major to relative minor.`,
}

const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5)
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

const validKeys = Object.keys(KEY_CHORDS)

function generate(): Question {
  const key = pick(validKeys)
  const degIdx = Math.floor(Math.random() * 6)
  const degree = DEGREES[degIdx]
  const chord = KEY_CHORDS[key][degIdx]
  const func = FUNCTIONS[degIdx]

  const questions = [
    `In <strong>${key} major</strong>, the chord <strong>${chord}</strong> (${degree}) has what harmonic function?`,
    `<strong>${chord}</strong> is the <strong>${degree}</strong> in ${key} major. What role does it play?`,
    `What is the harmonic function of the <strong>${degree}</strong> chord in any major key?`,
  ]

  const explanation = `The ${degree} chord = <strong>${func}</strong> — the ${FUNC_DESC[func]}. True in every major key, not just ${key}.`

  const wrongFuncs = shuffle(FUNCTIONS.filter((f) => f !== func)).slice(0, 3)

  return {
    type: 'chordFunction',
    conceptKey: `chordFunction:${degree}`,
    modeBadge: 'Chord Function',
    modeClass: 'chords',
    answer: func,
    options: shuffle([func, ...wrongFuncs]),
    questionText: pick(questions),
    explanation,
  }
}

function deepDive(question: Question): string {
  return DEEP_DIVES[question.answer] ?? '<p>No deep dive available.</p>'
}

function describe(conceptKey: string): string | null {
  const m = conceptKey.match(/^chordFunction:(.+)$/)
  if (!m) return null
  const degree = m[1]
  const idx = DEGREES.indexOf(degree)
  if (idx < 0) return `${degree} function`
  return `${degree} (${FUNCTIONS[idx]})`
}

function getTip(question: Question, instrument: Instrument): string | null {
  const tip =
    instrument === 'guitar'
      ? GUITAR_TIPS[question.answer]
      : instrument === 'piano'
        ? PIANO_TIPS[question.answer]
        : null
  if (!tip) return null
  const cls = instrument === 'guitar' ? 'guitar-tip' : 'piano-tip'
  return `<div class="${cls}">${tip}</div>`
}

export const chordFunctionModule: QuizModule = {
  id: 'chordFunction',
  label: 'Chord Function',
  generate,
  deepDive,
  describe,
  getTip,
}
