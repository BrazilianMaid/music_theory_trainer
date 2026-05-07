interface StreakBarProps {
  streak: number
}

export function StreakBar({ streak }: StreakBarProps) {
  const pct = Math.min((streak / 10) * 100, 100)
  return (
    <div className="w-full max-w-[560px] h-[3px] bg-border rounded-sm mb-5 overflow-hidden">
      <div
        className="h-full rounded-sm transition-[width] duration-400 ease-out"
        style={{
          width: `${pct}%`,
          background: 'linear-gradient(90deg, var(--accent), var(--accent-light))',
        }}
      />
    </div>
  )
}
