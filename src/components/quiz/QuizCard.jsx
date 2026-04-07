export default function QuizCard({ question }) {
  return (
    <div className="mb-6">
      <p className="text-xl font-semibold text-gray-900 leading-snug">
        {question}
      </p>
    </div>
  )
}
