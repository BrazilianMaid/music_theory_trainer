'use client'

import { useState } from 'react'
import Dashboard from './Dashboard'
import QuizApp, { type QuizConfig } from './QuizApp'

type View = 'dashboard' | 'quiz'

export default function AppShell() {
  const [view, setView] = useState<View>('dashboard')
  const [quizConfig, setQuizConfig] = useState<QuizConfig>({ mode: 'all' })

  if (view === 'quiz') {
    return (
      <QuizApp
        // Force a fresh QuizApp instance per quiz session so internal state
        // (current question, scores, recent types) resets cleanly.
        key={`${quizConfig.mode}:${quizConfig.filter?.weakOnly ? 'weak' : 'all'}`}
        config={quizConfig}
        onHome={() => setView('dashboard')}
      />
    )
  }

  return (
    <Dashboard
      onStartQuiz={(config) => {
        setQuizConfig(config)
        setView('quiz')
      }}
    />
  )
}
