"use client";

import type { ReactNode } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
    return (
        <div
            className={cn(
                "relative flex items-center gap-4 py-2 transition-opacity duration-300",
                !isActive && "opacity-40 grayscale-[0.5]",
                className,
            )}
        >
            {/* Active Indicator Line */}
            <div
                className={cn(
                    "absolute -left-3 top-1/2 h-8 w-1 -translate-y-1/2 rounded-full transition-all duration-300",
                    isActive
                        ? "bg-foreground scale-y-100"
                        : "bg-transparent scale-y-0",
                )}
            />

            <Avatar
                className={cn(
                    "size-12 shrink-0 rounded-full border shadow-sm transition-all duration-300",
                    isActive ? "border-border shadow-md" : "border-border/50",
                )}
            >
                <AvatarFallback
                    className={cn(
                        "font-sans text-sm font-medium",
                        stoneColor === "black"
                            ? "bg-stone-black text-white"
                            : "bg-stone-white text-black border-border",
                        avatarIcon && "bg-muted text-foreground",
                    )}
                >
                    {avatarIcon ? (
                        <span className="flex items-center justify-center text-lg">
                            {avatarIcon}
                        </span>
                    ) : (
                        initial
                    )}
                </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                    <p className="font-sans text-[15px] font-semibold tracking-tight truncate text-foreground">
                        {name}
                    </p>
                    <Timer
                        minutes={minutes}
                        seconds={seconds}
                        isLowTime={isLowTime}
                        className="text-right"
                    />
                </div>
                <div className="mt-1 flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium uppercase tracking-widest">
                        <div
                            className={cn(
                                "size-2 rounded-full",
                                stoneColor === "black"
                                    ? "bg-stone-black shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
                                    : "bg-stone-white border border-border/50 shadow-sm",
                            )}
                        />
                        <span>{stoneColor}</span>
                    </div>
                    <div className="h-3 w-px bg-border/50" />
                    <p className="text-xs text-muted-foreground font-medium">
                        <span className="text-foreground font-semibold mr-1">
                            {captures}
                        </span>
                        Captures
                    </p>
                </div>
            </div>
        </div>
    );
}
