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
        <div className={cn("grid h-[52px] w-full grid-cols-2 border border-border bg-background", className)}>
            <button
                type="button"
                className="h-full border-r border-border bg-transparent font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-subtle disabled:cursor-not-allowed disabled:opacity-45"
                onClick={onPass}
                disabled={disabled}
            >
                Pass turn
            </button>
            <button
                type="button"
                className="h-full bg-transparent font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-accent transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-45"
                onClick={onResign}
                disabled={disabled}
            >
                Resign
            </button>
        </div>
    );
}
