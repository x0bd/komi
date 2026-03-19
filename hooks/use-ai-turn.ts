import { useEffect, useRef } from "react"
import { useGameStore } from "../lib/stores/game-store"
import { getActiveEngineProvider } from "../lib/ai"

export function useAITurn() {
  const gameState = useGameStore((state) => state.gameState)
  const turn = useGameStore((state) => state.gameState.turn)
  const moveNumber = useGameStore((state) => state.gameState.moveNumber)
  const mode = useGameStore((state) => state.mode)
  const aiDifficulty = useGameStore((state) => state.aiDifficulty)
  const size = useGameStore((state) => state.size)
  const isGameOver = useGameStore((state) => state.isGameOver)
  const placeStone = useGameStore((state) => state.placeStone)
  const passTurn = useGameStore((state) => state.passTurn)
  const isProcessingRef = useRef(false)
  const requestIdRef = useRef(0)

  useEffect(() => {
    requestIdRef.current += 1
    const requestId = requestIdRef.current

    if (mode !== "versus-ai" || isGameOver) {
      isProcessingRef.current = false
      return
    }

    // AI plays White
    if (turn === "white" && !isProcessingRef.current) {
      isProcessingRef.current = true

      const processAITurn = async () => {
        try {
          const move = await getActiveEngineProvider().pickMove({
            state: gameState,
            size,
            player: "white",
            difficulty: aiDifficulty,
            withDelay: true,
          })
          if (requestId !== requestIdRef.current) {
            return
          }

          const latest = useGameStore.getState()
          if (
            latest.mode !== "versus-ai" ||
            latest.isGameOver ||
            latest.gameState.turn !== "white" ||
            latest.gameState.moveNumber !== moveNumber
          ) {
            return
          }
          
          if (move.isPass) {
            passTurn()
          } else {
            placeStone(move.x, move.y)
          }
        } finally {
          if (requestId === requestIdRef.current) {
            isProcessingRef.current = false
          }
        }
      }

      processAITurn()
    }

    return () => {
      if (requestId === requestIdRef.current) {
        isProcessingRef.current = false
      }
    }
  }, [
    turn,
    moveNumber,
    mode,
    aiDifficulty,
    isGameOver,
    gameState,
    size,
    placeStone,
    passTurn,
  ])
}
