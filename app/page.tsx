"use client"

import { useState } from "react"
import { GameLayout } from "@/components/layout/game-layout"
import { GoBoard } from "@/components/game/go-board"
import { ModeToggle } from "@/components/game/mode-toggle"
import { PlayerCard } from "@/components/game/player-card"
import { MoveHistorySection, type MoveEntry } from "@/components/game/move-history-section"
import { GameControls } from "@/components/game/game-controls"
import { GameOverDialog } from "@/components/game/game-over-dialog"

export default function Home() {
  const [mode, setMode] = useState<"local" | "versus-ai">("local")
  const [showGameOver, setShowGameOver] = useState(false)

  return (
    <>
      <GameLayout
        board={<BoardPreview />}
        sidebar={
          <Sidebar
            mode={mode}
            onModeChange={setMode}
            onResign={() => setShowGameOver(true)}
          />
        }
      />
      <GameOverDialog
        open={showGameOver}
        onOpenChange={setShowGameOver}
        result="resignation"
        onPlayAgain={() => setShowGameOver(false)}
      />
    </>
  )
}

function BoardPreview() {
  return (
    <GoBoard
      board={createSampleBoard()}
      size={19}
      currentPlayer="black"
      lastMove={{ x: 10, y: 10 }}
    />
  )
}

function Sidebar({
  mode,
  onModeChange,
  onResign,
}: {
  mode: "local" | "versus-ai"
  onModeChange: (mode: "local" | "versus-ai") => void
  onResign?: () => void
}) {
  const sampleMoves: MoveEntry[] = [
    { moveNumber: 1, player: "black", coordinate: "D7" },
    { moveNumber: 2, player: "white", coordinate: "F7" },
    { moveNumber: 3, player: "black", coordinate: "E4" },
    { moveNumber: 4, player: "white", coordinate: "E6" },
    { moveNumber: 5, player: "black", coordinate: "C5" },
    { moveNumber: 6, player: "white", coordinate: "G5" },
    { moveNumber: 7, player: "black", coordinate: "D3" },
    { moveNumber: 8, player: "white", coordinate: "F4" },
    { moveNumber: 9, player: "black", coordinate: "E2" },
    { moveNumber: 10, player: "white", coordinate: "F3" },
  ]

  return (
    <>
      <ModeToggle value={mode} onValueChange={onModeChange} />

      <PlayerCard
        name="You"
        initial="Y"
        stoneColor="black"
        captures={0}
        minutes={15}
        seconds={0}
        isActive
      />

      <PlayerCard
        name="Player 2"
        initial="P"
        stoneColor="white"
        captures={0}
        minutes={15}
        seconds={0}
      />

      <MoveHistorySection moves={sampleMoves} moveCount={10} />

      <GameControls onResign={onResign} />
    </>
  )
}

function createSampleBoard() {
  const board = Array.from({ length: 19 }, () =>
    Array.from({ length: 19 }, () => null as "black" | "white" | null)
  )

  const blackStones = [
    [3, 3], [4, 3], [15, 3], [3, 9], [8, 8], [9, 8], [9, 9], [10, 9], [11, 10],
    [7, 12], [3, 15], [15, 15],
  ]

  const whiteStones = [
    [14, 3], [15, 4], [4, 9], [10, 8], [8, 9], [10, 10], [11, 9], [12, 10],
    [8, 12], [4, 15], [14, 15],
  ]

  blackStones.forEach(([x, y]) => {
    board[y][x] = "black"
  })

  whiteStones.forEach(([x, y]) => {
    board[y][x] = "white"
  })

  return board
}
