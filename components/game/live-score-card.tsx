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
                "flex flex-col w-full p-5 rounded-none border-2 border-white bg-black shadow-[4px_4px_0_0_white] transition-all duration-300",
                className,
            )}
        >
            <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-widest text-white/60">
                    <span>LIVE SCORE</span>
                    <span className="font-sans text-[15px] font-semibold text-white tracking-normal normal-case leading-tight">
                        {leadText}
                    </span>
                </div>
                <div className="flex items-center justify-center text-[10px] font-mono font-bold text-white border border-white/30 bg-white/10 px-2.5 py-1 rounded-none uppercase tracking-wider">
                    {isGameOver ? "Final" : `${moveCount} moves`}
                </div>
            </div>

            <div className="relative w-full h-4 rounded-none border-2 border-white overflow-hidden flex bg-white/20">
                <div
                    className="h-full bg-swiss-yellow transition-[width] duration-500 border-r-2 border-white"
                    style={{ width: `${blackShare}%` }}
                />
                <div
                    className="h-full bg-white transition-[width] duration-500"
                    style={{ width: `${whiteShare}%` }}
                />
            </div>

            <div className="flex items-center justify-between mt-3 px-1">
                <div className="flex flex-col">
                    <span className="text-[12px] font-semibold text-white/50 uppercase tracking-widest mb-0.5">
                        Black
                    </span>
                    <span className="text-[16px] font-mono font-semibold text-white tracking-tight">
                        {formatPoints(blackTotal)}
                    </span>
                </div>
                <div className="flex flex-col text-right">
                    <span className="text-[12px] font-semibold text-white/50 uppercase tracking-widest mb-0.5">
                        White
                    </span>
                    <span className="text-[16px] font-mono font-semibold text-white tracking-tight">
                        {formatPoints(whiteTotal)}
                    </span>
                </div>
            </div>
        </div>
    );
}
