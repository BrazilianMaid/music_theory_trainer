'use client'

import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'mtt_theme'

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

function readSavedTheme(): Theme | null {
  if (!isBrowser()) return null
  try {
    const v = window.localStorage.getItem(STORAGE_KEY)
    return v === 'light' || v === 'dark' ? v : null
  } catch {
    return null
  }
}

function systemPrefersDark(): boolean {
  if (!isBrowser() || !window.matchMedia) return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyTheme(theme: Theme): void {
  if (!isBrowser()) return
  const root = document.documentElement
  if (theme === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
}

export function useTheme(): { theme: Theme; toggle: () => void; setTheme: (t: Theme) => void } {
  // Default matches the FOUC-prevention script in app/layout.tsx so the first
  // paint and React's first render agree.
  const [theme, setThemeState] = useState<Theme>('light')

  useEffect(() => {
    const initial = readSavedTheme() ?? (systemPrefersDark() ? 'dark' : 'light')
    setThemeState(initial)
    applyTheme(initial)
  }, [])

  const setTheme = (next: Theme) => {
    setThemeState(next)
    applyTheme(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Storage disabled or full — toggle still works for the session.
    }
  }

  const toggle = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  return { theme, toggle, setTheme }
}
