export default function QuizSummary({ score, topicTitle, onRetry, onChooseTopic }) {
  const { correct, incorrect, total, percentage } = score

  return (
    <div className="max-w-md mx-auto px-4 py-12 text-center">
      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
        Session Complete
      </p>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mb-8">
        <p className="text-6xl font-bold text-violet-700 mb-1">
          {correct}<span className="text-3xl text-gray-400 font-normal"> / {total}</span>
        </p>
        <p className="text-2xl font-semibold text-gray-700 mb-6">{percentage}%</p>

        <div className="flex justify-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
            <span className="text-gray-600">Correct: <strong className="text-gray-900">{correct}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
            <span className="text-gray-600">Incorrect: <strong className="text-gray-900">{incorrect}</strong></span>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-6">Topic: {topicTitle}</p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 active:bg-violet-800 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
        >
          Try Again
        </button>
        <button
          onClick={onChooseTopic}
          className="px-6 py-3 bg-white text-violet-700 font-semibold rounded-xl border-2 border-violet-600 hover:bg-violet-50 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
        >
          Choose Another Topic
        </button>
      </div>
    </div>
  )
}
