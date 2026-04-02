"use client";

import { useEffect, useMemo, useState } from "react";
import {
    LuBot,
    LuChevronDown,
    LuChevronUp,
    LuGauge,
    LuKeyRound,
    LuMessageSquareQuote,
    LuSend,
    LuSparkles,
} from "react-icons/lu";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLearningStore } from "@/lib/stores/learning-store";
import { useGameStore } from "@/lib/stores/game-store";
import { cn } from "@/lib/utils";

export type ChatMessageTone = "coach" | "celebrate" | "warning" | "tip";

export type ChatMessage = {
    id: string;
    text: string;
    tone: ChatMessageTone;
};

const QUICK_TIPS = ["Opening tips", "How to capture", "Territory"] as const;
const LETTERS = "ABCDEFGHJKLMNOPQRST".split("");

type TutorMode = "passive" | "active" | "review";

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

function toCoordinate(x: number, y: number, size: number) {
    const col = LETTERS[x] ?? "?";
    return `${col}${size - y}`;
}

function buildReviewLine({
    moveNumber,
    player,
    isPass,
    coordinate,
}: {
    moveNumber: number;
    player: "black" | "white";
    isPass: boolean;
    coordinate: string;
}) {
    if (isPass) {
        return `#${moveNumber}: ${player === "black" ? "Black" : "White"} passed. Check if there was still a forcing move before ending local fights.`;
    }

    const tone =
        moveNumber <= 20
            ? "opening shape"
            : moveNumber <= 120
              ? "middle-game pressure"
              : "endgame value";

    return `#${moveNumber}: ${player === "black" ? "Black" : "White"} played ${coordinate}. Re-evaluate nearby liberties and territory balance for ${tone}.`;
}

export function AIChatPanel({
    className,
}: {
    className?: string;
}) {
    const chatMessages = useLearningStore((state) => state.chatMessages);
    const tutorMood = useLearningStore((state) => state.tutorMood);
    const tutorGoal = useLearningStore((state) => state.tutorGoal);
    const tutorCue = useLearningStore((state) => state.tutorCue);
    const latestAnalysis = useLearningStore((state) => state.latestAnalysis);
    const requestTip = useLearningStore((state) => state.requestTip);
    const addMessage = useLearningStore((state) => state.addMessage);
    const isGameOver = useGameStore((state) => state.isGameOver);
    const moveHistory = useGameStore((state) => state.moveHistory);
    const scoreResult = useGameStore((state) => state.scoreResult);
    const gameOverReason = useGameStore((state) => state.gameOverReason);
    const boardSize = useGameStore((state) => state.size);
    const [question, setQuestion] = useState("");
    const [isAsking, setIsAsking] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamingReply, setStreamingReply] = useState("");
    const [tutorMode, setTutorMode] = useState<TutorMode>("active");
    const [openAIApiKey, setOpenAIApiKey] = useState("");
    const [showKeyEditor, setShowKeyEditor] = useState(false);
    const [reviewSummary, setReviewSummary] = useState("");
    const [isGeneratingReview, setIsGeneratingReview] = useState(false);
    const [lastReviewedGameKey, setLastReviewedGameKey] = useState("");

    const latestMessage = chatMessages[chatMessages.length - 1];
    const visibleMessages = chatMessages.slice(-12);
    const canAsk = question.trim().length > 0 && !isAsking && !isStreaming;
    const hasApiKey = openAIApiKey.trim().length > 0;
    const reviewKey = isGameOver
        ? `${moveHistory.length}:${scoreResult?.winner ?? "none"}:${gameOverReason ?? "none"}`
        : "";
    const recentReviewMoves = useMemo(
        () =>
            moveHistory.slice(-8).map((move, index) => {
                const absoluteMoveNumber = moveHistory.length - 8 + index + 1;
                const moveNumber =
                    absoluteMoveNumber > 0 ? absoluteMoveNumber : index + 1;
                const coordinate = move.isPass
                    ? "pass"
                    : toCoordinate(move.x, move.y, boardSize);

                return buildReviewLine({
                    moveNumber,
                    player: move.player,
                    isPass: move.isPass,
                    coordinate,
                });
            }),
        [boardSize, moveHistory],
    );

    const moodLabel =
        tutorMood === "celebrate"
            ? "Sensei is impressed"
            : tutorMood === "warning"
              ? "Sensei sees danger"
              : tutorMood === "focus"
                ? "Sensei sees a plan"
                : "Sensei is calm";

    useEffect(() => {
        if (typeof window === "undefined") return;
        const saved = window.localStorage.getItem("komi_openai_api_key");
        if (saved) {
            setOpenAIApiKey(saved);
        }
    }, []);

    function saveApiKey() {
        if (typeof window === "undefined") return;
        const next = openAIApiKey.trim();
        if (!next) {
            window.localStorage.removeItem("komi_openai_api_key");
            addMessage(
                "Using local tutor mode. Add your key anytime to enable live AI.",
                "tip",
            );
            return;
        }

        window.localStorage.setItem("komi_openai_api_key", next);
        addMessage("Personal API key saved locally on this device.", "tip");
    }

    function clearApiKey() {
        if (typeof window === "undefined") return;
        setOpenAIApiKey("");
        window.localStorage.removeItem("komi_openai_api_key");
        addMessage(
            "Personal API key removed. Back to local tutor mode.",
            "tip",
        );
    }

    useEffect(() => {
        if (!isGameOver) {
            setReviewSummary("");
            setLastReviewedGameKey("");
        }
    }, [isGameOver]);

    async function generateReview() {
        if (!isGameOver || isGeneratingReview || !reviewKey) return;

        setIsGeneratingReview(true);
        try {
            const finalResult = !scoreResult
                ? "result unavailable"
                : scoreResult.winner === "draw"
                  ? "draw"
                  : `${scoreResult.winner} by ${scoreResult.margin.toFixed(1)}`;

            const response = await fetch("/api/tutor", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question: [
                        "Give a compact post-game Go review.",
                        `Result: ${finalResult}.`,
                        `Reason: ${gameOverReason ?? "score"}.`,
                        `Recent moves: ${recentReviewMoves.join(" | ")}`,
                        "Focus on one strength, one mistake pattern, and one next-game objective.",
                    ].join(" "),
                    apiKey: hasApiKey ? openAIApiKey.trim() : undefined,
                }),
            });

            if (!response.ok) {
                setReviewSummary(
                    "Review unavailable right now. Check shape efficiency in your last 8 moves and prioritize safer liberties next game.",
                );
                return;
            }

            const json = (await response.json().catch(() => ({}))) as {
                message?: unknown;
            };
            if (
                typeof json.message === "string" &&
                json.message.trim().length > 0
            ) {
                setReviewSummary(json.message.trim());
            } else {
                setReviewSummary(
                    "Game complete. Revisit the final sequence and choose one defensive pattern to sharpen before your next match.",
                );
            }
        } catch {
            setReviewSummary(
                "Could not fetch review notes. Quick check: identify one over-extended group and one missed forcing move from the final phase.",
            );
        } finally {
            setIsGeneratingReview(false);
            setLastReviewedGameKey(reviewKey);
        }
    }

    useEffect(() => {
        if (tutorMode !== "review") return;
        if (!isGameOver || !reviewKey) return;
        if (lastReviewedGameKey === reviewKey) return;
        void generateReview();
    }, [tutorMode, isGameOver, reviewKey, lastReviewedGameKey]);

    async function handleAskSensei() {
        const nextQuestion = question.trim();
        if (!nextQuestion || isAsking || isStreaming) return;

        setIsAsking(true);
        setIsStreaming(true);
        setStreamingReply("");
        try {
            const response = await fetch("/api/tutor", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question: nextQuestion,
                    apiKey: hasApiKey ? openAIApiKey.trim() : undefined,
                    stream: true,
                }),
            });

            if (!response.ok) {
                addMessage(
                    "I could not answer that just now. Ask again in a moment.",
                    "warning",
                );
                return;
            }

            if (!response.body) {
                const json = (await response.json().catch(() => ({}))) as {
                    message?: unknown;
                };
                if (
                    typeof json.message === "string" &&
                    json.message.trim().length > 0
                ) {
                    addMessage(json.message, "coach");
                }
                return;
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullText = "";

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                fullText += decoder.decode(value, { stream: true });
                setStreamingReply(fullText);
            }
            fullText += decoder.decode();

            if (fullText.trim().length > 0) {
                addMessage(fullText.trim(), "coach");
            }
        } catch {
            addMessage(
                "Connection issue while asking Sensei. Try once more.",
                "warning",
            );
        } finally {
            setIsAsking(false);
            setIsStreaming(false);
            setStreamingReply("");
            setQuestion("");
        }
    }

    return (
        <div
            className={cn(
                "flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 h-full",
                className,
            )}
        >
            <div className="rounded-none border-2 border-border bg-card p-4 shadow-[4px_4px_0_0_var(--foreground)] shrink-0">
                <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-7 items-center justify-center rounded-none border-2 border-border bg-background text-foreground shadow-[2px_2px_0_0_var(--foreground)]">
                        <LuSparkles className="size-3.5" />
                    </span>
                    <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                            Current Goal • <span className="text-foreground/80 lowercase">{moodLabel}</span>
                        </p>
                        <p className="mt-1 font-sans text-sm font-medium text-foreground">
                            {tutorGoal}
                        </p>
                        <p className="mt-1.5 text-[13px] text-muted-foreground/80 leading-relaxed">
                            {tutorCue}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-[2px] bg-border p-[2px] shrink-0 border-2 border-border shadow-[4px_4px_0_0_var(--foreground)]">
                        {(["passive", "active", "review"] as TutorMode[]).map(
                            (mode) => (
                                <button
                                    key={mode}
                                    type="button"
                                    onClick={() => setTutorMode(mode)}
                                    className={cn(
                                        "rounded-lg px-2 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-all duration-200",
                                        tutorMode === mode
                                            ? "bg-background text-foreground shadow-sm"
                                            : "text-muted-foreground hover:text-foreground",
                                    )}
                                >
                                    {mode}
                                </button>
                            ),
                        )}
                    </div>

                    {latestAnalysis ? (
                        <div className="rounded-none border-2 border-border bg-background p-4 shadow-[4px_4px_0_0_var(--foreground)] shrink-0">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                                        Engine Read
                                    </p>
                                    <p className="mt-1 text-sm text-foreground">
                                        {latestAnalysis.summary}
                                    </p>
                                </div>
                                <div className="inline-flex items-center gap-1 rounded-none border-2 border-border bg-background px-2.5 py-1 font-mono text-[11px] font-bold text-foreground shadow-[2px_2px_0_0_var(--foreground)]">
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
                                        className="grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-none border border-border bg-background px-2.5 py-1.5"
                                    >
                                        <span className="font-mono text-xs text-muted-foreground">
                                            #{index + 1}
                                        </span>
                                        <div className="min-w-0">
                                            <p className="truncate font-mono text-xs font-bold text-foreground">
                                                {move.coordinate}
                                            </p>
                                            <p className="truncate font-mono text-[10px] text-muted-foreground">
                                                {move.reason}
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

                    {tutorMode === "review" ? (
                        <div className="rounded-none border-2 border-border bg-background p-4 shadow-[4px_4px_0_0_var(--foreground)] shrink-0">
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                                    Post-Game Review
                                </p>
                                {isGameOver ? (
                                    <button
                                        type="button"
                                        onClick={() => void generateReview()}
                                        disabled={isGeneratingReview}
                                        className="rounded-full border border-border/70 bg-secondary/25 px-2.5 py-1 text-[11px] font-semibold text-foreground disabled:opacity-60"
                                    >
                                        {isGeneratingReview
                                            ? "Updating..."
                                            : "Refresh"}
                                    </button>
                                ) : null}
                            </div>

                            {!isGameOver ? (
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Review unlocks after game end. Finish the
                                    current game to get a move-by-move
                                    walkthrough.
                                </p>
                            ) : (
                                <>
                                    <p className="mt-2 text-sm text-foreground">
                                        {isGeneratingReview
                                            ? "Sensei is preparing your recap..."
                                            : reviewSummary ||
                                              "Generating review..."}
                                    </p>
                                    <div className="mt-3 space-y-1.5">
                                        {recentReviewMoves.map(
                                            (line, index) => (
                                                <p
                                                    key={`${line}-${index}`}
                                                    className="rounded-none border-l-4 border-l-border border border-border bg-background px-2.5 py-1.5 font-mono text-[11px] font-bold text-muted-foreground"
                                                >
                                                    {line}
                                                </p>
                                            ),
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    ) : null}

                    <div className="flex-1 overflow-hidden rounded-xl border border-border/60 bg-secondary/15 relative min-h-[250px] shrink-0">
                        <ScrollArea className="absolute inset-0 top-0 h-full w-full">
                            <div className="p-4">
                                {visibleMessages.map((message) => (
                                    <div
                                        key={message.id}
                                        className="mb-5 flex gap-3"
                                    >
                                        <div className="flex size-8 shrink-0 select-none items-center justify-center rounded-full border border-border/50 bg-secondary text-primary shadow-sm">
                                            <LuBot className="size-4" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-semibold text-foreground">
                                                Sensei
                                                <span className="ml-2 font-normal text-muted-foreground text-[10px] uppercase tracking-wider">
                                                    {message.tone === "coach"
                                                        ? "Coach"
                                                        : message.tone}
                                                </span>
                                            </p>
                                            <p className="text-[13px] text-foreground/80 text-pretty leading-relaxed">
                                                {message.text}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {isStreaming ? (
                                    <div className="mb-5 flex gap-3">
                                        <div className="flex size-8 shrink-0 select-none items-center justify-center rounded-full border border-border/50 bg-secondary text-primary shadow-sm animate-pulse">
                                            <LuBot className="size-4" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-semibold text-foreground">
                                                Sensei
                                                <span className="ml-2 font-normal text-muted-foreground text-[10px] uppercase tracking-wider">
                                                    Thinking
                                                </span>
                                            </p>
                                            <p className="text-[13px] text-foreground/80 text-pretty leading-relaxed">
                                                {streamingReply || "..."}
                                            </p>
                                        </div>
                                    </div>
                                ) : null}
                                {!visibleMessages.length && !isStreaming ? (
                                    <p className="py-8 text-center text-sm text-muted-foreground">
                                        Sensei will react after your next move.
                                    </p>
                                ) : null}
                            </div>
                        </ScrollArea>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0 pb-4">
                        {tutorMode === "active" ? (
                            <div className="flex flex-col gap-2">
                                <div className="w-full rounded-xl border border-border/60 bg-secondary/20 p-3">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                            AI Key
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowKeyEditor(
                                                    (current) => !current,
                                                )
                                            }
                                            className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/80 px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
                                        >
                                            <LuKeyRound className="size-3.5" />
                                            {hasApiKey
                                                ? "Configured"
                                                : "Set key"}
                                        </button>
                                    </div>
                                    {showKeyEditor ? (
                                        <div className="mt-2 space-y-2">
                                            <input
                                                value={openAIApiKey}
                                                onChange={(event) =>
                                                    setOpenAIApiKey(
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="sk-..."
                                                type="password"
                                                className="h-10 w-full rounded-full border border-border/70 bg-background/85 px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent/60"
                                            />
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={clearApiKey}
                                                    className="inline-flex h-8 items-center rounded-full border border-border/70 bg-background/85 px-3 text-xs font-medium text-muted-foreground hover:text-foreground"
                                                >
                                                    Clear
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={saveApiKey}
                                                    className="inline-flex h-8 items-center rounded-full border border-border/70 bg-secondary/30 px-3 text-xs font-semibold text-foreground hover:bg-secondary/50"
                                                >
                                                    Save key
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {hasApiKey
                                                ? "Using your key for live tutor responses."
                                                : "No key set. Sensei uses local fallback responses."}
                                        </p>
                                    )}
                                </div>

                                <form
                                    className="flex w-full items-center gap-2 relative mt-2"
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        void handleAskSensei();
                                    }}
                                >
                                    <input
                                        value={question}
                                        onChange={(event) =>
                                            setQuestion(event.target.value)
                                        }
                                        placeholder="Ask Sensei about this position..."
                                        className="h-10 flex-1 rounded-full border border-border/50 bg-background/50 backdrop-blur-md pl-4 pr-12 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent/60 shadow-sm"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!canAsk}
                                        className="absolute right-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <LuSend className="size-3.5" />
                                    </button>
                                </form>
                            </div>
                        ) : null}

                        {tutorMode === "passive" ? (
                            <p className="w-full rounded-xl border border-border/60 bg-secondary/15 px-3 py-2 text-xs text-muted-foreground">
                                Passive mode keeps hints lightweight while you
                                focus on play.
                            </p>
                        ) : null}

                        {tutorMode !== "review"
                            ? QUICK_TIPS.map((topic) => (
                                  <button
                                      key={topic}
                                      type="button"
                                      onClick={() => requestTip(topic)}
                                      className="inline-flex min-h-9 items-center rounded-full border border-border/70 bg-background/80 px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                                  >
                                      {topic}
                                  </button>
                              ))
                            : null}
                    </div>
        </div>
    );
}
