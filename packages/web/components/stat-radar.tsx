'use client'

const STAT_NAMES = ['DEBUGGING', 'PATIENCE', 'CHAOS', 'WISDOM', 'SNARK'] as const

function getEffective(base: number, growth: number): number {
  return Math.min(200, Math.max(1, Math.round(base + growth)))
}

export function StatRadar({
  baseStats,
  statGrowth,
}: {
  baseStats: Record<string, number>
  statGrowth: Record<string, number>
}) {
  const size = 200
  const center = size / 2
  const radius = 80
  const angleStep = (2 * Math.PI) / STAT_NAMES.length
  const startAngle = -Math.PI / 2

  function getPoint(i: number, value: number, maxVal: number) {
    const angle = startAngle + i * angleStep
    const r = (value / maxVal) * radius
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) }
  }

  const basePoints = STAT_NAMES.map((s, i) => getPoint(i, baseStats[s] || 0, 200))
  const effectivePoints = STAT_NAMES.map((s, i) =>
    getPoint(i, getEffective(baseStats[s] || 0, statGrowth[s] || 0), 200),
  )

  const basePath = basePoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + ' Z'
  const effectivePath = effectivePoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + ' Z'

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[250px] mx-auto">
      {/* Grid rings */}
      {[0.25, 0.5, 0.75, 1].map(scale => (
        <polygon
          key={scale}
          points={STAT_NAMES.map((_, i) => {
            const p = getPoint(i, scale * 200, 200)
            return `${p.x},${p.y}`
          }).join(' ')}
          fill="none"
          stroke="#374151"
          strokeWidth="0.5"
        />
      ))}
      {/* Axes */}
      {STAT_NAMES.map((_, i) => {
        const p = getPoint(i, 200, 200)
        return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="#374151" strokeWidth="0.5" />
      })}
      {/* Base stats */}
      <path d={basePath} fill="rgba(59,130,246,0.2)" stroke="#3b82f6" strokeWidth="1" />
      {/* Effective stats */}
      <path d={effectivePath} fill="rgba(34,197,94,0.2)" stroke="#22c55e" strokeWidth="1.5" />
      {/* Labels */}
      {STAT_NAMES.map((name, i) => {
        const p = getPoint(i, 240, 200)
        return (
          <text key={name} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
            className="fill-gray-400 text-[8px]">
            {name}
          </text>
        )
      })}
    </svg>
  )
}
