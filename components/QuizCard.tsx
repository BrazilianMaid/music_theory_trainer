'use client'

import type { Question } from '@/lib/types'
import { DeepDive } from './DeepDive'

interface QuizCardProps {
  question: Question
  answered: boolean
  selectedAnswer: string | null
  onAnswer: (answer: string) => void
  onNext: () => void
  deepDiveContent: string
}

const BADGE_CLASSES: Record<string, string> = {
  '':       'bg-badge-default-bg text-badge-default-text border-badge-default-border',
  chords:   'bg-badge-chords-bg text-badge-chords-text border-badge-chords-border',
  reverse:  'bg-badge-reverse-bg text-badge-reverse-text border-badge-reverse-border',
  roman:    'bg-badge-roman-bg text-badge-roman-text border-badge-roman-border',
  scales:   'bg-badge-scales-bg text-badge-scales-text border-badge-scales-border',
}

export function QuizCard({
  question,
  answered,
  selectedAnswer,
  onAnswer,
  onNext,
  deepDiveContent,
}: QuizCardProps) {
  const badgeClass = BADGE_CLASSES[question.modeClass] ?? BADGE_CLASSES['']

  const getOptionClass = (option: string): string => {
    const base =
      'font-mono text-[0.85rem] py-3 px-2 rounded border text-center cursor-pointer transition-all'

    if (!answered) {
      return `${base} bg-surface-alt border-border-light text-text-primary hover:border-accent hover:text-accent hover:bg-surface-tint`
    }
    if (option === question.answer) {
      return `${base} border-correct bg-correct-tint text-correct cursor-default`
    }
    if (option === selectedAnswer) {
      return `${base} border-wrong bg-wrong-tint text-wrong cursor-default`
    }
    return `${base} bg-surface-alt border-border-light text-text-muted cursor-default`
  }

  return (
    <div className="bg-surface border border-border rounded-md p-7 w-full max-w-[560px] mb-5 shadow-sm">
      <div
        className={`inline-block text-[0.6rem] uppercase tracking-[0.12em] px-2 py-[3px] rounded-sm mb-4 border ${badgeClass}`}
      >
        {question.modeBadge}
      </div>

      <div
        className="font-serif text-[1.15rem] text-text-primary mb-5 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: question.questionText }}
      />

      <div className="grid grid-cols-2 gap-[10px] mb-4">
        {question.options.map((option) => (
          <button
            key={option}
            className={getOptionClass(option)}
            disabled={answered}
            onClick={() => onAnswer(option)}
          >
            {option}
          </button>
        ))}
      </div>

      {answered && (
        <div className="bg-surface-deep border-l-[3px] border-accent rounded-r mb-3 overflow-hidden">
          <div className="px-4 py-3">
            <div className="text-accent text-[0.65rem] uppercase tracking-[0.1em] mb-[6px] font-medium">Why</div>
            <div
              className="text-[0.8rem] leading-relaxed text-text-muted"
              dangerouslySetInnerHTML={{ __html: question.explanation }}
            />
          </div>
          <DeepDive content={deepDiveContent} />
        </div>
      )}

      {answered && (
        <button
          onClick={onNext}
          className="w-full bg-accent text-white border-none font-sans text-[0.85rem] font-medium py-[13px] rounded cursor-pointer tracking-[0.08em] hover:bg-accent-light transition-colors mt-1"
        >
          Next Question →
        </button>
      )}
    </div>
  )
}
