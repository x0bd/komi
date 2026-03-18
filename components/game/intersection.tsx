"use client"

import { cn } from "@/lib/utils"
import { Stone, type StoneColor } from "@/components/game/stone"

export function Intersection({
  stone,
  ghostColor,
  remoteGhostColor,
  isLastMove = false,
  hovered = false,
  remoteHovered = false,
  interactive = false,
  isFocused = false,
}: {
  stone?: StoneColor
  ghostColor?: StoneColor
  remoteGhostColor?: StoneColor
  isLastMove?: boolean
  hovered?: boolean
  remoteHovered?: boolean
  interactive?: boolean
  isFocused?: boolean
}) {
  return (
    <div
      className={cn(
        "relative z-10 flex h-full w-full items-center justify-center",
        interactive ? "cursor-pointer" : "cursor-default"
      )}
    >
      {isFocused ? (
        <div className="pointer-events-none absolute inset-[11%] rounded-full border-2 border-accent/70 ring-2 ring-accent/20 ring-offset-2 ring-offset-background" />
      ) : null}
      {!stone && remoteHovered && remoteGhostColor ? (
        <Stone color={remoteGhostColor} ghost />
      ) : null}
      {!stone && hovered && ghostColor ? <Stone color={ghostColor} ghost /> : null}
      {stone ? <Stone color={stone} isLastMove={isLastMove} /> : null}
    </div>
  )
}
