'use client'

import { useEffect, useState } from 'react'
import { QUIZ_MODES, type QuestionFilter } from '@/lib/quiz-engine'
import {
  loadState,
  moduleAccuracy,
  moduleTrend,
  overallStats,
  weakModules,
  type AdaptiveState,
  type Trend,
  type WeakModuleEntry,
} from '@/lib/adaptive'
import { ThemeToggle } from './ThemeToggle'

interface QuizConfig {
  mode: string
  filter?: QuestionFilter
}

interface DashboardProps {
  onStartQuiz: (config: QuizConfig) => void
}

const MODULE_CARDS = QUIZ_MODES.filter((m) => m.id !== 'all')
const MODULE_LABEL: Record<string, string> = Object.fromEntries(
  QUIZ_MODES.map((m) => [m.id, m.label]),
)

const WEAK_TOPIC_LIMIT = 3
const WEAK_TOPIC_MIN_ATTEMPTS = 3

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

  const weak = weakModules(state, WEAK_TOPIC_LIMIT, WEAK_TOPIC_MIN_ATTEMPTS)

  return (
    <main className="min-h-screen bg-bg flex flex-col items-center px-4 py-10 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <h1 className="font-serif text-accent text-[1.8rem] tracking-[0.05em] mb-1">
        Circle of Fifths Trainer
      </h1>
      <p className="text-[0.7rem] text-text-dim uppercase tracking-[0.1em] mb-8">
        Practice · Track · Master
      </p>

      <div className="w-full max-w-[680px]">
        {/* Overall stats */}
        <section className="bg-surface border border-border rounded-md p-5 mb-5 shadow-sm">
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
        <section className="bg-surface border border-border rounded-md p-5 mb-5 shadow-sm">
          <div className="text-[0.6rem] text-text-faint uppercase tracking-widest mb-3">
            By Quiz Type
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {MODULE_CARDS.map((m) => {
              const acc = moduleAccuracy(state, m.id)
              const trend = moduleTrend(state, m.id)
              return (
                <ModuleCard
                  key={m.id}
                  label={m.label}
                  accuracy={acc.accuracy}
                  attempts={acc.totalAttempts}
                  trend={trend}
                  onClick={() => onStartQuiz({ mode: m.id })}
                />
              )
            })}
          </div>
        </section>

        {/* Weakest topics */}
        {weak.length > 0 && (
          <section className="bg-surface border border-border rounded-md p-5 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[0.6rem] text-text-faint uppercase tracking-widest">
                Weakest Topics
              </div>
              <div className="text-[0.6rem] text-text-faint tracking-wide">
                Where to focus
              </div>
            </div>
            <ul className="flex flex-col gap-2">
              {weak.map((w) => (
                <WeakModuleRow
                  key={w.moduleId}
                  entry={w}
                  label={MODULE_LABEL[w.moduleId] ?? w.moduleId}
                  trend={moduleTrend(state, w.moduleId)}
                  onPractice={() =>
                    onStartQuiz({ mode: w.moduleId, filter: { weakOnly: true } })
                  }
                />
              ))}
            </ul>
          </section>
        )}

        {/* Start quiz */}
        <section className="flex flex-col gap-2">
          <button
            onClick={() => onStartQuiz({ mode: 'all' })}
            className="w-full bg-accent text-accent-text border-none font-sans text-[0.85rem] font-medium py-[14px] rounded cursor-pointer tracking-[0.08em] hover:bg-accent-light transition-colors uppercase"
          >
            Start Quiz — All Types
          </button>
          {weak.length > 0 && (
            <button
              onClick={() => onStartQuiz({ mode: 'all', filter: { weakOnly: true } })}
              className="w-full bg-surface-alt border border-accent text-accent font-sans text-[0.8rem] font-medium py-[12px] rounded cursor-pointer tracking-[0.08em] hover:bg-surface-tint transition-colors uppercase"
            >
              Practice Weak Concepts Only
            </button>
          )}
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

function TrendIndicator({ trend }: { trend: Trend }) {
  if (trend === 'unknown') return null
  const map = {
    improving: { glyph: '▲', cls: 'text-correct',   label: 'Improving' },
    declining: { glyph: '▼', cls: 'text-wrong',     label: 'Declining' },
    stable:    { glyph: '─', cls: 'text-text-dim',  label: 'Stable'    },
  } as const
  const t = map[trend]
  return (
    <span
      className={`text-[0.7rem] leading-none ${t.cls}`}
      title={`Trend: ${t.label}`}
      aria-label={`Trend: ${t.label}`}
    >
      {t.glyph}
    </span>
  )
}

function ModuleCard({
  label,
  accuracy,
  attempts,
  trend,
  onClick,
}: {
  label: string
  accuracy: number
  attempts: number
  trend: Trend
  onClick: () => void
}) {
  const pct = attempts === 0 ? 0 : Math.round(accuracy * 100)
  const display = attempts === 0 ? '—' : `${pct}%`
  const barWidth = attempts === 0 ? 0 : pct

  return (
    <button
      onClick={onClick}
      className="text-left bg-surface-alt border border-border-light rounded p-3 hover:border-accent hover:bg-surface-tint transition-colors group"
    >
      <div className="text-[0.65rem] text-text-dim uppercase tracking-[0.08em] group-hover:text-accent transition-colors">
        {label}
      </div>
      <div className="flex items-baseline gap-[6px] mt-1">
        <span className="text-[1.3rem] font-medium text-text-primary">{display}</span>
        <TrendIndicator trend={trend} />
      </div>
      <div className="h-[3px] bg-border rounded-sm overflow-hidden mt-2">
        <div
          className="h-full rounded-sm"
          style={{
            width: `${barWidth}%`,
            background: 'linear-gradient(90deg, var(--accent), var(--accent-light))',
          }}
        />
      </div>
      <div className="text-[0.6rem] text-text-faint mt-1">
        {attempts === 0 ? 'No attempts yet' : `${attempts} attempt${attempts === 1 ? '' : 's'}`}
      </div>
    </button>
  )
}

function WeakModuleRow({
  entry,
  label,
  trend,
  onPractice,
}: {
  entry: WeakModuleEntry
  label: string
  trend: Trend
  onPractice: () => void
}) {
  const pct = Math.round(entry.accuracy * 100)
  return (
    <li className="flex items-center justify-between gap-3 py-2 px-3 bg-surface-alt border border-border-light rounded">
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[0.95rem] text-text-primary font-medium">{label}</span>
          <TrendIndicator trend={trend} />
        </div>
        <span className="text-[0.65rem] text-text-faint tracking-wide mt-[2px]">
          {pct}% accuracy
          <span className="mx-2 text-text-ghost">·</span>
          {entry.totalCorrect}/{entry.totalAttempts} correct
        </span>
      </div>
      <button
        onClick={onPractice}
        className="shrink-0 text-[0.65rem] font-sans uppercase tracking-[0.08em] py-[6px] px-3 rounded border border-border-light text-text-dim hover:border-accent hover:text-accent hover:bg-surface-tint transition-colors"
      >
        Practice
      </button>
    </li>
  )
}
