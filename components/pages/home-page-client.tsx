"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
    RoomProvider,
    useOthers,
    useSelf,
    useStatus,
    useUpdateMyPresence,
} from "@liveblocks/react";
import { GameLayout } from "@/components/layout/game-layout";
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
import { GameOverDialog } from "@/components/game/game-over-dialog";
import { useGameStore, type GameMode } from "@/lib/stores/game-store";
import { splitClock, useGameClock } from "@/hooks/use-timer";
import { useAITurn } from "@/hooks/use-ai-turn";
import { AIReaction } from "@/components/learning/ai-reaction";
import { AIChatPanel } from "@/components/learning/ai-chat-panel";
import { XPBar } from "@/components/learning/xp-bar";
import { MobileSenseiFab } from "@/components/learning/mobile-sensei-fab";
import type { ScoreResult } from "@/lib/engine/scoring";
import type { GameState, Move } from "@/lib/engine/types";
import { useMultiplayerStore } from "@/lib/stores/multiplayer-store";
import { LuBot } from "react-icons/lu";
import { OnlineRoomSync } from "@/components/game/online-room-sync";
import type { StoneColor } from "@/components/game/stone";

const LETTERS = "ABCDEFGHJKLMNOPQRST".split("");

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

export default function HomePageClient() {
    const searchParams = useSearchParams();
    const roomParam = searchParams.get("room");
    const isGameOver = useGameStore((state) => state.isGameOver);
    const scoreResult = useGameStore((state) => state.scoreResult);
    const gameOverReason = useGameStore((state) => state.gameOverReason);
    const winner = useGameStore((state) => state.winner);
    const mode = useGameStore((state) => state.mode);
    const setMode = useGameStore((state) => state.setMode);
    const size = useGameStore((state) => state.size);
    const gameState = useGameStore((state) => state.gameState);
    const timers = useGameStore((state) => state.timers);
    const moveHistory = useGameStore((state) => state.moveHistory);
    const exportSGF = useGameStore((state) => state.exportSGF);
    const resetGame = useGameStore((state) => state.resetGame);
    const roomId = useMultiplayerStore((state) => state.roomId);
    const createRoom = useMultiplayerStore((state) => state.createRoom);
    const joinRoom = useMultiplayerStore((state) => state.joinRoom);
    const leaveRoom = useMultiplayerStore((state) => state.leaveRoom);
    const persistedGameKeyRef = useRef<string | null>(null);

    // Attach AI turn listener
    useAITurn();
    useGameClock(mode !== "online");

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
            return;
        }
        if (!gameOverReason || !winner) return;

        const persistenceKey = `${gameOverReason}:${winner}:${moveHistory.length}`;
        if (persistedGameKeyRef.current === persistenceKey) return;
        persistedGameKeyRef.current = persistenceKey;

        const resultCode = formatResultCode(gameOverReason, winner, scoreResult);
        const sgf = exportSGF();

        void fetch("/api/games", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                mode,
                moves: moveHistory,
                result: resultCode,
                sgf,
            }),
        }).catch(() => {
            // Allow retry after user starts a new game and ends again.
            persistedGameKeyRef.current = null;
        });
    }, [
        exportSGF,
        gameOverReason,
        isGameOver,
        mode,
        moveHistory,
        scoreResult,
        winner,
    ]);

    return (
        <OnlineRoomShell
            mode={mode}
            roomId={roomId}
            size={size}
            gameState={gameState}
            moveHistory={moveHistory}
            timers={timers}
            isGameOver={isGameOver}
            winner={winner}
            gameOverReason={gameOverReason}
        >
            <GameLayout
                board={
                    mode === "online" && roomId ? (
                        <OnlineBoardView />
                    ) : (
                        <LocalBoardView />
                    )
                }
                sidebar={<Sidebar />}
            />
            <AIReaction />
            <MobileSenseiFab />
            <GameOverDialog
                open={isGameOver}
                onOpenChange={() => {}}
                result={result}
                reason={gameOverReason ?? "score"}
                onPlayAgain={() => resetGame()}
            />
        </OnlineRoomShell>
    );
}

function OnlineRoomShell({
    mode,
    roomId,
    size,
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

function LocalBoardView() {
    const board = useGameStore((state) => state.gameState.board);
    const size = useGameStore((state) => state.size);
    const placeStone = useGameStore((state) => state.placeStone);
    const currentPlayer = useGameStore((state) => state.currentPlayer);
    const validMoves = useGameStore((state) => state.validMoves);
    const recentCaptures = useGameStore((state) => state.recentCaptures);
    const lastMove =
        useGameStore((state) => {
            const moveHistory = state.moveHistory;
            return moveHistory.length > 0
                ? moveHistory[moveHistory.length - 1]
                : undefined;
        });

    return (
        <GoBoard
            board={board}
            size={size}
            currentPlayer={currentPlayer}
            validMoves={validMoves}
            capturedStones={recentCaptures}
            lastMove={
                lastMove && !lastMove.isPass
                    ? { x: lastMove.x, y: lastMove.y }
                    : undefined
            }
            onIntersectionClick={(x, y) => placeStone(x, y)}
        />
    );
}

function OnlineBoardView() {
    const board = useGameStore((state) => state.gameState.board);
    const size = useGameStore((state) => state.size);
    const placeStone = useGameStore((state) => state.placeStone);
    const currentPlayer = useGameStore((state) => state.currentPlayer);
    const validMoves = useGameStore((state) => state.validMoves);
    const recentCaptures = useGameStore((state) => state.recentCaptures);
    const lastMove =
        useGameStore((state) => {
            const history = state.moveHistory;
            return history.length > 0 ? history[history.length - 1] : undefined;
        });

    const others = useOthers();
    const selfConnectionId = useSelf((me) => me.connectionId);
    const status = useStatus();
    const updateMyPresence = useUpdateMyPresence();

    const myAssignedColor = useMemo<StoneColor | null>(() => {
        if (selfConnectionId === null) {
            return null;
        }

        const ids = [selfConnectionId, ...others.map((other) => other.connectionId)]
            .sort((a, b) => a - b)
            .slice(0, 2);

        if (ids.length === 0) {
            return null;
        }

        return ids[0] === selfConnectionId ? "black" : "white";
    }, [others, selfConnectionId]);

    const opponentHover = useMemo(() => {
        const hovered = others.find((other) => other.presence.hoveredIntersection);
        const intersection = hovered?.presence.hoveredIntersection;

        if (!hovered || !intersection) {
            return null;
        }

        const fallbackColor: StoneColor =
            myAssignedColor === "black" ? "white" : "black";

        return {
            x: intersection.x,
            y: intersection.y,
            color: hovered.presence.stoneColor ?? fallbackColor,
        };
    }, [myAssignedColor, others]);

    useEffect(() => {
        const connectionQuality =
            status === "connected"
                ? "good"
                : status === "reconnecting"
                  ? "poor"
                  : "offline";

        updateMyPresence({
            stoneColor: myAssignedColor,
            connectionQuality,
        });
    }, [myAssignedColor, status, updateMyPresence]);

    useEffect(
        () => () => {
            updateMyPresence({ hoveredIntersection: null });
        },
        [updateMyPresence],
    );

    return (
        <GoBoard
            board={board}
            size={size}
            currentPlayer={currentPlayer}
            validMoves={validMoves}
            capturedStones={recentCaptures}
            opponentHover={opponentHover}
            lastMove={
                lastMove && !lastMove.isPass
                    ? { x: lastMove.x, y: lastMove.y }
                    : undefined
            }
            onHoverIntersectionChange={(next) => {
                updateMyPresence({ hoveredIntersection: next });
            }}
            onIntersectionClick={(x, y) => placeStone(x, y)}
        />
    );
}

function Sidebar() {
    const [expandedPanel, setExpandedPanel] = useState<
        "history" | "sensei" | "streak" | null
    >(null);
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
    const timers = useGameStore((state) => state.timers);
    const liveScore = useGameStore((state) => state.liveScore);
    const roomId = useMultiplayerStore((state) => state.roomId);
    const shareUrl = useMultiplayerStore((state) => state.shareUrl);
    const multiplayerState = useMultiplayerStore((state) => state.state);
    const multiplayerError = useMultiplayerStore((state) => state.error);
    const createRoom = useMultiplayerStore((state) => state.createRoom);
    const joinRoom = useMultiplayerStore((state) => state.joinRoom);

    const blackTimer = splitClock(timers.black);
    const whiteTimer = splitClock(timers.white);

    // Map engine moves to UI MoveEntry format
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

    return (
        <div className="flex flex-col gap-4 lg:h-full lg:min-h-0">
            <div className="flex flex-col gap-4">
                <ModeToggle
                    value={mode as "local" | "versus-ai" | "online"}
                    onValueChange={(val) => setMode(val as GameMode)}
                />

                {mode === "versus-ai" ? (
                    <AIDifficultySelector
                        value={aiDifficulty}
                        onValueChange={setAIDifficulty}
                    />
                ) : null}

                {mode === "online" ? (
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
                    />
                ) : null}

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

            <div className="flex min-h-0 flex-col gap-4">
                <LiveScoreCard
                    score={liveScore}
                    moveCount={mappedMoves.length}
                    isGameOver={isGameOver}
                />

                <MoveHistorySection
                    moves={mappedMoves}
                    moveCount={mappedMoves.length}
                    collapsed={expandedPanel !== "history"}
                    onToggle={() =>
                        setExpandedPanel((current) =>
                            current === "history" ? null : "history",
                        )
                    }
                    className={
                        expandedPanel === "history"
                            ? "lg:h-full lg:flex-1"
                            : "lg:flex-none"
                    }
                />

                <AIChatPanel
                    collapsed={expandedPanel !== "sensei"}
                    onToggle={() =>
                        setExpandedPanel((current) =>
                            current === "sensei" ? null : "sensei",
                        )
                    }
                    className="hidden lg:block"
                />

                <XPBar
                    collapsed={expandedPanel !== "streak"}
                    onToggle={() =>
                        setExpandedPanel((current) =>
                            current === "streak" ? null : "streak",
                        )
                    }
                />
            </div>

            <div className="mt-auto pt-1">
                <GameControls
                    onPass={passTurn}
                    onResign={resign}
                    disabled={isGameOver}
                />
            </div>
        </div>
    );
}
