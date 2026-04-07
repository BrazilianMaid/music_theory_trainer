export default function Header({ topic }) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Circle of Fifths Trainer</h1>
        {topic && (
          <span className="text-sm font-medium text-violet-700 bg-violet-50 px-3 py-1 rounded-full">
            {topic}
          </span>
        )}
      </div>
    </header>
  )
}
