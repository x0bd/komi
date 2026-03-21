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
                    ? "bg-gradient-to-br from-[#2c2c2c] to-[#050505] shadow-[inset_0_-2px_4px_rgba(0,0,0,0.6),_0_4px_10px_var(--stone-shadow)] border border-[#3a3a3a] dark:border-[#222]"
                    : "bg-gradient-to-br from-[#ffffff] to-[#e5e5e5] shadow-[inset_0_-2px_4px_rgba(0,0,0,0.05),_0_4px_10px_var(--stone-shadow)] border border-[#d1d1d1] dark:border-[#e5e5e5]",
                ghost && "opacity-20",
            )}
        >
            <div
                className={cn(
                    "absolute left-[15%] top-[10%] h-[35%] w-[35%] rounded-full mix-blend-screen",
                    color === "black"
                        ? "bg-gradient-to-br from-white/25 to-transparent blur-[1px]"
                        : "bg-gradient-to-br from-white/80 to-transparent blur-[1px]",
                )}
            />
            {isLastMove && <LastMoveMarker />}
        </div>
    );
}
