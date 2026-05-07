'use client'

import { Component, type ErrorInfo, type ReactNode } from 'react'
import { reportError } from '@/lib/error-reporting'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

/**
 * Top-level React error boundary. Catches render-time errors anywhere
 * below it and shows a recovery UI with a Reload button instead of
 * crashing the whole app to a blank page. The error is forwarded to
 * `reportError()` so observability tooling (Sentry, etc.) can capture it.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    reportError(error, { componentStack: info.componentStack ?? undefined })
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <main className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 text-center">
          <h1 className="font-serif text-accent text-[1.6rem] tracking-[0.05em] mb-3">
            Something went wrong
          </h1>
          <p className="text-text-muted text-[0.9rem] mb-6 max-w-sm leading-relaxed">
            The app hit an unexpected error. Your progress is saved locally — reloading usually fixes it.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-accent text-accent-text font-sans text-[0.85rem] uppercase tracking-[0.08em] py-3 px-6 rounded hover:bg-accent-light transition-colors"
          >
            Reload
          </button>
        </main>
      )
    }
    return this.props.children
  }
}
