import type { GameState, PlayerColor } from "../engine/types"

export type EngineDifficulty = "easy" | "medium" | "hard"
export type EngineSearchBudget = "fast" | "standard" | "deep"

export type EngineMove = {
  x: number
  y: number
  isPass: boolean
}

export type EngineCandidate = {
  x: number
  y: number
  score: number
  captureGain: number
  liberties: number
  confidence: number
  tags: string[]
}

export type EngineRequest = {
  state: GameState
  size: number
  player: PlayerColor
  difficulty?: EngineDifficulty
  searchBudget?: EngineSearchBudget
  maxCandidates?: number
  timeBudgetMs?: number
  withDelay?: boolean
}

export type EngineAnalysis = {
  providerId: string
  difficulty: EngineDifficulty
  recommendedMove: EngineMove
  estimatedWinRate: number
  topMoves: EngineCandidate[]
  summary: string
}

export interface EngineProvider {
  id: string
  label: string
  pickMove: (request: EngineRequest) => Promise<EngineMove>
  analyzePosition: (request: EngineRequest) => Promise<EngineAnalysis>
}
