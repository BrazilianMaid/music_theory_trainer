// answerState per option: 'default' | 'correct' | 'incorrect' | 'disabled'
const STATE_STYLES = {
  default: 'bg-white border-gray-200 text-gray-900 hover:border-violet-500 hover:bg-violet-50 cursor-pointer',
  correct: 'bg-green-50 border-green-400 text-green-800 cursor-default',
  incorrect: 'bg-red-50 border-red-400 text-red-800 cursor-default',
  disabled: 'bg-gray-50 border-gray-200 text-gray-400 cursor-default',
}

const STATE_ICONS = {
  correct: '✓',
  incorrect: '✗',
  default: '',
  disabled: '',
}

export default function QuizOptions({ options, onSelect, getAnswerState, isAnswered }) {
  return (
    <div className="flex flex-col gap-3 mb-6">
      {options.map((option) => {
        const state = getAnswerState(option)
        return (
          <button
            key={option}
            onClick={() => !isAnswered && onSelect(option)}
            disabled={isAnswered}
            className={`w-full text-left px-4 py-3 rounded-xl border-2 font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-1 ${STATE_STYLES[state]}`}
          >
            <span className="flex items-center justify-between">
              <span>{option}</span>
              {STATE_ICONS[state] && (
                <span className={state === 'correct' ? 'text-green-600' : 'text-red-500'}>
                  {STATE_ICONS[state]}
                </span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}
