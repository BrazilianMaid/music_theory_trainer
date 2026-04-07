// Shown after an answer is selected. Displays correct/incorrect result
// and a theory explanation for every answer regardless of correctness.

export default function QuizFeedback({ isAnswered, wasCorrect, explanation }) {
  if (!isAnswered) return null

  return (
    <div
      className={`rounded-xl p-4 mb-6 border ${
        wasCorrect
          ? 'bg-green-50 border-green-200'
          : 'bg-red-50 border-red-200'
      }`}
    >
      <p
        className={`font-semibold mb-1 ${
          wasCorrect ? 'text-green-800' : 'text-red-700'
        }`}
      >
        {wasCorrect ? '✓ Correct!' : '✗ Incorrect'}
      </p>
      <p className="text-sm text-gray-700 leading-relaxed">{explanation}</p>
    </div>
  )
}
