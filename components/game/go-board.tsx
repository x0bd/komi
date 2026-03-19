"use client"

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react"
import { cn } from "@/lib/utils"
import { Intersection } from "@/components/game/intersection"
import { Stone, type StoneColor } from "@/components/game/stone"

const LETTERS = "ABCDEFGHJKLMNOPQRST".split("")

export function GoBoard({
  size = 19,
  board,
  currentPlayer = "black",
  validMoves = [],
  capturedStones = [],
  lastMove,
  onIntersectionClick,
  onHoverIntersectionChange,
  opponentHover,
  analysisHints = [],
  territoryMap,
  showTerritoryHeatmap = false,
  className,
}: {
  size?: 9 | 13 | 19
  board: number[]
  currentPlayer?: StoneColor
  validMoves?: Array<{ x: number; y: number }>
  capturedStones?: Array<{ x: number; y: number; color: StoneColor; key: string }>
  lastMove?: { x: number; y: number }
  onIntersectionClick?: (x: number, y: number) => void
  onHoverIntersectionChange?: (next: { x: number; y: number } | null) => void
  opponentHover?: { x: number; y: number; color: StoneColor } | null
  analysisHints?: Array<{ x: number; y: number; confidence: number; rank: number }>
  territoryMap?: number[]
  showTerritoryHeatmap?: boolean
  className?: string
}) {
  const [hovered, setHovered] = useState<{ x: number; y: number } | null>(null)
  const [focused, setFocused] = useState<{ x: number; y: number }>({
    x: Math.floor(size / 2),
    y: Math.floor(size / 2),
  })
  const cellRefs = useRef<Array<HTMLButtonElement | null>>([])
  const hoshiPoints = useMemo(() => getHoshiPoints(size), [size])
  const validMoveSet = useMemo(
    () => new Set(validMoves.map(({ x, y }) => `${x}:${y}`)),
    [validMoves]
  )
  const letters = LETTERS.slice(0, size)
  const numbers = Array.from({ length: size }, (_, i) => size - i)

  // Convert 1D BoardState to 2D for rendering
  const rows = useMemo(() => {
    const result: number[][] = []
    for (let y = 0; y < size; y++) {
      const row: number[] = []
      for (let x = 0; x < size; x++) {
        row.push(board[y * size + x])
      }
      result.push(row)
    }
    return result
  }, [board, size])

  useEffect(() => {
    setFocused((current) => ({
      x: clampCoordinate(current.x, size),
      y: clampCoordinate(current.y, size),
    }))
  }, [size])

  useEffect(() => {
    if (!hovered) return

    if (!validMoveSet.has(`${hovered.x}:${hovered.y}`)) {
      setHovered(null)
      onHoverIntersectionChange?.(null)
    }
  }, [hovered, onHoverIntersectionChange, validMoveSet])

  function focusCell(x: number, y: number) {
    const nextX = clampCoordinate(x, size)
    const nextY = clampCoordinate(y, size)
    setFocused({ x: nextX, y: nextY })
    cellRefs.current[nextY * size + nextX]?.focus()
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    x: number,
    y: number,
    isPlayable: boolean
  ) {
    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault()
        focusCell(x - 1, y)
        break
      case "ArrowRight":
        event.preventDefault()
        focusCell(x + 1, y)
        break
      case "ArrowUp":
        event.preventDefault()
        focusCell(x, y - 1)
        break
      case "ArrowDown":
        event.preventDefault()
        focusCell(x, y + 1)
        break
      case "Enter":
      case " ":
        event.preventDefault()
        if (isPlayable) {
          onIntersectionClick?.(x, y)
        }
        break
      default:
        break
    }
  }

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

              {showTerritoryHeatmap && territoryMap
                ? rows.map((row, y) =>
                    row.map((stoneValue, x) => {
                      if (stoneValue !== 0) return null
                      const owner = territoryMap[y * size + x]
                      if (owner !== 1 && owner !== 2) return null

                      return (
                        <div
                          key={`territory-${x}-${y}`}
                          className="pointer-events-none absolute z-[6] flex items-center justify-center"
                          style={{
                            left: `${(x / size) * 100}%`,
                            top: `${(y / size) * 100}%`,
                            width: `${100 / size}%`,
                            height: `${100 / size}%`,
                          }}
                          aria-hidden="true"
                        >
                          <div
                            className={cn(
                              "h-[54%] w-[54%] rounded-[35%]",
                              owner === 1
                                ? "bg-stone-black/18"
                                : "border border-stone-black/15 bg-stone-white/55",
                            )}
                          />
                        </div>
                      )
                    }),
                  )
                : null}

              {analysisHints.map((hint) => (
                <div
                  key={`analysis-${hint.x}-${hint.y}-${hint.rank}`}
                  className="pointer-events-none absolute z-[15] flex items-center justify-center"
                  style={{
                    left: `${(hint.x / size) * 100}%`,
                    top: `${(hint.y / size) * 100}%`,
                    width: `${100 / size}%`,
                    height: `${100 / size}%`,
                  }}
                  aria-hidden="true"
                >
                  <div
                    className={cn(
                      "relative flex h-[66%] w-[66%] items-center justify-center rounded-full border text-[8px] font-semibold shadow-sm md:text-[9px]",
                      hint.rank === 1 &&
                        "border-emerald-400/80 bg-emerald-400/25 text-emerald-950 dark:text-emerald-100",
                      hint.rank === 2 &&
                        "border-amber-400/80 bg-amber-400/24 text-amber-950 dark:text-amber-100",
                      hint.rank >= 3 &&
                        "border-sky-400/80 bg-sky-400/24 text-sky-950 dark:text-sky-100",
                    )}
                    title={`Engine rank ${hint.rank} (${hint.confidence}% confidence)`}
                  >
                    {hint.rank}
                  </div>
                </div>
              ))}

              {capturedStones.map((capture) => (
                <div
                  key={capture.key}
                  className="pointer-events-none absolute z-20 flex items-center justify-center"
                  style={{
                    left: `${(capture.x / size) * 100}%`,
                    top: `${(capture.y / size) * 100}%`,
                    width: `${100 / size}%`,
                    height: `${100 / size}%`,
                  }}
                >
                  <Stone color={capture.color} capture />
                </div>
              ))}

              {/* Intersection grid */}
              <div
                className="absolute inset-0 z-10 grid h-full w-full"
                role="grid"
                aria-label={`${size} by ${size} Go board`}
                aria-rowcount={size}
                aria-colcount={size}
                style={{
                  gridTemplateColumns: `repeat(${size}, 1fr)`,
                  gridTemplateRows: `repeat(${size}, 1fr)`,
                }}
              >
                {rows.map((row, y) =>
                  row.map((stoneValue, x) => {
                    const stoneColor = stoneValue === 1 ? "black" : stoneValue === 2 ? "white" : undefined
                    const coordinateKey = `${x}:${y}`
                    const isPlayable = !stoneColor && validMoveSet.has(coordinateKey)
                    const isFocused = focused.x === x && focused.y === y
                    return (
                      <button
                        key={`${x}-${y}`}
                        ref={(node) => {
                          cellRefs.current[y * size + x] = node
                        }}
                        type="button"
                        role="gridcell"
                        tabIndex={isFocused ? 0 : -1}
                        aria-label={describeIntersection(x, y, size, stoneColor, isPlayable)}
                        aria-selected={isFocused}
                        aria-disabled={!isPlayable}
                        className="h-full w-full appearance-none bg-transparent p-0 text-inherit outline-none"
                        onFocus={() => setFocused({ x, y })}
                        onMouseEnter={() => {
                          if (isPlayable) {
                            setHovered({ x, y })
                            onHoverIntersectionChange?.({ x, y })
                          } else if (hovered?.x === x && hovered?.y === y) {
                            setHovered(null)
                            onHoverIntersectionChange?.(null)
                          }
                        }}
                        onMouseLeave={() => {
                          if (hovered?.x === x && hovered?.y === y) {
                            setHovered(null)
                            onHoverIntersectionChange?.(null)
                          }
                        }}
                        onClick={() => {
                          if (isPlayable) {
                            onIntersectionClick?.(x, y)
                          }
                        }}
                        onKeyDown={(event) => handleKeyDown(event, x, y, isPlayable)}
                      >
                        <Intersection
                          stone={stoneColor}
                          ghostColor={isPlayable ? currentPlayer : undefined}
                          remoteGhostColor={opponentHover?.color}
                          hovered={isPlayable && hovered?.x === x && hovered?.y === y}
                          remoteHovered={
                            !stoneColor &&
                            opponentHover?.x === x &&
                            opponentHover?.y === y
                          }
                          isLastMove={lastMove?.x === x && lastMove?.y === y}
                          interactive={isPlayable}
                          isFocused={isFocused}
                        />
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

function clampCoordinate(value: number, size: number) {
  return Math.min(Math.max(value, 0), size - 1)
}

function describeIntersection(
  x: number,
  y: number,
  size: number,
  stoneColor?: StoneColor,
  isPlayable?: boolean
) {
  const coordinate = `${LETTERS[x]}${size - y}`
  if (stoneColor) {
    return `${coordinate}, occupied by ${stoneColor}`
  }

  return isPlayable ? `${coordinate}, legal move` : `${coordinate}, unavailable`
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
