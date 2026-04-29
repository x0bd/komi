"use client";

import { cn } from "@/lib/utils";
import { LastMoveMarker } from "@/components/game/last-move-marker";

export type StoneColor = "black" | "white";

export function Stone({
    color,
    isLastMove = false,
    ghost = false,
    capture = false,
    markedDead = false,
}: {
    color: StoneColor;
    isLastMove?: boolean;
    ghost?: boolean;
    capture?: boolean;
    markedDead?: boolean;
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
                markedDead && "opacity-45 grayscale",
            )}
        >
            {markedDead ? (
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <span className="absolute h-[2px] w-[70%] rotate-45 rounded-full bg-swiss-red" />
                    <span className="absolute h-[2px] w-[70%] -rotate-45 rounded-full bg-swiss-red" />
                </span>
            ) : null}
            {isLastMove && <LastMoveMarker />}
        </div>
    );
}
