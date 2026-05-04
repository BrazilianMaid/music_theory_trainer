'use client'

import { useEffect, useState } from 'react'
import { QUIZ_MODES, type QuestionFilter } from '@/lib/quiz-engine'
import {
  loadState,
  moduleAccuracy,
  overallStats,
  type AdaptiveState,
} from '@/lib/adaptive'

interface QuizConfig {
  mode: string
  filter?: QuestionFilter
}

interface DashboardProps {
  onStartQuiz: (config: QuizConfig) => void
}

const MODULE_CARDS = QUIZ_MODES.filter((m) => m.id !== 'all')

export default function Dashboard({ onStartQuiz }: DashboardProps) {
  // Hydrate from localStorage after mount so server/client output stays in sync.
  const [state, setState] = useState<AdaptiveState>({ cards: {}, sessionHistory: [] })

  useEffect(() => {
    setState(loadState())
  }, [])

  const stats = overallStats(state)
  const accuracyPct = stats.totalAnswered === 0
    ? '—'
    : `${Math.round(stats.accuracy * 100)}%`

  return (
    <main className="min-h-screen bg-bg flex flex-col items-center px-4 py-10">
      <h1 className="font-serif text-gold text-[1.8rem] tracking-[0.05em] mb-1">
        Circle of Fifths Trainer
      </h1>
      <p className="text-[0.7rem] text-text-ghost uppercase tracking-[0.1em] mb-8">
        Practice · Track · Master
      </p>

      <div className="w-full max-w-[680px]">
        {/* Overall stats */}
        <section className="bg-surface border border-border rounded-md p-5 mb-5">
          <div className="text-[0.6rem] text-text-faint uppercase tracking-widest mb-3">
            Overall
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Stat label="Total Answered" value={stats.totalAnswered.toString()} />
            <Stat label="Accuracy"        value={accuracyPct} />
            <Stat label="Active Days"     value={stats.activeDays.toString()} />
          </div>
        </section>

        {/* Module breakdown */}
        <section className="bg-surface border border-border rounded-md p-5 mb-6">
          <div className="text-[0.6rem] text-text-faint uppercase tracking-widest mb-3">
            By Quiz Type
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {MODULE_CARDS.map((m) => {
              const acc = moduleAccuracy(state, m.id)
              return (
                <ModuleCard
                  key={m.id}
                  label={m.label}
                  accuracy={acc.accuracy}
                  attempts={acc.totalAttempts}
                  onClick={() => onStartQuiz({ mode: m.id })}
                />
              )
            })}
          </div>
        </section>

        {/* Start quiz */}
        <section className="flex flex-col gap-2">
          <button
            onClick={() => onStartQuiz({ mode: 'all' })}
            className="w-full bg-gold text-bg border-none font-mono text-[0.85rem] font-medium py-[14px] rounded cursor-pointer tracking-[0.08em] hover:bg-gold-light transition-colors uppercase"
          >
            Start Quiz — All Types
          </button>
          <p className="text-[0.65rem] text-text-faint text-center mt-1 tracking-wide">
            Or pick a specific quiz type above to focus your practice.
          </p>
        </section>
      </div>
    </main>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-[0.6rem] text-text-faint uppercase tracking-widest mb-1">{label}</div>
      <div className="text-[1.6rem] font-medium text-text-primary">{value}</div>
    </div>
  )
}

function ModuleCard({
  label,
  accuracy,
  attempts,
  onClick,
}: {
  label: string
  accuracy: number
  attempts: number
  onClick: () => void
}) {
  const pct = attempts === 0 ? 0 : Math.round(accuracy * 100)
  const display = attempts === 0 ? '—' : `${pct}%`
  const barWidth = attempts === 0 ? 0 : pct

  return (
    <button
      onClick={onClick}
      className="text-left bg-surface-alt border border-border-light rounded p-3 hover:border-gold hover:bg-[#1a1700] transition-colors group"
    >
      <div className="text-[0.65rem] text-text-dim uppercase tracking-[0.08em] group-hover:text-gold transition-colors">
        {label}
      </div>
      <div className="text-[1.3rem] font-medium text-text-primary mt-1">{display}</div>
      <div className="h-[3px] bg-[#1a1a1a] rounded-sm overflow-hidden mt-2">
        <div
          className="h-full rounded-sm"
          style={{
            width: `${barWidth}%`,
            background: 'linear-gradient(90deg, #c9a84c, #e0bd60)',
          }}
        />
      </div>
      <div className="text-[0.6rem] text-text-faint mt-1">
        {attempts === 0 ? 'No attempts yet' : `${attempts} attempt${attempts === 1 ? '' : 's'}`}
      </div>
    </button>
  )
}
