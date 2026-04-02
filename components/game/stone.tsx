"use client";

import { cn } from "@/lib/utils";
import { LastMoveMarker } from "@/components/game/last-move-marker";

export type StoneColor = "black" | "white";

export function Stone({
    color,
    isLastMove = false,
    ghost = false,
    capture = false,
}: {
    color: StoneColor;
    isLastMove?: boolean;
    ghost?: boolean;
    capture?: boolean;
}) {
    return (
        <div
            className={cn(
                "relative h-[92%] w-[92%] rounded-full transition-opacity duration-150",
                capture ? "animate-stone-capture" : "animate-stone-place",
                color === "black"
                    ? "bg-stone-black border-2 border-stone-black shadow-[4px_4px_0_0_var(--stone-shadow)]"
                    : "bg-stone-white border-2 border-stone-white-border shadow-[4px_4px_0_0_var(--stone-shadow)]",
                ghost && "opacity-30",
            )}
        >
            {isLastMove && <LastMoveMarker />}
        </div>
    );
}
