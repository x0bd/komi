"use client"

import { cn } from "@/lib/utils"
import { Stone, type StoneColor } from "@/components/game/stone"

export function Intersection({
  stone,
  ghostColor,
  isLastMove = false,
  hovered = false,
}: {
  stone?: StoneColor
  ghostColor?: StoneColor
  isLastMove?: boolean
  hovered?: boolean
}) {
  return (
    <div
      className={cn(
        "relative z-10 flex items-center justify-center",
        stone ? "cursor-default" : "cursor-pointer"
      )}
    >
      {!stone && hovered && ghostColor ? <Stone color={ghostColor} ghost /> : null}
      {stone ? <Stone color={stone} isLastMove={isLastMove} /> : null}
    </div>
  )
}
