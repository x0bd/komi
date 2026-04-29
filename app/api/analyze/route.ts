import { NextRequest, NextResponse } from "next/server"

import { getActiveEngineProvider } from "@/lib/ai"
import { readJsonBody } from "@/lib/api/request-guards"
import { getApiDbUser } from "@/lib/auth/api"
import type { EngineAnalysis, EngineDifficulty, EngineSearchBudget } from "@/lib/ai/engine-provider"
import { boardToString } from "@/lib/engine/board"
import { createInitialState } from "@/lib/engine/game"
import type { GameState, PlayerColor, Stone } from "@/lib/engine/types"

type AnalyzeRequestBody = {
  size?: unknown
  player?: unknown
  difficulty?: unknown
  searchBudget?: unknown
  maxCandidates?: unknown
  state?: {
    board?: unknown
    turn?: unknown
    moveNumber?: unknown
    consecutivePasses?: unknown
    captured?: {
      black?: unknown
      white?: unknown
    }
    ko?: unknown
    history?: unknown
  }
}

type CacheEntry = {
  expiresAt: number
  analysis: EngineAnalysis
}

const analysisCache = new Map<string, CacheEntry>()
const CACHE_TTL_MS = 30_000
const CACHE_MAX_ENTRIES = 300
const MAX_ANALYZE_PAYLOAD_BYTES = 96_000

function parseSize(value: unknown): 9 | 13 | 19 {
  if (value === 9 || value === 13 || value === 19) {
    return value
  }
  return 19
}

function parsePlayerColor(value: unknown): PlayerColor {
  return value === "white" ? "white" : "black"
}

function parseDifficulty(value: unknown): EngineDifficulty {
  if (value === "easy" || value === "hard") return value
  return "medium"
}

function parseSearchBudget(value: unknown): EngineSearchBudget | undefined {
  if (value === "fast" || value === "standard" || value === "deep") {
    return value
  }
  return undefined
}

function parseInteger(
  value: unknown,
  fallback: number,
  min: number,
  max: number,
) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback
  }
  const next = Math.trunc(value)
  return Math.max(min, Math.min(max, next))
}

function parseBoard(value: unknown, size: number): Stone[] | null {
  if (!Array.isArray(value) || value.length !== size * size) {
    return null
  }

  const board: Stone[] = []
  for (const cell of value) {
    if (cell !== 0 && cell !== 1 && cell !== 2) {
      return null
    }
    board.push(cell)
  }
  return board
}

function normalizeState(size: 9 | 13 | 19, stateInput?: AnalyzeRequestBody["state"]) {
  if (!stateInput) {
    return createInitialState(size)
  }

  const board = parseBoard(stateInput.board, size)
  if (!board) {
    return null
  }

  const turn = parsePlayerColor(stateInput.turn)
  const moveNumber = parseInteger(stateInput.moveNumber, 0, 0, 10_000)
  const consecutivePasses = parseInteger(stateInput.consecutivePasses, 0, 0, 2)
  const capturedBlack = parseInteger(stateInput.captured?.black, 0, 0, 500)
  const capturedWhite = parseInteger(stateInput.captured?.white, 0, 0, 500)

  let ko: number | null = null
  if (typeof stateInput.ko === "number" && Number.isInteger(stateInput.ko)) {
    ko = stateInput.ko >= 0 && stateInput.ko < size * size ? stateInput.ko : null
  }

  const history =
    Array.isArray(stateInput.history) && stateInput.history.every((entry) => typeof entry === "string")
      ? stateInput.history.slice(-250)
      : [boardToString(board)]

  const state: GameState = {
    board,
    turn,
    moveNumber,
    consecutivePasses,
    captured: {
      black: capturedBlack,
      white: capturedWhite,
    },
    ko,
    history,
  }

  return state
}

function buildCacheKey({
  size,
  player,
  difficulty,
  searchBudget,
  maxCandidates,
  state,
}: {
  size: 9 | 13 | 19
  player: PlayerColor
  difficulty: EngineDifficulty
  searchBudget?: EngineSearchBudget
  maxCandidates: number
  state: GameState
}) {
  return [
    size,
    player,
    difficulty,
    searchBudget ?? "default",
    maxCandidates,
    state.turn,
    state.moveNumber,
    state.consecutivePasses,
    state.captured.black,
    state.captured.white,
    state.ko ?? -1,
    boardToString(state.board),
    state.history.join("|"),
  ].join(":")
}

function getCachedAnalysis(key: string) {
  const cached = analysisCache.get(key)
  if (!cached) {
    return null
  }

  if (cached.expiresAt <= Date.now()) {
    analysisCache.delete(key)
    return null
  }

  return cached.analysis
}

function setCachedAnalysis(key: string, analysis: EngineAnalysis) {
  if (analysisCache.size >= CACHE_MAX_ENTRIES) {
    const firstKey = analysisCache.keys().next().value
    if (firstKey) {
      analysisCache.delete(firstKey)
    }
  }

  analysisCache.set(key, {
    analysis,
    expiresAt: Date.now() + CACHE_TTL_MS,
  })
}

export async function POST(request: NextRequest) {
  const user = await getApiDbUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const parsedBody = await readJsonBody<AnalyzeRequestBody>(
    request,
    MAX_ANALYZE_PAYLOAD_BYTES,
  )
  if (!parsedBody.ok) {
    return NextResponse.json(
      { error: parsedBody.error },
      { status: parsedBody.status },
    )
  }

  const body = parsedBody.body

  const size = parseSize(body.size)
  const player = parsePlayerColor(body.player)
  const difficulty = parseDifficulty(body.difficulty)
  const searchBudget = parseSearchBudget(body.searchBudget)
  const maxCandidates = parseInteger(body.maxCandidates, 5, 1, 10)

  const state = normalizeState(size, body.state)
  if (!state) {
    return NextResponse.json(
      { error: "Invalid state payload. Ensure board has size*size cells with values 0/1/2." },
      { status: 400 },
    )
  }

  const cacheKey = buildCacheKey({
    size,
    player,
    difficulty,
    searchBudget,
    maxCandidates,
    state,
  })

  const cached = getCachedAnalysis(cacheKey)
  if (cached) {
    return NextResponse.json({ analysis: cached, cached: true })
  }

  const analysis = await getActiveEngineProvider().analyzePosition({
    state,
    size,
    player,
    difficulty,
    searchBudget,
    maxCandidates,
    withDelay: false,
  })

  setCachedAnalysis(cacheKey, analysis)

  return NextResponse.json({ analysis, cached: false })
}
