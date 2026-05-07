'use client'

import { useInstrument, INSTRUMENT_LABELS, INSTRUMENT_ICONS, type Instrument } from '@/lib/instrument'

const ORDER: Instrument[] = ['guitar', 'piano', 'none']

export function InstrumentSelector() {
  const { instrument, setInstrument } = useInstrument()

  return (
    <label className="inline-flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.08em] text-text-dim">
      <span className="leading-none" aria-hidden="true">{INSTRUMENT_ICONS[instrument]}</span>
      <span className="sr-only">Instrument:</span>
      <select
        value={instrument}
        onChange={(e) => setInstrument(e.target.value as Instrument)}
        aria-label="Instrument-specific tips"
        className="bg-surface-alt border border-border-light rounded px-2 py-1 text-text-primary text-[0.7rem] font-sans cursor-pointer hover:border-accent transition-colors"
      >
        {ORDER.map((inst) => (
          <option key={inst} value={inst}>
            {INSTRUMENT_LABELS[inst]}
          </option>
        ))}
      </select>
    </label>
  )
}
