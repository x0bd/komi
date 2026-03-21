"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LuDownload, LuFlag } from "react-icons/lu";
import type { ScoreResult } from "@/lib/engine/scoring";

function formatOutcome({
    winner,
    reason,
    scoreResult,
}: {
    winner: "black" | "white" | "draw" | null;
    reason: "score" | "resignation" | "timeout" | null;
    scoreResult: ScoreResult | null;
}) {
    if (!winner) return "Game finished";
    if (winner === "draw") return "Draw";

    const winnerLabel = winner === "black" ? "Black" : "White";
    if (reason === "resignation") return `${winnerLabel} wins by resignation`;
    if (reason === "timeout") return `${winnerLabel} wins on time`;

    if (reason === "score" && scoreResult) {
        const margin =
            Number.isFinite(scoreResult.margin) &&
            typeof scoreResult.margin === "number"
                ? scoreResult.margin.toFixed(1)
                : String(scoreResult.margin);
        return `${winnerLabel} wins by ${margin}`;
    }

    return `${winnerLabel} wins`;
}

export function PostGameReviewCard({
    scoreResult,
    winner,
    reason,
    onExportSgf,
}: {
    scoreResult: ScoreResult | null;
    winner: "black" | "white" | "draw" | null;
    reason: "score" | "resignation" | "timeout" | null;
    onExportSgf: () => void;
}) {
    return (
        <Card className="rounded-2xl border border-border bg-card shadow-sm">
            <CardHeader className="px-4 pb-3 pt-4">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <CardTitle className="text-base font-semibold">
                            Post-game review
                        </CardTitle>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {formatOutcome({ winner, reason, scoreResult })}
                        </p>
                    </div>
                    <Badge
                        variant="secondary"
                        className="inline-flex items-center gap-1 rounded-full"
                    >
                        <LuFlag className="size-3.5" />
                        Final
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-3 px-4 pb-4 pt-0">
                {scoreResult ? (
                    <div className="overflow-hidden rounded-xl border border-border/70">
                        <div className="grid grid-cols-[1.2fr_repeat(4,minmax(0,1fr))] bg-secondary/35 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                            <span>Player</span>
                            <span className="text-right">Terr</span>
                            <span className="text-right">Cap</span>
                            <span className="text-right">Komi</span>
                            <span className="text-right">Total</span>
                        </div>

                        <div className="grid grid-cols-[1.2fr_repeat(4,minmax(0,1fr))] px-3 py-2.5 text-xs text-foreground">
                            <span className="font-semibold">Black</span>
                            <span className="text-right font-mono">
                                {scoreResult.black.territory}
                            </span>
                            <span className="text-right font-mono">
                                {scoreResult.black.captures}
                            </span>
                            <span className="text-right font-mono">-</span>
                            <span className="text-right font-mono font-semibold">
                                {scoreResult.black.total.toFixed(1)}
                            </span>
                        </div>

                        <div className="grid grid-cols-[1.2fr_repeat(4,minmax(0,1fr))] border-t border-border/70 px-3 py-2.5 text-xs text-foreground">
                            <span className="font-semibold">White</span>
                            <span className="text-right font-mono">
                                {scoreResult.white.territory}
                            </span>
                            <span className="text-right font-mono">
                                {scoreResult.white.captures}
                            </span>
                            <span className="text-right font-mono">
                                {scoreResult.white.komi?.toFixed(1) ?? "0.0"}
                            </span>
                            <span className="text-right font-mono font-semibold">
                                {scoreResult.white.total.toFixed(1)}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-xl border border-border/70 bg-secondary/20 px-3 py-2 text-xs text-muted-foreground">
                        Final score details are unavailable for this game end type.
                    </div>
                )}

                <Button
                    type="button"
                    onClick={onExportSgf}
                    variant="outline"
                    className="w-full rounded-full"
                >
                    <LuDownload className="size-4" />
                    Export SGF
                </Button>
            </CardContent>
        </Card>
    );
}
