"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LuCheck, LuDownload, LuFlag, LuRotateCcw } from "react-icons/lu";
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
    canReviewDeadStones = false,
    deadStoneCount = 0,
    scoreReviewPending = false,
    onClearDeadStones,
    onConfirmScore,
    onExportSgf,
}: {
    scoreResult: ScoreResult | null;
    winner: "black" | "white" | "draw" | null;
    reason: "score" | "resignation" | "timeout" | null;
    keyMoments: KeyMoment[];
    tutorNotes?: TutorNote[];
    canReviewDeadStones?: boolean;
    deadStoneCount?: number;
    scoreReviewPending?: boolean;
    onClearDeadStones?: () => void;
    onConfirmScore?: () => void;
    onExportSgf: () => void;
}) {
    return (
        <div className="flex flex-col gap-6 w-full rounded-none border-2 border-border bg-card p-5 lg:p-6 shadow-[4px_4px_0_0_var(--foreground)]">
            <div className="flex items-start justify-between gap-3 px-1">
                <div>
                    <h3 className="text-2xl font-display font-black uppercase tracking-tighter text-foreground">
                        Post-game review
                    </h3>
                    <p className="font-mono text-[11px] font-bold uppercase text-muted-foreground mt-1">
                        {formatOutcome({ winner, reason, scoreResult })}
                    </p>
                </div>
                <Badge
                    variant="outline"
                    className="inline-flex items-center gap-1.5 rounded-none border-2 border-border px-3 py-1 font-mono font-bold text-[11px] uppercase tracking-widest bg-background text-foreground shadow-[2px_2px_0_0_var(--foreground)]"
                >
                    <LuFlag className="size-3.5" />
                    Final
                </Badge>
            </div>

            {scoreResult ? (
                <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Black Stat Block */}
                        <div className="flex flex-col bg-swiss-blue text-white border-2 border-border rounded-none p-5 shadow-[4px_4px_0_0_var(--foreground)] w-full transition-transform hover:-translate-y-1 group">
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-[12px] font-mono font-bold uppercase tracking-widest text-white">Black</span>
                                <div className="size-4 rounded-none bg-black border-2 border-transparent" />
                            </div>
                            <div className="mt-auto">
                                <span className="text-5xl font-display font-black tracking-tighter text-white group-hover:scale-105 transition-transform origin-left inline-block">
                                    {scoreResult.black.total.toFixed(1)}
                                </span>
                                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-white/20">
                                    <div className="flex items-center justify-between text-[11px] font-bold text-white/70 uppercase tracking-wider">
                                        <span>Territory</span>
                                        <span className="font-mono text-white text-[13px]">{scoreResult.black.territory}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] font-bold text-white/70 uppercase tracking-wider">
                                        <span>Captures</span>
                                        <span className="font-mono text-white text-[13px]">{scoreResult.black.captures}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* White Stat Block */}
                        <div className="flex flex-col bg-swiss-red text-white border-2 border-border rounded-none p-5 shadow-[4px_4px_0_0_var(--foreground)] w-full transition-transform hover:-translate-y-1 group">
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-[12px] font-mono font-bold uppercase tracking-widest text-white">White</span>
                                <div className="size-4 rounded-none bg-white border-2 border-transparent" />
                            </div>
                            <div className="mt-auto">
                                <span className="text-5xl font-display font-black tracking-tighter text-white group-hover:scale-105 transition-transform origin-left inline-block">
                                    {scoreResult.white.total.toFixed(1)}
                                </span>
                                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-white/20">
                                    <div className="flex items-center justify-between text-[11px] font-bold text-white/70 uppercase tracking-wider">
                                        <span>Territory</span>
                                        <span className="font-mono text-white text-[13px]">{scoreResult.white.territory}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] font-bold text-white/70 uppercase tracking-wider">
                                        <span>Komi</span>
                                        <span className="font-mono text-white text-[13px]">+{scoreResult.white.komi?.toFixed(1) ?? "0.0"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {canReviewDeadStones ? (
                        <div className="flex flex-col gap-3 border-2 border-border bg-background/80 p-3 shadow-[3px_3px_0_0_var(--foreground)]">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                                        Dead-stone review
                                    </p>
                                    <p className="mt-1 text-[12px] font-semibold leading-snug text-foreground">
                                        Select stones on the board before confirming the final score.
                                    </p>
                                </div>
                                <Badge
                                    variant="outline"
                                    className="rounded-none border-2 border-border bg-card px-2 py-1 font-mono text-[10px] font-bold uppercase"
                                >
                                    Marked: {deadStoneCount}
                                </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onClearDeadStones}
                                    disabled={deadStoneCount === 0}
                                    className="h-10 rounded-none border-2 border-border font-mono text-[11px] font-bold uppercase tracking-widest"
                                >
                                    <LuRotateCcw className="mr-2 size-3.5" />
                                    Clear
                                </Button>
                                <Button
                                    type="button"
                                    onClick={onConfirmScore}
                                    className="h-10 rounded-none border-2 border-foreground font-mono text-[11px] font-bold uppercase tracking-widest shadow-[3px_3px_0_0_var(--foreground)]"
                                >
                                    <LuCheck className="mr-2 size-3.5" />
                                    {scoreReviewPending ? "Confirm" : "Confirmed"}
                                </Button>
                            </div>
                        </div>
                    ) : null}
                    <p className="border-2 border-dashed border-border/60 bg-background/70 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                        Estimate only. Dead stones, seki, and neutral points are not manually adjudicated yet.
                    </p>
                </div>
            ) : (
                <div className="rounded-3xl border border-border/50 bg-secondary/30 p-6 text-center text-[13px] font-medium text-muted-foreground">
                    No score detail for this finish.
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
                                            <span className="px-2 py-0.5 rounded-none border-2 border-border bg-background text-muted-foreground font-mono text-[10px] font-bold">
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
                                            <span className="px-2 py-0.5 rounded-none border-2 border-tutor-accent bg-background text-tutor-accent font-mono text-[10px] font-bold shadow-[2px_2px_0_0_var(--color-tutor-accent)]">
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
                className="w-full h-12 rounded-none border-2 border-transparent font-mono font-bold text-[14px] uppercase tracking-widest shadow-[4px_4px_0_0_var(--foreground)] transition-all hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:shadow-none mt-2"
            >
                <LuDownload className="size-4 mr-2" />
                Export SGF
            </Button>
        </div>
    );
}
