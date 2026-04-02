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
        <div className={cn("flex w-full items-center h-[52px] rounded-none border-2 border-border bg-card overflow-hidden shadow-[4px_4px_0_0_var(--foreground)]", className)}>
            <button
                type="button"
                className="flex-1 h-full font-mono text-[13px] font-bold uppercase tracking-widest text-foreground hover:bg-foreground hover:text-primary-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={onPass}
                disabled={disabled}
            >
                Pass turn
            </button>
            <div className="h-full w-[2px] shrink-0 bg-border" />
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
