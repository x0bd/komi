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
                "flex w-full flex-col border border-border bg-background",
                className,
            )}
        >
            <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
                <div className="flex flex-col gap-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    <span>LIVE SCORE</span>
                    <span className="font-sans text-[15px] font-semibold normal-case leading-tight tracking-[-0.03em] text-foreground">
                        {leadText}
                    </span>
                </div>
                <div className="border border-border px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground">
                    {isGameOver ? "Final" : `${moveCount} moves`}
                </div>
            </div>

            <div className="relative flex h-4 w-full overflow-hidden border-b border-border bg-subtle">
                <div
                    className="h-full border-r border-border bg-foreground transition-[width] duration-500"
                    style={{ width: `${blackShare}%` }}
                />
                <div
                    className="h-full bg-accent transition-[width] duration-500"
                    style={{ width: `${whiteShare}%` }}
                />
            </div>

            <div className="grid grid-cols-2 divide-x divide-border">
                <div className="flex flex-col">
                    <span className="border-b border-border px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Black
                    </span>
                    <span className="px-4 py-3 font-mono text-[16px] font-semibold tracking-[-0.06em] text-foreground">
                        {formatPoints(blackTotal)}
                    </span>
                </div>
                <div className="flex flex-col text-right">
                    <span className="border-b border-border px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        White
                    </span>
                    <span className="px-4 py-3 font-mono text-[16px] font-semibold tracking-[-0.06em] text-foreground">
                        {formatPoints(whiteTotal)}
                    </span>
                </div>
            </div>
        </div>
    );
}
