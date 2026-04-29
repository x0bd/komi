"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
    RoomProvider,
    useMutation,
    useOthersConnectionIds,
    useOthers,
    useSelf,
    useStatus,
    useUpdateMyPresence,
} from "@liveblocks/react";
import { GameLayout, type DockPanel } from "@/components/layout/game-layout";
import { LuGamepad2, LuBrain, LuSettings } from "react-icons/lu";
import { GoBoard } from "@/components/game/go-board";
import { ModeToggle } from "@/components/game/mode-toggle";
import { AIDifficultySelector } from "@/components/game/ai-difficulty-selector";
import { PlayerCard } from "@/components/game/player-card";
import { OnlineRoomPanel } from "@/components/game/online-room-panel";
import { LiveScoreCard } from "@/components/game/live-score-card";
import {
    MoveHistorySection,
    type MoveEntry,
} from "@/components/game/move-history-section";
import { GameControls } from "@/components/game/game-controls";
import { PostGameReviewCard } from "@/components/game/post-game-review-card";
import { ReplayControls } from "@/components/game/replay-controls";
import { GameOverDialog } from "@/components/game/game-over-dialog";
import {
    useGameStore,
    type GameMode,
    type MultiplayerSnapshot,
} from "@/lib/stores/game-store";
import { splitClock, useGameClock } from "@/hooks/use-timer";
import { useAITurn } from "@/hooks/use-ai-turn";
import { AIReaction } from "@/components/learning/ai-reaction";
import { AIChatPanel } from "@/components/learning/ai-chat-panel";
import { XPBar } from "@/components/learning/xp-bar";
import { MobileSenseiFab } from "@/components/learning/mobile-sensei-fab";
import type { ScoreResult } from "@/lib/engine/scoring";
import { calculateScore } from "@/lib/engine/scoring";
import type { GameState, Move } from "@/lib/engine/types";
import { applyMove, applyPass } from "@/lib/engine/rules";
import {
    createInitialState,
    isGameOver as getIsGameOver,
} from "@/lib/engine/game";
import { useMultiplayerStore } from "@/lib/stores/multiplayer-store";
import { useLearningStore } from "@/lib/stores/learning-store";
import { LuBot, LuSparkles } from "react-icons/lu";
import { OnlineRoomSync } from "@/components/game/online-room-sync";
import type { StoneColor } from "@/components/game/stone";
import { cn } from "@/lib/utils";

const LETTERS = "ABCDEFGHJKLMNOPQRST".split("");

function getAssignedOnlineColor(
    selfConnectionId: number | null,
    otherConnectionIds: number[],
): StoneColor | null {
    if (selfConnectionId === null) {
        return null;
    }

    const ids = [selfConnectionId, ...otherConnectionIds]
        .sort((a, b) => a - b)
        .slice(0, 2);

    if (ids.length < 2) {
        return null;
    }

    return ids[0] === selfConnectionId ? "black" : "white";
}

function formatResultCode(
    reason: "score" | "resignation" | "timeout" | null,
    winner: "black" | "white" | "draw" | null,
    scoreResult: ScoreResult | null,
) {
    if (!winner) return null;
    if (winner === "draw") return "Draw";

    const winnerCode = winner === "black" ? "B" : "W";
    if (reason === "resignation") return `${winnerCode}+Resign`;
    if (reason === "timeout") return `${winnerCode}+Time`;

    if (reason === "score" && scoreResult) {
        const margin = Number.isFinite(scoreResult.margin)
            ? Number(scoreResult.margin.toFixed(1))
            : scoreResult.margin;
        return `${winnerCode}+${margin}`;
    }

    return winnerCode;
}

function parseMoveCoordinate(coordinate: string, size: number) {
    const match = /^([A-HJ-T])(\d{1,2})$/i.exec(coordinate.trim());
    if (!match) return null;

    const x = LETTERS.indexOf(match[1].toUpperCase());
    const row = Number.parseInt(match[2], 10);
    if (x < 0 || x >= size || row < 1 || row > size) {
        return null;
    }

    return { x, y: size - row };
}

function buildAnalysisHints({
    enabled,
    topMoves,
    size,
    board,
}: {
    enabled: boolean;
    topMoves:
        | Array<{
              coordinate: string;
              confidence: number;
          }>
        | null
        | undefined;
    size: number;
    board: number[];
}) {
    if (!enabled || !topMoves || topMoves.length === 0) {
        return [] as Array<{
            x: number;
            y: number;
            confidence: number;
            rank: number;
        }>;
    }

    return topMoves
        .slice(0, 3)
        .map((move, index) => {
            const parsed = parseMoveCoordinate(move.coordinate, size);
            if (!parsed) return null;

            const boardIndex = parsed.y * size + parsed.x;
            if (board[boardIndex] !== 0) return null;

            return {
                x: parsed.x,
                y: parsed.y,
                confidence: move.confidence,
                rank: index + 1,
            };
        })
        .filter(
            (
                move,
            ): move is {
                x: number;
                y: number;
                confidence: number;
                rank: number;
            } => move !== null,
        );
}

type ReplayFrame = {
    board: number[];
    turn: GameState["turn"];
    captured: {
        black: number;
        white: number;
    };
    lastMove: Move | null;
};

type KeyMoment = {
    moveNumber: number;
    player: "black" | "white";
    label: string;
    detail: string;
};

function toCoordinate(move: Move, size: 9 | 13 | 19) {
    if (move.isPass) return "Pass";
    const column = LETTERS[move.x] ?? "?";
    const row = size - move.y;
    return `${column}${row}`;
}

function buildKeyMoments(moves: Move[], size: 9 | 13 | 19): KeyMoment[] {
    let state = createInitialState(size);
    const weightedMoments: Array<KeyMoment & { weight: number }> = [];

    for (let index = 0; index < moves.length; index += 1) {
        const move = moves[index];
        const moveNumber = index + 1;
        const coordinate = toCoordinate(move, size);

        if (move.isPass) {
            state = applyPass(state);
            if (index >= Math.max(0, moves.length - 2)) {
                weightedMoments.push({
                    moveNumber,
                    player: move.player,
                    label: "Endgame pass",
                    detail: `${move.player === "black" ? "Black" : "White"} passed on ${coordinate}`,
                    weight: 2,
                });
            }
            continue;
        }

        const nextState = applyMove(state, size, move.x, move.y, move.player);
        if (!nextState) continue;

        const captureGain =
            nextState.captured[move.player] - state.captured[move.player];
        if (captureGain >= 1) {
            weightedMoments.push({
                moveNumber,
                player: move.player,
                label: captureGain >= 3 ? "Major capture" : "Capture",
                detail: `${move.player === "black" ? "Black" : "White"} captured ${captureGain} on ${coordinate}`,
                weight: captureGain >= 3 ? 6 : 3 + captureGain,
            });
        }

        if (moveNumber === 1) {
            weightedMoments.push({
                moveNumber,
                player: move.player,
                label: "Opening move",
                detail: `${move.player === "black" ? "Black" : "White"} opened at ${coordinate}`,
                weight: 1,
            });
        }

        state = nextState;
    }

    if (weightedMoments.length === 0 && moves.length > 0) {
        const last = moves[moves.length - 1];
        weightedMoments.push({
            moveNumber: moves.length,
            player: last.player,
            label: "Closing move",
            detail: `${last.player === "black" ? "Black" : "White"} played ${toCoordinate(last, size)}`,
            weight: 1,
        });
    }

    return weightedMoments
        .sort((a, b) => b.weight - a.weight || a.moveNumber - b.moveNumber)
        .slice(0, 4)
        .sort((a, b) => a.moveNumber - b.moveNumber)
        .map(({ weight: _weight, ...moment }) => moment);
}

function buildReplayFrame(
    moves: Move[],
    size: 9 | 13 | 19,
    moveNumber: number,
): ReplayFrame {
    const targetMove = Math.max(0, Math.min(moveNumber, moves.length));
    let state = createInitialState(size);
    let lastMove: Move | null = null;

    for (let index = 0; index < targetMove; index += 1) {
        const move = moves[index];
        if (move.isPass) {
            state = applyPass(state);
            lastMove = move;
            continue;
        }

        const nextState = applyMove(state, size, move.x, move.y, move.player);
        if (!nextState) {
            break;
        }

        state = nextState;
        lastMove = move;
    }

    return {
        board: [...state.board],
        turn: state.turn,
        captured: {
            black: state.captured.black,
            white: state.captured.white,
        },
        lastMove,
    };
}

function readSnapshotFromMutableStorage(storage: {
    get: (key: keyof Liveblocks["Storage"]) => unknown;
}): MultiplayerSnapshot {
    const rawSize = storage.get("size");
    const rawKomi = storage.get("komi");
    const board = storage.get("board") as number[];
    const turn = storage.get("turn") as MultiplayerSnapshot["turn"];
    const moveNumber = storage.get("moveNumber") as number;
    const consecutivePasses = storage.get("consecutivePasses") as number;
    const captured = storage.get("captured") as MultiplayerSnapshot["captured"];
    const ko = storage.get("ko") as number | null;
    const history = storage.get("history") as string[];
    const moveHistory = storage.get("moveHistory") as Move[];
    const timers = storage.get("timers") as MultiplayerSnapshot["timers"];
    const isGameOver = storage.get("isGameOver") as boolean;
    const winner = storage.get("winner") as MultiplayerSnapshot["winner"];
    const gameOverReason = storage.get(
        "gameOverReason",
    ) as MultiplayerSnapshot["gameOverReason"];

    return {
        size: rawSize === 9 || rawSize === 13 || rawSize === 19 ? rawSize : 19,
        komi: typeof rawKomi === "number" && Number.isFinite(rawKomi) ? rawKomi : 6.5,
        board: [...board],
        turn,
        moveNumber,
        consecutivePasses,
        captured: {
            black: captured.black,
            white: captured.white,
        },
        ko,
        history: [...history],
        moveHistory: moveHistory.map((move) => ({ ...move })),
        timers: {
            black: timers.black,
            white: timers.white,
        },
        isGameOver,
        winner,
        gameOverReason,
    };
}

type MutableLiveblocksStorage = {
    set<TKey extends keyof Liveblocks["Storage"]>(
        key: TKey,
        value: Liveblocks["Storage"][TKey],
    ): void;
};

function writeSnapshotToMutableStorage(
    storage: MutableLiveblocksStorage,
    snapshot: MultiplayerSnapshot,
) {
    storage.set("size", snapshot.size);
    storage.set("komi", snapshot.komi);
    storage.set("board", [...snapshot.board]);
    storage.set("turn", snapshot.turn);
    storage.set("moveNumber", snapshot.moveNumber);
    storage.set("consecutivePasses", snapshot.consecutivePasses);
    storage.set("captured", {
        black: snapshot.captured.black,
        white: snapshot.captured.white,
    });
    storage.set("ko", snapshot.ko);
    storage.set("history", [...snapshot.history]);
    storage.set(
        "moveHistory",
        snapshot.moveHistory.map((move) => ({ ...move })),
    );
    storage.set("timers", {
        black: snapshot.timers.black,
        white: snapshot.timers.white,
    });
    storage.set("isGameOver", snapshot.isGameOver);
    storage.set("winner", snapshot.winner);
    storage.set("gameOverReason", snapshot.gameOverReason);
}

export default function HomePageClient() {
    const searchParams = useSearchParams();
    const roomParam = searchParams.get("room");
    const isGameOver = useGameStore((state) => state.isGameOver);
    const scoreResult = useGameStore((state) => state.scoreResult);
    const gameOverReason = useGameStore((state) => state.gameOverReason);
    const scoreReviewConfirmed = useGameStore(
        (state) => state.scoreReviewConfirmed,
    );
    const winner = useGameStore((state) => state.winner);
    const mode = useGameStore((state) => state.mode);
    const setMode = useGameStore((state) => state.setMode);
    const gameState = useGameStore((state) => state.gameState);
    const size = useGameStore((state) => state.size);
    const timers = useGameStore((state) => state.timers);
    const moveHistory = useGameStore((state) => state.moveHistory);
    const deadStones = useGameStore((state) => state.deadStones);
    const exportSGF = useGameStore((state) => state.exportSGF);
    const resetGame = useGameStore((state) => state.resetGame);
    const komi = useGameStore((state) => state.komi);
    const roomId = useMultiplayerStore((state) => state.roomId);
    const onlineRole = useMultiplayerStore((state) => state.role);
    const createRoom = useMultiplayerStore((state) => state.createRoom);
    const joinRoom = useMultiplayerStore((state) => state.joinRoom);
    const leaveRoom = useMultiplayerStore((state) => state.leaveRoom);
    const persistedGameKeyRef = useRef<string | null>(null);
    const [saveState, setSaveState] = useState<
        "idle" | "saving" | "saved" | "skipped" | "failed"
    >("idle");
    const [replayMoveNumber, setReplayMoveNumber] = useState<number | null>(
        null,
    );
    const [replayIsPlaying, setReplayIsPlaying] = useState(false);
    const [replayPlaybackSpeed, setReplayPlaybackSpeed] = useState(1);
    const [gameOverDialogDismissed, setGameOverDialogDismissed] =
        useState(false);

    // Attach AI turn listener
    useAITurn();
    useGameClock(mode !== "online");

    const maxReplayMove = moveHistory.length;
    const replayCurrentMove = replayMoveNumber ?? maxReplayMove;
    const replayEnabled =
        isGameOver &&
        replayMoveNumber !== null &&
        replayCurrentMove < maxReplayMove;
    const replayFrame = useMemo(
        () =>
            replayEnabled
                ? buildReplayFrame(moveHistory, size, replayCurrentMove)
                : null,
        [moveHistory, replayCurrentMove, replayEnabled, size],
    );

    const result =
        !scoreResult || scoreResult.winner === "draw"
            ? "draw"
            : scoreResult?.winner === "black"
              ? "black-wins"
              : "white-wins";

    useEffect(() => {
        if (roomParam && mode !== "online") {
            setMode("online");
        }
    }, [mode, roomParam, setMode]);

    useEffect(() => {
        if (mode !== "online") {
            if (roomId) {
                leaveRoom();
            }
            return;
        }

        if (roomId) return;

        if (roomParam) {
            void joinRoom(roomParam);
            return;
        }

        void createRoom();
    }, [createRoom, joinRoom, leaveRoom, mode, roomId, roomParam]);

    useEffect(() => {
        if (!isGameOver) {
            persistedGameKeyRef.current = null;
            setSaveState("idle");
            return;
        }
        if (!gameOverReason || !winner) return;
        if (gameOverReason === "score" && !scoreReviewConfirmed) return;
        if (mode === "local") {
            setSaveState("skipped");
            return;
        }
        if (mode === "online" && onlineRole !== "host") {
            setSaveState("skipped");
            return;
        }

        const persistenceKey = `${gameOverReason}:${winner}:${moveHistory.length}:${deadStones.join(",")}`;
        if (persistedGameKeyRef.current === persistenceKey) return;
        persistedGameKeyRef.current = persistenceKey;
        setSaveState("saving");

        const resultCode = formatResultCode(
            gameOverReason,
            winner,
            scoreResult,
        );
        const sgf = exportSGF();

        void fetch("/api/games", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                mode,
                boardSize: size,
                komi,
                resultReason: gameOverReason,
                winner,
                moves: moveHistory,
                result: resultCode,
                sgf,
            }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to save game");
                }
                setSaveState("saved");
            })
            .catch(() => {
                // Allow retry after user starts a new game and ends again.
                persistedGameKeyRef.current = null;
                setSaveState("failed");
            });
    }, [
        exportSGF,
        gameOverReason,
        isGameOver,
        deadStones,
        komi,
        mode,
        moveHistory,
        onlineRole,
        scoreReviewConfirmed,
        scoreResult,
        size,
        winner,
    ]);

    const handleExportSgf = () => {
        const sgf = exportSGF();
        const filenameDate = new Date().toISOString().replace(/[:.]/g, "-");
        const blob = new Blob([sgf], { type: "application/x-go-sgf" });
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = `komi-${filenameDate}.sgf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);
    };

    const handleReplayFromDialog = () => {
        if (maxReplayMove === 0) return;
        setReplayMoveNumber(0);
        setReplayIsPlaying(true);
        setGameOverDialogDismissed(true);
    };

    const handleShareGame = () => {
        const url = window.location.href;
        const title = "Komi game";

        if (navigator.share) {
            void navigator.share({ title, url }).catch(() => undefined);
            return;
        }

        void navigator.clipboard?.writeText(url);
    };

    useEffect(() => {
        if (isGameOver) return;
        setReplayMoveNumber(null);
        setReplayIsPlaying(false);
        setGameOverDialogDismissed(false);
    }, [isGameOver]);

    useEffect(() => {
        if (!replayIsPlaying || !isGameOver) return;

        if (replayMoveNumber === null) {
            setReplayMoveNumber(0);
            return;
        }

        if (replayMoveNumber >= maxReplayMove) {
            setReplayIsPlaying(false);
            return;
        }

        const intervalMs = Math.max(260, Math.round(950 / replayPlaybackSpeed));
        const timeoutId = window.setTimeout(() => {
            setReplayMoveNumber((current) => {
                if (current === null) return 0;
                const nextMove = Math.min(current + 1, maxReplayMove);
                if (nextMove >= maxReplayMove) {
                    setReplayIsPlaying(false);
                }
                return nextMove;
            });
        }, intervalMs);

        return () => window.clearTimeout(timeoutId);
    }, [
        isGameOver,
        maxReplayMove,
        replayIsPlaying,
        replayMoveNumber,
        replayPlaybackSpeed,
    ]);

    const { panels: sidebarPanels, rightPanel } = useSidebarPanels({
        replayState: {
            enabled: replayEnabled,
            isPlaying: replayIsPlaying,
            maxMove: maxReplayMove,
            currentMove: replayCurrentMove,
            playbackSpeed: replayPlaybackSpeed,
        },
        onReplaySeek: (moveNumber) => {
            setReplayMoveNumber(
                Math.max(0, Math.min(moveNumber, maxReplayMove)),
            );
            setReplayIsPlaying(false);
        },
        onReplayTogglePlay: () => {
            if (!isGameOver || maxReplayMove === 0) return;
            setReplayMoveNumber((current) =>
                current === null ? 0 : current,
            );
            setReplayIsPlaying((playing) => !playing);
        },
        onReplayStepBack: () => {
            if (!isGameOver || maxReplayMove === 0) return;
            setReplayIsPlaying(false);
            setReplayMoveNumber((current) => {
                const safeCurrent = current === null ? maxReplayMove : current;
                return Math.max(0, safeCurrent - 1);
            });
        },
        onReplayStepForward: () => {
            if (!isGameOver || maxReplayMove === 0) return;
            setReplayIsPlaying(false);
            setReplayMoveNumber((current) => {
                const safeCurrent = current === null ? maxReplayMove : current;
                return Math.min(maxReplayMove, safeCurrent + 1);
            });
        },
        onReplaySkipStart: () => {
            if (!isGameOver || maxReplayMove === 0) return;
            setReplayIsPlaying(false);
            setReplayMoveNumber(0);
        },
        onReplaySkipEnd: () => {
            if (!isGameOver || maxReplayMove === 0) return;
            setReplayIsPlaying(false);
            setReplayMoveNumber(maxReplayMove);
        },
        onReplaySpeedChange: (speed) =>
            setReplayPlaybackSpeed(speed),
    });

    return (
        <OnlineRoomShell
            mode={mode}
            roomId={roomId}
            size={size}
            komi={komi}
            gameState={gameState}
            moveHistory={moveHistory}
            timers={timers}
            isGameOver={isGameOver}
            winner={winner}
            gameOverReason={gameOverReason}
        >
            {mode === "online" && roomId ? (
                <OnlineGameplayLayout />
            ) : (
                <GameLayout
                    board={
                        <LocalBoardView
                            replayEnabled={replayEnabled}
                            replayFrame={replayFrame}
                        />
                    }
                    panels={sidebarPanels}
                    rightPanel={rightPanel}
                />
            )}
            <AIReaction />
            <MobileSenseiFab />
            <GameOverDialog
                open={isGameOver && !gameOverDialogDismissed}
                onOpenChange={(open) => {
                    if (!open) setGameOverDialogDismissed(true);
                }}
                result={result}
                reason={gameOverReason ?? "score"}
                moveCount={moveHistory.length}
                saveState={saveState}
                onReview={() => setGameOverDialogDismissed(true)}
                onReplay={handleReplayFromDialog}
                onExportSgf={handleExportSgf}
                onShare={handleShareGame}
                onPlayAgain={() => resetGame()}
            />
        </OnlineRoomShell>
    );
}

function OnlineRoomShell({
    mode,
    roomId,
    size,
    komi,
    gameState,
    moveHistory,
    timers,
    isGameOver,
    winner,
    gameOverReason,
    children,
}: {
    mode: GameMode;
    roomId: string | null;
    size: 9 | 13 | 19;
    komi: number;
    gameState: GameState;
    moveHistory: Move[];
    timers: { black: number; white: number };
    isGameOver: boolean;
    winner: "black" | "white" | "draw" | null;
    gameOverReason: "score" | "resignation" | "timeout" | null;
    children: React.ReactNode;
}) {
    if (mode !== "online" || !roomId) {
        return <>{children}</>;
    }

    return (
        <RoomProvider
            id={roomId}
            initialPresence={{
                cursor: null,
                hoveredIntersection: null,
                connectionQuality: "good",
                stoneColor: null,
            }}
            initialStorage={{
                size,
                komi,
                board: [...gameState.board],
                turn: gameState.turn,
                captured: {
                    black: gameState.captured.black,
                    white: gameState.captured.white,
                },
                moveNumber: gameState.moveNumber,
                consecutivePasses: gameState.consecutivePasses,
                ko: gameState.ko,
                history: [...gameState.history],
                moveHistory: moveHistory.map((move) => ({ ...move })),
                timers: { black: timers.black, white: timers.white },
                isGameOver,
                winner,
                gameOverReason,
            }}
        >
            <OnlineRoomSync />
            {children}
        </RoomProvider>
    );
}

function OnlineGameplayLayout() {
    const otherConnectionIds = useOthersConnectionIds();
    const selfConnectionId = useSelf((me) => me.connectionId);
    const waitingForOpponent = otherConnectionIds.length === 0;
    const currentPlayer = useGameStore((state) => state.currentPlayer);
    const myAssignedColor = useMemo(
        () => getAssignedOnlineColor(selfConnectionId, otherConnectionIds),
        [otherConnectionIds, selfConnectionId],
    );
    const canAct = !waitingForOpponent && myAssignedColor === currentPlayer;

    const commitStone = useMutation(
        ({ storage }, x: number, y: number) => {
            if (waitingForOpponent) {
                return false;
            }

            const snapshot = readSnapshotFromMutableStorage(storage);
            if (snapshot.isGameOver) {
                return false;
            }

            const currentTurn = snapshot.turn;
            if (myAssignedColor !== currentTurn) {
                return false;
            }

            const gameState: GameState = {
                board: [...snapshot.board] as GameState["board"],
                turn: snapshot.turn,
                moveNumber: snapshot.moveNumber,
                consecutivePasses: snapshot.consecutivePasses,
                captured: {
                    black: snapshot.captured.black,
                    white: snapshot.captured.white,
                },
                ko: snapshot.ko,
                history: [...snapshot.history],
            };
            const nextState = applyMove(gameState, snapshot.size, x, y, currentTurn);
            if (!nextState) {
                return false;
            }

            const nextSnapshot: MultiplayerSnapshot = {
                size: snapshot.size,
                komi: snapshot.komi,
                board: [...nextState.board],
                turn: nextState.turn,
                moveNumber: nextState.moveNumber,
                consecutivePasses: nextState.consecutivePasses,
                captured: {
                    black: nextState.captured.black,
                    white: nextState.captured.white,
                },
                ko: nextState.ko,
                history: [...nextState.history],
                moveHistory: [
                    ...snapshot.moveHistory,
                    { x, y, player: currentTurn, isPass: false },
                ],
                timers: {
                    black: snapshot.timers.black,
                    white: snapshot.timers.white,
                },
                isGameOver: false,
                winner: null,
                gameOverReason: null,
            };

            writeSnapshotToMutableStorage(storage, nextSnapshot);
            return true;
        },
        [myAssignedColor, waitingForOpponent],
    );

    const commitPass = useMutation(
        ({ storage }) => {
            if (waitingForOpponent) {
                return false;
            }

            const snapshot = readSnapshotFromMutableStorage(storage);
            if (snapshot.isGameOver) {
                return false;
            }

            const passingPlayer = snapshot.turn;
            if (myAssignedColor !== passingPlayer) {
                return false;
            }

            const gameState: GameState = {
                board: [...snapshot.board] as GameState["board"],
                turn: snapshot.turn,
                moveNumber: snapshot.moveNumber,
                consecutivePasses: snapshot.consecutivePasses,
                captured: {
                    black: snapshot.captured.black,
                    white: snapshot.captured.white,
                },
                ko: snapshot.ko,
                history: [...snapshot.history],
            };
            const nextState = applyPass(gameState);
            const finished = getIsGameOver(nextState);
            const score = finished
                ? calculateScore(
                      nextState.board,
                      snapshot.size,
                      nextState.captured,
                      snapshot.komi,
                  )
                : null;

            const nextSnapshot: MultiplayerSnapshot = {
                size: snapshot.size,
                komi: snapshot.komi,
                board: [...nextState.board],
                turn: nextState.turn,
                moveNumber: nextState.moveNumber,
                consecutivePasses: nextState.consecutivePasses,
                captured: {
                    black: nextState.captured.black,
                    white: nextState.captured.white,
                },
                ko: nextState.ko,
                history: [...nextState.history],
                moveHistory: [
                    ...snapshot.moveHistory,
                    { x: -1, y: -1, player: passingPlayer, isPass: true },
                ],
                timers: {
                    black: snapshot.timers.black,
                    white: snapshot.timers.white,
                },
                isGameOver: finished,
                winner: finished && score ? score.winner : null,
                gameOverReason: finished ? "score" : null,
            };

            writeSnapshotToMutableStorage(storage, nextSnapshot);
            return true;
        },
        [myAssignedColor, waitingForOpponent],
    );

    const commitResign = useMutation(({ storage }) => {
        if (waitingForOpponent) {
            return false;
        }

        const snapshot = readSnapshotFromMutableStorage(storage);
        if (snapshot.isGameOver) {
            return false;
        }
        if (myAssignedColor !== snapshot.turn) {
            return false;
        }

        const winner = snapshot.turn === "black" ? "white" : "black";

        const nextSnapshot: MultiplayerSnapshot = {
            ...snapshot,
            isGameOver: true,
            winner,
            gameOverReason: "resignation",
        };

        writeSnapshotToMutableStorage(storage, nextSnapshot);
        return true;
    }, [myAssignedColor, waitingForOpponent]);

    const tickOnlineClock = useMutation(
        ({ storage }) => {
            if (waitingForOpponent || myAssignedColor !== "black") {
                return;
            }

            const snapshot = readSnapshotFromMutableStorage(storage);
            if (snapshot.isGameOver) {
                return;
            }

            const activeTimer = Math.max(0, snapshot.timers[snapshot.turn] - 1);
            const nextTimers = {
                ...snapshot.timers,
                [snapshot.turn]: activeTimer,
            };

            if (activeTimer > 0) {
                writeSnapshotToMutableStorage(storage, {
                    ...snapshot,
                    timers: nextTimers,
                });
                return;
            }

            writeSnapshotToMutableStorage(storage, {
                ...snapshot,
                timers: nextTimers,
                isGameOver: true,
                winner: snapshot.turn === "black" ? "white" : "black",
                gameOverReason: "timeout",
            });
        },
        [myAssignedColor, waitingForOpponent],
    );

    useEffect(() => {
        if (waitingForOpponent || myAssignedColor !== "black") {
            return;
        }

        const interval = window.setInterval(() => {
            tickOnlineClock();
        }, 1000);

        return () => window.clearInterval(interval);
    }, [myAssignedColor, tickOnlineClock, waitingForOpponent]);

    const { panels: sidebarPanels } = useSidebarPanels({
        onPassAction: commitPass,
        onResignAction: commitResign,
        controlsDisabled: !canAct,
    });

    return (
        <GameLayout
            board={
                <OnlineBoardView
                    onIntersectionClick={commitStone}
                    assignedColor={myAssignedColor}
                    waitingForOpponent={waitingForOpponent}
                />
            }
            panels={sidebarPanels}
        />
    );
}

function LocalBoardView({
    replayEnabled = false,
    replayFrame = null,
}: {
    replayEnabled?: boolean;
    replayFrame?: ReplayFrame | null;
}) {
    const liveBoard = useGameStore((state) => state.gameState.board);
    const size = useGameStore((state) => state.size);
    const komi = useGameStore((state) => state.komi);
    const placeStone = useGameStore((state) => state.placeStone);
    const liveCurrentPlayer = useGameStore((state) => state.currentPlayer);
    const liveValidMoves = useGameStore((state) => state.validMoves);
    const liveRecentCaptures = useGameStore((state) => state.recentCaptures);
    const liveScore = useGameStore((state) => state.liveScore);
    const isGameOver = useGameStore((state) => state.isGameOver);
    const gameOverReason = useGameStore((state) => state.gameOverReason);
    const deadStones = useGameStore((state) => state.deadStones);
    const toggleDeadStone = useGameStore((state) => state.toggleDeadStone);
    const analysisOverlayEnabled = useGameStore(
        (state) => state.analysisOverlayEnabled,
    );
    const latestAnalysis = useLearningStore((state) => state.latestAnalysis);
    const liveLastMove = useGameStore((state) => {
        const history = state.moveHistory;
        return history.length > 0 ? history[history.length - 1] : undefined;
    });

    const board = replayEnabled && replayFrame ? replayFrame.board : liveBoard;
    const currentPlayer =
        replayEnabled && replayFrame ? replayFrame.turn : liveCurrentPlayer;
    const deadStoneMarkingEnabled =
        !replayEnabled && isGameOver && gameOverReason === "score";
    const validMoves =
        replayEnabled || deadStoneMarkingEnabled ? [] : liveValidMoves;
    const capturedStones = replayEnabled ? [] : liveRecentCaptures;
    const displayLastMove =
        replayEnabled && replayFrame
            ? replayFrame.lastMove && !replayFrame.lastMove.isPass
                ? { x: replayFrame.lastMove.x, y: replayFrame.lastMove.y }
                : undefined
            : liveLastMove && !liveLastMove.isPass
              ? { x: liveLastMove.x, y: liveLastMove.y }
              : undefined;
    const replayScore = useMemo(
        () =>
            replayEnabled && replayFrame
                ? calculateScore(
                      replayFrame.board as any,
                      size,
                      replayFrame.captured,
                      komi,
                  )
                : null,
        [komi, replayEnabled, replayFrame, size],
    );

    const analysisHints = useMemo(
        () =>
            buildAnalysisHints({
                enabled: analysisOverlayEnabled && !replayEnabled,
                topMoves: latestAnalysis?.topMoves,
                size,
                board,
            }),
        [
            analysisOverlayEnabled,
            board,
            latestAnalysis?.topMoves,
            replayEnabled,
            size,
        ],
    );

    return (
        <GoBoard
            board={board}
            size={size}
            currentPlayer={currentPlayer}
            validMoves={validMoves}
            capturedStones={capturedStones}
            lastMove={displayLastMove}
            analysisHints={analysisHints}
            territoryMap={
                replayEnabled && replayScore
                    ? replayScore.territoryMap
                    : liveScore.territoryMap
            }
            showTerritoryHeatmap={
                (analysisOverlayEnabled || deadStoneMarkingEnabled) &&
                !replayEnabled
            }
            deadStoneMarkingEnabled={deadStoneMarkingEnabled}
            markedDeadStones={deadStones}
            onDeadStoneToggle={toggleDeadStone}
            onIntersectionClick={
                replayEnabled ? undefined : (x, y) => placeStone(x, y)
            }
        />
    );
}

function OnlineBoardView({
    onIntersectionClick,
    assignedColor,
    waitingForOpponent = false,
}: {
    onIntersectionClick?: (x: number, y: number) => boolean;
    assignedColor: StoneColor | null;
    waitingForOpponent?: boolean;
}) {
    const board = useGameStore((state) => state.gameState.board);
    const size = useGameStore((state) => state.size);
    const placeStone = useGameStore((state) => state.placeStone);
    const currentPlayer = useGameStore((state) => state.currentPlayer);
    const validMoves = useGameStore((state) => state.validMoves);
    const recentCaptures = useGameStore((state) => state.recentCaptures);
    const liveScore = useGameStore((state) => state.liveScore);
    const analysisOverlayEnabled = useGameStore(
        (state) => state.analysisOverlayEnabled,
    );
    const latestAnalysis = useLearningStore((state) => state.latestAnalysis);
    const lastMove = useGameStore((state) => {
        const history = state.moveHistory;
        return history.length > 0 ? history[history.length - 1] : undefined;
    });
    const analysisHints = useMemo(
        () =>
            buildAnalysisHints({
                enabled: analysisOverlayEnabled,
                topMoves: latestAnalysis?.topMoves,
                size,
                board,
            }),
        [analysisOverlayEnabled, latestAnalysis?.topMoves, size, board],
    );

    const others = useOthers();
    const status = useStatus();
    const updateMyPresence = useUpdateMyPresence();
    const canPlay = !waitingForOpponent && assignedColor === currentPlayer;

    const opponentHover = useMemo(() => {
        const hovered = others.find(
            (other) => other.presence.hoveredIntersection,
        );
        const intersection = hovered?.presence.hoveredIntersection;

        if (!hovered || !intersection) {
            return null;
        }

        const fallbackColor: StoneColor =
            assignedColor === "black" ? "white" : "black";

        return {
            x: intersection.x,
            y: intersection.y,
            color: hovered.presence.stoneColor ?? fallbackColor,
        };
    }, [assignedColor, others]);

    useEffect(() => {
        const connectionQuality =
            status === "connected"
                ? "good"
                : status === "reconnecting"
                  ? "poor"
                  : "offline";

        updateMyPresence({
            stoneColor: assignedColor,
            connectionQuality,
        });
    }, [assignedColor, status, updateMyPresence]);

    useEffect(
        () => () => {
            updateMyPresence({ hoveredIntersection: null });
        },
        [updateMyPresence],
    );

    return (
        <div className="relative">
            <GoBoard
                board={board}
                size={size}
                currentPlayer={currentPlayer}
                validMoves={canPlay ? validMoves : []}
                capturedStones={recentCaptures}
                opponentHover={opponentHover}
                lastMove={
                    lastMove && !lastMove.isPass
                        ? { x: lastMove.x, y: lastMove.y }
                        : undefined
                }
                analysisHints={analysisHints}
                territoryMap={liveScore.territoryMap}
                showTerritoryHeatmap={analysisOverlayEnabled}
                onHoverIntersectionChange={(next) => {
                    updateMyPresence({ hoveredIntersection: next });
                }}
                onIntersectionClick={(x, y) => {
                    if (!canPlay) {
                        return;
                    }
                    if (onIntersectionClick) {
                        onIntersectionClick(x, y);
                        return;
                    }
                    placeStone(x, y);
                }}
            />
            {waitingForOpponent ? (
                <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center rounded-3xl bg-background/55 backdrop-blur-[2px]">
                    <div className="rounded-full border border-border/80 bg-card/95 px-4 py-2 text-sm font-medium text-foreground shadow-sm">
                        Waiting for opponent to join...
                    </div>
                </div>
            ) : null}
        </div>
    );
}

export function useSidebarPanels({
    onPassAction,
    onResignAction,
    controlsDisabled = false,
    replayState,
    onReplayTogglePlay,
    onReplaySeek,
    onReplayStepBack,
    onReplayStepForward,
    onReplaySkipStart,
    onReplaySkipEnd,
    onReplaySpeedChange,
}: {
    onPassAction?: () => void;
    onResignAction?: () => void;
    controlsDisabled?: boolean;
    replayState?: {
        enabled: boolean;
        maxMove: number;
        currentMove: number;
        isPlaying: boolean;
        playbackSpeed: number;
    };
    onReplayTogglePlay?: () => void;
    onReplaySeek?: (moveNumber: number) => void;
    onReplayStepBack?: () => void;
    onReplayStepForward?: () => void;
    onReplaySkipStart?: () => void;
    onReplaySkipEnd?: () => void;
    onReplaySpeedChange?: (speed: number) => void;
} = {}): { panels: DockPanel[]; rightPanel: React.ReactNode } {
    const gameState = useGameStore((state) => state.gameState);
    const moveHistory = useGameStore((state) => state.moveHistory);
    const mode = useGameStore((state) => state.mode);
    const passTurn = useGameStore((state) => state.passTurn);
    const resign = useGameStore((state) => state.resign);
    const setMode = useGameStore((state) => state.setMode);
    const aiDifficulty = useGameStore((state) => state.aiDifficulty);
    const setAIDifficulty = useGameStore((state) => state.setAIDifficulty);
    const size = useGameStore((state) => state.size);
    const isGameOver = useGameStore((state) => state.isGameOver);
    const winner = useGameStore((state) => state.winner);
    const gameOverReason = useGameStore((state) => state.gameOverReason);
    const scoreResult = useGameStore((state) => state.scoreResult);
    const deadStones = useGameStore((state) => state.deadStones);
    const scoreReviewConfirmed = useGameStore(
        (state) => state.scoreReviewConfirmed,
    );
    const clearDeadStones = useGameStore((state) => state.clearDeadStones);
    const confirmScoreReview = useGameStore(
        (state) => state.confirmScoreReview,
    );
    const timers = useGameStore((state) => state.timers);
    const liveScore = useGameStore((state) => state.liveScore);
    const exportSGF = useGameStore((state) => state.exportSGF);
    const analysisOverlayEnabled = useGameStore((state) => state.analysisOverlayEnabled);
    const setAnalysisOverlayEnabled = useGameStore((state) => state.setAnalysisOverlayEnabled);
    const roomId = useMultiplayerStore((state) => state.roomId);
    const shareUrl = useMultiplayerStore((state) => state.shareUrl);
    const multiplayerState = useMultiplayerStore((state) => state.state);
    const multiplayerError = useMultiplayerStore((state) => state.error);
    const createRoom = useMultiplayerStore((state) => state.createRoom);
    const joinRoom = useMultiplayerStore((state) => state.joinRoom);
    const leaveRoom = useMultiplayerStore((state) => state.leaveRoom);
    const latestAnalysis = useLearningStore((state) => state.latestAnalysis);

    const blackTimer = splitClock(timers.black);
    const whiteTimer = splitClock(timers.white);

    const handleExportSgf = () => {
        const sgf = exportSGF();
        const filenameDate = new Date().toISOString().replace(/[:.]/g, "-");
        const blob = new Blob([sgf], { type: "application/x-go-sgf" });
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = `komi-${filenameDate}.sgf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);
    };

    const mappedMoves: MoveEntry[] = moveHistory.map((m, idx) => {
        let coordinate = "—";
        if (!m.isPass) {
            const col = LETTERS[m.x];
            const row = size - m.y;
            coordinate = `${col}${row}`;
        }
        return {
            moveNumber: idx + 1,
            player: m.player,
            isPass: m.isPass,
            coordinate,
        };
    });
    const keyMoments = useMemo(
        () => buildKeyMoments(moveHistory, size),
        [moveHistory, size],
    );
    const winProbability = latestAnalysis
        ? Math.round(Math.max(0, Math.min(1, latestAnalysis.winRate)) * 100)
        : null;

    const rightPanel = (
        <div className="flex flex-col gap-0 w-24 border-4 border-black bg-black shadow-[6px_6px_0_0_var(--foreground)] uppercase font-display font-black tracking-widest text-[10px]">
            <div className="flex flex-col items-center bg-black text-white py-4 border-b-2 border-white/20">
                <span className="text-white/50 mb-2">BLK</span>
                <span className="text-3xl">{liveScore.black.total}</span>
            </div>
            <div className="flex flex-col items-center bg-white text-black py-4">
                <span className="text-black/50 mb-2">WHT</span>
                <span className="text-3xl font-bold">{Math.floor(liveScore.white.total)}</span>
            </div>
        </div>
    );

    const panels = [
        {
            id: "game",
            label: "Game Info",
            icon: <LuGamepad2 />,
            content: (
                <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex flex-col gap-3">
                        <PlayerCard
                            name="Player 1"
                            initial="P1"
                            stoneColor="black"
                            captures={gameState.captured.black}
                            minutes={blackTimer.minutes}
                            seconds={blackTimer.seconds}
                            isActive={gameState.turn === "black" && !isGameOver}
                            isLowTime={blackTimer.isLowTime}
                        />

                        <PlayerCard
                            name={
                                mode === "versus-ai"
                                    ? gameState.turn === "white" && !isGameOver
                                        ? "Sensei AI (Thinking...)"
                                        : "Sensei AI"
                                    : "Player 2"
                            }
                            initial={mode === "versus-ai" ? "AI" : "P2"}
                            avatarIcon={mode === "versus-ai" ? <LuBot /> : undefined}
                            stoneColor="white"
                            captures={gameState.captured.white}
                            minutes={whiteTimer.minutes}
                            seconds={whiteTimer.seconds}
                            isActive={gameState.turn === "white" && !isGameOver}
                            isLowTime={whiteTimer.isLowTime}
                        />
                    </div>

                    {winProbability !== null ? (
                        <div className="mt-8 mb-2 px-2">
                            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-black mb-3">
                                <span className="bg-white text-black px-2 py-1 tracking-widest">Engine Read</span>
                                <span className="font-mono text-white text-base bg-black border-2 border-white px-2 py-0.5">
                                    {winProbability}%
                                </span>
                            </div>
                            <div className="h-6 rounded-none bg-white overflow-hidden relative border-[3px] border-white shadow-[4px_4px_0_0_var(--swiss-red)]">
                                <div
                                    className="absolute inset-y-0 left-0 bg-black transition-[width] duration-1000 ease-out border-r-[3px] border-white"
                                    style={{ width: `${winProbability}%` }}
                                />
                            </div>
                        </div>
                    ) : null}

                    <div className="mt-auto pt-6 flex flex-col gap-4 shrink-0">
                        <LiveScoreCard
                            score={liveScore}
                            moveCount={mappedMoves.length}
                            isGameOver={isGameOver}
                        />

                        <GameControls
                            onPass={onPassAction ?? passTurn}
                            onResign={onResignAction ?? resign}
                            disabled={isGameOver || controlsDisabled}
                        />
                    </div>
                </div>
            )
        },
        {
            id: "analysis",
            label: "Sensei & Analysis",
            icon: <LuBrain />,
            content: (
                <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {isGameOver ? (
                        <PostGameReviewCard
                            scoreResult={scoreResult}
                            winner={winner}
                            reason={gameOverReason}
                            keyMoments={keyMoments}
                            canReviewDeadStones={
                                mode !== "online" && gameOverReason === "score"
                            }
                            deadStoneCount={deadStones.length}
                            scoreReviewPending={
                                gameOverReason === "score" &&
                                !scoreReviewConfirmed
                            }
                            onClearDeadStones={clearDeadStones}
                            onConfirmScore={confirmScoreReview}
                            onExportSgf={handleExportSgf}
                        />
                    ) : null}
                    <div className="flex items-center justify-between bg-white p-5 border-[3px] border-white rounded-none shadow-[6px_6px_0_0_var(--swiss-blue)] transition-all group hover:translate-x-[2px] hover:-translate-y-[2px]">
                        <div className="flex flex-col gap-1">
                            <span className="text-[14px] font-display font-black text-black tracking-tight uppercase">
                                Sensei Move Hints
                            </span>
                            <span className="text-[12px] font-bold text-black/60 uppercase">
                                Overlay optimal AI suggestions directly on the board
                            </span>
                        </div>
                        <button
                            onClick={() => setAnalysisOverlayEnabled(!analysisOverlayEnabled)}
                            className={cn(
                                "w-14 h-8 rounded-none transition-all relative outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0 border-[3px] border-black",
                                analysisOverlayEnabled ? "bg-black" : "bg-transparent",
                            )}
                        >
                            <span
                                className={cn(
                                    "absolute top-[2px] left-[2px] w-5 h-5 rounded-none transition-transform shadow-[2px_2px_0_0_var(--foreground)]",
                                    analysisOverlayEnabled ? "translate-x-7 border border-transparent bg-swiss-yellow" : "translate-x-0 border-[3px] border-black bg-white"
                                )}
                            />
                        </button>
                    </div>

                    <AIChatPanel />

                    {isGameOver && replayState && replayState.maxMove > 0 ? (
                        <ReplayControls
                            maxMove={replayState.maxMove}
                            currentMove={replayState.currentMove}
                            isPlaying={replayState.isPlaying}
                            playbackSpeed={replayState.playbackSpeed}
                            onTogglePlay={() => onReplayTogglePlay?.()}
                            onSeek={(moveNumber) => onReplaySeek?.(moveNumber)}
                            onStepBack={() => onReplayStepBack?.()}
                            onStepForward={() => onReplayStepForward?.()}
                            onSkipStart={() => onReplaySkipStart?.()}
                            onSkipEnd={() => onReplaySkipEnd?.()}
                            onSpeedChange={(speed) => onReplaySpeedChange?.(speed)}
                        />
                    ) : null}

                    <MoveHistorySection
                        moves={mappedMoves}
                        moveCount={mappedMoves.length}
                        highlightedMoveNumber={
                            replayState?.enabled && replayState.currentMove > 0
                                ? replayState.currentMove
                                : undefined
                        }
                        onMoveSelect={
                            isGameOver && onReplaySeek
                                ? (moveNumber) => onReplaySeek(moveNumber)
                                : undefined
                        }
                        collapsed={false}
                    />
                </div>
            )
        },
        {
            id: "settings",
            label: "Context & Settings",
            icon: <LuSettings />,
            content: (
                <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex flex-col gap-2">
                        <span className="text-[11px] font-black uppercase tracking-widest text-white/50 ml-1 px-1">
                            Game Mode
                        </span>
                        <ModeToggle
                            value={mode as "local" | "versus-ai" | "online"}
                            onValueChange={(val) => setMode(val as GameMode)}
                        />
                    </div>

                    {mode === "versus-ai" && (
                        <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
                            <AIDifficultySelector
                                value={aiDifficulty}
                                onValueChange={setAIDifficulty}
                            />
                        </div>
                    )}

                    {mode === "online" && (
                        <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
                            <OnlineRoomPanel
                                roomId={roomId}
                                shareUrl={shareUrl}
                                isConnecting={
                                    multiplayerState === "creating-room" ||
                                    multiplayerState === "joining-room"
                                }
                                error={multiplayerError}
                                onCreateRoom={() => {
                                    void createRoom();
                                }}
                                onJoinRoom={(nextRoomId) => {
                                    void joinRoom(nextRoomId);
                                }}
                                onLeaveRoom={leaveRoom}
                            />
                        </div>
                    )}

                    <div className="mt-4">
                        <XPBar collapsed={false} />
                    </div>
                </div>
            )
        }
    ];

    return { panels, rightPanel };
}
