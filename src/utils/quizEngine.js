const QUESTIONS_PER_SESSION = 20

// Returns a shuffled array of `count` questions for the given topic,
// with options shuffled so the correct answer isn't always in the same position.
export function buildSession(allQuestions, topicId, count = QUESTIONS_PER_SESSION) {
  const topicQuestions = allQuestions.filter((q) => q.topic === topicId)
  const shuffled = [...topicQuestions].sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, count)

  // Shuffle options for each question so correct answer position varies
  return selected.map((q) => ({
    ...q,
    options: [...q.options].sort(() => Math.random() - 0.5),
  }))
}

export function isCorrect(question, selectedAnswer) {
  return selectedAnswer === question.correctAnswer
}

export function computeScore(questions, answers) {
  const correct = answers.filter((a, i) => a === questions[i].correctAnswer).length
  return {
    correct,
    incorrect: questions.length - correct,
    total: questions.length,
    percentage: Math.round((correct / questions.length) * 100),
  }
}
