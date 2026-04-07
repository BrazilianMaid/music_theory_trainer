import { useState } from 'react'
import { isCorrect } from '../utils/quizEngine'

export function useQuiz(sessionQuestions) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [answers, setAnswers] = useState([])
  const [isComplete, setIsComplete] = useState(false)

  const currentQuestion = sessionQuestions[currentIndex]
  const isAnswered = selectedAnswer !== null
  const isLastQuestion = currentIndex === sessionQuestions.length - 1

  function selectAnswer(answer) {
    // Prevent re-selection after answering
    if (isAnswered) return
    setSelectedAnswer(answer)
    setAnswers((prev) => [...prev, answer])
  }

  function advanceQuestion() {
    if (!isAnswered) return
    if (isLastQuestion) {
      setIsComplete(true)
    } else {
      setCurrentIndex((prev) => prev + 1)
      setSelectedAnswer(null)
    }
  }

  function getAnswerState(option) {
    if (!isAnswered) return 'default'
    if (option === currentQuestion.correctAnswer) return 'correct'
    if (option === selectedAnswer) return 'incorrect'
    return 'disabled'
  }

  const wasCorrect = isAnswered ? isCorrect(currentQuestion, selectedAnswer) : null

  return {
    currentQuestion,
    currentIndex,
    selectedAnswer,
    isAnswered,
    isLastQuestion,
    isComplete,
    answers,
    wasCorrect,
    selectAnswer,
    advanceQuestion,
    getAnswerState,
  }
}
