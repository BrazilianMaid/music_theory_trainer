/**
 * Thin wrapper for error reporting. The point is to give the codebase a
 * single function — `reportError(error, context)` — to call wherever an
 * unexpected failure happens, so wiring up Sentry (or any other service)
 * later is a one-line change instead of a refactor.
 *
 * Currently a no-op in production and a console.error in dev. To enable
 * Sentry:
 *   1. npm install @sentry/nextjs
 *   2. Initialize in instrumentation.ts (or app/layout.tsx) with the DSN
 *      from process.env.NEXT_PUBLIC_SENTRY_DSN.
 *   3. Replace this file's reportError() body with Sentry.captureException
 *      forwarding.
 *   4. Update vercel.json CSP — add the Sentry ingest origin to
 *      connect-src (currently 'self' only).
 */

export interface ErrorContext {
  componentStack?: string
  [key: string]: unknown
}

export function reportError(error: unknown, context?: ErrorContext): void {
  if (typeof window === 'undefined') return

  // Always log in dev so an engineer sees the failure in the console.
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.error('[error-reporting]', error, context)
    return
  }

  // Production today: no-op. Wire Sentry here when ready (see file header).
}
