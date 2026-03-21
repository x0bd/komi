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
                "flex flex-col w-full p-5 rounded-3xl border border-border/60 bg-white dark:bg-card/60 shadow-sm transition-all duration-300",
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
                <div className="flex items-center justify-center text-[10px] font-mono font-medium text-muted-foreground bg-secondary/60 px-2.5 py-1 rounded-full">
                    {isGameOver ? "Final" : `${moveCount} moves`}
                </div>
            </div>

            <div className="relative w-full h-2.5 rounded-full overflow-hidden flex bg-border/40">
                <div
                    className="h-full bg-[#111] dark:bg-foreground transition-[width] duration-500 shadow-sm"
                    style={{ width: `${blackShare}%` }}
                />
                <div
                    className="h-full bg-stone-300 dark:bg-muted-foreground/30 transition-[width] duration-500"
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
