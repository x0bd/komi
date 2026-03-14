"use client"

import { GameLayout } from "@/components/layout/game-layout"
import { GoBoard } from "@/components/game/go-board"
import { ModeToggle } from "@/components/game/mode-toggle"
import { PlayerCard } from "@/components/game/player-card"
import { MoveHistorySection, type MoveEntry } from "@/components/game/move-history-section"
import { GameControls } from "@/components/game/game-controls"
import { GameOverDialog } from "@/components/game/game-over-dialog"
import { useGameStore, type GameMode } from "@/lib/stores/game-store"
import { useTimer } from "@/hooks/use-timer"
import { useAITurn } from "@/hooks/use-ai-turn"
import { ChatDock } from "@/components/learning/chat-dock"
import { XPBar } from "@/components/learning/xp-bar"
import { useLearningStore } from "@/lib/stores/learning-store"
import { LuBot } from "react-icons/lu"

const LETTERS = "ABCDEFGHJKLMNOPQRST".split("")

export default function Home() {
  const store = useGameStore()
  
  // Attach AI turn listener
  useAITurn()
  
  return (
    <>
      <GameLayout
        board={<BoardView />}
        sidebar={<Sidebar />}
      />
      <ChatDock />
      <GameOverDialog
        open={store.isGameOver}
        onOpenChange={() => {}}
        result={store.scoreResult?.winner === "draw" ? "draw" : store.scoreResult?.margin === Infinity ? "resignation" : (store.scoreResult?.winner === "black" ? "black-wins" : "white-wins")}
        onPlayAgain={() => store.resetGame()}
      />
    </>
  )
}

function BoardView() {
  const { gameState, size, placeStone } = useGameStore()
  const { board, turn } = gameState
  
  const moveHistory = useGameStore(state => state.moveHistory)
  const lastMove = moveHistory.length > 0 ? moveHistory[moveHistory.length - 1] : undefined

  return (
    <GoBoard
      board={board}
      size={size}
      currentPlayer={turn}
      lastMove={lastMove && !lastMove.isPass ? { x: lastMove.x, y: lastMove.y } : undefined}
      onIntersectionClick={(x, y) => placeStone(x, y)}
    />
  )
}

function Sidebar() {
  const store = useGameStore()
  const { gameState, moveHistory, mode, passTurn, resign, setMode } = store
  const learningStore = useLearningStore()
  
  const blackTimer = useTimer(15 * 60, gameState.turn === "black" && !store.isGameOver)
  const whiteTimer = useTimer(15 * 60, gameState.turn === "white" && !store.isGameOver)

  // Map engine moves to UI MoveEntry format
  const mappedMoves: MoveEntry[] = moveHistory.map((m, idx) => {
    let coordinate = "—"
    if (!m.isPass) {
      const col = LETTERS[m.x]
      const row = store.size - m.y
      coordinate = `${col}${row}`
    }
    return {
      moveNumber: idx + 1,
      player: m.player,
      isPass: m.isPass,
      coordinate
    }
  })

  return (
    <div className="flex flex-col gap-5">
      <ModeToggle value={mode as "local" | "versus-ai"} onValueChange={(val) => setMode(val as GameMode)} />

      <PlayerCard
        name="Player 1"
        initial="P1"
        stoneColor="black"
        captures={gameState.captured.black}
        minutes={blackTimer.minutes}
        seconds={blackTimer.seconds}
        isActive={gameState.turn === "black" && !store.isGameOver}
        isLowTime={blackTimer.isLowTime}
      />

      <PlayerCard
        name={mode === "versus-ai" ? (gameState.turn === "white" && !store.isGameOver ? "Sensei AI (Thinking...)" : "Sensei AI") : "Player 2"}
        initial={mode === "versus-ai" ? "AI" : "P2"}
        avatarIcon={mode === "versus-ai" ? <LuBot /> : undefined}
        stoneColor="white"
        captures={gameState.captured.white}
        minutes={whiteTimer.minutes}
        seconds={whiteTimer.seconds}
        isActive={gameState.turn === "white" && !store.isGameOver}
        isLowTime={whiteTimer.isLowTime}
      />

      <MoveHistorySection moves={mappedMoves} moveCount={mappedMoves.length} />
      <XPBar
        streak={learningStore.streak}
        xpPercent={(learningStore.xp / 1000) * 100}
      />

      <GameControls 
        onPass={passTurn} 
        onResign={resign} 
        disabled={store.isGameOver} 
      />
    </div>
  )
}
