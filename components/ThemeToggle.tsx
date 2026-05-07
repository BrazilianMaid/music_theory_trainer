'use client'

import { useTheme } from '@/lib/theme'

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-border-light text-text-dim hover:text-accent hover:border-accent transition-colors"
    >
      <span aria-hidden="true" className="text-[0.85rem] leading-none">
        {isDark ? '☀' : '☾'}
      </span>
    </button>
  )
}
