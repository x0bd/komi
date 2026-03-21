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
                "relative flex items-center gap-4 rounded-2xl border p-4 transition-all duration-500",
                isActive
                    ? "border-border shadow-lg bg-card scale-[1.02]"
                    : "border-border/40 shadow-sm bg-card/40 opacity-70 grayscale-[0.2]",
                className,
            )}
        >
            {/* Active Indicator Glow */}
            {isActive && (
                <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-b from-foreground/[0.03] to-transparent" />
            )}

            <Avatar
                className={cn(
                    "size-12 shrink-0 rounded-full border shadow-sm transition-all duration-300",
                    isActive
                        ? "border-foreground/20 shadow-md"
                        : "border-border/50",
                )}
            >
                <AvatarFallback
                    className={cn(
                        "font-sans text-[15px] font-semibold",
                        stoneColor === "black"
                            ? "bg-[#111] text-white"
                            : "bg-white text-black border-border",
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
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                        <div
                            className={cn(
                                "size-2 rounded-full",
                                stoneColor === "black"
                                    ? "bg-[#111] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
                                    : "bg-white border border-black/10 shadow-sm",
                            )}
                        />
                        <span>{stoneColor}</span>
                    </div>
                    <div className="h-3 w-px bg-border/60" />
                    <p className="text-[12px] text-muted-foreground font-medium">
                        <span className="text-foreground font-bold mr-1">
                            {captures}
                        </span>
                        Captures
                    </p>
                </div>
            </div>
        </div>
    );
}
