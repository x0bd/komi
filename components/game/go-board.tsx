"use client"

import { useMemo, useState } from "react"

import { cn } from "@/lib/utils"
import { CoordinateLabels } from "@/components/game/coordinate-labels"
import { Intersection } from "@/components/game/intersection"
import type { StoneColor } from "@/components/game/stone"

type BoardCell = StoneColor | null

export function GoBoard({
  size = 19,
  board,
  currentPlayer = "black",
  lastMove,
  className,
}: {
  size?: 9 | 13 | 19
  board: BoardCell[][]
  currentPlayer?: StoneColor
  lastMove?: { x: number; y: number }
  className?: string
}) {
  const [hovered, setHovered] = useState<{ x: number; y: number } | null>(null)

  const hoshiPoints = useMemo(() => getHoshiPoints(size), [size])

  return (
    <div className={cn("w-full max-w-[42rem]", className)}>
      <div className="rounded-[2rem] border border-white/5 bg-board-frame p-4 shadow-[0_30px_80px_var(--stone-shadow),0_8px_20px_var(--stone-shadow)] md:p-5">
        <div className="rounded-[1.5rem] border border-white/8 bg-board-surface board-texture px-3 pb-3 pt-4 md:px-5 md:pb-5 md:pt-5">
          <div className="grid grid-cols-[auto_1fr] grid-rows-[auto_1fr] gap-3">
            <CoordinateLabels size={size} />

            <div className="relative aspect-square w-full overflow-hidden rounded-[1rem]">
              <GridLayer size={size} hoshiPoints={hoshiPoints} />

              <div
                className={cn(
                  "relative z-10 grid h-full w-full",
                  size === 9 && "grid-cols-9 grid-rows-9",
                  size === 13 && "grid-cols-13 grid-rows-13",
                  size === 19 && "grid-cols-19 grid-rows-19"
                )}
              >
                {board.map((row, y) =>
                  row.map((stone, x) => (
                    <div
                      key={`${x}-${y}`}
                      onMouseEnter={() => setHovered({ x, y })}
                      onMouseLeave={() => setHovered(null)}
                    >
                      <Intersection
                        stone={stone ?? undefined}
                        ghostColor={!stone ? currentPlayer : undefined}
                        hovered={!stone && hovered?.x === x && hovered?.y === y}
                        isLastMove={lastMove?.x === x && lastMove?.y === y}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function GridLayer({
  size,
  hoshiPoints,
}: {
  size: 9 | 13 | 19
  hoshiPoints: Array<{ x: number; y: number }>
}) {
  const positions = Array.from({ length: size }, (_, i) => (i / (size - 1)) * 100)

  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {positions.map((position) => (
        <line
          key={`v-${position}`}
          x1={position}
          x2={position}
          y1="0"
          y2="100"
          stroke="var(--board-grid)"
          strokeOpacity="0.48"
          strokeWidth="0.32"
        />
      ))}
      {positions.map((position) => (
        <line
          key={`h-${position}`}
          y1={position}
          y2={position}
          x1="0"
          x2="100"
          stroke="var(--board-grid)"
          strokeOpacity="0.48"
          strokeWidth="0.32"
        />
      ))}
      {hoshiPoints.map((point, index) => (
        <circle
          key={`hoshi-${index}`}
          cx={(point.x / (size - 1)) * 100}
          cy={(point.y / (size - 1)) * 100}
          r={size === 19 ? 0.95 : 1.15}
          fill="var(--board-hoshi)"
          fillOpacity="0.72"
        />
      ))}
    </svg>
  )
}

function getHoshiPoints(size: 9 | 13 | 19) {
  if (size === 9) {
    return [
      { x: 2, y: 2 },
      { x: 6, y: 2 },
      { x: 4, y: 4 },
      { x: 2, y: 6 },
      { x: 6, y: 6 },
    ]
  }

  if (size === 13) {
    return [
      { x: 3, y: 3 },
      { x: 9, y: 3 },
      { x: 6, y: 6 },
      { x: 3, y: 9 },
      { x: 9, y: 9 },
    ]
  }

  return [
    { x: 3, y: 3 },
    { x: 9, y: 3 },
    { x: 15, y: 3 },
    { x: 3, y: 9 },
    { x: 9, y: 9 },
    { x: 15, y: 9 },
    { x: 3, y: 15 },
    { x: 9, y: 15 },
    { x: 15, y: 15 },
  ]
}
