"use client";

import type { ScoreResult } from "@/lib/engine/scoring";
import { cn } from "@/lib/utils";

function formatPoints(value: number) {
    return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

export function LiveScoreCard({
    score,
    moveCount,
    isGameOver = false,
    className,
}: {
    score: ScoreResult;
    moveCount: number;
    isGameOver?: boolean;
    className?: string;
}) {
    const blackTotal = score.black.total;
    const whiteTotal = score.white.total;
    const combined = blackTotal + whiteTotal;
    const blackShare = combined > 0 ? (blackTotal / combined) * 100 : 50;
    const whiteShare = 100 - blackShare;

    const leadText =
        score.winner === "draw"
            ? "Even"
            : `${score.winner === "black" ? "Black" : "White"} +${formatPoints(score.margin)}`;

    return (
        <div
            className={cn(
                "flex flex-col w-full p-5 rounded-none border-2 border-border bg-card shadow-[4px_4px_0_0_var(--foreground)] transition-all duration-300",
                className,
            )}
        >
            <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    <span>LIVE SCORE</span>
                    <span className="font-sans text-[15px] font-semibold text-foreground tracking-normal normal-case leading-tight">
                        {leadText}
                    </span>
                </div>
                <div className="flex items-center justify-center text-[10px] font-mono font-bold text-foreground border border-border bg-background px-2.5 py-1 rounded-none uppercase tracking-wider">
                    {isGameOver ? "Final" : `${moveCount} moves`}
                </div>
            </div>

            <div className="relative w-full h-4 rounded-none border-2 border-border overflow-hidden flex bg-background">
                <div
                    className="h-full bg-stone-black transition-[width] duration-500 border-r-2 border-border"
                    style={{ width: `${blackShare}%` }}
                />
                <div
                    className="h-full bg-stone-white transition-[width] duration-500"
                    style={{ width: `${whiteShare}%` }}
                />
            </div>

            <div className="flex items-center justify-between mt-3 px-1">
                <div className="flex flex-col">
                    <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">
                        Black
                    </span>
                    <span className="text-[16px] font-mono font-semibold text-foreground/90 tracking-tight">
                        {formatPoints(blackTotal)}
                    </span>
                </div>
                <div className="flex flex-col text-right">
                    <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">
                        White
                    </span>
                    <span className="text-[16px] font-mono font-semibold text-foreground/90 tracking-tight">
                        {formatPoints(whiteTotal)}
                    </span>
                </div>
            </div>
        </div>
    );
}
