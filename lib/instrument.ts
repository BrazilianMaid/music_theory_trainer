'use client'

import { useEffect, useState } from 'react'
import type { Instrument } from './types'

export type { Instrument }

const STORAGE_KEY = 'mtt_instrument'

const VALID: readonly Instrument[] = ['guitar', 'piano', 'none'] as const

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

function readSaved(): Instrument | null {
  if (!isBrowser()) return null
  try {
    const v = window.localStorage.getItem(STORAGE_KEY)
    return VALID.includes(v as Instrument) ? (v as Instrument) : null
  } catch {
    return null
  }
}

export const INSTRUMENT_LABELS: Record<Instrument, string> = {
  guitar: 'Guitar',
  piano: 'Piano',
  none: 'None',
}

export const INSTRUMENT_ICONS: Record<Instrument, string> = {
  guitar: '🎸',
  piano: '🎹',
  none: '○',
}

// Same-tab pub/sub so multiple useInstrument() callers stay in sync. Each
// component using the hook subscribes on mount; setInstrument fans out the new
// value to all subscribers.
const subscribers = new Set<(i: Instrument) => void>()

export function useInstrument(): {
  instrument: Instrument
  setInstrument: (i: Instrument) => void
} {
  const [instrument, setState] = useState<Instrument>('guitar')

  useEffect(() => {
    const saved = readSaved()
    if (saved) setState(saved)
    subscribers.add(setState)
    return () => {
      subscribers.delete(setState)
    }
  }, [])

  const setInstrument = (next: Instrument) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Storage disabled — selection still works for the session.
    }
    subscribers.forEach((fn) => fn(next))
  }

  return { instrument, setInstrument }
}
