"use client"

const LETTERS = "ABCDEFGHJKLMNOPQRST".split("")

export function CoordinateLabels({
  size,
}: {
  size: 9 | 13 | 19
}) {
  const labels = LETTERS.slice(0, size)
  const numbers = Array.from({ length: size }, (_, i) => size - i)

  return (
    <>
      <div className="grid grid-cols-[auto_1fr] items-end gap-3">
        <div />
        <div className={`grid h-4 w-full ${gridColsBySize[size]}`}>
          {labels.map((label) => (
            <span
              key={label}
              className="text-center font-mono text-[10px] font-semibold tracking-[0.08em] text-board-grid/60 md:text-xs"
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-[auto_1fr] gap-3">
        <div className={`grid ${gridRowsBySize[size]} w-4`}>
          {numbers.map((number) => (
            <span
              key={number}
              className="flex items-center justify-center font-mono text-[10px] font-semibold text-board-grid/60 md:text-xs"
            >
              {number}
            </span>
          ))}
        </div>
        <div />
      </div>
    </>
  )
}

const gridColsBySize = {
  9: "grid-cols-9",
  13: "grid-cols-13",
  19: "grid-cols-19",
} as const

const gridRowsBySize = {
  9: "grid-rows-9",
  13: "grid-rows-13",
  19: "grid-rows-19",
} as const
