"use client";

import type { ReactNode } from "react";
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

function formatPoint(value: number | undefined) {
    if (typeof value !== "number" || !Number.isFinite(value)) return "0";
    return Number.isInteger(value) ? String(value) : value.toFixed(1);
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
        <section className="relative flex w-full flex-col overflow-hidden border border-border bg-background">
            <span className="pointer-events-none absolute -right-5 top-6 font-sans text-[7rem] font-semibold leading-none text-foreground/10">
                勝
            </span>

            <header className="relative border-b border-border px-5 py-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                            Post-game dossier
                        </p>
                        <h3 className="mt-2 font-sans text-3xl font-semibold leading-none tracking-[-0.06em] text-foreground">
                            Review Board
                        </h3>
                        <p className="mt-2 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                            {formatOutcome({ winner, reason, scoreResult })}
                        </p>
                    </div>
                    <span className="inline-flex items-center gap-2 border border-border bg-background px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground">
                        <LuFlag className="size-3.5" />
                        Final
                    </span>
                </div>
            </header>

            {scoreResult ? (
                <div className="border-b border-border">
                    <div className="grid grid-cols-2 divide-x divide-border">
                        <ScoreColumn
                            label="Black"
                            kanji="黒"
                            total={scoreResult.black.total}
                            rows={[
                                ["Territory", formatPoint(scoreResult.black.territory)],
                                ["Captures", formatPoint(scoreResult.black.captures)],
                            ]}
                        />
                        <ScoreColumn
                            label="White"
                            kanji="白"
                            total={scoreResult.white.total}
                            rows={[
                                ["Territory", formatPoint(scoreResult.white.territory)],
                                ["Komi", `+${formatPoint(scoreResult.white.komi)}`],
                            ]}
                        />
                    </div>

                    {canReviewDeadStones ? (
                        <div className="border-t border-border p-4">
                            <div className="border border-border bg-background">
                                <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
                                    <div>
                                        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                            Dead-stone review
                                        </p>
                                        <p className="mt-1 font-sans text-[13px] leading-relaxed text-foreground/80">
                                            Select stones on the board before confirming the final score.
                                        </p>
                                    </div>
                                    <span className="border border-border px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground">
                                        Marked: {deadStoneCount}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 divide-x divide-border">
                                    <button
                                        type="button"
                                        onClick={onClearDeadStones}
                                        disabled={deadStoneCount === 0}
                                        className="flex h-10 items-center justify-center gap-2 bg-background font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground transition-colors hover:bg-subtle disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <LuRotateCcw className="size-3.5" />
                                        Clear
                                    </button>
                                    <button
                                        type="button"
                                        onClick={onConfirmScore}
                                        disabled={!onConfirmScore}
                                        className="flex h-10 items-center justify-center gap-2 bg-foreground font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <LuCheck className="size-3.5" />
                                        {scoreReviewPending ? "Confirm" : "Confirmed"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    <p className="border-t border-border px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        Estimate only. Dead stones, seki, and neutral points are not manually adjudicated yet.
                    </p>
                </div>
            ) : (
                <div className="border-b border-border px-5 py-6 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    No score detail for this finish
                </div>
            )}

            <div className="grid gap-6 px-5 py-5">
                {keyMoments.length > 0 ? (
                    <TimelineBlock title="Key moments">
                        {keyMoments.map((moment) => (
                            <TimelineRow
                                key={`${moment.moveNumber}-${moment.label}`}
                                label={`M${moment.moveNumber}`}
                                title={moment.label}
                                detail={moment.detail}
                            />
                        ))}
                    </TimelineBlock>
                ) : null}

                {tutorNotes.length > 0 ? (
                    <TimelineBlock title="Sensei notes">
                        {tutorNotes.map((note) => (
                            <TimelineRow
                                key={`tutor-${note.moveNumber}`}
                                label={`M${note.moveNumber}`}
                                title="Sensei"
                                detail={note.note}
                            />
                        ))}
                    </TimelineBlock>
                ) : null}
            </div>

            <button
                type="button"
                onClick={onExportSgf}
                className="flex h-12 items-center justify-center gap-2 border-t border-border bg-foreground font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
                <LuDownload className="size-4" />
                Export SGF
            </button>
        </section>
    );
}

function ScoreColumn({
    label,
    kanji,
    total,
    rows,
}: {
    label: string;
    kanji: string;
    total: number;
    rows: Array<[string, string]>;
}) {
    return (
        <div className="relative min-w-0 px-4 py-4">
            <span className="pointer-events-none absolute right-3 top-3 font-sans text-5xl font-semibold leading-none text-foreground/10">
                {kanji}
            </span>
            <div className="relative">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {label}
                </p>
                <p className="mt-3 font-mono text-4xl font-semibold leading-none tracking-[-0.08em] text-foreground">
                    {formatPoint(total)}
                </p>
                <div className="mt-4 grid gap-2 border-t border-border pt-3">
                    {rows.map(([rowLabel, value]) => (
                        <div
                            key={rowLabel}
                            className="flex items-center justify-between gap-3 font-mono text-[10px] font-semibold uppercase tracking-[0.12em]"
                        >
                            <span className="text-muted-foreground">{rowLabel}</span>
                            <span className="text-foreground">{value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function TimelineBlock({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <section>
            <h4 className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {title}
            </h4>
            <div className="mt-3 grid gap-px bg-border p-px">{children}</div>
        </section>
    );
}

function TimelineRow({
    label,
    title,
    detail,
}: {
    label: string;
    title: string;
    detail: string;
}) {
    return (
        <div className="grid grid-cols-[56px_1fr] bg-background">
            <div className="border-r border-border px-3 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {label}
            </div>
            <div className="px-3 py-3">
                <p className="font-sans text-[14px] font-semibold tracking-[-0.03em] text-foreground">
                    {title}
                </p>
                <p className="mt-1 font-sans text-[13px] leading-relaxed text-muted-foreground">
                    {detail}
                </p>
            </div>
        </div>
    );
}
