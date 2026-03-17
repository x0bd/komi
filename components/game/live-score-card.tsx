"use client";

import type { ScoreResult } from "@/lib/engine/scoring";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LuScale } from "react-icons/lu";

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
            ? "Even position"
            : `${score.winner === "black" ? "Black" : "White"} +${formatPoints(score.margin)}`;

    return (
        <Card
            className={cn(
                "overflow-hidden rounded-2xl border border-border bg-card shadow-md",
                className,
            )}
        >
            <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-primary">
                            <LuScale className="size-5" />
                        </span>
                        <div className="space-y-0.5">
                            <p className="font-display text-lg font-bold leading-none">
                                Score
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {leadText}
                            </p>
                        </div>
                    </div>

                    <Badge
                        variant="secondary"
                        className="rounded-full px-2.5 py-0.5 text-[11px]"
                    >
                        {isGameOver ? "Final" : `${moveCount} moves`}
                    </Badge>
                </div>

                <div className="mt-4 overflow-hidden rounded-full bg-secondary/70">
                    <div className="flex h-2.5 w-full">
                        <div
                            className="bg-stone-black"
                            style={{ width: `${blackShare}%` }}
                        />
                        <div
                            className="bg-stone-white"
                            style={{ width: `${whiteShare}%` }}
                        />
                    </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-border/60 bg-secondary/30 px-3 py-2">
                        <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                            Black
                        </p>
                        <p className="mt-1 font-mono text-lg font-bold tabular-nums text-foreground">
                            {formatPoints(blackTotal)}
                        </p>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-secondary/30 px-3 py-2">
                        <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                            White
                        </p>
                        <p className="mt-1 font-mono text-lg font-bold tabular-nums text-foreground">
                            {formatPoints(whiteTotal)}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
