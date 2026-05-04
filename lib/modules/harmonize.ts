import type { QuizModule, Question } from '../types'
import { SCALE_ROOTS } from '../scale-data'
import {
  HARMONY_TYPES,
  KEY_TYPE_LABEL,
  buildChord,
  type HarmonyDefinition,
} from '../harmony-data'

// Deep dives are keyed by degree string. The degree strings are unique
// across major and natural minor (case-sensitive: 'iii' vs 'III', 'ii' vs
// 'ii°'), so a single map covers all 14 degree+keyType combinations.
const DEEP_DIVES: Record<string, string> = {
  // ── Major-key degrees ──────────────────────────────────────────────────
  I: `
    <h4>I — The Tonic Triad</h4>
    <p>The <strong>I chord</strong> is built on scale degree 1: the notes 1, 3, and 5 of the major scale stacked. Because the major scale always has a <em>major 3rd</em> (4 semitones) between the root and the 3rd, the I chord is always major. This is the gravitational center of the key — every other chord is heard in relation to it, and the ear strongly wants to land here.</p>
    <p>Notes: root, major 3rd, perfect 5th. In G major that's G–B–D. In C major it's C–E–G. The pattern never changes.</p>
    <div class="guitar-tip">In any major key, the root note of the I chord is the name of the key itself. G major → I = G. Strum I, then anything else, then back to I — feel the "home" pull. That sensation of arrival is tonic function in action.</div>`,

  ii: `
    <h4>ii — The Minor Supertonic</h4>
    <p>The <strong>ii chord</strong> sits on scale degree 2. Stack a third on top of degree 2 and you land on degree 4 — but the gap from 2 to 4 in a major scale is only 3 semitones (a <em>minor 3rd</em>). That minor 3rd is what makes ii minor. From 4 to 6 you get another major-scale third (variable: in C, F→A is a major 3rd), completing the minor triad.</p>
    <p>Functionally ii is a <em>pre-dominant</em>: it doesn't move toward home like V does, but sets up V. The ii→V→I progression is the single most common chord movement in jazz and shows up constantly in pop songs too.</p>
    <div class="guitar-tip">In C major, ii is Dm (D–F–A). Try Dm → G → C and listen — that's "ii–V–I", the engine of "Autumn Leaves," "Fly Me to the Moon," and a thousand pop tunes you've heard. On guitar, ii is always two letter-names up from I (C → D, G → A, D → E).</div>`,

  iii: `
    <h4>iii — The Minor Mediant</h4>
    <p>The <strong>iii chord</strong> sits on scale degree 3. From 3 to 5 of a major scale is a minor 3rd (only 3 semitones — e.g. E to G), and 5 to 7 is a major 3rd: that stack gives a minor triad. iii is the rarest of the diatonic chords because two of its three notes (the 3rd and 5th of the key) are <em>also</em> in the I chord — so iii sounds tonic-adjacent, ambiguous, almost floating.</p>
    <p>That overlap with I is exactly what makes iii useful: it's the chord that goes "somewhere new" without abandoning home. Songs use it as a passing chord to fill space between I and IV, often creating a smooth descending or stepwise bassline.</p>
    <div class="guitar-tip">In G major, iii is Bm. The progression G → Bm → C → D walks the bass G → B → C → D (almost stepwise) and sounds richer than just G → C → D. You'll hear this in folk and singer-songwriter music constantly — it's a quiet way to add emotional weight without changing key.</div>`,

  IV: `
    <h4>IV — The Major Subdominant</h4>
    <p>The <strong>IV chord</strong> sits on scale degree 4. From 4 to 6 of a major scale is a major 3rd (4 semitones — e.g. F to A), and from 6 to 1 is a minor 3rd, completing a major triad. IV is the chord that moves you <em>away</em> from home — softer and more open than the V→I tug, more like a deep breath out.</p>
    <p>I–IV–V–I is the foundational three-chord progression of all popular music. IV is also exactly one step <em>counter-clockwise</em> on the Circle of Fifths from I — that's where the name "subdominant" comes from (a fifth below, not above).</p>
    <div class="guitar-tip">In A major, IV is D. The IV chord is always two letter-names up from the I (count: A–B–C–D). I–IV–V in A is A–D–E — the spine of countless blues, country, and rock songs. If you only learn one progression to play in every key, learn this one.</div>`,

  V: `
    <h4>V — The Major Dominant</h4>
    <p>The <strong>V chord</strong> sits on scale degree 5. From 5 to 7 is a major 3rd, and 7 to 2 is a minor 3rd — a major triad. But the special thing about V is what scale degree 7 <em>is</em>: the leading tone, just a half-step below tonic. That half-step pull is the strongest gravitational force in tonal music. V wants to resolve to I, hard.</p>
    <p>V→I is called an <strong>authentic cadence</strong> and it's the most common chord movement in all of Western music. Adding the b7 of the V (turning V into V7, e.g. G7) intensifies the pull because it adds a tritone — the most dissonant interval in tonal music — which only resolves comfortably onto the I chord.</p>
    <div class="guitar-tip">In D major, V is A. Strum A, then immediately D — feel the lock. That's why every clockwise step on the Circle of Fifths <em>is</em> a V→I relationship: G is the V of C, D is the V of G, A is the V of D. The circle is literally a map of dominant relationships.</div>`,

  vi: `
    <h4>vi — The Minor Submediant (Relative Minor)</h4>
    <p>The <strong>vi chord</strong> sits on scale degree 6. From 6 to 1 is a minor 3rd (3 semitones), making vi minor. But the bigger story: vi is the <em>relative minor</em> of the key. In C major, vi is Am — and Am uses the same 7 notes as C major. Just rooted differently.</p>
    <p>This dual identity is huge. A song can start in C major, drift toward Am, and suddenly sound minor — without changing a single note or accidental. This is exactly what the inner ring of the Circle of Fifths shows. Many famous songs ("While My Guitar Gently Weeps," "Stairway to Heaven") toggle their tonal center between I and vi to shift mood.</p>
    <div class="guitar-tip">In G major, vi is Em. Loop Em a few bars and the song feels minor; loop G and it feels major — same notes available either way. On guitar, the relative minor of any major key is the chord rooted three frets <em>down</em> from the major's root note (or equivalently, a minor 3rd below).</div>`,

  'vii°': `
    <h4>vii° — The Diminished Leading-Tone Triad</h4>
    <p>The <strong>vii° chord</strong> sits on scale degree 7. From 7 to 2 is a minor 3rd, and 2 to 4 is <em>also</em> a minor 3rd — two stacked minor 3rds is the definition of a diminished triad. The root of vii° is the leading tone (a half-step below tonic), so the whole chord is built on the most unstable note in the key.</p>
    <p>vii° is rarely strummed as a plain triad in modern pop or rock — it's tense and unstable. In practice it's used as the upper structure of V7: in C major, V7 is G7 (G–B–D–F), and the upper three notes B–D–F are exactly the vii° triad. Functionally V7 and vii° do the same thing: pull hard back to I.</p>
    <div class="guitar-tip">In C major, vii° is B° (B–D–F). Try B° → C — feel the squeeze of the half-step from B up to C in the bass. On guitar you'll almost always play V7 instead (G7 in C major), but recognizing vii° as "the top of V7" unlocks chord-substitution thinking. Diminished chords are fully symmetric: shift the same shape up 3 frets and you get the <em>same</em> chord with a different note on the bottom.</div>`,

  // ── Natural-minor-key degrees ──────────────────────────────────────────
  i: `
    <h4>i — The Minor Tonic</h4>
    <p>The <strong>i chord</strong> is built on degree 1 of the natural minor scale: notes 1, b3, and 5. Because natural minor has a <em>flatted 3rd</em> (only 3 semitones above the root, not 4), the i chord is minor. This is the home chord of any minor key — the gravitational center the ear wants to resolve to.</p>
    <p>Crucially, a minor key shares all 7 notes with its <em>relative major</em>. A minor and C major contain the exact same pitches; the only difference is which note feels like "home." That's why i in A minor (Am) is the same chord as vi in C major.</p>
    <div class="guitar-tip">In A natural minor, i is Am (A–C–E). Try noodling on the A natural minor scale (A B C D E F G) and resolving every phrase to A — it sounds minor. Now resolve every phrase to C instead — same notes, suddenly major. That switching is what relative-key thinking unlocks.</div>`,

  'ii°': `
    <h4>ii° — The Diminished Supertonic</h4>
    <p>The <strong>ii° chord</strong> in natural minor sits on scale degree 2. Stack thirds: 2 to 4 is a minor 3rd, 4 to b6 is also a minor 3rd — two minor 3rds is a diminished triad. Note that this exact same chord exists in the relative major as the vii° (built on degree 7 of the major). Same notes, different role.</p>
    <p>ii° is tense and rarely played as a plain triad in pop/rock — like vii° in major, it more often appears as the upper structure of a V7 (or V7b9) in the minor key. It's a pre-dominant, but the dissonance pushes hard toward V.</p>
    <div class="guitar-tip">In A minor, ii° is B° (B–D–F). And in C major, vii° is also B°. Same chord, two different harmonic functions depending on where you call "home." This is one of the deepest insights in tonal music: chords don't have functions on their own — only in relation to the tonic.</div>`,

  III: `
    <h4>III — The Major Mediant (Relative Major)</h4>
    <p>The <strong>III chord</strong> in natural minor sits on degree b3. From b3 to 5 is a major 3rd (4 semitones), and 5 to b7 is a minor 3rd — a major triad. But the bigger fact: III is the relative-major tonic built right inside the minor key. In A minor, III is C (C major). In E minor, III is G major.</p>
    <p>III is one of the bright spots inside an otherwise dark minor key. The move i → III (Am → C) lifts the mood briefly into major before pulling back. Many minor-key choruses use this exact lift.</p>
    <div class="guitar-tip">In E natural minor, III is G major. Try Em → G → D → Em — the move from i up to III feels like stepping out into sunlight, and coming back down feels like returning indoors. On guitar, III is always three frets <em>up</em> from i (e.g. A minor's root at fret 5 → C major's root at fret 8 on the same string).</div>`,

  iv: `
    <h4>iv — The Minor Subdominant</h4>
    <p>The <strong>iv chord</strong> in natural minor sits on degree 4. From 4 to b6 is a minor 3rd (3 semitones), making iv minor. Note this is <em>different</em> from major keys, where IV is major. The minor iv has a darker, sadder color — it's the chord behind countless ballad bridges and minor-key turnarounds.</p>
    <p>Compare A minor's i → iv → V (Am → Dm → E, using harmonic minor's raised 7th to make V major) to A major's I → IV → V (A → D → E). Same letter names, dramatically different mood. The fact that iv is minor instead of major is a big part of why minor keys feel inherently sadder than major.</p>
    <div class="guitar-tip">In A minor, iv is Dm (D–F–A). On guitar, iv is the same shape as a major-key IV but with a flattened 3rd (one fret lower). If you can finger D major, you can finger Dm by sliding the F# down a fret to F. That single half-step is the entire mood shift between major and minor.</div>`,

  v: `
    <h4>v — The Minor Dominant (the One That Got "Fixed")</h4>
    <p>The <strong>v chord</strong> in natural minor sits on degree 5. From 5 to b7 is a minor 3rd, making v minor. This is the chord that classical theorists wanted to "fix" — because b7 is a whole step below tonic, not a half step, there's no leading tone tugging back to i. The minor v is too weak to function as a real dominant.</p>
    <p>The fix: raise the 7th of the natural minor scale, creating <em>harmonic minor</em>. That single change converts v (e.g. Em in A minor) into V (E major in A minor) and gives you a true leading-tone cadence back to i. The harmonic minor scale exists almost entirely to enable this V→i resolution.</p>
    <div class="guitar-tip">In A natural minor, v is Em (E–G–B). Try Em → Am: it sounds modal and ambiguous, like the song could drift anywhere. Now try E (or E7, with the raised G#) → Am: that G# is the leading tone, and you'll feel it yank the ear back to A. The choice between v and V is the choice between "modal" and "tonal" minor — and both are valid musical languages.</div>`,

  VI: `
    <h4>VI — The Major Submediant</h4>
    <p>The <strong>VI chord</strong> in natural minor sits on degree b6. From b6 to 1 is a major 3rd, making VI major. VI is one of three "bright" chords inside a minor key (along with III and VII), giving songwriters relief from the overall darkness. The i → VI motion (Am → F in A minor) is one of the most evocative moves in minor-key writing.</p>
    <p>VI shows up everywhere in cinematic and emotional pop music. It's the chord that makes a minor song feel <em>hopeful</em> for a moment without leaving the minor key.</p>
    <div class="guitar-tip">In E natural minor, VI is C major. Try Em → C → G → D (i → VI → III → VII) — that's the engine behind "Don't Stop Believin'," "Zombie," "Save Tonight," and hundreds of other hits. The four chords are all diatonic to E minor, but three of them are major, which is why this loop sounds so much brighter than you'd expect from a "minor key" progression.</div>`,

  VII: `
    <h4>VII — The Major Subtonic ("The Rock bVII")</h4>
    <p>The <strong>VII chord</strong> in natural minor sits on degree b7 — a whole step below the tonic, not the half-step you'd get in major. From b7 to 2 is a major 3rd, making VII major. This chord is famously absent from "classical" minor (where you'd raise the 7th to get the leading tone), but it's everywhere in rock, blues, and modal music.</p>
    <p>When rock songs in major keys borrow this chord, it's called the <em>bVII</em> — a "borrowed chord" from the parallel minor. The Beatles, Zeppelin, and countless others lean on bVII for that classic descending power-chord move that doesn't need to climb back through V.</p>
    <div class="guitar-tip">In A natural minor, VII is G major. Strum Am → G → Am → G — that's the modal vamp under "Smoke on the Water"-style riffs and the entire vibe of Mixolydian-flavored rock. The b7 root gives you a power-chord move that descends naturally, no leading tone required. This is a big reason rock loves minor and modal sounds so much.</div>`,
}

const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5)
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

const ORDINALS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th']

function formatAnswer(chord: string, quality: string): string {
  return `${chord} (${quality})`
}

function generate(): Question {
  const harmony = pick(HARMONY_TYPES) as HarmonyDefinition
  const key = pick(SCALE_ROOTS)
  const degIdx = Math.floor(Math.random() * 7)
  const degree = harmony.degrees[degIdx]
  const quality = harmony.qualities[degIdx]
  const chord = buildChord(key, harmony, degIdx)
  const answer = formatAnswer(chord, quality)
  const ktLabel = KEY_TYPE_LABEL[harmony.keyType]

  // Wrong options: the other 6 diatonic chords from the same key+harmony.
  // Same format ("Chord (quality)"), so the user must distinguish degree
  // and quality together — not just guess by quality alone.
  const wrongs = shuffle([0, 1, 2, 3, 4, 5, 6].filter((i) => i !== degIdx))
    .slice(0, 3)
    .map((i) => formatAnswer(buildChord(key, harmony, i), harmony.qualities[i]))

  const questions = [
    `In <strong>${key} ${ktLabel}</strong>, what is the <strong>${degree}</strong> chord?`,
    `<strong>${key} ${ktLabel}</strong> — name the <strong>${degree}</strong> chord (with quality).`,
    `Bandmate calls <strong>${degree}</strong> in <strong>${key} ${ktLabel}</strong>. What do you play?`,
    `What chord does <strong>${degree}</strong> represent in <strong>${key} ${ktLabel}</strong>?`,
  ]

  const explanation =
    `Diatonic ${ktLabel} pattern: <strong>${harmony.degrees.join(' – ')}</strong> ` +
    `(qualities: ${harmony.qualities.join(', ')}). ` +
    `In ${key} ${ktLabel}, the ${ORDINALS[degIdx]} scale degree gives <strong>${chord}</strong>, ` +
    `and ${degree} is always ${quality} — so ${degree} of ${key} ${ktLabel} = <strong>${answer}</strong>.`

  return {
    type: 'harmonize',
    conceptKey: `harmonize:${key}:${harmony.keyType}:${degree}`,
    modeBadge: 'Harmonize',
    modeClass: 'chords',
    answer,
    options: shuffle([answer, ...wrongs]),
    questionText: pick(questions),
    explanation,
    meta: {
      keyType: harmony.keyType,
      degree,
      degreeIndex: degIdx,
      quality,
      key,
    },
  }
}

function deepDive(question: Question): string {
  const degree = question.meta?.degree as string | undefined
  return DEEP_DIVES[degree ?? ''] ?? '<p>No deep dive available.</p>'
}

export const harmonizeModule: QuizModule = {
  id: 'harmonize',
  label: 'Harmonize',
  generate,
  deepDive,
}
