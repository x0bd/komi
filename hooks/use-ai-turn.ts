import { useEffect, useRef } from "react"
import { useGameStore } from "../lib/stores/game-store"
import { getRandomAIMove } from "../lib/ai/random"

export function useAITurn() {
  const gameState = useGameStore((state) => state.gameState)
  const turn = useGameStore((state) => state.gameState.turn)
  const mode = useGameStore((state) => state.mode)
  const size = useGameStore((state) => state.size)
  const isGameOver = useGameStore((state) => state.isGameOver)
  const placeStone = useGameStore((state) => state.placeStone)
  const passTurn = useGameStore((state) => state.passTurn)
  const isProcessingRef = useRef(false)

  useEffect(() => {
    if (mode !== "versus-ai" || isGameOver) {
      isProcessingRef.current = false
      return
    }

    // AI plays White
    if (turn === "white" && !isProcessingRef.current) {
      isProcessingRef.current = true

      const processAITurn = async () => {
        try {
          const move = await getRandomAIMove(gameState, size, "white")
          
          if (move.isPass) {
            passTurn()
          } else {
            placeStone(move.x, move.y)
          }
        } finally {
          isProcessingRef.current = false
        }
      }

      processAITurn()
    }
  }, [turn, mode, isGameOver, gameState, size, placeStone, passTurn])
}
