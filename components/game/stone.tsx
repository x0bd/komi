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
                "relative h-[82%] w-[82%] rounded-full transition-opacity duration-150",
                capture ? "animate-stone-capture" : "animate-stone-place",
                color === "black"
                    ? "border border-stone-black bg-stone-black"
                    : "border border-stone-white-border bg-stone-white ring-1 ring-background/55",
                ghost && "opacity-30",
                markedDead && "opacity-45 grayscale",
            )}
        >
            {markedDead ? (
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <span className="absolute h-px w-[70%] rotate-45 bg-accent" />
                    <span className="absolute h-px w-[70%] -rotate-45 bg-accent" />
                </span>
            ) : null}
            {isLastMove && <LastMoveMarker />}
        </div>
    );
}
