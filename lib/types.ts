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
  /**
   * Render a one-line human label for a conceptKey produced by this module.
   * Used by the dashboard's "Weakest Concepts" list. Return null if the key
   * doesn't match the module's format.
   */
  describe?: (conceptKey: string) => string | null
}
