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
                "flex items-center gap-4 py-3 px-4 rounded-none transition-all duration-300 w-full border-2",
                isActive 
                    ? "bg-black border-white text-white shadow-[4px_4px_0_0_white] scale-[1.02]" 
                    : "bg-transparent border-white/20 text-white/50 grayscale-[0.2]",
                className,
            )}
        >
            <div className={cn(
                "relative shrink-0 rounded-full transition-all duration-500",
                isActive ? "shadow-[0_0_20px_rgba(0,0,0,0.08)] scale-105" : ""
            )}>
                {isActive && (
                    <div className="absolute -inset-1.5 rounded-full border-2 border-foreground/15 animate-ping duration-[3s] opacity-20" />
                )}
                <Avatar
                    className={cn(
                        "relative z-10 size-14 rounded-full",
                        stoneColor === "white" && "border border-border/60 bg-transparent"
                    )}
                >
                    <AvatarFallback
                        className={cn(
                            "font-sans text-[16px] font-medium tracking-tight",
                            stoneColor === "black"
                                ? "bg-white text-black"
                                : "bg-transparent border border-white/40 text-white",
                        )}
                    >
                        {avatarIcon ? (
                            <span className="flex items-center justify-center text-xl">
                                {avatarIcon}
                            </span>
                        ) : (
                            initial
                        )}
                    </AvatarFallback>
                </Avatar>
            </div>

            <div className="min-w-0 flex-1 flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <p className={cn("font-sans text-[16px] font-semibold tracking-tight truncate", isActive ? "text-white" : "text-white/60")}>
                        {name}
                    </p>
                    <div className={cn("flex items-center gap-2 text-[12px] font-medium", isActive ? "text-white/80" : "text-white/40")}>
                        <div className="flex items-center gap-1.5 uppercase tracking-widest font-bold">
                            <div
                                className={cn(
                                    "size-2 rounded-full",
                                    stoneColor === "black"
                                        ? "bg-white"
                                        : "bg-transparent border border-white/50",
                                )}
                            />
                            <span>{stoneColor}</span>
                        </div>
                        <div className="size-1 rounded-full bg-white/20 shrink-0" />
                        <p className="truncate">
                            <span className="font-bold mr-1.5">
                                {captures}
                            </span>
                            captures
                        </p>
                    </div>
                </div>

                <Timer
                    minutes={minutes}
                    seconds={seconds}
                    isLowTime={isLowTime}
                    className={cn("text-right text-2xl font-mono tracking-tighter", isActive ? "text-white" : "text-white/50")}
                />
            </div>
        </div>
    );
}
