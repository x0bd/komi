"use client";

import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
        <Card
            className={cn(
                "rounded-xl transition-all duration-300",
                isActive
                    ? "border-accent/50 shadow-[0_0_20px_rgba(0,0,0,0.05)] dark:shadow-[0_0_20px_rgba(255,255,255,0.05)] bg-card"
                    : "border-border/50 shadow-sm opacity-50 hover:opacity-100 bg-card/50",
                className,
            )}
        >
            <CardContent className="flex items-center gap-4 p-4">
                <Avatar
                    className={cn(
                        "size-12 shrink-0 border-2 bg-card",
                        isActive
                            ? "border-accent shadow-[0_0_10px_rgba(0,0,0,0.1)] dark:shadow-[0_0_10px_rgba(255,255,255,0.1)]"
                            : "border-border/50",
                    )}
                >
                    <AvatarFallback
                        className={cn(
                            "font-sans text-sm font-semibold",
                            stoneColor === "black"
                                ? "bg-stone-black text-white"
                                : "bg-stone-white text-black border border-border/50",
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
                    <p className="font-sans text-sm font-semibold truncate lg:text-base">
                        {name}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                        <Badge
                            variant={
                                stoneColor === "black" ? "default" : "secondary"
                            }
                        >
                            {stoneColor === "black" ? "Black" : "White"}
                        </Badge>
                        <Badge
                            variant="secondary"
                            className="gap-1 bg-transparent border border-border/50"
                        >
                            <span
                                className={cn(
                                    "inline-block h-2 w-2 shrink-0 rounded-full",
                                    stoneColor === "black"
                                        ? "bg-stone-black"
                                        : "bg-stone-white border border-border/50",
                                )}
                            />
                            {captures}
                        </Badge>
                    </div>
                </div>

                <Timer
                    minutes={minutes}
                    seconds={seconds}
                    isLowTime={isLowTime}
                    className={cn(
                        !isActive && "text-muted-foreground opacity-50",
                    )}
                />
            </CardContent>
        </Card>
    );
}
