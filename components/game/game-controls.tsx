"use client";

import { cn } from "@/lib/utils";

export function GameControls({
    onPass,
    onResign,
    disabled = false,
    className,
}: {
    onPass?: () => void;
    onResign?: () => void;
    disabled?: boolean;
    className?: string;
}) {
    return (
        <div className={cn("flex w-full items-center gap-4", className)}>
            <button
                type="button"
                className="flex-1 h-12 rounded-full border border-border/70 font-sans text-[15px] font-medium text-foreground/80 hover:bg-secondary/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={onPass}
                disabled={disabled}
            >
                Pass turn
            </button>
            <div className="h-4 w-px shrink-0 bg-border" />
            <button
                type="button"
                className="flex-1 h-12 rounded-full border border-border/70 font-sans text-[15px] font-medium text-[#d94545] hover:bg-destructive/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={onResign}
                disabled={disabled}
            >
                Resign
            </button>
        </div>
    );
}
