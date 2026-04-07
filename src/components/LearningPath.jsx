export default function LearningPath({ topics, onSelectTopic }) {
  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <p className="text-gray-600 mb-8">
        Build your music theory foundation. Choose a topic below to begin a 20-question session.
        Topics are listed in recommended order, but you can start anywhere.
      </p>

      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
        Learning Path
      </h2>

      <div className="flex flex-col gap-3">
        {topics.map((topic) => (
          <button
            key={topic.id}
            onClick={() => onSelectTopic(topic)}
            className="w-full text-left bg-white border border-gray-200 rounded-xl p-5 hover:border-violet-500 hover:shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
          >
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-100 text-violet-700 text-sm font-bold flex items-center justify-center">
                {topic.order}
              </span>
              <div>
                <p className="font-semibold text-gray-900">{topic.title}</p>
                <p className="text-sm text-gray-500 mt-0.5">{topic.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
