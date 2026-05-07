import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-alt': 'var(--surface-alt)',
        'surface-deep': 'var(--surface-deep)',
        'surface-tint': 'var(--surface-tint)',

        border: 'var(--border)',
        'border-light': 'var(--border-light)',
        'border-strong': 'var(--border-strong)',

        'text-primary': 'var(--text-primary)',
        'text-muted': 'var(--text-muted)',
        'text-dim': 'var(--text-dim)',
        'text-faint': 'var(--text-faint)',
        'text-ghost': 'var(--text-ghost)',

        accent: 'var(--accent)',
        'accent-light': 'var(--accent-light)',
        'accent-deep': 'var(--accent-deep)',

        correct: 'var(--correct)',
        'correct-tint': 'var(--correct-tint)',
        'correct-bright': 'var(--correct-bright)',

        wrong: 'var(--wrong)',
        'wrong-tint': 'var(--wrong-tint)',
        'wrong-bright': 'var(--wrong-bright)',

        minor: 'var(--minor)',
        'minor-dark': 'var(--minor-dark)',

        'badge-default-bg': 'var(--badge-default-bg)',
        'badge-default-text': 'var(--badge-default-text)',
        'badge-default-border': 'var(--badge-default-border)',
        'badge-chords-bg': 'var(--badge-chords-bg)',
        'badge-chords-text': 'var(--badge-chords-text)',
        'badge-chords-border': 'var(--badge-chords-border)',
        'badge-reverse-bg': 'var(--badge-reverse-bg)',
        'badge-reverse-text': 'var(--badge-reverse-text)',
        'badge-reverse-border': 'var(--badge-reverse-border)',
        'badge-roman-bg': 'var(--badge-roman-bg)',
        'badge-roman-text': 'var(--badge-roman-text)',
        'badge-roman-border': 'var(--badge-roman-border)',
        'badge-scales-bg': 'var(--badge-scales-bg)',
        'badge-scales-text': 'var(--badge-scales-text)',
        'badge-scales-border': 'var(--badge-scales-border)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
        serif: ['var(--font-playfair)', 'serif'],
      },
    },
  },
  plugins: [],
}

export default config
