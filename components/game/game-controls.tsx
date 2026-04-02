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
        <div className={cn("flex w-full items-center h-[52px] rounded-none border-[3px] border-white bg-white overflow-hidden shadow-[6px_6px_0_0_var(--swiss-red)]", className)}>
            <button
                type="button"
                className="flex-1 h-full font-mono text-[13px] bg-transparent text-black font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed border-r-[3px] border-black"
                onClick={onPass}
                disabled={disabled}
            >
                Pass turn
            </button>
            <button
                type="button"
                className="flex-1 h-full font-mono text-[13px] bg-transparent text-black font-black uppercase tracking-widest hover:bg-swiss-red hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={onResign}
                disabled={disabled}
            >
                Resign
            </button>
        </div>
    );
}
