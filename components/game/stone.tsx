"use client"

import { cn } from "@/lib/utils"
import { LastMoveMarker } from "@/components/game/last-move-marker"

export type StoneColor = "black" | "white"

export function Stone({
  color,
  isLastMove = false,
  ghost = false,
}: {
  color: StoneColor
  isLastMove?: boolean
  ghost?: boolean
}) {
  return (
    <div
      className={cn(
        "animate-stone-place relative h-[84%] w-[84%] rounded-full transition-opacity duration-150",
        color === "black"
          ? "bg-[radial-gradient(circle_at_30%_30%,_var(--stone-black-highlight),_var(--stone-black))] shadow-[0_6px_14px_var(--stone-shadow),0_2px_4px_var(--stone-shadow)]"
          : "border border-stone-white/70 bg-[radial-gradient(circle_at_30%_30%,_var(--stone-white-highlight),_var(--stone-white))] shadow-[0_6px_14px_var(--stone-shadow),0_2px_4px_var(--stone-shadow)]",
        ghost && "opacity-20"
      )}
    >
      <div
        className={cn(
          "absolute left-[14%] top-[12%] h-[19%] w-[19%] rounded-full",
          color === "black" ? "bg-white/12" : "bg-white/45"
        )}
      />
      {isLastMove && <LastMoveMarker />}
    </div>
  )
}
