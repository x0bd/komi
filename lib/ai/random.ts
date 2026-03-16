import type { GameState, PlayerColor } from "../engine/types"
import { getValidMoves } from "../engine/game"
import type { AIDifficulty } from "../stores/game-store"

export async function getRandomAIMove(
  state: GameState,
  size: number,
  player: PlayerColor,
  difficulty: AIDifficulty = "easy"
): Promise<{ x: number; y: number; isPass: boolean }> {
  // Artificial delay for UI feel (300-600ms)
  const delayMs =
    difficulty === "easy"
      ? Math.floor(Math.random() * 300) + 300
      : Math.floor(Math.random() * 300) + 300
  await new Promise(resolve => setTimeout(resolve, delayMs))

  const validMoves = getValidMoves(state, size, player)
  
  if (validMoves.length === 0) {
    return { x: -1, y: -1, isPass: true }
  }

  // Pick random move
  const randomIdx = Math.floor(Math.random() * validMoves.length)
  const selectedMove = validMoves[randomIdx]

  return { ...selectedMove, isPass: false }
}
