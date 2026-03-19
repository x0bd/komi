"use client";

import {
    LuBot,
    LuChevronDown,
    LuChevronUp,
    LuGauge,
    LuMessageSquareQuote,
    LuSparkles,
} from "react-icons/lu";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLearningStore } from "@/lib/stores/learning-store";
import { cn } from "@/lib/utils";

export type ChatMessageTone = "coach" | "celebrate" | "warning" | "tip";

export type ChatMessage = {
    id: string;
    text: string;
    tone: ChatMessageTone;
};

const QUICK_TIPS = ["Opening tips", "How to capture", "Territory"] as const;

function getToneClasses(tone: ChatMessageTone) {
    switch (tone) {
        case "celebrate":
            return "border-status-active/25 bg-status-active/10 text-foreground";
        case "warning":
            return "border-destructive/20 bg-destructive/8 text-foreground";
        case "tip":
            return "border-accent/25 bg-accent/10 text-foreground";
        default:
            return "border-border/60 bg-secondary/35 text-foreground";
    }
}

export function AIChatPanel({
    collapsed = false,
    onToggle,
    className,
}: {
    collapsed?: boolean;
    onToggle?: () => void;
    className?: string;
}) {
    const chatMessages = useLearningStore((state) => state.chatMessages);
    const tutorMood = useLearningStore((state) => state.tutorMood);
    const tutorGoal = useLearningStore((state) => state.tutorGoal);
    const tutorCue = useLearningStore((state) => state.tutorCue);
    const latestAnalysis = useLearningStore((state) => state.latestAnalysis);
    const requestTip = useLearningStore((state) => state.requestTip);

    const latestMessage = chatMessages[chatMessages.length - 1];
    const visibleMessages = chatMessages.slice(-12);

    const moodLabel =
        tutorMood === "celebrate"
            ? "Sensei is impressed"
            : tutorMood === "warning"
              ? "Sensei sees danger"
              : tutorMood === "focus"
                ? "Sensei sees a plan"
                : "Sensei is calm";

    if (collapsed) {
        return (
            <button
                type="button"
                onClick={onToggle}
                className={cn("group w-full text-left", className)}
            >
                <Card className="overflow-hidden rounded-2xl border border-border shadow-md bg-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                    <CardContent className="px-5 py-3.5">
                        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
                            <div className="flex size-11 items-center justify-center rounded-full bg-secondary text-accent shadow-sm">
                                <LuBot className="size-[18px]" />
                            </div>

                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                                        Sensei
                                    </p>
                                    <span className="inline-flex h-2 w-2 rounded-full bg-status-active" />
                                </div>
                                <p className="mt-1 truncate font-display text-[1.28rem] font-semibold leading-none tracking-[-0.03em] text-foreground/[0.92]">
                                    {moodLabel}
                                </p>
                                <p className="mt-1 truncate text-sm text-muted-foreground">
                                    {latestMessage?.text ?? tutorCue}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="text-right">
                                    <p className="font-display text-xl font-bold leading-none tracking-[-0.04em] text-accent">
                                        {chatMessages.length}
                                    </p>
                                    <p className="mt-1 text-[11px] font-medium text-muted-foreground">
                                        notes
                                    </p>
                                </div>
                                <span className="flex size-9 items-center justify-center rounded-full border border-border/65 bg-background/70 text-muted-foreground shadow-sm transition-colors group-hover:text-foreground">
                                    <LuChevronDown className="size-4" />
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </button>
        );
    }

    return (
        <Card
            className={cn(
                "overflow-hidden rounded-2xl border border-border shadow-md bg-card",
                className,
            )}
        >
            <CardContent className="p-0">
                <div className="relative overflow-hidden bg-tutor-accent px-5 py-4 text-tutor-foreground">
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-white/10" />
                    <div className="relative flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className="flex size-11 items-center justify-center rounded-full bg-tutor-foreground/15 text-tutor-foreground shadow-sm">
                                <LuBot className="size-[18px] drop-shadow-sm" />
                            </span>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-tutor-foreground/70">
                                    Sensei
                                </p>
                                <p className="font-display text-[1.35rem] font-semibold leading-none tracking-[-0.03em] text-tutor-foreground">
                                    {moodLabel}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-2">
                            <div className="text-right">
                                <p className="font-display text-2xl font-extrabold leading-none tracking-[-0.05em] text-tutor-foreground">
                                    {chatMessages.length}
                                </p>
                                <p className="mt-1 text-[11px] font-medium text-tutor-foreground/70">
                                    notes
                                </p>
                            </div>
                            {onToggle ? (
                                <button
                                    type="button"
                                    onClick={onToggle}
                                    aria-label="Collapse Sensei panel"
                                    className="flex size-9 items-center justify-center rounded-full border border-tutor-foreground/30 bg-tutor-foreground/10 text-tutor-foreground/80 shadow-sm transition-colors hover:text-tutor-foreground"
                                >
                                    <LuChevronUp className="size-4" />
                                </button>
                            ) : null}
                        </div>
                    </div>
                </div>

                <div className="px-5 py-4">
                    <div className="rounded-xl border border-border/60 bg-secondary/25 p-4">
                        <div className="flex items-start gap-3">
                            <span className="mt-0.5 flex size-8 items-center justify-center rounded-full bg-background/80 text-accent shadow-sm">
                                <LuSparkles className="size-[14px]" />
                            </span>
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                                    Current Goal
                                </p>
                                <p className="mt-1 font-medium text-foreground">
                                    {tutorGoal}
                                </p>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {tutorCue}
                                </p>
                            </div>
                        </div>
                    </div>

                    {latestAnalysis ? (
                        <div className="mt-4 rounded-xl border border-border/60 bg-background/80 p-4 shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                                        Engine Read
                                    </p>
                                    <p className="mt-1 text-sm text-foreground">
                                        {latestAnalysis.summary}
                                    </p>
                                </div>
                                <div className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-secondary/40 px-2.5 py-1 text-xs font-semibold text-foreground">
                                    <LuGauge className="size-3.5 text-accent" />
                                    {Math.round(
                                        Math.max(
                                            0,
                                            Math.min(1, latestAnalysis.winRate),
                                        ) * 100,
                                    )}
                                    %
                                </div>
                            </div>

                            <div className="mt-3 space-y-1.5">
                                {latestAnalysis.topMoves.map((move, index) => (
                                    <div
                                        key={`${move.coordinate}-${index}`}
                                        className="grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-lg border border-border/55 bg-secondary/25 px-2.5 py-1.5"
                                    >
                                        <span className="font-mono text-xs text-muted-foreground">
                                            #{index + 1}
                                        </span>
                                        <div className="min-w-0">
                                            <p className="truncate font-mono text-xs font-semibold text-foreground">
                                                {move.coordinate}
                                            </p>
                                            <p className="truncate text-[10px] text-muted-foreground">
                                                {move.tags.length
                                                    ? move.tags.join(" · ")
                                                    : "shape"}
                                            </p>
                                        </div>
                                        <span className="font-mono text-[11px] font-semibold text-muted-foreground">
                                            {move.confidence}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    <div className="mt-4 overflow-hidden rounded-xl border border-border/60 bg-secondary/15">
                        <ScrollArea className="h-[210px]">
                            <div className="space-y-2 p-3">
                                {visibleMessages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={cn(
                                            "rounded-2xl border px-3.5 py-3 text-sm leading-relaxed shadow-sm",
                                            getToneClasses(message.tone),
                                        )}
                                    >
                                        <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                                            <LuMessageSquareQuote className="size-3.5" />
                                            <span>
                                                {message.tone === "coach"
                                                    ? "Coach note"
                                                    : message.tone}
                                            </span>
                                        </div>
                                        <p className="text-pretty">
                                            {message.text}
                                        </p>
                                    </div>
                                ))}
                                {!visibleMessages.length ? (
                                    <p className="px-1 py-4 text-center text-sm text-muted-foreground">
                                        Sensei will react after your next move.
                                    </p>
                                ) : null}
                                </div>
                        </ScrollArea>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        {QUICK_TIPS.map((topic) => (
                            <button
                                key={topic}
                                type="button"
                                onClick={() => requestTip(topic)}
                                className="inline-flex min-h-9 items-center rounded-full border border-border/70 bg-background/80 px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                            >
                                {topic}
                            </button>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
