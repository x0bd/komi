import { create } from "zustand"
import type { GameState, Move } from "../engine/types"
import { createInitialState } from "../engine/game"
import { applyMove, applyPass } from "../engine/rules"
import { calculateScore, type ScoreResult } from "../engine/scoring"
import { gameToSGF } from "../engine/sgf"
import { useLearningStore } from "./learning-store"

export type GameMode = "local" | "versus-ai" | "online"
const LETTERS = "ABCDEFGHJKLMNOPQRST"

function toCoordinate(x: number, y: number, size: number) {
  const col = LETTERS[x] ?? "?"
  const row = size - y
  return `${col}${row}`
}

interface KomiStore {
  // Config
  size: 9 | 13 | 19
  komi: number
  mode: GameMode
  
  // State
  gameState: GameState
  moveHistory: Move[]
  consecutivePasses: number
  isGameOver: boolean
  scoreResult: ScoreResult | null
  
  // Actions
  placeStone: (x: number, y: number) => boolean
  passTurn: () => void
  resign: () => void
  setMode: (mode: GameMode) => void
  resetGame: (size?: 9|13|19, komi?: number) => void
  
  // Derived / Utility
  exportSGF: () => string
}

export const useGameStore = create<KomiStore>((set, get) => ({
  size: 19,
  komi: 6.5,
  mode: "local",
  
  gameState: createInitialState(19),
  moveHistory: [],
  consecutivePasses: 0,
  isGameOver: false,
  scoreResult: null,

  placeStone: (x, y) => {
    const { gameState, size, isGameOver } = get()
    
    if (isGameOver) return false

    const currentPlayer = gameState.turn
    const nextState = applyMove(gameState, size, x, y, currentPlayer)
    
    if (!nextState) return false // Invalid move
    
    // Distribute XP base
    let xpGained = 10
    
    // Check if captures actually occurred using tracking
    const previousCaptures = currentPlayer === "black" ? gameState.captured.black : gameState.captured.white
    const currentCaptures = currentPlayer === "black" ? nextState.captured.black : nextState.captured.white
    const capturedCount = currentCaptures - previousCaptures
    
    if (capturedCount > 0) {
      xpGained += capturedCount * 50 // Huge XP for capturing!
    }

    const learningStore = useLearningStore.getState()
    const coordinate = toCoordinate(x, y, size)

    if (currentPlayer === "black") { // Assuming player is black initially
      learningStore.addXP(xpGained)
      learningStore.registerStreakEvent(
        capturedCount > 0
          ? { type: "player-capture", count: capturedCount }
          : { type: "player-stone" }
      )
      learningStore.registerTutorEvent(
        capturedCount > 0
          ? { type: "player-capture", count: capturedCount, coordinate }
          : { type: "player-stone", coordinate }
      )
    } else {
      learningStore.registerStreakEvent(
        capturedCount > 0
          ? { type: "opponent-capture", count: capturedCount }
          : { type: "opponent-stone" }
      )
      learningStore.registerTutorEvent(
        capturedCount > 0
          ? { type: "opponent-capture", count: capturedCount, coordinate }
          : { type: "opponent-stone", coordinate }
      )
    }

    const move: Move = { x, y, player: currentPlayer, isPass: false }

    set((state) => ({
      gameState: nextState,
      moveHistory: [...state.moveHistory, move],
      consecutivePasses: 0, // Reset passes since a stone was placed
    }))

    return true
  },

  passTurn: () => {
    const { gameState, size, komi, consecutivePasses, isGameOver } = get()
    
    if (isGameOver) return

    const currentPlayer = gameState.turn
    const nextState = applyPass(gameState)
    const move: Move = { x: -1, y: -1, player: currentPlayer, isPass: true }
    
    const nextPasses = consecutivePasses + 1
    const gameOver = nextPasses >= 2
    
    let scoreResult = null
    if (gameOver) {
       scoreResult = calculateScore(nextState.board, size, nextState.captured, komi)
    }

    const learningStore = useLearningStore.getState()
    if (gameOver && scoreResult) {
      learningStore.registerStreakEvent(
        scoreResult.winner === "black"
          ? { type: "player-win" }
          : { type: "player-loss" }
      )
      learningStore.registerTutorEvent(
        scoreResult.winner === "black"
          ? { type: "player-win" }
          : { type: "player-loss" }
      )
    } else {
      learningStore.registerStreakEvent(
        currentPlayer === "black"
          ? { type: "player-pass" }
          : { type: "opponent-pass" }
      )
      learningStore.registerTutorEvent(
        currentPlayer === "black"
          ? { type: "player-pass" }
          : { type: "opponent-pass" }
      )
    }

    set((state) => ({
      gameState: nextState,
      moveHistory: [...state.moveHistory, move],
      consecutivePasses: nextPasses,
      isGameOver: gameOver,
      scoreResult,
    }))
  },

  resign: () => {
    const { isGameOver, gameState } = get()
    if (isGameOver) return

    const learningStore = useLearningStore.getState()
    learningStore.registerStreakEvent(gameState.turn === "black" ? { type: "player-loss" } : { type: "player-win" })
    learningStore.registerTutorEvent(gameState.turn === "black" ? { type: "player-loss" } : { type: "player-win" })

    set({
      isGameOver: true,
      scoreResult: {
        winner: gameState.turn === "black" ? "white" : "black", // Current turn player resigns
        margin: Infinity,
        black: { territory: 0, captures: 0, total: 0 },
        white: { territory: 0, captures: 0, komi: 0, total: 0 },
        territoryMap: []
      }
    })
  },

  setMode: (mode) => {
    set({ mode })
    get().resetGame() // Changing mode resets the game for now
  },

  resetGame: (newSize, newKomi) => {
    const size = newSize ?? get().size
    const komi = newKomi ?? get().komi

    useLearningStore.getState().resetLiveStreak()
    useLearningStore.getState().registerTutorEvent({ type: "reset" })
    
    set({
      size,
      komi,
      gameState: createInitialState(size),
      moveHistory: [],
      consecutivePasses: 0,
      isGameOver: false,
      scoreResult: null,
    })
  },

  exportSGF: () => {
    const { moveHistory, size, komi, scoreResult } = get()
    return gameToSGF(moveHistory, {
      size,
      komi,
      result: scoreResult ? `${scoreResult.winner === "black" ? "B" : "W"}+${scoreResult.margin === Infinity ? "Resign" : scoreResult.margin}` : undefined,
    })
  }
}))
