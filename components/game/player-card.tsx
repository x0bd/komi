"use client";

import type { ReactNode } from "react";
import { Timer } from "@/components/game/timer";
import { cn } from "@/lib/utils";

export type StoneColor = "black" | "white";

export function PlayerCard({
    name,
    initial,
    avatarIcon,
    stoneColor,
    captures = 0,
    minutes,
    seconds,
    isActive = false,
    isLowTime = false,
    className,
}: {
    name: string;
    initial: string;
    avatarIcon?: ReactNode;
    stoneColor: StoneColor;
    captures?: number;
    minutes: number;
    seconds: number;
    isActive?: boolean;
    isLowTime?: boolean;
    className?: string;
}) {
    const stoneLabel = stoneColor === "black" ? "黒" : "白";

    return (
        <div
            className={cn(
                "grid w-full grid-cols-[3px_52px_1fr_auto] items-center border border-border bg-background transition-colors",
                isActive ? "border-border-strong bg-subtle/45" : "opacity-70",
                className,
            )}
        >
            <div className={cn("h-full bg-transparent", isActive && "bg-accent")} />

            <div className="flex h-full min-h-20 items-center justify-center border-r border-border">
                <div className="relative flex size-9 items-center justify-center border border-border bg-background">
                    <span
                        className={cn(
                            "absolute -right-1 -top-1 size-2 border border-border",
                            stoneColor === "black" ? "bg-stone-black" : "bg-stone-white",
                        )}
                    />
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-[-0.04em] text-foreground">
                        {avatarIcon ?? initial}
                    </span>
                </div>
            </div>

            <div className="min-w-0 px-4 py-3">
                <div className="flex items-center gap-2">
                    <p className="truncate font-sans text-[16px] font-semibold tracking-[-0.04em] text-foreground">
                        {name}
                    </p>
                    <span className="font-mono text-[10px] text-muted-foreground">
                        {stoneLabel}
                    </span>
                </div>
                <div className="mt-2 flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
                    <span>{stoneColor}</span>
                    <span className="h-3 w-px bg-border" />
                    <span>{captures} cap</span>
                </div>
            </div>

            <div className="flex h-full min-h-20 items-center border-l border-border px-4">
                <Timer
                    minutes={minutes}
                    seconds={seconds}
                    isLowTime={isLowTime}
                    className={cn("text-right text-2xl", !isActive && "text-muted-foreground")}
                />
            </div>
        </div>
    );
}
