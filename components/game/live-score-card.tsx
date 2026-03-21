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
                "flex flex-col w-full py-4 transition-all duration-300",
                className,
            )}
        >
            <div className="flex items-center justify-between gap-4 mb-2.5">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    <span>Live Score</span>
                    <div className="w-1 h-1 rounded-full bg-status-active" />
                    <span>{leadText}</span>
                </div>
            </div>

            <div className="relative w-full h-1.5 rounded-full overflow-hidden flex bg-border/40">
                <div
                    className="h-full bg-foreground transition-[width] duration-500"
                    style={{ width: `${blackShare}%` }}
                />
                <div
                    className="h-full bg-muted-foreground/30 transition-[width] duration-500"
                    style={{ width: `${whiteShare}%` }}
                />
            </div>

            <div className="flex items-center justify-between mt-2.5 px-0.5">
                <div className="flex flex-col">
                    <span className="text-[12px] font-medium text-foreground/80">
                        {formatPoints(blackTotal)}
                    </span>
                </div>
                <div className="flex flex-col text-right">
                    <span className="text-[12px] font-medium text-muted-foreground">
                        {formatPoints(whiteTotal)}
                    </span>
                </div>
            </div>
        </div>
    );
}
