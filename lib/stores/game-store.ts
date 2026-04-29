import { create } from "zustand"
import type { GameState, Move, PlayerColor } from "../engine/types"
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
  size: 9 | 13 | 19
  komi: number
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
  deadStones: number[]
  scoreReviewConfirmed: boolean
  
  // Actions
  placeStone: (x: number, y: number) => boolean
  passTurn: () => void
  resign: () => void
  toggleDeadStone: (x: number, y: number) => void
  clearDeadStones: () => void
  confirmScoreReview: () => void
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

type LearningActor = "player" | "opponent" | "none"

function getLearningActor(mode: GameMode, player: PlayerColor): LearningActor {
  if (mode === "local") return "player"
  if (mode === "versus-ai") return player === "black" ? "player" : "opponent"
  return "none"
}

function getLearningOutcome(
  mode: GameMode,
  winner: "black" | "white" | "draw" | null,
) {
  if (!winner || winner === "draw") return null
  if (mode === "local") return { type: "player-win" } as const
  if (mode === "versus-ai") {
    return winner === "black"
      ? ({ type: "player-win" } as const)
      : ({ type: "player-loss" } as const)
  }
  return null
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

async function requestTutorMessage(payload: {
  moveNumber: number
  moveCoordinate: string
  isPass: boolean
  analysis: {
    quality: MoveQuality
    winRate: number
    suggestedCoordinate: string | null
    summary: string
    topMoves: Array<{ coordinate: string; reason: string }>
  }
}) {
  const learningStore = useLearningStore.getState()
  if (!learningStore.claimTutorNarrationSlot()) {
    return
  }

  try {
    const apiKey =
      typeof window === "undefined"
        ? ""
        : window.localStorage.getItem("komi_openai_api_key")?.trim() ?? ""

    const response = await fetch("/api/tutor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey: apiKey || undefined,
        moveNumber: payload.moveNumber,
        lastMove: {
          coordinate: payload.moveCoordinate,
          isPass: payload.isPass,
        },
        analysis: {
          quality: payload.analysis.quality,
          winRate: payload.analysis.winRate,
          suggestedCoordinate: payload.analysis.suggestedCoordinate,
          summary: payload.analysis.summary,
          topMoves: payload.analysis.topMoves,
        },
      }),
    })

    if (!response.ok) {
      return
    }

    const json = (await response.json().catch(() => ({}))) as {
      message?: unknown
    }
    if (typeof json.message === "string" && json.message.trim().length > 0) {
      learningStore.addMessage(json.message)
    }
  } catch {
    // Ignore transient network errors for tutor narration.
  }
}

async function registerEngineMoveInsight({
  previousState,
  nextState,
  size,
  player,
  actor,
  aiDifficulty,
  x,
  y,
  coordinate,
}: {
  previousState: GameState
  nextState: GameState
  size: 9 | 13 | 19
  player: GameState["turn"]
  actor: "player" | "opponent"
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
      actor,
      moveCoordinate: coordinate,
      suggestedCoordinate,
      quality,
      winRate: playerPerspectiveWinRate,
      summary: before.summary,
      topMoves,
    })

    void requestTutorMessage({
      moveNumber: nextState.moveNumber,
      moveCoordinate: coordinate,
      isPass: false,
      analysis: {
        quality,
        winRate: playerPerspectiveWinRate,
        suggestedCoordinate,
        summary: before.summary,
        topMoves: topMoves.map((move) => ({
          coordinate: move.coordinate,
          reason: move.reason,
        })),
      },
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
  deadStones: [],
  scoreReviewConfirmed: true,

  placeStone: (x, y) => {
    const { gameState, size, mode, isGameOver, aiDifficulty } = get()
    
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
    const learningActor = getLearningActor(mode, currentPlayer)

    if (learningActor === "player") {
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
    } else if (learningActor === "opponent") {
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

    if (learningActor === "player" && nextState.moveNumber >= 50 && !learningStore.tipFlags.territory) {
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

    if (learningActor === "player") {
      void registerEngineMoveInsight({
        previousState: gameState,
        nextState,
        size,
        player: currentPlayer,
        actor: learningActor,
        aiDifficulty,
        x,
        y,
        coordinate,
      })
    }

    return true
  },

  passTurn: () => {
    const { gameState, size, komi, mode, isGameOver: gameAlreadyOver } = get()
    
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
    const learningActor = getLearningActor(mode, currentPlayer)
    if (gameOver && scoreResult) {
      const outcome = getLearningOutcome(mode, scoreResult.winner)
      if (outcome) {
        learningStore.registerStreakEvent(outcome)
        learningStore.registerTutorEvent(outcome)
      }
    } else {
      if (learningActor === "player") {
        learningStore.registerStreakEvent({ type: "player-pass" })
        learningStore.registerTutorEvent({ type: "player-pass" })
      } else if (learningActor === "opponent") {
        learningStore.registerStreakEvent({ type: "opponent-pass" })
        learningStore.registerTutorEvent({ type: "opponent-pass" })
      }
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
      deadStones: gameOver ? [] : state.deadStones,
      scoreReviewConfirmed: gameOver ? false : state.scoreReviewConfirmed,
    }))
  },

  resign: () => {
    const { isGameOver, gameState, mode } = get()
    if (isGameOver) return
    if (captureClearTimeout) {
      clearTimeout(captureClearTimeout)
      captureClearTimeout = null
    }

    const winner = gameState.turn === "black" ? "white" : "black"
    const learningStore = useLearningStore.getState()
    const learningActor = getLearningActor(mode, gameState.turn)
    const outcome =
      learningActor === "player"
        ? ({ type: "player-loss" } as const)
        : learningActor === "opponent"
          ? ({ type: "player-win" } as const)
          : null

    if (outcome) {
      learningStore.registerStreakEvent(outcome)
      learningStore.registerTutorEvent(outcome)
    }

    set({
      currentPlayer: gameState.turn,
      validMoves: [],
      recentCaptures: [],
      isGameOver: true,
      winner,
      gameOverReason: "resignation",
      liveScore: calculateScore(gameState.board, get().size, gameState.captured, get().komi),
      deadStones: [],
      scoreReviewConfirmed: true,
      scoreResult: {
        winner,
        margin: Infinity,
        black: { territory: 0, captures: 0, stones: 0, total: 0 },
        white: { territory: 0, captures: 0, stones: 0, komi: 0, total: 0 },
        ruleset: "japanese",
        territoryMap: []
      }
    })
  },

  toggleDeadStone: (x, y) => {
    const {
      gameState,
      size,
      komi,
      isGameOver,
      gameOverReason,
      deadStones,
    } = get()

    if (!isGameOver || gameOverReason !== "score") return

    const index = y * size + x
    const stone = gameState.board[index]
    if (stone !== 1 && stone !== 2) return

    const nextDeadStones = deadStones.includes(index)
      ? deadStones.filter((deadStone) => deadStone !== index)
      : [...deadStones, index].sort((a, b) => a - b)
    const scoreResult = calculateScore(
      gameState.board,
      size,
      gameState.captured,
      komi,
      { deadStones: nextDeadStones },
    )

    set({
      deadStones: nextDeadStones,
      scoreResult,
      liveScore: scoreResult,
      winner: scoreResult.winner,
      scoreReviewConfirmed: false,
    })
  },

  clearDeadStones: () => {
    const { gameState, size, komi, isGameOver, gameOverReason } = get()
    if (!isGameOver || gameOverReason !== "score") return

    const scoreResult = calculateScore(
      gameState.board,
      size,
      gameState.captured,
      komi,
    )

    set({
      deadStones: [],
      scoreResult,
      liveScore: scoreResult,
      winner: scoreResult.winner,
      scoreReviewConfirmed: false,
    })
  },

  confirmScoreReview: () => {
    set({ scoreReviewConfirmed: true })
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
      deadStones: [],
      scoreReviewConfirmed: true,
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
    const learningActor = getLearningActor(get().mode, currentPlayer)
    const outcome =
      learningActor === "player"
        ? ({ type: "player-loss" } as const)
        : learningActor === "opponent"
          ? ({ type: "player-win" } as const)
          : null

    if (outcome) {
      learningStore.registerStreakEvent(outcome)
      learningStore.registerTutorEvent(outcome)
    }

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
      deadStones: [],
      scoreReviewConfirmed: true,
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
    const size = snapshot.size
    const komi = snapshot.komi
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
      size,
      komi,
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
      deadStones: [],
      scoreReviewConfirmed: true,
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
