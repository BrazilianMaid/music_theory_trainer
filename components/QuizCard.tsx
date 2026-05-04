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
  '':       'bg-[#1a1a2e] text-minor   border-minor-dark',
  chords:   'bg-[#1a2e1a] text-[#7bde8c] border-[#2d612d]',
  reverse:  'bg-[#2e1a1a] text-[#de8c7b] border-[#612d2d]',
  roman:    'bg-[#2e2a1a] text-[#dec97b] border-[#615d2d]',
  scales:   'bg-[#1a2e2e] text-[#7bcfde] border-[#2d6161]',
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
      return `${base} bg-surface-alt border-border-light text-[#ccc] hover:border-gold hover:text-gold hover:bg-[#1a1700]`
    }
    if (option === question.answer) {
      return `${base} border-correct bg-[#0a1f0a] text-correct cursor-default`
    }
    if (option === selectedAnswer) {
      return `${base} border-wrong bg-[#1f0a0a] text-wrong cursor-default`
    }
    return `${base} bg-surface-alt border-border-light text-[#ccc] cursor-default`
  }

  return (
    <div className="bg-surface border border-border rounded-md p-7 w-full max-w-[560px] mb-5">
      <div
        className={`inline-block text-[0.6rem] uppercase tracking-[0.12em] px-2 py-[3px] rounded-sm mb-4 border ${badgeClass}`}
      >
        {question.modeBadge}
      </div>

      <div
        className="font-serif text-[1.15rem] text-[#ddd] mb-5 leading-relaxed"
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
        <div className="bg-[#0e0e0e] border-l-[3px] border-gold rounded-r mb-3 overflow-hidden">
          <div className="px-4 py-3">
            <div className="text-gold text-[0.65rem] uppercase tracking-[0.1em] mb-[6px]">Why</div>
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
          className="w-full bg-gold text-bg border-none font-mono text-[0.85rem] font-medium py-[13px] rounded cursor-pointer tracking-[0.08em] hover:bg-gold-light transition-colors mt-1"
        >
          Next Question →
        </button>
      )}
    </div>
  )
}
