'use client'

import { useState } from 'react'
import { generateQuestion, getDeepDive, QUIZ_MODES, type QuestionFilter } from '@/lib/quiz-engine'
import type { Question } from '@/lib/types'
import { loadState, recordResult, type AdaptiveState } from '@/lib/adaptive'
import { CircleOfFifths } from '@/components/CircleOfFifths'
import { Scoreboard }     from '@/components/Scoreboard'
import { ModeSelector }   from '@/components/ModeSelector'
import { StreakBar }      from '@/components/StreakBar'
import { QuizCard }       from '@/components/QuizCard'

interface Scores {
  correct: number
  wrong: number
  streak: number
  total: number
}

export interface QuizConfig {
  mode: string
  filter?: QuestionFilter
}

interface QuizAppProps {
  config?: QuizConfig
  onHome?: () => void
}

export default function QuizApp({ config, onHome }: QuizAppProps = {}) {
  const initialMode = config?.mode ?? 'all'
  const initialFilter = config?.filter

  const [mode, setMode]               = useState(initialMode)
  const [filter, setFilter]           = useState<QuestionFilter | undefined>(initialFilter)
  const [adaptive, setAdaptive]       = useState<AdaptiveState>(() => loadState())
  const [recentTypes, setRecentTypes] = useState<string[]>([])
  const [scores, setScores]           = useState<Scores>({ correct: 0, wrong: 0, streak: 0, total: 0 })
  const [currentQuestion, setCurrentQuestion] = useState<Question>(
    () => generateQuestion(initialMode, [], loadState(), initialFilter)
  )
  const [answered, setAnswered]               = useState(false)
  const [selectedAnswer, setSelectedAnswer]   = useState<string | null>(null)
  const [circleOpen, setCircleOpen]           = useState(false)

  const handleAnswer = (answer: string) => {
    if (answered) return
    setAnswered(true)
    setSelectedAnswer(answer)
    const correct = answer === currentQuestion.answer
    setScores((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      wrong:   prev.wrong   + (correct ? 0 : 1),
      streak:  correct ? prev.streak + 1 : 0,
      total:   prev.total + 1,
    }))
    const nextState = recordResult(currentQuestion.conceptKey, currentQuestion.type, correct)
    setAdaptive(nextState)
  }

  const handleNext = () => {
    const updated = [...recentTypes, currentQuestion.type, currentQuestion.conceptKey].slice(-6)
    setRecentTypes(updated)
    setCurrentQuestion(generateQuestion(mode, updated, adaptive, filter))
    setAnswered(false)
    setSelectedAnswer(null)
  }

  const handleModeChange = (newMode: string) => {
    setMode(newMode)
    setFilter(undefined)
    setRecentTypes([])
    setCurrentQuestion(generateQuestion(newMode, [], adaptive, undefined))
    setAnswered(false)
    setSelectedAnswer(null)
  }

  const deepDiveContent = answered ? getDeepDive(currentQuestion) : ''

  return (
    <main className="min-h-screen bg-bg flex flex-col items-center px-4 py-6 relative">
      {onHome && (
        <button
          onClick={onHome}
          aria-label="Return to dashboard"
          className="absolute top-4 left-4 text-text-dim hover:text-gold text-[0.7rem] font-mono uppercase tracking-widest transition-colors"
        >
          ← Home
        </button>
      )}

      <h1 className="font-serif text-gold text-[1.6rem] tracking-[0.05em] mb-1">
        Circle of Fifths Trainer
      </h1>
      <p className="text-[0.7rem] text-text-ghost uppercase tracking-[0.1em] mb-6">
        Key Signatures · Chord Function · Roman Numerals
      </p>

      <Scoreboard {...scores} />

      {/* Circle of Fifths collapsible reference */}
      <div className="w-full max-w-[560px] mb-3">
        <button
          onClick={() => setCircleOpen(!circleOpen)}
          className={[
            'w-full bg-surface-alt border border-[#2a2a2a] text-gold font-mono text-[0.7rem]',
            'py-[10px] px-4 rounded cursor-pointer text-left tracking-[0.08em] uppercase',
            'flex justify-between items-center transition-colors',
            circleOpen
              ? 'hover:bg-[#1a1700] hover:border-gold rounded-b-none'
              : 'hover:bg-[#1a1700] hover:border-gold',
          ].join(' ')}
        >
          <span>◎ Circle of Fifths Reference</span>
          <span
            className="transition-transform duration-300 text-[0.8rem]"
            style={{ transform: circleOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            ▼
          </span>
        </button>

        {circleOpen && (
          <div className="bg-[#111] border border-[#252525] border-t-0 rounded-b-md px-5 py-5">
            <div className="flex justify-center">
              <CircleOfFifths />
            </div>
            <div className="flex gap-4 justify-center flex-wrap mt-3 text-[0.65rem] text-text-dim">
              <LegendItem color="#c9a84c" label="Major keys (outer)" />
              <LegendItem color="#7b8cde" label="Relative minors (inner)" />
              <LegendItem color="#5cb85c" label="Sharp keys →" />
              <LegendItem color="#de8c7b" label="← Flat keys" />
            </div>
            <p className="mt-3 text-[0.7rem] text-[#666] text-center leading-relaxed italic">
              Each inner minor key shares the same notes &amp; key signature as the major key directly outside it.
              <br />
              They are &quot;relatives&quot; — same notes, different home base.
            </p>
          </div>
        )}
      </div>

      <ModeSelector modes={QUIZ_MODES} currentMode={mode} onModeChange={handleModeChange} />

      <StreakBar streak={scores.streak} />

      <QuizCard
        question={currentQuestion}
        answered={answered}
        selectedAnswer={selectedAnswer}
        onAnswer={handleAnswer}
        onNext={handleNext}
        deepDiveContent={deepDiveContent}
      />
    </main>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-[6px]">
      <div className="w-[10px] h-[10px] rounded-full" style={{ background: color }} />
      <span>{label}</span>
    </div>
  )
}
