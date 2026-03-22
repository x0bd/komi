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
        <div className={cn("flex w-full items-center h-[52px] rounded-full border border-border/60 overflow-hidden shadow-sm", className)}>
            <button
                type="button"
                className="flex-1 h-full font-sans text-[15px] font-medium text-foreground/90 hover:bg-secondary/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={onPass}
                disabled={disabled}
            >
                Pass turn
            </button>
            <div className="h-6 w-px shrink-0 bg-border/60" />
            <button
                type="button"
                className="flex-1 h-full font-sans text-[15px] font-medium text-[#E03E3E] hover:bg-destructive/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={onResign}
                disabled={disabled}
            >
                Resign
            </button>
        </div>
    );
}
