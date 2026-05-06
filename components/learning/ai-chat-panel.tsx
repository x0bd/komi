"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
    LuBot,
    LuGauge,
    LuKeyRound,
    LuSend,
    LuSparkles,
    LuX,
} from "react-icons/lu";
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

function buildLocalTutorFallback(question: string) {
    const normalized = question.toLowerCase();

    if (normalized.includes("capture") || normalized.includes("atari")) {
        return "Local read: count liberties first. If your move puts a group in atari but leaves your own stones short on liberties, connect before chasing.";
    }

    if (normalized.includes("territory") || normalized.includes("point")) {
        return "Local read: compare secure points, not hopeful points. Reinforce the border where your opponent can cut or reduce in one move.";
    }

    if (normalized.includes("opening") || normalized.includes("fuseki")) {
        return "Local read: in the opening, take corners, extend from strength, then approach weak corners. Avoid low-value contact fights too early.";
    }

    if (normalized.includes("live") || normalized.includes("die") || normalized.includes("eye")) {
        return "Local read: make two eye-shape threats before expanding. A single big eye often still collapses if the opponent owns the vital point.";
    }

    return "Local read: pause and count liberties around the last fight, then choose the move that keeps your stones connected while reducing the opponent's easiest territory.";
}

function ToneIcon({ tone }: { tone: ChatMessageTone }) {
    return (
        <span
            className={cn(
                "flex size-9 shrink-0 items-center justify-center border border-border bg-foreground text-primary-foreground",
                tone === "warning" && "border-accent bg-accent text-accent-foreground",
                tone === "celebrate" && "border-status-active bg-status-active text-background",
            )}
        >
            <LuBot className="size-4" />
        </span>
    );
}

export function AIChatPanel({ className }: { className?: string }) {
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
    const analysisOverlayEnabled = useGameStore((state) => state.analysisOverlayEnabled);
    const setAnalysisOverlayEnabled = useGameStore((state) => state.setAnalysisOverlayEnabled);
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
    const askAbortRef = useRef<AbortController | null>(null);
    const reviewAbortRef = useRef<AbortController | null>(null);

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
            ? "sensei is impressed"
            : tutorMood === "warning"
              ? "sensei sees danger"
              : tutorMood === "focus"
                ? "sensei sees a plan"
                : "sensei is calm";

    useEffect(() => {
        if (typeof window === "undefined") return;
        const saved = window.localStorage.getItem("komi_openai_api_key");
        if (saved) {
            setOpenAIApiKey(saved);
        }
    }, []);

    useEffect(() => {
        return () => {
            askAbortRef.current?.abort();
            reviewAbortRef.current?.abort();
        };
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
        addMessage("Personal API key saved locally. Tutor requests still route through the Komi server.", "tip");
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

        reviewAbortRef.current?.abort();
        const controller = new AbortController();
        reviewAbortRef.current = controller;
        let shouldMarkReviewed = false;
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
                signal: controller.signal,
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
                shouldMarkReviewed = true;
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
            shouldMarkReviewed = true;
        } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") {
                return;
            }
            setReviewSummary(
                "Could not fetch review notes. Quick check: identify one over-extended group and one missed forcing move from the final phase.",
            );
            shouldMarkReviewed = true;
        } finally {
            if (reviewAbortRef.current === controller) {
                reviewAbortRef.current = null;
                setIsGeneratingReview(false);
                if (shouldMarkReviewed) {
                    setLastReviewedGameKey(reviewKey);
                }
            }
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

        askAbortRef.current?.abort();
        const controller = new AbortController();
        askAbortRef.current = controller;
        let shouldClearQuestion = false;

        setIsAsking(true);
        setIsStreaming(true);
        setStreamingReply("");
        try {
            const response = await fetch("/api/tutor", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                signal: controller.signal,
                body: JSON.stringify({
                    question: nextQuestion,
                    apiKey: hasApiKey ? openAIApiKey.trim() : undefined,
                    stream: true,
                }),
            });

            if (!response.ok) {
                addMessage(
                    response.status === 429
                        ? "Sensei is rate-limited for a moment. Let the board breathe, then ask again."
                        : buildLocalTutorFallback(nextQuestion),
                    response.status === 429 ? "warning" : "coach",
                );
                if (response.status !== 429) {
                    shouldClearQuestion = true;
                }
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
                    shouldClearQuestion = true;
                } else {
                    addMessage(buildLocalTutorFallback(nextQuestion), "coach");
                    shouldClearQuestion = true;
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
                shouldClearQuestion = true;
            }
        } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") {
                addMessage("Sensei paused that answer. Ask again when ready.", "tip");
                return;
            }
            addMessage(
                buildLocalTutorFallback(nextQuestion),
                "coach",
            );
            shouldClearQuestion = true;
        } finally {
            if (askAbortRef.current === controller) {
                askAbortRef.current = null;
                setIsAsking(false);
                setIsStreaming(false);
                setStreamingReply("");
                if (shouldClearQuestion) {
                    setQuestion("");
                }
            }
        }
    }

    function cancelAskSensei() {
        askAbortRef.current?.abort();
    }

    return (
        <div
            className={cn(
                "flex h-full min-h-0 flex-col gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300",
                className,
            )}
        >
            <section className="relative shrink-0 border border-border bg-background">
                <div className="absolute bottom-0 left-0 h-1 w-full bg-accent" />
                <div className="absolute right-0 top-0 h-full w-1 bg-accent" />
                <div className="flex items-start gap-4 p-5 pr-6">
                    <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center border border-border bg-background">
                        <LuSparkles className="size-5 text-foreground" />
                    </span>
                    <div className="min-w-0">
                        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                            Current goal / <span className="lowercase tracking-[0.08em] text-foreground">{moodLabel}</span>
                        </p>
                        <p className="mt-2 font-sans text-[17px] font-semibold leading-snug tracking-[-0.04em] text-foreground">
                            {tutorGoal}
                        </p>
                        <p className="mt-3 max-w-[26rem] font-sans text-[14px] leading-relaxed text-foreground/80">
                            {tutorCue}
                        </p>
                    </div>
                </div>
            </section>

            <div className="grid shrink-0 grid-cols-3 gap-px border border-border bg-foreground p-px">
                {(["passive", "active", "review"] as TutorMode[]).map((mode) => (
                    <button
                        key={mode}
                        type="button"
                        onClick={() => setTutorMode(mode)}
                        className={cn(
                            "h-11 bg-foreground font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-background/55 transition-colors hover:text-background",
                            tutorMode === mode && "bg-background text-foreground",
                        )}
                    >
                        {mode}
                    </button>
                ))}
            </div>

            <section className="flex shrink-0 items-center justify-between gap-4 border border-border bg-background px-4 py-3">
                <div className="min-w-0">
                    <p className="font-sans text-[14px] font-semibold tracking-[-0.03em] text-foreground">
                        Board overlay
                    </p>
                    <p className="mt-1 truncate font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        Show ranked move hints on the grid
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setAnalysisOverlayEnabled(!analysisOverlayEnabled)}
                    className={cn(
                        "relative h-8 w-14 shrink-0 border border-border bg-background outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                        analysisOverlayEnabled && "bg-foreground",
                    )}
                    aria-pressed={analysisOverlayEnabled}
                    aria-label="Toggle board analysis overlay"
                >
                    <span
                        className={cn(
                            "absolute left-[3px] top-[3px] h-5 w-5 border border-border bg-background transition-transform",
                            analysisOverlayEnabled && "translate-x-6 border-accent bg-accent",
                        )}
                    />
                </button>
            </section>

            {latestAnalysis ? (
                <section className="shrink-0 border border-border bg-background p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                Engine read
                            </p>
                            <p className="mt-2 font-sans text-[15px] font-semibold leading-relaxed tracking-[-0.03em] text-foreground">
                                {latestAnalysis.summary}
                            </p>
                        </div>
                        <div className="inline-flex shrink-0 items-center gap-1.5 border border-border bg-foreground px-3 py-2 font-mono text-[11px] font-semibold text-primary-foreground">
                            <LuGauge className="size-3.5 text-warning" />
                            {Math.round(
                                Math.max(0, Math.min(1, latestAnalysis.winRate)) * 100,
                            )}
                            %
                        </div>
                    </div>

                    <div className="mt-5 grid gap-3">
                        {latestAnalysis.topMoves.map((move, index) => (
                            <div
                                key={`${move.coordinate}-${index}`}
                                className="grid grid-cols-[36px_1fr_auto] items-center gap-3 border border-border bg-subtle/40 px-3 py-3"
                            >
                                <span className="font-mono text-[12px] text-muted-foreground">
                                    #{index + 1}
                                </span>
                                <div className="min-w-0">
                                    <p className="truncate font-mono text-[13px] font-semibold text-foreground">
                                        {move.coordinate}
                                    </p>
                                    <p className="truncate font-mono text-[10px] font-semibold tracking-[-0.02em] text-muted-foreground">
                                        {move.reason}
                                    </p>
                                </div>
                                <span className="font-mono text-[11px] font-semibold text-foreground">
                                    {move.confidence}%
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            ) : null}

            {tutorMode === "review" ? (
                <section className="shrink-0 border border-border bg-background p-5">
                    <div className="flex items-center justify-between gap-3">
                        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                            Post-game review
                        </p>
                        {isGameOver ? (
                            <button
                                type="button"
                                onClick={() => void generateReview()}
                                disabled={isGeneratingReview}
                                className="border border-border bg-foreground px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isGeneratingReview ? "Updating" : "Refresh"}
                            </button>
                        ) : null}
                    </div>
                    {!isGameOver ? (
                        <p className="mt-4 border-l border-border pl-3 font-sans text-[14px] text-muted-foreground">
                            Review unlocks after game end.
                        </p>
                    ) : (
                        <>
                            <p className="mt-4 border-b border-border pb-4 font-sans text-[14px] font-semibold leading-relaxed tracking-[-0.02em] text-foreground">
                                {isGeneratingReview ? "Sensei is preparing your recap..." : reviewSummary || "Generating review..."}
                            </p>
                            <div className="mt-4 grid gap-2">
                                {recentReviewMoves.map((line, index) => (
                                    <p
                                        key={`${line}-${index}`}
                                        className="border-l border-foreground bg-subtle/45 px-3 py-2 font-mono text-[11px] leading-relaxed text-foreground/80"
                                    >
                                        {line}
                                    </p>
                                ))}
                            </div>
                        </>
                    )}
                </section>
            ) : null}

            <section className="relative min-h-[250px] flex-1 overflow-hidden border border-border bg-background">
                <ScrollArea className="absolute inset-0 h-full w-full">
                    <div className="p-5">
                        {visibleMessages.map((message) => (
                            <div key={message.id} className="mb-6 grid grid-cols-[36px_1fr] gap-4">
                                <ToneIcon tone={message.tone} />
                                <div className="min-w-0 border-b border-border pb-5">
                                    <p className="font-sans text-[14px] font-semibold tracking-[-0.03em] text-foreground">
                                        Sensei
                                        <span className="ml-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                            {message.tone === "coach" ? "Coach" : message.tone}
                                        </span>
                                    </p>
                                    <p className="mt-2 font-sans text-[13px] leading-relaxed text-foreground/80">
                                        {message.text}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {isStreaming ? (
                            <div className="mb-6 grid grid-cols-[36px_1fr] gap-4">
                                <ToneIcon tone="coach" />
                                <div className="min-w-0 border-b border-border pb-5">
                                    <p className="font-sans text-[14px] font-semibold tracking-[-0.03em] text-foreground">
                                        Sensei
                                        <span className="ml-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                            Thinking
                                        </span>
                                    </p>
                                    <p className="mt-2 font-sans text-[13px] leading-relaxed text-foreground/80">
                                        {streamingReply || "..."}
                                    </p>
                                </div>
                            </div>
                        ) : null}

                        {!visibleMessages.length && !isStreaming ? (
                            <p className="border border-dashed border-border px-3 py-2 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                Awaiting next move
                            </p>
                        ) : null}
                    </div>
                </ScrollArea>
            </section>

            <div className="flex shrink-0 flex-col gap-3 pb-1">
                {tutorMode === "active" ? (
                    <div className="flex flex-col gap-3">
                        <section className="border border-border bg-background p-4">
                            <div className="flex items-center justify-between gap-3">
                                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                    AI key
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setShowKeyEditor((current) => !current)}
                                    className="inline-flex items-center gap-2 border border-border bg-background px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground transition-colors hover:bg-subtle"
                                >
                                    <LuKeyRound className="size-3.5" />
                                    {hasApiKey ? "Configured" : "Set key"}
                                </button>
                            </div>
                            {showKeyEditor ? (
                                <div className="mt-3 space-y-3">
                                    <input
                                        value={openAIApiKey}
                                        onChange={(event) => setOpenAIApiKey(event.target.value)}
                                        placeholder="sk-..."
                                        type="password"
                                        className="h-10 w-full border border-border bg-background px-3 font-mono text-[12px] font-semibold text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
                                    />
                                    <div className="flex items-center justify-end gap-px bg-border p-px">
                                        <button
                                            type="button"
                                            onClick={clearApiKey}
                                            className="inline-flex h-8 items-center bg-background px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground transition-colors hover:bg-subtle"
                                        >
                                            Clear
                                        </button>
                                        <button
                                            type="button"
                                            onClick={saveApiKey}
                                            className="inline-flex h-8 items-center bg-foreground px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                                        >
                                            Save key
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="mt-3 font-sans text-[12px] leading-relaxed text-muted-foreground">
                                    {hasApiKey
                                        ? "Using your key through the Komi server for live tutor responses."
                                        : "No key set. Sensei uses local fallback responses."}
                                </p>
                            )}
                        </section>

                        <form
                            className="relative flex w-full items-center"
                            onSubmit={(event) => {
                                event.preventDefault();
                                void handleAskSensei();
                            }}
                        >
                            <input
                                value={question}
                                onChange={(event) => setQuestion(event.target.value)}
                                placeholder="Ask Sensei about this position..."
                                className="h-12 flex-1 border border-border bg-background pl-4 pr-14 font-sans text-[14px] font-semibold text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
                            />
                            {isStreaming ? (
                                <button
                                    type="button"
                                    onClick={cancelAskSensei}
                                    className="absolute right-2 top-2 inline-flex size-8 items-center justify-center border border-border bg-accent text-accent-foreground transition-colors hover:bg-foreground hover:text-primary-foreground"
                                    aria-label="Stop Sensei response"
                                >
                                    <LuX className="size-3.5" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={!canAsk}
                                    className="absolute right-2 top-2 inline-flex size-8 items-center justify-center border border-border bg-foreground text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                    aria-label="Ask Sensei"
                                >
                                    <LuSend className="size-3.5" />
                                </button>
                            )}
                        </form>
                    </div>
                ) : null}

                {tutorMode === "passive" ? (
                    <p className="border border-border bg-background px-4 py-3 font-sans text-[13px] leading-relaxed text-muted-foreground">
                        Passive mode keeps hints lightweight while you focus on play.
                    </p>
                ) : null}

                {tutorMode !== "review" ? (
                    <div className="flex flex-wrap gap-2">
                        {QUICK_TIPS.map((topic) => (
                            <button
                                key={topic}
                                type="button"
                                onClick={() => requestTip(topic)}
                                className="inline-flex min-h-9 items-center border border-border bg-background px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground transition-colors hover:bg-subtle"
                            >
                                {topic}
                            </button>
                        ))}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
