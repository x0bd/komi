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
        <div className={cn("flex w-full items-center h-[52px] rounded-none border-2 border-border overflow-hidden shadow-[4px_4px_0_0_var(--foreground)]", className)}>
            <button
                type="button"
                className="flex-1 h-full font-mono text-[13px] bg-swiss-yellow text-black font-bold uppercase tracking-widest hover:brightness-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed border-r-2 border-border"
                onClick={onPass}
                disabled={disabled}
            >
                Pass turn
            </button>
            <button
                type="button"
                className="flex-1 h-full font-mono text-[13px] bg-swiss-red text-white font-bold uppercase tracking-widest hover:brightness-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={onResign}
                disabled={disabled}
            >
                Resign
            </button>
        </div>
    );
}
