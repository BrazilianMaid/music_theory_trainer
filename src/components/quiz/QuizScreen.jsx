import CircleOfFifths from '../circle/CircleOfFifths'
import QuizProgress from './QuizProgress'
import QuizCard from './QuizCard'
import QuizOptions from './QuizOptions'
import QuizFeedback from './QuizFeedback'
import { QUESTIONS_PER_SESSION } from '../../utils/quizEngine'

export default function QuizScreen({ quiz }) {
  const {
    currentQuestion,
    currentIndex,
    isAnswered,
    isLastQuestion,
    wasCorrect,
    selectAnswer,
    advanceQuestion,
    getAnswerState,
  } = quiz

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Desktop: two-column. Mobile: single column with diagram on top. */}
      <div className="flex flex-col lg:flex-row gap-8">

        {/* Left column: Circle of Fifths (always visible) */}
        <div className="lg:w-2/5 flex justify-center">
          <div className="w-full max-w-sm lg:sticky lg:top-6 lg:self-start">
            <CircleOfFifths />
          </div>
        </div>

        {/* Right column: quiz content */}
        <div className="lg:w-3/5">
          <QuizProgress
            current={currentIndex + 1}
            total={QUESTIONS_PER_SESSION}
          />

          <QuizCard question={currentQuestion.question} />

          <QuizOptions
            options={currentQuestion.options}
            onSelect={selectAnswer}
            getAnswerState={getAnswerState}
            isAnswered={isAnswered}
          />

          <QuizFeedback
            isAnswered={isAnswered}
            wasCorrect={wasCorrect}
            explanation={currentQuestion.explanation}
          />

          {isAnswered && (
            <button
              onClick={advanceQuestion}
              className="w-full sm:w-auto px-6 py-3 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 active:bg-violet-800 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
            >
              {isLastQuestion ? 'See Results →' : 'Next Question →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
