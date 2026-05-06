"use client"

import { cn } from "@/lib/utils"
import { Stone, type StoneColor } from "@/components/game/stone"

export function Intersection({
  stone,
  ghostColor,
  remoteGhostColor,
  isLastMove = false,
  markedDead = false,
  hovered = false,
  remoteHovered = false,
  interactive = false,
  isFocused = false,
}: {
  stone?: StoneColor
  ghostColor?: StoneColor
  remoteGhostColor?: StoneColor
  isLastMove?: boolean
  markedDead?: boolean
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
        <div className="pointer-events-none absolute inset-[24%] border border-signal/45" />
      ) : null}
      {!stone && hovered && ghostColor ? (
        <div className="pointer-events-none absolute size-[28%] border border-foreground/25 bg-foreground/[0.06]" />
      ) : null}
      {!stone && remoteHovered && remoteGhostColor ? (
        <div className="pointer-events-none absolute size-[28%] border border-signal/45 bg-signal/[0.07]" />
      ) : null}
      {!stone && remoteHovered && remoteGhostColor ? (
        <Stone color={remoteGhostColor} ghost />
      ) : null}
      {!stone && hovered && ghostColor ? <Stone color={ghostColor} ghost /> : null}
      {stone ? (
        <Stone color={stone} isLastMove={isLastMove} markedDead={markedDead} />
      ) : null}
    </div>
  )
}
