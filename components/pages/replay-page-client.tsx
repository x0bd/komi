"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    LuArrowLeft,
    LuBrain,
    LuFileUp,
    LuGamepad2,
    LuLoaderCircle,
    LuSettings,
    LuSparkles,
} from "react-icons/lu";
import type { EngineAnalysis, EngineCandidate } from "@/lib/ai/engine-provider";
import type { GameState, Move } from "@/lib/engine/types";
import { createInitialState } from "@/lib/engine/game";
import { applyMove, applyPass } from "@/lib/engine/rules";
import { boardToString } from "@/lib/engine/board";
import { calculateScore, type ScoreResult } from "@/lib/engine/scoring";
import { gameToSGF, sgfToGame } from "@/lib/engine/sgf";
import { GoBoard } from "@/components/game/go-board";
import {
    MoveHistorySection,
    type MoveEntry,
} from "@/components/game/move-history-section";
import { PostGameReviewCard } from "@/components/game/post-game-review-card";
import { ReplayControls } from "@/components/game/replay-controls";
import { GameLayout, type DockPanel } from "@/components/layout/game-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const LETTERS = "ABCDEFGHJKLMNOPQRST".split("");

type ReplayReason = "score" | "resignation" | "timeout" | null;
type ReplayWinner = "black" | "white" | "draw" | null;

type ReplayFrame = {
    moveNumber: number;
    state: GameState;
    lastMove: Move | null;
};

type ReplayGame = {
    id: string;
    source: "database" | "sgf";
    size: 9 | 13 | 19;
    komi: number;
    result: string | null;
    startedAt: string;
    endedAt: string | null;
    blackName: string;
    whiteName: string;
    moves: Move[];
    sgf: string | null;
};

type ReplayApiResponse = {
    game: {
        id: string;
        result: string | null;
        sgf: string | null;
        startedAt: string;
        endedAt: string | null;
        size: number;
        blackPlayer: { id: string; name: string | null; email: string };
        whitePlayer: { id: string; name: string | null; email: string };
        moves: Array<{
            moveNumber: number;
            player: "black" | "white";
            x: number | null;
            y: number | null;
            isPass: boolean;
        }>;
    };
};

function toCoordinate(move: Move, size: number) {
    if (move.isPass) return "Pass";
    const column = LETTERS[move.x] ?? "?";
    const row = size - move.y;
    return `${column}${row}`;
}

function parseResult(result: string | null): {
    winner: ReplayWinner;
    reason: ReplayReason;
} {
    if (!result) {
        return { winner: null, reason: null };
    }

    const value = result.toLowerCase().trim();

    const winner: ReplayWinner = value.includes("draw")
        ? "draw"
        : value.startsWith("b+") || value.includes("black")
          ? "black"
          : value.startsWith("w+") || value.includes("white")
            ? "white"
            : null;

    const reason: ReplayReason = value.includes("resign")
        ? "resignation"
        : value.includes("time")
          ? "timeout"
          : winner
            ? "score"
            : null;

    return { winner, reason };
}

function buildReplayFrames(moves: Move[], size: 9 | 13 | 19): ReplayFrame[] {
    let state = createInitialState(size);
    const frames: ReplayFrame[] = [
        {
            moveNumber: 0,
            state,
            lastMove: null,
        },
    ];

    moves.forEach((move, index) => {
        if (move.isPass) {
            state = applyPass(state);
            frames.push({
                moveNumber: index + 1,
                state,
                lastMove: move,
            });
            return;
        }

        const nextState = applyMove(state, size, move.x, move.y, move.player);
        if (!nextState) {
            return;
        }

        state = nextState;
        frames.push({
            moveNumber: index + 1,
            state,
            lastMove: move,
        });
    });

    return frames;
}

function buildKeyMoments(moves: Move[], size: 9 | 13 | 19) {
    let state = createInitialState(size);

    const weighted = moves
        .map((move, index) => {
            const moveNumber = index + 1;
            const coordinate = toCoordinate(move, size);

            if (move.isPass) {
                state = applyPass(state);
                return {
                    moveNumber,
                    player: move.player,
                    label: "Pass timing",
                    detail: `${move.player === "black" ? "Black" : "White"} passed on ${coordinate}`,
                    weight: 2,
                };
            }

            const nextState = applyMove(
                state,
                size,
                move.x,
                move.y,
                move.player,
            );
            if (!nextState) return null;
            const captures =
                nextState.captured[move.player] - state.captured[move.player];
            state = nextState;

            if (captures >= 1) {
                return {
                    moveNumber,
                    player: move.player,
                    label: captures >= 3 ? "Major capture" : "Capture",
                    detail: `${move.player === "black" ? "Black" : "White"} captured ${captures} on ${coordinate}`,
                    weight: captures >= 3 ? 6 : captures + 2,
                };
            }

            if (moveNumber === 1) {
                return {
                    moveNumber,
                    player: move.player,
                    label: "Opening move",
                    detail: `${move.player === "black" ? "Black" : "White"} opened at ${coordinate}`,
                    weight: 1,
                };
            }

            return null;
        })
        .filter(
            (moment): moment is NonNullable<typeof moment> => moment !== null,
        );

    return weighted
        .sort((a, b) => b.weight - a.weight || a.moveNumber - b.moveNumber)
        .slice(0, 4)
        .sort((a, b) => a.moveNumber - b.moveNumber)
        .map(({ weight: _weight, ...moment }) => moment);
}

function candidateReason(candidate: EngineCandidate) {
    if (candidate.captureGain >= 2) return "multi-stone capture";
    if (candidate.captureGain === 1) return "clean capture";
    if (candidate.tags.includes("stable-shape")) return "shape connection";
    if (candidate.tags.includes("atari-risk")) return "liberty pressure";
    if (candidate.liberties <= 2) return "urgent liberties";
    return "territory pressure";
}

function inferQuality(move: Move, analysis: EngineAnalysis | null) {
    if (!analysis || move.isPass) return "ok" as const;
    const index = analysis.topMoves.findIndex(
        (candidate) => candidate.x === move.x && candidate.y === move.y,
    );
    if (index === 0) return "best" as const;
    if (index > 0 && index < 3) return "strong" as const;
    if (index === -1) return "mistake" as const;
    return "ok" as const;
}

function normalizeSize(size: number): 9 | 13 | 19 | null {
    if (size === 9 || size === 13 || size === 19) return size;
    return null;
}

function formatDate(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Unknown date";
    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    }).format(date);
}

export function ReplayPageClient({ gameId }: { gameId: string }) {
    const [dbGame, setDbGame] = useState<ReplayGame | null>(null);
    const [overrideGame, setOverrideGame] = useState<ReplayGame | null>(null);
    const [isLoadingGame, setIsLoadingGame] = useState(true);
    const [gameError, setGameError] = useState<string | null>(null);
    const [currentMove, setCurrentMove] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [analysisByMove, setAnalysisByMove] = useState<
        Record<number, EngineAnalysis>
    >({});
    const [analysisFailedMoves, setAnalysisFailedMoves] = useState<
        Record<number, boolean>
    >({});
    const [tutorNotesByMove, setTutorNotesByMove] = useState<
        Record<number, string>
    >({});
    const [analysisLoadingMove, setAnalysisLoadingMove] = useState<
        number | null
    >(null);
    const [tutorLoadingMove, setTutorLoadingMove] = useState<number | null>(
        null,
    );
    const [sgfText, setSgfText] = useState("");
    const [sgfError, setSgfError] = useState<string | null>(null);

    const activeGame = overrideGame ?? dbGame;

    useEffect(() => {
        const controller = new AbortController();

        async function loadGame() {
            setIsLoadingGame(true);
            setGameError(null);

            try {
                const response = await fetch(`/api/games/${gameId}`, {
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error("Unable to load replay game");
                }

                const payload = (await response.json()) as ReplayApiResponse;
                const game = payload.game;
                const size = normalizeSize(game.size) ?? 19;

                let komi = 6.5;
                if (game.sgf) {
                    try {
                        komi = sgfToGame(game.sgf).metadata.komi;
                    } catch {
                        komi = 6.5;
                    }
                }

                const normalizedMoves: Move[] = game.moves.map((move) => ({
                    x: move.isPass ? -1 : (move.x ?? -1),
                    y: move.isPass ? -1 : (move.y ?? -1),
                    player: move.player,
                    isPass: move.isPass,
                }));

                setDbGame({
                    id: game.id,
                    source: "database",
                    size,
                    komi,
                    result: game.result,
                    startedAt: game.startedAt,
                    endedAt: game.endedAt,
                    blackName:
                        game.blackPlayer.name?.trim() || game.blackPlayer.email,
                    whiteName:
                        game.whitePlayer.name?.trim() || game.whitePlayer.email,
                    moves: normalizedMoves,
                    sgf: game.sgf,
                });
            } catch (error) {
                if (controller.signal.aborted) return;
                const message =
                    error instanceof Error
                        ? error.message
                        : "Unable to load replay game";
                setGameError(message);
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoadingGame(false);
                }
            }
        }

        void loadGame();

        return () => {
            controller.abort();
        };
    }, [gameId]);

    const replayFrames = useMemo(() => {
        if (!activeGame) return [];
        return buildReplayFrames(activeGame.moves, activeGame.size);
    }, [activeGame]);

    const maxMove =
        replayFrames.length > 0
            ? replayFrames.length - 1
            : (activeGame?.moves.length ?? 0);
    const clampedMove = Math.max(0, Math.min(currentMove, maxMove));
    const currentFrame = replayFrames[clampedMove] ?? null;
    const currentReplayMove =
        activeGame && clampedMove > 0
            ? activeGame.moves[clampedMove - 1]
            : null;

    useEffect(() => {
        if (!activeGame) return;
        setCurrentMove(activeGame.moves.length);
        setIsPlaying(false);
        setAnalysisByMove({});
        setAnalysisFailedMoves({});
        setTutorNotesByMove({});
    }, [activeGame]);

    useEffect(() => {
        if (!isPlaying || maxMove <= 0) return;

        if (clampedMove >= maxMove) {
            setIsPlaying(false);
            return;
        }

        const intervalMs = Math.max(260, Math.round(900 / playbackSpeed));
        const timer = window.setTimeout(() => {
            setCurrentMove((value) => Math.min(maxMove, value + 1));
        }, intervalMs);

        return () => window.clearTimeout(timer);
    }, [clampedMove, isPlaying, maxMove, playbackSpeed]);

    useEffect(() => {
        if (!activeGame || !currentFrame || clampedMove <= 0) return;
        if (analysisByMove[clampedMove] || analysisFailedMoves[clampedMove])
            return;

        const controller = new AbortController();
        setAnalysisLoadingMove(clampedMove);

        async function loadAnalysis() {
            try {
                const response = await fetch("/api/analyze", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    signal: controller.signal,
                    body: JSON.stringify({
                        size: activeGame!.size,
                        player: currentFrame.state.turn,
                        difficulty: "medium",
                        searchBudget: "standard",
                        maxCandidates: 4,
                        state: {
                            board: currentFrame.state.board,
                            turn: currentFrame.state.turn,
                            moveNumber: currentFrame.state.moveNumber,
                            consecutivePasses:
                                currentFrame.state.consecutivePasses,
                            captured: currentFrame.state.captured,
                            ko: currentFrame.state.ko,
                            history:
                                currentFrame.state.history.length > 0
                                    ? currentFrame.state.history
                                    : [boardToString(currentFrame.state.board)],
                        },
                    }),
                });

                if (!response.ok) {
                    throw new Error("Analysis unavailable");
                }

                const payload = (await response.json()) as {
                    analysis?: EngineAnalysis;
                };
                if (!payload.analysis) {
                    throw new Error("Analysis unavailable");
                }

                setAnalysisByMove((current) => ({
                    ...current,
                    [clampedMove]: payload.analysis as EngineAnalysis,
                }));
            } catch {
                if (controller.signal.aborted) return;
                setAnalysisFailedMoves((current) => ({
                    ...current,
                    [clampedMove]: true,
                }));
            } finally {
                if (!controller.signal.aborted) {
                    setAnalysisLoadingMove((current) =>
                        current === clampedMove ? null : current,
                    );
                }
            }
        }

        void loadAnalysis();

        return () => {
            controller.abort();
        };
    }, [
        activeGame,
        analysisByMove,
        analysisFailedMoves,
        clampedMove,
        currentFrame,
    ]);

    useEffect(() => {
        if (!activeGame || !currentReplayMove || clampedMove <= 0) return;
        if (tutorNotesByMove[clampedMove]) return;
        if (!analysisByMove[clampedMove] && !analysisFailedMoves[clampedMove])
            return;

        const analysis = analysisByMove[clampedMove] ?? null;
        const quality = inferQuality(currentReplayMove, analysis);
        const coordinate = toCoordinate(currentReplayMove, activeGame.size);
        const controller = new AbortController();
        setTutorLoadingMove(clampedMove);

        async function loadTutorNote() {
            try {
                const response = await fetch("/api/tutor", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    signal: controller.signal,
                    body: JSON.stringify({
                        moveNumber: clampedMove,
                        lastMove: {
                            coordinate,
                            isPass: currentReplayMove?.isPass ?? false,
                        },
                        analysis: {
                            quality,
                            winRate: analysis
                                ? analysis.estimatedWinRate
                                : currentReplayMove?.player === "black"
                                  ? 0.52
                                  : 0.48,
                            suggestedCoordinate: analysis
                                ? analysis.topMoves[0]
                                    ? toCoordinate(
                                          {
                                              x: analysis.topMoves[0].x,
                                              y: analysis.topMoves[0].y,
                                              player:
                                                  currentReplayMove?.player ??
                                                  "black",
                                              isPass: false,
                                          },
                                          activeGame?.size ?? 19,
                                      )
                                    : null
                                : null,
                            summary: analysis?.summary,
                            topMoves: analysis?.topMoves
                                .slice(0, 3)
                                .map((candidate) => ({
                                    coordinate: toCoordinate(
                                        {
                                            x: candidate.x,
                                            y: candidate.y,
                                            player: currentReplayMove?.player ?? "black",
                                            isPass: false,
                                        },
                                        activeGame?.size ?? 19,
                                    ),
                                    reason: candidateReason(candidate),
                                })),
                        },
                    }),
                });

                if (!response.ok) {
                    throw new Error("Tutor unavailable");
                }

                const payload = (await response.json()) as {
                    message?: unknown;
                };
                const message =
                    typeof payload.message === "string" &&
                    payload.message.trim().length > 0
                        ? payload.message.trim()
                        : "Sensei note unavailable for this move.";

                setTutorNotesByMove((current) => ({
                    ...current,
                    [clampedMove]: message,
                }));
            } catch {
                if (controller.signal.aborted) return;
                setTutorNotesByMove((current) => ({
                    ...current,
                    [clampedMove]: "Sensei note unavailable for this move.",
                }));
            } finally {
                if (!controller.signal.aborted) {
                    setTutorLoadingMove((current) =>
                        current === clampedMove ? null : current,
                    );
                }
            }
        }

        void loadTutorNote();

        return () => {
            controller.abort();
        };
    }, [
        activeGame,
        analysisByMove,
        analysisFailedMoves,
        clampedMove,
        currentReplayMove,
        tutorNotesByMove,
    ]);

    const moveEntries = useMemo<MoveEntry[]>(() => {
        if (!activeGame) return [];
        return activeGame.moves.map((move, index) => ({
            moveNumber: index + 1,
            player: move.player,
            isPass: move.isPass,
            coordinate: toCoordinate(move, activeGame.size),
        }));
    }, [activeGame]);

    const currentAnalysis =
        clampedMove > 0 ? analysisByMove[clampedMove] : undefined;
    const keyMoments = useMemo(
        () =>
            activeGame
                ? buildKeyMoments(activeGame.moves, activeGame.size)
                : [],
        [activeGame],
    );
    const tutorNotesForCard = useMemo(
        () =>
            Object.entries(tutorNotesByMove)
                .map(([moveNumber, note]) => ({
                    moveNumber: Number.parseInt(moveNumber, 10),
                    note,
                }))
                .sort((a, b) => a.moveNumber - b.moveNumber)
                .slice(-6),
        [tutorNotesByMove],
    );

    const finalScore = useMemo<ScoreResult | null>(() => {
        if (!activeGame || replayFrames.length === 0) return null;
        const finalFrame = replayFrames[replayFrames.length - 1];
        return calculateScore(
            finalFrame.state.board,
            activeGame.size,
            finalFrame.state.captured,
            activeGame.komi,
        );
    }, [activeGame, replayFrames]);

    const parsedResult = useMemo(
        () => parseResult(activeGame?.result ?? null),
        [activeGame?.result],
    );
    const winner = parsedResult.winner ?? finalScore?.winner ?? null;
    const reason = parsedResult.reason ?? (winner ? "score" : null);

    const exportSgf = () => {
        if (!activeGame) return;
        const sgf =
            activeGame.sgf ??
            gameToSGF(activeGame.moves, {
                size: activeGame.size,
                komi: activeGame.komi,
                result: activeGame.result ?? undefined,
                blackName: activeGame.blackName,
                whiteName: activeGame.whiteName,
            });

        const blob = new Blob([sgf], { type: "application/x-go-sgf" });
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = `komi-replay-${activeGame.id}.sgf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);
    };

    const loadSgfFromText = () => {
        const trimmed = sgfText.trim();
        if (!trimmed) {
            setSgfError("Paste an SGF first.");
            return;
        }

        try {
            const parsed = sgfToGame(trimmed);
            const size = normalizeSize(parsed.metadata.size);
            if (!size) {
                setSgfError(
                    "Only 9x9, 13x13, or 19x19 SGF files are supported right now.",
                );
                return;
            }

            setOverrideGame({
                id: `sgf-${Date.now()}`,
                source: "sgf",
                size,
                komi: parsed.metadata.komi,
                result: parsed.metadata.result ?? null,
                startedAt: new Date().toISOString(),
                endedAt: new Date().toISOString(),
                blackName: parsed.metadata.blackName ?? "Black",
                whiteName: parsed.metadata.whiteName ?? "White",
                moves: parsed.moves,
                sgf: trimmed,
            });
            setSgfError(null);
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Invalid SGF";
            setSgfError(message);
        }
    };

    if (isLoadingGame) {
        return (
            <main className="flex min-h-svh items-center justify-center bg-background">
                <div className="flex items-center gap-2 rounded-none border-2 border-border bg-card shadow-[4px_4px_0_0_var(--foreground)] px-4 py-2 font-mono text-sm font-bold text-foreground">
                    <LuLoaderCircle className="size-4 animate-spin" />
                    Loading replay...
                </div>
            </main>
        );
    }

    if (gameError || !activeGame || !currentFrame) {
        return (
            <main className="flex min-h-svh items-center justify-center bg-background px-6">
                <Card className="w-full max-w-lg">
                    <CardHeader>
                        <CardTitle>Replay unavailable</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                            {gameError ??
                                "Unable to render this replay right now."}
                        </p>
                        <Button
                            variant="secondary"
                            render={<Link href="/games" />}
                        >
                            <LuArrowLeft className="size-4" />
                            Back to History
                        </Button>
                    </CardContent>
                </Card>
            </main>
        );
    }

    const topCandidates = currentAnalysis?.topMoves.slice(0, 3) ?? [];
    const currentTutorNote =
        clampedMove > 0 ? tutorNotesByMove[clampedMove] : null;

    const panels: DockPanel[] = [
        {
            id: "review",
            label: "Replay Review",
            icon: <LuGamepad2 />,
            content: (
                <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-base">
                                <span className="font-display">
                                    Replay Review
                                </span>
                                <Badge
                                    variant="secondary"
                                    className="capitalize"
                                >
                                    {activeGame.source}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-xs text-muted-foreground">
                            <p>
                                {activeGame.blackName} vs {activeGame.whiteName}
                            </p>
                            <p>
                                {formatDate(activeGame.startedAt)} •{" "}
                                {activeGame.moves.length} moves
                            </p>
                            <div className="flex flex-wrap gap-2 pt-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    render={<Link href="/games" />}
                                >
                                    <LuArrowLeft className="size-4" />
                                    History
                                </Button>
                                {overrideGame ? (
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => setOverrideGame(null)}
                                    >
                                        Use database game
                                    </Button>
                                ) : null}
                            </div>
                        </CardContent>
                    </Card>

                    <ReplayControls
                        maxMove={maxMove}
                        currentMove={clampedMove}
                        isPlaying={isPlaying}
                        playbackSpeed={playbackSpeed}
                        onTogglePlay={() => setIsPlaying((value) => !value)}
                        onSeek={(moveNumber) => {
                            setCurrentMove(moveNumber);
                            setIsPlaying(false);
                        }}
                        onStepBack={() => {
                            setCurrentMove((value) => Math.max(0, value - 1));
                            setIsPlaying(false);
                        }}
                        onStepForward={() => {
                            setCurrentMove((value) =>
                                Math.min(maxMove, value + 1),
                            );
                            setIsPlaying(false);
                        }}
                        onSkipStart={() => {
                            setCurrentMove(0);
                            setIsPlaying(false);
                        }}
                        onSkipEnd={() => {
                            setCurrentMove(maxMove);
                            setIsPlaying(false);
                        }}
                        onSpeedChange={setPlaybackSpeed}
                    />

                    <MoveHistorySection
                        moves={moveEntries}
                        moveCount={moveEntries.length}
                        highlightedMoveNumber={
                            clampedMove > 0 ? clampedMove : undefined
                        }
                        onMoveSelect={(moveNumber) => {
                            setCurrentMove(moveNumber);
                            setIsPlaying(false);
                        }}
                        className="lg:h-[230px] lg:flex-none"
                    />
                </div>
            )
        },
        {
            id: "analysis",
            label: "Analysis & Tutor",
            icon: <LuBrain />,
            content: (
                <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Card className="lg:flex-none">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <LuBrain className="size-4 text-muted-foreground" />
                                Position Analysis
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            {clampedMove === 0 ? (
                                <p className="text-muted-foreground">
                                    Move the timeline to start analysis.
                                </p>
                            ) : analysisLoadingMove === clampedMove ? (
                                <p className="inline-flex items-center gap-2 text-muted-foreground">
                                    <LuLoaderCircle className="size-4 animate-spin" />
                                    Analyzing this position...
                                </p>
                            ) : currentAnalysis ? (
                                <>
                                    <p className="text-muted-foreground">
                                        {currentAnalysis.summary}
                                    </p>
                                    <div className="rounded-xl border border-border/70 bg-secondary/20 p-3">
                                        <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                                            Best move
                                        </p>
                                        <p className="mt-1 font-mono text-sm font-semibold">
                                            {currentAnalysis.recommendedMove
                                                .isPass
                                                ? "Pass"
                                                : toCoordinate(
                                                      {
                                                          x: currentAnalysis
                                                              .recommendedMove
                                                              .x,
                                                          y: currentAnalysis
                                                              .recommendedMove
                                                              .y,
                                                          player: currentFrame
                                                              .state.turn,
                                                          isPass: false,
                                                      },
                                                      activeGame.size,
                                                  )}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        {topCandidates.map(
                                            (candidate, index) => (
                                                <div
                                                    key={`analysis-${candidate.x}-${candidate.y}-${index}`}
                                                    className="rounded-xl border border-border/70 px-3 py-2"
                                                >
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="font-mono">
                                                            {toCoordinate(
                                                                {
                                                                    x: candidate.x,
                                                                    y: candidate.y,
                                                                    player: currentFrame
                                                                        .state
                                                                        .turn,
                                                                    isPass: false,
                                                                },
                                                                activeGame.size,
                                                            )}
                                                        </span>
                                                        <span className="text-muted-foreground">
                                                            {Math.round(
                                                                candidate.confidence *
                                                                    100,
                                                            )}
                                                            %
                                                        </span>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </>
                            ) : (
                                <p className="text-muted-foreground">
                                    Analysis is unavailable for this move.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="lg:flex-none">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <LuSparkles className="size-4 text-muted-foreground" />
                                Tutor Commentary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            {clampedMove === 0 ? (
                                <p className="text-muted-foreground">
                                    Pick a move to see tutor commentary.
                                </p>
                            ) : tutorLoadingMove === clampedMove ? (
                                <p className="inline-flex items-center gap-2 text-muted-foreground">
                                    <LuLoaderCircle className="size-4 animate-spin" />
                                    Sensei is writing a note...
                                </p>
                            ) : currentTutorNote ? (
                                <p className="rounded-xl border border-border/70 bg-secondary/20 px-3 py-2">
                                    {currentTutorNote}
                                </p>
                            ) : (
                                <p className="text-muted-foreground">
                                    No tutor note for this move yet.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <PostGameReviewCard
                        scoreResult={finalScore}
                        winner={winner}
                        reason={reason}
                        keyMoments={keyMoments}
                        tutorNotes={tutorNotesForCard}
                        onExportSgf={exportSgf}
                    />
                </div>
            )
        },
        {
            id: "settings",
            label: "Load SGF",
            icon: <LuFileUp />,
            content: (
                <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Card className="lg:flex-none">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <LuFileUp className="size-4 text-muted-foreground" />
                                Load SGF
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Textarea
                                value={sgfText}
                                onChange={(event) =>
                                    setSgfText(event.target.value)
                                }
                                placeholder="Paste SGF here to replay another game"
                                className="min-h-24"
                            />
                            {sgfError ? (
                                <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                                    {sgfError}
                                </p>
                            ) : null}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={loadSgfFromText}
                            >
                                Load SGF replay
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )
        }
    ];

    return (
        <GameLayout
            board={
                <GoBoard
                    board={currentFrame.state.board}
                    size={activeGame.size}
                    currentPlayer={currentFrame.state.turn}
                    validMoves={[]}
                    lastMove={
                        currentFrame.lastMove && !currentFrame.lastMove.isPass
                            ? {
                                  x: currentFrame.lastMove.x,
                                  y: currentFrame.lastMove.y,
                              }
                            : undefined
                    }
                    onIntersectionClick={() => {}}
                />
            }
            panels={panels}
        />
    );
}
