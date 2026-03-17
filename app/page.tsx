"use client";

import { useState } from "react";
import { GameLayout } from "@/components/layout/game-layout";
import { GoBoard } from "@/components/game/go-board";
import { ModeToggle } from "@/components/game/mode-toggle";
import { AIDifficultySelector } from "@/components/game/ai-difficulty-selector";
import { PlayerCard } from "@/components/game/player-card";
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
import { LuBot } from "react-icons/lu";

const LETTERS = "ABCDEFGHJKLMNOPQRST".split("");

export default function Home() {
    const isGameOver = useGameStore((state) => state.isGameOver);
    const scoreResult = useGameStore((state) => state.scoreResult);
    const gameOverReason = useGameStore((state) => state.gameOverReason);
    const resetGame = useGameStore((state) => state.resetGame);

    // Attach AI turn listener
    useAITurn();
    useGameClock();

    const result =
        !scoreResult || scoreResult.winner === "draw"
            ? "draw"
            : scoreResult?.winner === "black"
              ? "black-wins"
              : "white-wins";

    return (
        <>
            <GameLayout board={<BoardView />} sidebar={<Sidebar />} />
            <AIReaction />
            <MobileSenseiFab />
            <GameOverDialog
                open={isGameOver}
                onOpenChange={() => {}}
                result={result}
                reason={gameOverReason ?? "score"}
                onPlayAgain={() => resetGame()}
            />
        </>
    );
}

function BoardView() {
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
                    value={mode as "local" | "versus-ai"}
                    onValueChange={(val) => setMode(val as GameMode)}
                />

                {mode === "versus-ai" ? (
                    <AIDifficultySelector
                        value={aiDifficulty}
                        onValueChange={setAIDifficulty}
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
