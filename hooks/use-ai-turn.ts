import { useEffect, useRef } from "react"
import { useGameStore } from "../lib/stores/game-store"
import { getRandomAIMove } from "../lib/ai/random"

export function useAITurn() {
  const { gameState, mode, size, isGameOver, placeStone, passTurn } = useGameStore()
  const isProcessingRef = useRef(false)

  useEffect(() => {
    if (mode !== "versus-ai" || isGameOver) {
      isProcessingRef.current = false
      return
    }

    // AI plays White
    if (gameState.turn === "white" && !isProcessingRef.current) {
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
  }, [gameState.turn, mode, isGameOver, gameState, size, placeStone, passTurn])
}
