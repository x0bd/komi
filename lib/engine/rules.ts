import type { BoardState, GameState, PlayerColor, Move, Stone } from "./types"
import { getIndex, boardToString } from "./board"
import { findGroup, getCapturedGroups } from "./groups"

const colorToStone: Record<PlayerColor, Stone> = {
  black: 1,
  white: 2,
}

const opponentStone: Record<Stone, Stone> = {
  0: 0,
  1: 2,
  2: 1,
}

export function isValidMove(state: GameState, size: number, x: number, y: number, player: PlayerColor): boolean {
  const index = getIndex(x, y, size)
  
  if (x < 0 || x >= size || y < 0 || y >= size || state.board[index] !== 0) {
    return false
  }

  const stoneColor = colorToStone[player]
  const oppColor = opponentStone[stoneColor]

  const newBoard = [...state.board]
  newBoard[index] = stoneColor

  const capturedOpponentGroups = getCapturedGroups(newBoard, size, oppColor)
  
  let totalCaptured = 0
  for (const group of capturedOpponentGroups) {
    for (const pos of group.stones) {
      newBoard[pos] = 0
      totalCaptured++
    }
  }

  const newGroup = findGroup(newBoard, size, index)
  if (newGroup && newGroup.liberties.size === 0 && totalCaptured === 0) {
    return false // Suicide move
  }

  const newBoardHash = boardToString(newBoard)
  if (state.history.includes(newBoardHash)) {
    return false // Positional superko
  }

  return true
}

export function applyMove(state: GameState, size: number, x: number, y: number, player: PlayerColor): GameState | null {
  if (!isValidMove(state, size, x, y, player)) {
    return null
  }

  const index = getIndex(x, y, size)
  const stoneColor = colorToStone[player]
  const oppColor = opponentStone[stoneColor]

  const newBoard = [...state.board]
  newBoard[index] = stoneColor

  const capturedOpponentGroups = getCapturedGroups(newBoard, size, oppColor)
  
  let capturedCount = 0
  let koPos: number | null = null

  for (const group of capturedOpponentGroups) {
    for (const pos of group.stones) {
      newBoard[pos] = 0
      capturedCount++
    }
  }

  if (capturedCount === 1) {
     koPos = capturedOpponentGroups[0].stones.values().next().value as number
  }

  const nextTurn = player === "black" ? "white" : "black"
  const newCaptured = { ...state.captured }
  if (player === "black") {
    newCaptured.black += capturedCount
  } else {
    newCaptured.white += capturedCount
  }

  const newHistory = [...state.history, boardToString(newBoard)]

  return {
    board: newBoard,
    turn: nextTurn,
    moveNumber: state.moveNumber + 1,
    captured: newCaptured,
    ko: koPos,
    history: newHistory,
  }
}

export function applyPass(state: GameState): GameState {
  const nextTurn = state.turn === "black" ? "white" : "black"
  return {
    ...state,
    turn: nextTurn,
    moveNumber: state.moveNumber + 1,
    ko: null, // Ko implies immediate recapture
  }
}
