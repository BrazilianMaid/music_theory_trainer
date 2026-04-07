export default function QuizProgress({ current, total }) {
  const percent = (current / total) * 100

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-500">
          Question {current} of {total}
        </span>
        <span className="text-sm font-medium text-violet-600">
          {Math.round(percent)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-violet-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
