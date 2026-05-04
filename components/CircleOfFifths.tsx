import { CIRCLE_DATA } from '@/lib/theory-data'

function annular(
  cx: number, cy: number,
  r1: number, r2: number,
  a1: number, a2: number,
): string {
  const x1 = cx + r2 * Math.cos(a1), y1 = cy + r2 * Math.sin(a1)
  const x2 = cx + r2 * Math.cos(a2), y2 = cy + r2 * Math.sin(a2)
  const x3 = cx + r1 * Math.cos(a2), y3 = cy + r1 * Math.sin(a2)
  const x4 = cx + r1 * Math.cos(a1), y4 = cy + r1 * Math.sin(a1)
  const large = a2 - a1 > Math.PI ? 1 : 0
  return `M ${x1} ${y1} A ${r2} ${r2} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${r1} ${r1} 0 ${large} 0 ${x4} ${y4} Z`
}

export function CircleOfFifths() {
  const cx = 240, cy = 240
  const outerR = 200, midR = 148, innerR = 100, sigR = 68
  const n = 12

  const majorR  = (midR + 2 + outerR) / 2
  const minorRad = (innerR + 2 + midR - 2) / 2

  return (
    <svg
      viewBox="0 0 480 480"
      width="100%"
      style={{ maxWidth: 460 }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#1a1a2e" />
          <stop offset="100%" stopColor="#0d0d0d" />
        </radialGradient>
      </defs>

      <circle cx={cx} cy={cy} r={outerR + 8} fill="url(#bgGrad)" stroke="#2a2a2a" strokeWidth="1" />

      {CIRCLE_DATA.map((d, i) => {
        const startAngle = (i / n) * 2 * Math.PI - Math.PI / 2 - Math.PI / n
        const endAngle   = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2 - Math.PI / n
        const midAngle   = (startAngle + endAngle) / 2

        const isSharp = i >= 1 && i <= 5
        const isFlat  = i >= 7 && i <= 11
        const isBoth  = i === 6

        const outerFill   = isSharp ? '#1a2a1a' : isFlat ? '#2a1a1a' : isBoth ? '#1a1a2a' : '#1e1a10'
        const outerStroke = isSharp ? '#2d612d' : isFlat ? '#612d2d' : isBoth ? '#2d2d61' : '#4a3a10'
        const majorColor  = isSharp ? '#7bde8c' : isFlat ? '#de8c7b' : isBoth ? '#9b9bde' : '#c9a84c'

        return (
          <g key={i}>
            <path
              d={annular(cx, cy, midR + 2, outerR, startAngle, endAngle)}
              fill={outerFill} stroke={outerStroke} strokeWidth="1"
            />
            <path
              d={annular(cx, cy, innerR + 2, midR - 2, startAngle, endAngle)}
              fill="#1a1a2e" stroke="#2d3561" strokeWidth="1"
            />
            <text
              x={cx + majorR * Math.cos(midAngle)}
              y={cy + majorR * Math.sin(midAngle)}
              textAnchor="middle" dominantBaseline="central"
              fontFamily="var(--font-mono), monospace"
              fontSize={d.major.length > 3 ? 9 : 13}
              fontWeight="500" fill={majorColor}
            >
              {d.major}
            </text>
            <text
              x={cx + minorRad * Math.cos(midAngle)}
              y={cy + minorRad * Math.sin(midAngle)}
              textAnchor="middle" dominantBaseline="central"
              fontFamily="var(--font-mono), monospace"
              fontSize={d.minor.length > 4 ? 8 : 10}
              fontWeight="400" fill="#7b8cde"
            >
              {d.minor}
            </text>
            <text
              x={cx + sigR * Math.cos(midAngle)}
              y={cy + sigR * Math.sin(midAngle)}
              textAnchor="middle" dominantBaseline="central"
              fontFamily="var(--font-mono), monospace"
              fontSize="9" fontWeight="400" fill="#555"
            >
              {d.sig}
            </text>
          </g>
        )
      })}

      <circle cx={cx} cy={cy} r={innerR - 2} fill="#0d0d0d" stroke="#2a2a2a" strokeWidth="1" />

      <text x={cx} y={cy - 10} textAnchor="middle" dominantBaseline="central"
            fontFamily="var(--font-playfair), serif" fontSize="13" fontWeight="400" fill="#c9a84c">
        Circle
      </text>
      <text x={cx} y={cy + 8} textAnchor="middle" dominantBaseline="central"
            fontFamily="var(--font-playfair), serif" fontSize="13" fontWeight="400" fill="#c9a84c">
        of Fifths
      </text>
      <text x={cx} y={cy + 26} textAnchor="middle" dominantBaseline="central"
            fontFamily="var(--font-mono), monospace" fontSize="8" fontWeight="400" fill="#444">
        (sig counts)
      </text>
      <text x={cx} y={14} textAnchor="middle" dominantBaseline="central"
            fontFamily="var(--font-mono), monospace" fontSize="8" fontWeight="400" fill="#444">
        ↻ +1♯ clockwise   ↺ +1♭ counter-clockwise
      </text>
    </svg>
  )
}
