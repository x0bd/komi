import type { GameState, PlayerColor } from "./types"
import { isValidMove } from "./rules"
import { createEmptyBoard, boardToString } from "./board"

export function createInitialState(size: number): GameState {
  const emptyBoard = createEmptyBoard(size)
  return {
    board: emptyBoard,
    turn: "black",
    moveNumber: 0,
    consecutivePasses: 0,
    captured: {
      black: 0,
      white: 0,
    },
    ko: null,
    history: [boardToString(emptyBoard)],
  }
}

export function getValidMoves(state: GameState, size: number, player: PlayerColor): { x: number; y: number }[] {
  const moves: { x: number; y: number }[] = []
  
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (isValidMove(state, size, x, y, player)) {
        moves.push({ x, y })
      }
    }
  }
  
  return moves
}

export function isGameOver(state: GameState | number): boolean {
  const consecutivePasses =
    typeof state === "number" ? state : state.consecutivePasses
  return consecutivePasses >= 2
}
