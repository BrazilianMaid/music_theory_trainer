import type { QuizModule, Question } from '../types'
import {
  SCALE_TYPES,
  SCALE_ROOTS,
  spellScale,
  type ScaleDefinition,
} from '../scale-data'

const DEEP_DIVES: Record<string, string> = {
  major: `
    <h4>The Major Scale — The Reference Point</h4>
    <p>Every other scale you'll learn is described as a deviation from major. The pattern is <strong>W W H W W W H</strong> (whole, whole, half, whole, whole, whole, half) — 7 notes that resolve back to the root after 12 semitones.</p>
    <p>The major scale is the source of the diatonic chords (I ii iii IV V vi vii°), the major key signatures, and the Circle of Fifths itself. Going clockwise on the circle, you're literally collecting major scales that share more and more notes with the previous one — G major has all of C major's notes except F → F#. One sharp added per step is one note changed in the scale.</p>
    <div class="guitar-tip">On a single string: frets <strong>0-2-4-5-7-9-11-12</strong>. Walk it on the open low E and you've played E major. Shift that exact pattern up 5 frets (5-7-9-10-12-14-16-17) and you've played A major. The fretboard is a major-scale calculator — every interval offset stays fixed forever.</div>`,

  naturalMinor: `
    <h4>Natural Minor — The Major Scale's Sad Twin</h4>
    <p>The pattern is <strong>W H W W H W W</strong>. Compared to major, the 3rd, 6th, and 7th are all flattened (b3, b6, b7). The flat 3rd does most of the emotional work — the minor 3rd is the most emotionally loaded interval in Western harmony, and it's why this scale sounds melancholy.</p>
    <p>A natural minor scale uses the <em>exact same notes</em> as its relative major — C major and A minor share all 7 notes, just starting from a different root. This is what the inner ring of the Circle of Fifths shows. If you can play C major, you can play A natural minor: same fingering, same notes, you just resolve to A instead of C.</p>
    <div class="guitar-tip">On a single string: frets <strong>0-2-3-5-7-8-10-12</strong>. Open low E walked up = E natural minor. Notice the half-step from fret 7 to 8 (the 5 to b6) — that downward pull is the dark interval that defines natural minor. Compare to major's 7→9 jump (5 to natural 6) which sounds bright by comparison.</div>`,

  harmonicMinor: `
    <h4>Harmonic Minor — Built to Fix the Dominant Problem</h4>
    <p>The pattern is <strong>W H W W H A2 H</strong> — that "A2" is an <em>augmented second</em>, a 3-fret jump from b6 to a natural 7. It's the only common Western scale with this gap, and it's the source of the unmistakable Middle-Eastern / flamenco flavor.</p>
    <p>Why does this scale exist? In natural minor, the V chord is minor (Em in A minor), which is too weak to pull strongly back to the tonic. Raising the 7th from b7 to natural 7 converts the V into a major chord with a leading tone — now you have a true V→i cadence. The harmonic minor scale exists <em>specifically</em> to harmonize a proper dominant chord in minor keys. That's why it's in the chord-function family of scales rather than the melodic family.</p>
    <div class="guitar-tip">On a single string: frets <strong>0-2-3-5-7-8-11-12</strong>. Walk it on the open low E and you'll hear E harmonic minor — the sound of countless metal solos and Spanish guitar passages. The 3-fret jump from fret 8 to 11 is the move that screams "this is harmonic minor." It's also the source of the Phrygian Dominant mode (the 5th mode of harmonic minor) — a single scale shape that gives you both flamenco riffs and metal solos.</div>`,

  melodicMinor: `
    <h4>Melodic Minor — Smoothing Out the Augmented Second</h4>
    <p>The ascending pattern is <strong>W H W W W W H</strong> — natural minor with both the 6th AND 7th raised. This eliminates the awkward augmented 2nd of harmonic minor, giving a smoother melodic line on the way up while keeping the leading-tone cadence to the tonic.</p>
    <p>In strict classical practice, melodic minor <em>descends</em> as natural minor — the raised tones only happen ascending. Modern jazz uses "jazz melodic minor" the same way going up and down, treating it as a single 7-note scale that's the source of several modes used for dominant chord substitutions (Lydian Dominant, Altered, etc.).</p>
    <div class="guitar-tip">On a single string: frets <strong>0-2-3-5-7-9-11-12</strong>. Compare to major's 0-2-4-5-7-9-11-12 — the only difference is the 3rd (fret 3 vs 4 = b3 vs natural 3). Melodic minor is literally "major scale with a flat 3rd." On guitar this means: take any major scale fingering, drop the 3rd by one fret = melodic minor. One finger move converts between them.</div>`,
}

const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5)
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

const diatonicScales = SCALE_TYPES.filter((s) => s.category === 'diatonic')

function intervalSteps(pattern: number[]): number[] {
  const full = [...pattern, 12]
  const diffs: number[] = []
  for (let i = 1; i < full.length; i++) diffs.push(full[i] - full[i - 1])
  return diffs
}

function formulaWords(scale: ScaleDefinition): string {
  return intervalSteps(scale.pattern)
    .map((s) => (s === 1 ? 'H' : s === 2 ? 'W' : s === 3 ? 'A2' : String(s)))
    .join('-')
}

function generate(): Question {
  const root = pick(SCALE_ROOTS)
  const scale = pick(diatonicScales)
  const notes = spellScale(root, scale)
  const noteString = notes.join(' – ')
  const formula = formulaWords(scale)
  const format: 'identify' | 'spell' = Math.random() < 0.5 ? 'identify' : 'spell'

  if (format === 'identify') {
    const wrongLabels = shuffle(diatonicScales.filter((s) => s.id !== scale.id))
      .slice(0, 3)
      .map((s) => s.label)

    const questions = [
      `The notes <strong>${noteString}</strong> form what type of scale?`,
      `Identify the scale: <strong>${noteString}</strong>.`,
      `You're handed these notes: <strong>${noteString}</strong>. Which scale is it?`,
    ]

    return {
      type: 'scaleId',
      conceptKey: `scaleId:${root}:${scale.id}`,
      modeBadge: 'Scale ID',
      modeClass: 'scales',
      answer: scale.label,
      options: shuffle([scale.label, ...wrongLabels]),
      questionText: pick(questions),
      explanation: `Step pattern from the root: <strong>${formula}</strong> — that's the ${scale.label} formula. ${root} ${scale.label} = ${noteString}.`,
      meta: { scaleId: scale.id, root, format },
    }
  }

  // 'spell' — given root + scale type, pick the correct note set.
  // Wrong options are the same root spelled as the OTHER three scale types,
  // so the user is forced to distinguish the formulas, not just guess by root.
  const wrongs = shuffle(diatonicScales.filter((s) => s.id !== scale.id))
    .slice(0, 3)
    .map((s) => spellScale(root, s).join(' – '))

  const questions = [
    `What are the notes in <strong>${root} ${scale.label}</strong>?`,
    `<strong>${root} ${scale.label}</strong> — name the notes in order.`,
    `Spell the <strong>${root} ${scale.label}</strong> scale.`,
  ]

  return {
    type: 'scaleId',
    conceptKey: `scaleSpell:${root}:${scale.id}`,
    modeBadge: 'Scale Spell',
    modeClass: 'scales',
    answer: noteString,
    options: shuffle([noteString, ...wrongs]),
    questionText: pick(questions),
    explanation: `${root} ${scale.label} pattern: <strong>${formula}</strong>. Counting up from ${root}: ${noteString}.`,
    meta: { scaleId: scale.id, root, format },
  }
}

function deepDive(question: Question): string {
  const scaleId = question.meta?.scaleId as string | undefined
  return DEEP_DIVES[scaleId ?? ''] ?? '<p>No deep dive available.</p>'
}

export const scaleIdModule: QuizModule = {
  id: 'scaleId',
  label: 'Scales',
  generate,
  deepDive,
}
