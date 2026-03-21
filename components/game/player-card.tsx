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
                "flex items-center gap-5 py-2 transition-all duration-300 w-full",
                !isActive && "opacity-50",
                className,
            )}
        >
            <Avatar
                className={cn(
                    "size-14 shrink-0 rounded-full",
                    stoneColor === "white" &&
                        "border border-border/60 bg-transparent",
                )}
            >
                <AvatarFallback
                    className={cn(
                        "font-sans text-[16px] font-medium tracking-tight",
                        stoneColor === "black"
                            ? "bg-[#111] text-white"
                            : "bg-transparent text-muted-foreground",
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

            <div className="min-w-0 flex-1 flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <p className="font-sans text-[16px] font-semibold tracking-tight text-foreground">
                        {name}
                    </p>
                    <div className="flex items-center gap-2.5 text-[12px] font-medium text-muted-foreground">
                        <div className="flex items-center gap-1.5 uppercase tracking-wider">
                            <div
                                className={cn(
                                    "size-2 rounded-full",
                                    stoneColor === "black"
                                        ? "bg-[#111]"
                                        : "bg-transparent border border-muted-foreground/50",
                                )}
                            />
                            <span>{stoneColor}</span>
                        </div>
                        <div className="w-px h-3 bg-border" />
                        <p>
                            <span className="text-foreground font-bold mr-1">
                                {captures}
                            </span>
                            Captures
                        </p>
                    </div>
                </div>

                <Timer
                    minutes={minutes}
                    seconds={seconds}
                    isLowTime={isLowTime}
                    className="text-right text-2xl font-mono tracking-tighter text-foreground"
                />
            </div>
        </div>
    );
}
