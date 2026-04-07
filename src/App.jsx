import { useState } from 'react'
import Layout from './components/layout/Layout'
import Header from './components/layout/Header'
import LearningPath from './components/LearningPath'
import QuizScreen from './components/quiz/QuizScreen'
import QuizSummary from './components/quiz/QuizSummary'
import { useQuiz } from './hooks/useQuiz'
import { buildSession, computeScore } from './utils/quizEngine'
import learningPath from './data/learningPath'
import questions from './data/questions'

// Top-level view states
const VIEW = {
  HOME: 'home',
  QUIZ: 'quiz',
  SUMMARY: 'summary',
}

function QuizWrapper({ topic, onComplete, onChooseTopic }) {
  const [sessionQuestions] = useState(() => buildSession(questions, topic.id))
  const quiz = useQuiz(sessionQuestions)

  // When quiz completes, transition to summary
  if (quiz.isComplete) {
    const score = computeScore(sessionQuestions, quiz.answers)
    onComplete(score, sessionQuestions, topic)
  }

  return <QuizScreen quiz={quiz} />
}

export default function App() {
  const [view, setView] = useState(VIEW.HOME)
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [sessionScore, setSessionScore] = useState(null)
  const [quizKey, setQuizKey] = useState(0) // increment to remount QuizWrapper on retry

  function handleSelectTopic(topic) {
    setSelectedTopic(topic)
    setSessionScore(null)
    setQuizKey((k) => k + 1)
    setView(VIEW.QUIZ)
  }

  function handleQuizComplete(score, _sessionQuestions, topic) {
    setSessionScore(score)
    setSelectedTopic(topic)
    setView(VIEW.SUMMARY)
  }

  function handleRetry() {
    setSessionScore(null)
    setQuizKey((k) => k + 1)
    setView(VIEW.QUIZ)
  }

  function handleChooseTopic() {
    setView(VIEW.HOME)
  }

  return (
    <Layout>
      <Header topic={view === VIEW.QUIZ ? selectedTopic?.title : null} />

      {view === VIEW.HOME && (
        <LearningPath topics={learningPath} onSelectTopic={handleSelectTopic} />
      )}

      {view === VIEW.QUIZ && selectedTopic && (
        <QuizWrapper
          key={quizKey}
          topic={selectedTopic}
          onComplete={handleQuizComplete}
          onChooseTopic={handleChooseTopic}
        />
      )}

      {view === VIEW.SUMMARY && sessionScore && (
        <QuizSummary
          score={sessionScore}
          topicTitle={selectedTopic?.title}
          onRetry={handleRetry}
          onChooseTopic={handleChooseTopic}
        />
      )}
    </Layout>
  )
}
