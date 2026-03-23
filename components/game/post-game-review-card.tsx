"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LuDownload, LuFlag } from "react-icons/lu";
import type { ScoreResult } from "@/lib/engine/scoring";

type KeyMoment = {
    moveNumber: number;
    player: "black" | "white";
    label: string;
    detail: string;
};

type TutorNote = {
    moveNumber: number;
    note: string;
};

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
    keyMoments,
    tutorNotes = [],
    onExportSgf,
}: {
    scoreResult: ScoreResult | null;
    winner: "black" | "white" | "draw" | null;
    reason: "score" | "resignation" | "timeout" | null;
    keyMoments: KeyMoment[];
    tutorNotes?: TutorNote[];
    onExportSgf: () => void;
}) {
    return (
        <div className="flex flex-col gap-6 w-full rounded-[2rem] border border-border/60 bg-card/40 backdrop-blur-xl p-5 lg:p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3 px-1">
                <div>
                    <h3 className="text-xl font-bold tracking-tight text-foreground">
                        Post-game review
                    </h3>
                    <p className="font-medium text-[13px] text-muted-foreground mt-1">
                        {formatOutcome({ winner, reason, scoreResult })}
                    </p>
                </div>
                <Badge
                    variant="secondary"
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-bold text-[11px] uppercase tracking-widest bg-secondary/80 text-foreground border-border/50 shadow-sm"
                >
                    <LuFlag className="size-3.5" />
                    Final
                </Badge>
            </div>

            {scoreResult ? (
                <div className="grid grid-cols-2 gap-3">
                    {/* Black Stat Block */}
                    <div className="flex flex-col bg-background/50 border border-border/60 rounded-3xl p-5 shadow-sm w-full transition-all hover:bg-background/80 group">
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-[12px] font-bold uppercase tracking-widest text-[#111] dark:text-foreground">Black</span>
                            <div className="size-3.5 rounded-full bg-[#111] shadow-inner" />
                        </div>
                        <div className="mt-auto">
                            <span className="text-4xl font-mono font-bold tracking-tighter text-foreground group-hover:scale-105 transition-transform origin-left inline-block">
                                {scoreResult.black.total.toFixed(1)}
                            </span>
                            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border/50">
                                <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                    <span>Territory</span>
                                    <span className="font-mono text-foreground text-[13px]">{scoreResult.black.territory}</span>
                                </div>
                                <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                    <span>Captures</span>
                                    <span className="font-mono text-foreground text-[13px]">{scoreResult.black.captures}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* White Stat Block */}
                    <div className="flex flex-col bg-background/50 border border-border/60 rounded-3xl p-5 shadow-sm w-full transition-all hover:bg-background/80 group">
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground">White</span>
                            <div className="size-3.5 rounded-full bg-stone-200 border border-border/80 shadow-inner" />
                        </div>
                        <div className="mt-auto">
                            <span className="text-4xl font-mono font-bold tracking-tighter text-foreground group-hover:scale-105 transition-transform origin-left inline-block">
                                {scoreResult.white.total.toFixed(1)}
                            </span>
                            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border/50">
                                <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                    <span>Territory</span>
                                    <span className="font-mono text-foreground text-[13px]">{scoreResult.white.territory}</span>
                                </div>
                                <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                    <span>Komi</span>
                                    <span className="font-mono text-foreground text-[13px]">+{scoreResult.white.komi?.toFixed(1) ?? "0.0"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="rounded-3xl border border-border/50 bg-secondary/30 p-6 text-center text-[13px] font-medium text-muted-foreground">
                    Final score details are unavailable for this game end type.
                </div>
            )}

            <div className="flex flex-col gap-8 mt-2 px-1">
                {keyMoments.length > 0 ? (
                    <div className="flex flex-col gap-4">
                        <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground ml-2">
                            Key Moments
                        </h4>
                        <div className="relative border-l-2 border-border/40 ml-4 space-y-6 pb-2">
                            {keyMoments.map((moment) => (
                                <div key={`${moment.moveNumber}-${moment.label}`} className="relative pl-6">
                                    <div className="absolute -left-[5px] top-1.5 size-2.5 rounded-full bg-foreground shadow-[0_0_10px_currentColor]" />
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className="px-2 py-0.5 rounded-md bg-secondary text-muted-foreground font-mono text-[10px] font-bold">
                                                M{moment.moveNumber}
                                            </span>
                                            <span className="font-semibold text-foreground text-[14px]">
                                                {moment.label}
                                            </span>
                                        </div>
                                        <p className="text-[13px] text-muted-foreground/90 font-medium leading-relaxed">
                                            {moment.detail}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null}

                {tutorNotes.length > 0 ? (
                    <div className="flex flex-col gap-4">
                        <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-tutor-accent ml-2">
                            Sensei Notes
                        </h4>
                        <div className="relative border-l-2 border-tutor-accent/30 ml-4 space-y-6 pb-2">
                            {tutorNotes.map((note) => (
                                <div key={`tutor-${note.moveNumber}`} className="relative pl-6">
                                    <div className="absolute -left-[5px] top-1.5 size-2.5 rounded-full bg-tutor-accent shadow-[0_0_10px_var(--color-tutor-accent)]" />
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className="px-2 py-0.5 rounded-md bg-tutor-accent/10 text-tutor-accent font-mono text-[10px] font-bold">
                                                M{note.moveNumber}
                                            </span>
                                        </div>
                                        <p className="text-[13px] text-foreground font-medium leading-relaxed">
                                            {note.note}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null}
            </div>

            <Button
                type="button"
                onClick={onExportSgf}
                className="w-full h-12 rounded-full font-bold text-[14px] uppercase tracking-wide shadow-md transition-shadow hover:shadow-lg mt-2"
            >
                <LuDownload className="size-4 mr-2" />
                Export SGF
            </Button>
        </div>
    );
}
