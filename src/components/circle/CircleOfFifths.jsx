// Static SVG diagram of the Circle of Fifths.
// Shows: outer ring (major keys), middle ring (sharp/flat counts), inner ring (relative minors).
// No interactivity — reference only, per architecture v1.0.

const CX = 200
const CY = 200
const OUTER_R = 178    // outer boundary
const MAJOR_R = 155    // major key label radius
const COUNT_R = 118    // sharp/flat count label radius
const INNER_BOUNDARY_R = 92
const MINOR_R = 72     // relative minor label radius
const CORE_R = 50      // innermost circle

// 12 keys clockwise starting from C at top (270° in standard math convention)
const KEYS = [
  { major: 'C',   minor: 'Am',  count: '0',   angle: 270 },
  { major: 'G',   minor: 'Em',  count: '1♯',  angle: 300 },
  { major: 'D',   minor: 'Bm',  count: '2♯',  angle: 330 },
  { major: 'A',   minor: 'F♯m', count: '3♯',  angle: 0   },
  { major: 'E',   minor: 'C♯m', count: '4♯',  angle: 30  },
  { major: 'B',   minor: 'G♯m', count: '5♯',  angle: 60  },
  { major: 'F♯',  minor: 'D♯m', count: '6♯',  angle: 90  },
  { major: 'D♭',  minor: 'B♭m', count: '5♭',  angle: 120 },
  { major: 'A♭',  minor: 'Fm',  count: '4♭',  angle: 150 },
  { major: 'E♭',  minor: 'Cm',  count: '3♭',  angle: 180 },
  { major: 'B♭',  minor: 'Gm',  count: '2♭',  angle: 210 },
  { major: 'F',   minor: 'Dm',  count: '1♭',  angle: 240 },
]

function toRad(deg) {
  return (deg * Math.PI) / 180
}

function point(angle, radius) {
  return {
    x: CX + radius * Math.cos(toRad(angle)),
    y: CY + radius * Math.sin(toRad(angle)),
  }
}

// Build a pie-slice path between two angles, between two radii
function slicePath(startAngle, endAngle, innerR, outerR) {
  const s1 = point(startAngle, outerR)
  const e1 = point(endAngle, outerR)
  const s2 = point(endAngle, innerR)
  const e2 = point(startAngle, innerR)
  return [
    `M ${s1.x} ${s1.y}`,
    `A ${outerR} ${outerR} 0 0 1 ${e1.x} ${e1.y}`,
    `L ${s2.x} ${s2.y}`,
    `A ${innerR} ${innerR} 0 0 0 ${e2.x} ${e2.y}`,
    'Z',
  ].join(' ')
}

export default function CircleOfFifths() {
  // Segment boundaries are midpoints between key angles (15° offset)
  const segmentHalf = 15

  return (
    <div className="flex flex-col items-center">
      <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
        Circle of Fifths
      </p>
      <svg
        viewBox="0 0 400 400"
        width="100%"
        style={{ maxWidth: '360px' }}
        aria-label="Circle of Fifths diagram showing major keys, relative minors, and sharp/flat counts"
      >
        {/* ── Segment fills ── */}
        {KEYS.map((key) => {
          const start = key.angle - segmentHalf
          const end = key.angle + segmentHalf
          // Sharp keys get a warm tint, flat keys a cool tint, C neutral
          const isSharp = key.count.includes('♯')
          const isFlat = key.count.includes('♭')
          const fill = isSharp
            ? '#faf5ff'  // light violet for sharp keys
            : isFlat
            ? '#f0f9ff'  // light sky for flat keys
            : '#f9fafb'  // neutral for C

          return (
            <path
              key={key.major}
              d={slicePath(start, end, INNER_BOUNDARY_R, OUTER_R)}
              fill={fill}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          )
        })}

        {/* ── Inner segment fills (relative minors) ── */}
        {KEYS.map((key) => {
          const start = key.angle - segmentHalf
          const end = key.angle + segmentHalf
          return (
            <path
              key={`inner-${key.major}`}
              d={slicePath(start, end, CORE_R, INNER_BOUNDARY_R)}
              fill="#f3f4f6"
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          )
        })}

        {/* ── Outer circle border ── */}
        <circle cx={CX} cy={CY} r={OUTER_R} fill="none" stroke="#d1d5db" strokeWidth="1.5" />

        {/* ── Inner boundary circle ── */}
        <circle cx={CX} cy={CY} r={INNER_BOUNDARY_R} fill="none" stroke="#d1d5db" strokeWidth="1" />

        {/* ── Core circle ── */}
        <circle cx={CX} cy={CY} r={CORE_R} fill="#e9d5ff" stroke="#c4b5fd" strokeWidth="1.5" />

        {/* ── Center label ── */}
        <text
          x={CX}
          y={CY - 6}
          textAnchor="middle"
          fontSize="9"
          fontWeight="600"
          fill="#7c3aed"
          fontFamily="Inter, system-ui, sans-serif"
        >
          CIRCLE
        </text>
        <text
          x={CX}
          y={CY + 8}
          textAnchor="middle"
          fontSize="9"
          fontWeight="600"
          fill="#7c3aed"
          fontFamily="Inter, system-ui, sans-serif"
        >
          OF 5THS
        </text>

        {/* ── Key labels and counts ── */}
        {KEYS.map((key) => {
          const majorPos = point(key.angle, MAJOR_R)
          const countPos = point(key.angle, COUNT_R)
          const minorPos = point(key.angle, MINOR_R)

          return (
            <g key={`label-${key.major}`}>
              {/* Major key label */}
              <text
                x={majorPos.x}
                y={majorPos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="13"
                fontWeight="700"
                fill="#1f2937"
                fontFamily="Inter, system-ui, sans-serif"
              >
                {key.major}
              </text>

              {/* Sharp/flat count */}
              <text
                x={countPos.x}
                y={countPos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="10"
                fontWeight="500"
                fill="#6b7280"
                fontFamily="Inter, system-ui, sans-serif"
              >
                {key.count}
              </text>

              {/* Relative minor */}
              <text
                x={minorPos.x}
                y={minorPos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="10"
                fontWeight="500"
                fill="#4b5563"
                fontFamily="Inter, system-ui, sans-serif"
              >
                {key.minor}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div className="flex gap-4 mt-2 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-violet-50 border border-gray-200 inline-block" />
          Sharps
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-sky-50 border border-gray-200 inline-block" />
          Flats
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-gray-100 border border-gray-200 inline-block" />
          Relative minor
        </span>
      </div>
    </div>
  )
}
