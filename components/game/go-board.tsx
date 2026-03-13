"use client"

import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { Intersection } from "@/components/game/intersection"
import type { StoneColor } from "@/components/game/stone"

const LETTERS = "ABCDEFGHJKLMNOPQRST".split("")

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
  const letters = LETTERS.slice(0, size)
  const numbers = Array.from({ length: size }, (_, i) => size - i)

  return (
    <div className={cn("w-full max-w-2xl", className)}>
      {/* Frame */}
      <div className="relative rounded-3xl border-2 border-primary/15 bg-board-frame p-6 shadow-board md:p-8">
        {/* Surface */}
        <div className="board-texture relative overflow-hidden rounded-2xl bg-board-surface p-4 md:p-5">

          {/* 2×2 coordinate + board grid
              col: [label-width] [board]
              row: [label-height] [board] */}
          <div
            className="grid gap-x-2 gap-y-1"
            style={{ gridTemplateColumns: "1.25rem 1fr", gridTemplateRows: "1.25rem 1fr" }}
          >
            {/* [0,0] — empty corner */}
            <div />

            {/* [0,1] — column letters (A B C … T) */}
            <div
              className="grid"
              style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
            >
              {letters.map((letter) => (
                <span
                  key={letter}
                  className="text-center font-mono text-[9px] font-semibold leading-none text-board-grid/55 md:text-[10px]"
                >
                  {letter}
                </span>
              ))}
            </div>

            {/* [1,0] — row numbers (19 … 1) */}
            <div
              className="grid"
              style={{ gridTemplateRows: `repeat(${size}, 1fr)` }}
            >
              {numbers.map((number) => (
                <span
                  key={number}
                  className="flex items-center justify-end font-mono text-[9px] font-semibold leading-none text-board-grid/55 md:text-[10px]"
                >
                  {number}
                </span>
              ))}
            </div>

            {/* [1,1] — the actual board */}
            <div className="relative aspect-square w-full rounded-md">
              {/* SVG grid lines + hoshi */}
              <GridLayer size={size} hoshiPoints={hoshiPoints} />

              {/* Intersection grid */}
              <div
                className="absolute inset-0 z-10 grid h-full w-full"
                style={{
                  gridTemplateColumns: `repeat(${size}, 1fr)`,
                  gridTemplateRows: `repeat(${size}, 1fr)`,
                }}
              >
                {board.map((row, y) =>
                  row.map((stone, x) => (
                    <div
                      key={`${x}-${y}`}
                      className="h-full w-full"
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
  const cellPct = 100 / (size - 1)
  const positions = Array.from({ length: size }, (_, i) => i * cellPct)
  const hoshiR = size === 19 ? 0.9 : 1.1

  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {positions.map((p) => (
        <line
          key={`v-${p}`}
          x1={p} x2={p} y1="0" y2="100"
          stroke="var(--board-grid)"
          strokeOpacity="0.5"
          strokeWidth="0.25"
          vectorEffect="non-scaling-stroke"
        />
      ))}
      {positions.map((p) => (
        <line
          key={`h-${p}`}
          x1="0" x2="100" y1={p} y2={p}
          stroke="var(--board-grid)"
          strokeOpacity="0.5"
          strokeWidth="0.25"
          vectorEffect="non-scaling-stroke"
        />
      ))}
      {hoshiPoints.map((pt, i) => (
        <circle
          key={`hoshi-${i}`}
          cx={(pt.x / (size - 1)) * 100}
          cy={(pt.y / (size - 1)) * 100}
          r={hoshiR}
          fill="var(--board-hoshi)"
          fillOpacity="0.7"
        />
      ))}
    </svg>
  )
}

function getHoshiPoints(size: 9 | 13 | 19) {
  if (size === 9) {
    return [
      { x: 2, y: 2 }, { x: 6, y: 2 },
      { x: 4, y: 4 },
      { x: 2, y: 6 }, { x: 6, y: 6 },
    ]
  }
  if (size === 13) {
    return [
      { x: 3, y: 3 }, { x: 9, y: 3 },
      { x: 6, y: 6 },
      { x: 3, y: 9 }, { x: 9, y: 9 },
    ]
  }
  return [
    { x: 3, y: 3 },  { x: 9, y: 3 },  { x: 15, y: 3 },
    { x: 3, y: 9 },  { x: 9, y: 9 },  { x: 15, y: 9 },
    { x: 3, y: 15 }, { x: 9, y: 15 }, { x: 15, y: 15 },
  ]
}
