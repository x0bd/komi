import { create } from "zustand"
import type { GameState, Move } from "../engine/types"
import { createInitialState, getValidMoves, isGameOver } from "../engine/game"
import { applyMove, applyPass } from "../engine/rules"
import { calculateScore, type ScoreResult } from "../engine/scoring"
import { gameToSGF } from "../engine/sgf"
import { useLearningStore } from "./learning-store"
import type { StoneColor } from "@/components/game/stone"
import { getActiveEngineProvider } from "../ai"
import type { EngineDifficulty, EngineSearchBudget } from "../ai/engine-provider"

export type GameMode = "local" | "versus-ai" | "online"
export type AIDifficulty = "easy" | "medium" | "hard"

export type MultiplayerSnapshot = {
  board: number[]
  turn: GameState["turn"]
  moveNumber: number
  consecutivePasses: number
  captured: {
    black: number
    white: number
  }
  ko: number | null
  history: string[]
  moveHistory: Move[]
  timers: {
    black: number
    white: number
  }
  isGameOver: boolean
  winner: "black" | "white" | "draw" | null
  gameOverReason: "score" | "resignation" | "timeout" | null
}
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
  aiDifficulty: AIDifficulty
  analysisOverlayEnabled: boolean
  
  // State
  gameState: GameState
  moveHistory: Move[]
  consecutivePasses: number
  currentPlayer: GameState["turn"]
  validMoves: Array<{ x: number; y: number }>
  recentCaptures: Array<{ x: number; y: number; color: StoneColor; key: string }>
  timers: {
    black: number
    white: number
  }
  liveScore: ScoreResult
  isGameOver: boolean
  winner: "black" | "white" | "draw" | null
  gameOverReason: "score" | "resignation" | "timeout" | null
  scoreResult: ScoreResult | null
  
  // Actions
  placeStone: (x: number, y: number) => boolean
  passTurn: () => void
  resign: () => void
  setMode: (mode: GameMode) => void
  setAIDifficulty: (difficulty: AIDifficulty) => void
  setAnalysisOverlayEnabled: (enabled: boolean) => void
  resetGame: (size?: 9|13|19, komi?: number) => void
  tickActiveTimer: (elapsedSeconds?: number) => void
  hydrateFromMultiplayer: (snapshot: MultiplayerSnapshot) => void
  
  // Derived / Utility
  exportSGF: () => string
}

function deriveValidMoves(state: GameState, size: 9 | 13 | 19) {
  return getValidMoves(state, size, state.turn)
}

const initialState = createInitialState(19)
const DEFAULT_TIME_SECONDS = 15 * 60
const INITIAL_SCORE = calculateScore(
  initialState.board,
  19,
  initialState.captured,
  6.5,
)
let captureClearTimeout: ReturnType<typeof setTimeout> | null = null

function deriveCapturedStones(
  previousBoard: GameState["board"],
  nextBoard: GameState["board"],
  size: 9 | 13 | 19,
  moveNumber: number
) {
  const captures: Array<{ x: number; y: number; color: StoneColor; key: string }> = []

  for (let index = 0; index < previousBoard.length; index++) {
    if (previousBoard[index] !== 0 && nextBoard[index] === 0) {
      const x = index % size
      const y = Math.floor(index / size)
      captures.push({
        x,
        y,
        color: previousBoard[index] === 1 ? "black" : "white",
        key: `capture-${moveNumber}-${index}`,
      })
    }
  }

  return captures
}

type MoveQuality = "best" | "strong" | "ok" | "mistake"

function classifyMoveQuality(deltaFromBest: number): MoveQuality {
  if (deltaFromBest <= 1.5) return "best"
  if (deltaFromBest <= 6) return "strong"
  if (deltaFromBest <= 14) return "ok"
  return "mistake"
}

function mapDifficultyToEngine(difficulty: AIDifficulty): EngineDifficulty {
  return difficulty
}

function mapDifficultyToSearchBudget(
  difficulty: AIDifficulty,
): EngineSearchBudget {
  if (difficulty === "hard") return "deep"
  if (difficulty === "medium") return "standard"
  return "fast"
}

function getCandidateReason(candidate: {
  captureGain: number
  liberties: number
  tags: string[]
}) {
  if (candidate.captureGain >= 2) return "multi-stone capture"
  if (candidate.captureGain === 1) return "clean capture"
  if (candidate.tags.includes("stable-shape")) return "solid shape"
  if (candidate.tags.includes("atari-risk")) return "thin but forcing"
  if (candidate.liberties >= 5) return "safe liberties"
  if (candidate.liberties <= 2) return "urgent liberties"
  return "pressure point"
}

async function registerEngineMoveInsight({
  previousState,
  nextState,
  size,
  player,
  aiDifficulty,
  x,
  y,
  coordinate,
}: {
  previousState: GameState
  nextState: GameState
  size: 9 | 13 | 19
  player: GameState["turn"]
  aiDifficulty: AIDifficulty
  x: number
  y: number
  coordinate: string
}) {
  try {
    const provider = getActiveEngineProvider()
    const difficulty = mapDifficultyToEngine(aiDifficulty)
    const searchBudget = mapDifficultyToSearchBudget(aiDifficulty)

    const [before, after] = await Promise.all([
      provider.analyzePosition({
        state: previousState,
        size,
        player,
        difficulty,
        searchBudget,
        maxCandidates: 12,
        withDelay: false,
      }),
      provider.analyzePosition({
        state: nextState,
        size,
        player,
        difficulty,
        searchBudget,
        maxCandidates: 5,
        withDelay: false,
      }),
    ])

    const best = before.topMoves[0]
    const played = before.topMoves.find((move) => move.x === x && move.y === y)

    if (!best) {
      return
    }

    const estimatedPlayedScore = played?.score ?? best.score - 16
    const deltaFromBest = Math.max(0, best.score - estimatedPlayedScore)
    const quality = classifyMoveQuality(deltaFromBest)
    const playerPerspectiveWinRate =
      player === "black" ? after.estimatedWinRate : 1 - after.estimatedWinRate

    const suggestedCoordinate =
      quality === "best" || (best.x === x && best.y === y)
        ? null
        : toCoordinate(best.x, best.y, size)
    const topMoves = before.topMoves.slice(0, 3).map((move) => ({
      coordinate: toCoordinate(move.x, move.y, size),
      confidence: Math.round(move.confidence * 100),
      score: Number(move.score.toFixed(1)),
      reason: getCandidateReason(move),
      tags: [...move.tags.slice(0, 2)],
    }))

    useLearningStore.getState().registerTutorEvent({
      type: "analysis",
      actor: player === "black" ? "player" : "opponent",
      moveCoordinate: coordinate,
      suggestedCoordinate,
      quality,
      winRate: playerPerspectiveWinRate,
      summary: before.summary,
      topMoves,
    })
  } catch {
    // Tutor analysis is non-blocking; ignore transient analysis failures.
  }
}

export const useGameStore = create<KomiStore>((set, get) => ({
  size: 19,
  komi: 6.5,
  mode: "local",
  aiDifficulty: "easy",
  analysisOverlayEnabled: false,
  
  gameState: initialState,
  moveHistory: [],
  consecutivePasses: 0,
  currentPlayer: initialState.turn,
  validMoves: deriveValidMoves(initialState, 19),
  recentCaptures: [],
  timers: {
    black: DEFAULT_TIME_SECONDS,
    white: DEFAULT_TIME_SECONDS,
  },
  liveScore: INITIAL_SCORE,
  isGameOver: false,
  winner: null,
  gameOverReason: null,
  scoreResult: null,

  placeStone: (x, y) => {
    const { gameState, size, isGameOver, aiDifficulty } = get()
    
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
      if (capturedCount > 0 && !learningStore.tipFlags.firstCapture) {
        learningStore.requestTip("How to capture")
        learningStore.markTipShown("firstCapture")
      }
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

    if (nextState.moveNumber >= 50 && !learningStore.tipFlags.territory) {
      learningStore.requestTip("Territory")
      learningStore.markTipShown("territory")
    }

    const move: Move = { x, y, player: currentPlayer, isPass: false }
    const recentCaptures = deriveCapturedStones(
      gameState.board,
      nextState.board,
      size,
      nextState.moveNumber,
    )

    set((state) => ({
      gameState: nextState,
      moveHistory: [...state.moveHistory, move],
      consecutivePasses: nextState.consecutivePasses,
      currentPlayer: nextState.turn,
      validMoves: deriveValidMoves(nextState, size),
      recentCaptures,
      liveScore: calculateScore(nextState.board, size, nextState.captured, get().komi),
    }))

    if (captureClearTimeout) {
      clearTimeout(captureClearTimeout)
      captureClearTimeout = null
    }
    if (recentCaptures.length > 0) {
      captureClearTimeout = setTimeout(() => {
        useGameStore.setState({ recentCaptures: [] })
        captureClearTimeout = null
      }, 260)
    }

    void registerEngineMoveInsight({
      previousState: gameState,
      nextState,
      size,
      player: currentPlayer,
      aiDifficulty,
      x,
      y,
      coordinate,
    })

    return true
  },

  passTurn: () => {
    const { gameState, size, komi, isGameOver: gameAlreadyOver } = get()
    
    if (gameAlreadyOver) return

    const currentPlayer = gameState.turn
    const nextState = applyPass(gameState)
    const move: Move = { x: -1, y: -1, player: currentPlayer, isPass: true }
    
    const nextPasses = nextState.consecutivePasses
    const gameOver = isGameOver(nextState)
    
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
      currentPlayer: nextState.turn,
      validMoves: gameOver ? [] : deriveValidMoves(nextState, size),
      recentCaptures: [],
      liveScore: calculateScore(nextState.board, size, nextState.captured, komi),
      isGameOver: gameOver,
      winner: gameOver && scoreResult ? scoreResult.winner : null,
      gameOverReason: gameOver ? "score" : null,
      scoreResult,
    }))
  },

  resign: () => {
    const { isGameOver, gameState } = get()
    if (isGameOver) return
    if (captureClearTimeout) {
      clearTimeout(captureClearTimeout)
      captureClearTimeout = null
    }

    const learningStore = useLearningStore.getState()
    learningStore.registerStreakEvent(gameState.turn === "black" ? { type: "player-loss" } : { type: "player-win" })
    learningStore.registerTutorEvent(gameState.turn === "black" ? { type: "player-loss" } : { type: "player-win" })

    set({
      currentPlayer: gameState.turn === "black" ? "white" : "black",
      validMoves: [],
      recentCaptures: [],
      isGameOver: true,
      winner: gameState.turn === "black" ? "white" : "black",
      gameOverReason: "resignation",
      liveScore: calculateScore(gameState.board, get().size, gameState.captured, get().komi),
      scoreResult: {
        winner: gameState.turn === "black" ? "white" : "black", // Current turn player resigns
        margin: Infinity,
        black: { territory: 0, captures: 0, stones: 0, total: 0 },
        white: { territory: 0, captures: 0, stones: 0, komi: 0, total: 0 },
        ruleset: "japanese",
        territoryMap: []
      }
    })
  },

  setMode: (mode) => {
    set({ mode })
    get().resetGame() // Changing mode resets the game for now
  },

  setAIDifficulty: (aiDifficulty) => {
    set({ aiDifficulty })
  },

  setAnalysisOverlayEnabled: (analysisOverlayEnabled) => {
    set({ analysisOverlayEnabled })
  },

  resetGame: (newSize, newKomi) => {
    const size = newSize ?? get().size
    const komi = newKomi ?? get().komi
    const nextState = createInitialState(size)
    if (captureClearTimeout) {
      clearTimeout(captureClearTimeout)
      captureClearTimeout = null
    }

    const learningStore = useLearningStore.getState()
    learningStore.resetLiveStreak()
    learningStore.registerTutorEvent({ type: "reset" })

    const refreshedLearningStore = useLearningStore.getState()
    if (!refreshedLearningStore.tipFlags.opening) {
      refreshedLearningStore.requestTip("Opening tips")
      refreshedLearningStore.markTipShown("opening")
    }
    
    set({
      size,
      komi,
      gameState: nextState,
      moveHistory: [],
      consecutivePasses: 0,
      currentPlayer: nextState.turn,
      validMoves: deriveValidMoves(nextState, size),
      recentCaptures: [],
      timers: {
        black: DEFAULT_TIME_SECONDS,
        white: DEFAULT_TIME_SECONDS,
      },
      liveScore: calculateScore(nextState.board, size, nextState.captured, komi),
      isGameOver: false,
      winner: null,
      gameOverReason: null,
      scoreResult: null,
    })
  },

  tickActiveTimer: (elapsedSeconds = 1) => {
    const {
      currentPlayer,
      isGameOver,
      timers,
      gameState,
    } = get()

    if (isGameOver || elapsedSeconds <= 0) return

    const nextTime = Math.max(0, timers[currentPlayer] - elapsedSeconds)
    if (nextTime > 0) {
      set({
        timers: {
          ...timers,
          [currentPlayer]: nextTime,
        },
      })
      return
    }

    const winner = currentPlayer === "black" ? "white" : "black"
    const learningStore = useLearningStore.getState()
    learningStore.registerStreakEvent(
      currentPlayer === "black"
        ? { type: "player-loss" }
        : { type: "player-win" }
    )
    learningStore.registerTutorEvent(
      currentPlayer === "black"
        ? { type: "player-loss" }
        : { type: "player-win" }
    )

    set({
      timers: {
        ...timers,
        [currentPlayer]: 0,
      },
      validMoves: [],
      recentCaptures: [],
      isGameOver: true,
      winner,
      currentPlayer: gameState.turn,
      gameOverReason: "timeout",
      liveScore: calculateScore(gameState.board, get().size, gameState.captured, get().komi),
      scoreResult: {
        winner,
        margin: Infinity,
        black: {
          territory: 0,
          captures: gameState.captured.black,
          stones: 0,
          total: 0,
        },
        white: {
          territory: 0,
          captures: gameState.captured.white,
          stones: 0,
          komi: 0,
          total: 0,
        },
        ruleset: "japanese",
        territoryMap: [],
      },
    })
  },

  hydrateFromMultiplayer: (snapshot) => {
    const size = get().size
    const komi = get().komi
    const nextGameState: GameState = {
      board: [...snapshot.board] as GameState["board"],
      turn: snapshot.turn,
      moveNumber: snapshot.moveNumber,
      consecutivePasses: snapshot.consecutivePasses,
      captured: {
        black: snapshot.captured.black,
        white: snapshot.captured.white,
      },
      ko: snapshot.ko,
      history: [...snapshot.history],
    }

    const liveScore = calculateScore(
      nextGameState.board,
      size,
      nextGameState.captured,
      komi,
    )

    let scoreResult: ScoreResult | null = null
    if (snapshot.isGameOver) {
      if (snapshot.gameOverReason === "score") {
        scoreResult = liveScore
      } else if (snapshot.winner) {
        scoreResult = {
          winner: snapshot.winner,
          margin: Infinity,
          black: {
            territory: 0,
            captures: nextGameState.captured.black,
            stones: 0,
            total: 0,
          },
          white: {
            territory: 0,
            captures: nextGameState.captured.white,
            stones: 0,
            komi: 0,
            total: 0,
          },
          ruleset: "japanese",
          territoryMap: [],
        }
      }
    }

    set({
      gameState: nextGameState,
      moveHistory: [...snapshot.moveHistory],
      consecutivePasses: snapshot.consecutivePasses,
      currentPlayer: snapshot.turn,
      validMoves: snapshot.isGameOver ? [] : deriveValidMoves(nextGameState, size),
      recentCaptures: [],
      timers: {
        black: snapshot.timers.black,
        white: snapshot.timers.white,
      },
      liveScore,
      isGameOver: snapshot.isGameOver,
      winner: snapshot.winner,
      gameOverReason: snapshot.gameOverReason,
      scoreResult,
    })
  },

  exportSGF: () => {
    const { moveHistory, size, komi, scoreResult, gameOverReason } = get()
    const result =
      !scoreResult
        ? undefined
        : scoreResult.winner === "draw"
          ? "Draw"
          : `${scoreResult.winner === "black" ? "B" : "W"}+${
              scoreResult.margin === Infinity
                ? gameOverReason === "timeout"
                  ? "Time"
                  : "Resign"
                : scoreResult.margin
            }`

    return gameToSGF(moveHistory, {
      size,
      komi,
      result,
    })
  }
}))
