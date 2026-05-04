interface ScoreboardProps {
  correct: number
  wrong: number
  streak: number
  total: number
}

export function Scoreboard({ correct, wrong, streak, total }: ScoreboardProps) {
  return (
    <div className="flex gap-6 mb-5 bg-surface-alt border border-[#2a2a2a] px-6 py-3 rounded">
      <ScoreItem label="Correct" value={correct} className="text-correct" />
      <ScoreItem label="Wrong"   value={wrong}   className="text-wrong" />
      <ScoreItem label="Streak"  value={streak}  className="text-text-primary" />
      <ScoreItem label="Total"   value={total}   className="text-text-primary" />
    </div>
  )
}

function ScoreItem({
  label,
  value,
  className,
}: {
  label: string
  value: number
  className: string
}) {
  return (
    <div className="text-center">
      <div className="text-[0.6rem] text-text-faint uppercase tracking-widest">{label}</div>
      <div className={`text-[1.4rem] font-medium ${className}`}>{value}</div>
    </div>
  )
}
