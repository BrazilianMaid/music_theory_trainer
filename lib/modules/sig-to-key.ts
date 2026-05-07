import type { QuizModule, Question, Instrument } from '../types'
import { ALL_KEYS, KEY_SIGS, SHARP_ORDER, FLAT_ORDER } from '../theory-data'

type SigKind = 'sharp' | 'flat' | 'none'

const DEEP_DIVES: Record<SigKind, string> = {
  sharp: `
    <h4>Why Sharps Add in This Order</h4>
    <p>The sharp order (F# C# G# D# A# E# B#) isn't arbitrary — it's the Circle of Fifths clockwise, starting on F#. Each new key going clockwise needs one more sharp, and that new sharp is always a fifth above the previous one.</p>
    <p>The reason the last sharp rule works: in any major key, the leading tone (7th scale degree) is always a half-step below the root. The last sharp written in the signature <em>is</em> that leading tone. So one half-step up from the last sharp always gives you the root of the key.</p>`,

  flat: `
    <h4>Why the Second-to-Last Flat Rule Works</h4>
    <p>The flat order (Bb Eb Ab Db Gb Cb Fb) is the Circle of Fifths counter-clockwise. Each new flat key adds a flat that's a fifth below the previous one.</p>
    <p>The second-to-last flat rule works because the second-to-last flat is always the <strong>fourth scale degree (IV)</strong> of the current key. And the name of the IV chord <em>is</em> the name of the key — because in flat keys, the key name and its subdominant share the same root. It's circular, but once you see it on the circle diagram it clicks instantly.</p>`,

  none: `
    <h4>Why C Major Has No Accidentals</h4>
    <p>The major scale pattern is W-W-H-W-W-W-H (whole and half steps). C major is the only key where that pattern lands <em>perfectly</em> on the natural notes — no adjustments needed. Every other key requires sharps or flats to preserve that pattern starting on a different pitch.</p>
    <p>This is why C major is taught first and why piano keyboards are laid out the way they are — the white keys are C major. All other keys are essentially C major's pattern shifted to start on a different note, with accidentals filling in the gaps.</p>`,
}

const GUITAR_TIPS: Record<SigKind, string> = {
  sharp: `On your fretboard: one half-step up = one fret up. If the last sharp is G#, find G# on any string and go up one fret — you're on A. That's A major.`,
  flat: `3 flats = Bb, Eb, Ab. Second to last = Eb. Key = Eb major. Check the circle: Eb is 3 steps counter-clockwise from C. Count the flats: 1(F), 2(Bb), 3(Eb). ✓`,
  none: `On guitar, C major has no open-string root (unlike E, A, D, G) which is why it feels awkward as a key for guitarists. E major (4 sharps) is the "guitar's C major" — the key that sits most naturally on the instrument.`,
}

const PIANO_TIPS: Record<SigKind, string> = {
  sharp: `On piano, sharps appear in the order F→C→G→D→A→E→B — the white keys, in fifths. The "last sharp + a half-step" rule still works on the keyboard: find the last sharp, step up one key (white or black), and you've landed on the tonic. For 4 sharps (E major), the last sharp is D# — one half-step up is E.`,
  flat: `On piano, flats add in the order B→E→A→D→G→C→F. The second-to-last flat <em>is</em> the key. For 4 flats (Ab major), the flats are Bb–Eb–Ab–Db; the second-to-last is Ab — that's your key. The pattern feels strange at first but locks in fast because the flat keys cluster around the same black keys.`,
  none: `C major is the white-key key. Every other key requires you to integrate at least one black key into your scale, which is why C is the natural starting point for sight-reading. Once you can play in C, every other key is "C with N substitutions."`,
}

const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5)
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

function sigKind(key: string): SigKind {
  const sig = KEY_SIGS[key]
  if (!sig || sig.count === 0) return 'none'
  return sig.type === 'sharp' ? 'sharp' : 'flat'
}

function generate(): Question {
  const key = pick(ALL_KEYS)
  const sig = KEY_SIGS[key]
  const sigText =
    sig.count === 0
      ? 'no sharps or flats'
      : `${sig.count} ${sig.type}${sig.count > 1 ? 's' : ''}`

  const questions = [
    `A key signature with <strong>${sigText}</strong> — which major key is this?`,
    `You open a piece of sheet music showing ${sigText}. What key are you in?`,
    `${sigText.charAt(0).toUpperCase() + sigText.slice(1)} in the key signature — name the major key.`,
  ]

  let explanation: string
  if (sig.count === 0) {
    explanation = `No sharps or flats = <strong>C major</strong>. C is the "vanilla" key — the major scale pattern lands perfectly on all natural notes.`
  } else if (sig.type === 'sharp') {
    const sharps = SHARP_ORDER.slice(0, sig.count)
    const last = sharps[sharps.length - 1]
    explanation = `${sig.count} sharp${sig.count > 1 ? 's' : ''}: ${sharps.join(', ')}. Last sharp = <strong>${last}</strong> → one half-step up = <strong>${key} major</strong>.`
  } else {
    const flats = FLAT_ORDER.slice(0, sig.count)
    if (sig.count === 1) {
      explanation = `One flat always = <strong>F major</strong>. The one exception — just memorize it.`
    } else {
      const s2l = flats[flats.length - 2]
      explanation = `${sig.count} flats: ${flats.join(', ')}. Second-to-last flat = <strong>${s2l}</strong> = <strong>${key} major</strong>.`
    }
  }

  const wrongs = shuffle(ALL_KEYS.filter((k) => k !== key)).slice(0, 3)
  return {
    type: 'sigToKey',
    conceptKey: `sigToKey:${key}`,
    modeBadge: 'Sig → Key',
    modeClass: '',
    answer: key,
    options: shuffle([key, ...wrongs]),
    questionText: pick(questions),
    explanation,
  }
}

function deepDive(question: Question): string {
  return DEEP_DIVES[sigKind(question.answer)]
}

function getTip(question: Question, instrument: Instrument): string | null {
  const kind = sigKind(question.answer)
  if (instrument === 'guitar') return `<div class="guitar-tip">${GUITAR_TIPS[kind]}</div>`
  if (instrument === 'piano') return `<div class="piano-tip">${PIANO_TIPS[kind]}</div>`
  return null
}

function describe(conceptKey: string): string | null {
  const m = conceptKey.match(/^sigToKey:(.+)$/)
  if (!m) return null
  const key = m[1]
  const sig = KEY_SIGS[key]
  if (!sig) return `${key} major`
  const sigStr =
    sig.count === 0
      ? 'no accidentals'
      : `${sig.count} ${sig.type}${sig.count > 1 ? 's' : ''}`
  return `${sigStr} → ${key} major`
}

export const sigToKeyModule: QuizModule = {
  id: 'sigToKey',
  label: 'Sig → Key',
  generate,
  deepDive,
  describe,
  getTip,
}
