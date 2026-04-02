"use client";

import { cn } from "@/lib/utils";

export function Timer({
    minutes,
    seconds,
    isLowTime = false,
    className,
}: {
    minutes: number;
    seconds: number;
    isLowTime?: boolean;
    className?: string;
}) {
    const mm = String(minutes).padStart(2, "0");
    const ss = String(seconds).padStart(2, "0");

    return (
        <span
            className={cn(
                "font-mono text-xl tracking-tight font-bold tabular-nums text-foreground",
                isLowTime && "text-status-danger animate-pulse-gentle",
                className,
            )}
        >
            {mm}:{ss}
        </span>
    );
}
