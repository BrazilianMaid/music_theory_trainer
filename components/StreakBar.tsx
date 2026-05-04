interface StreakBarProps {
  streak: number
}

export function StreakBar({ streak }: StreakBarProps) {
  const pct = Math.min((streak / 10) * 100, 100)
  return (
    <div className="w-full max-w-[560px] h-[3px] bg-[#1a1a1a] rounded-sm mb-5 overflow-hidden">
      <div
        className="h-full rounded-sm transition-[width] duration-400 ease-out"
        style={{
          width: `${pct}%`,
          background: 'linear-gradient(90deg, #c9a84c, #e0bd60)',
        }}
      />
    </div>
  )
}
