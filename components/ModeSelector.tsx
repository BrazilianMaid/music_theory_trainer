'use client'

interface Mode {
  id: string
  label: string
}

interface ModeSelectorProps {
  modes: Mode[]
  currentMode: string
  onModeChange: (mode: string) => void
}

export function ModeSelector({ modes, currentMode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="flex gap-2 mb-5 flex-wrap justify-center w-full max-w-[560px]">
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onModeChange(mode.id)}
          className={[
            'border font-mono text-[0.65rem] px-3 py-[6px] rounded-sm uppercase tracking-[0.08em] transition-all',
            currentMode === mode.id
              ? 'border-gold text-gold bg-[#1a1700]'
              : 'border-border-light text-text-dim bg-surface-alt hover:border-gold hover:text-gold hover:bg-[#1a1700]',
          ].join(' ')}
        >
          {mode.label}
        </button>
      ))}
    </div>
  )
}
