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

export type Instrument = 'guitar' | 'piano' | 'none'

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
  /**
   * Return an HTML snippet of an instrument-specific tip relevant to the
   * question, or null if there's no tip for the given instrument (or if the
   * user has opted out with 'none'). The DeepDive component appends this
   * after the narrative.
   */
  getTip?: (question: Question, instrument: Instrument) => string | null
}
