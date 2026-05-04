export interface Question {
  type: string
  conceptKey: string
  modeBadge: string
  modeClass: string
  answer: string
  options: string[]
  questionText: string
  explanation: string
  meta?: Record<string, unknown>
}

export interface QuizModule {
  id: string
  label: string
  generate: () => Question
  deepDive: (question: Question) => string
}
