import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getApiDbUser } from "@/lib/auth/api"
import type { Move } from "@/lib/engine/types"
import { sgfToGame } from "@/lib/engine/sgf"

const AI_EMAIL = "sensei-ai@komi.local"
const AI_NAME = "Sensei AI"

type SaveGamePayload = {
  mode?: "local" | "versus-ai" | "online"
  boardSize?: number
  komi?: number
  ruleset?: string
  winner?: "black" | "white" | "draw" | null
  resultReason?: "score" | "resignation" | "timeout" | null
  moves?: Move[]
  result?: string | null
  sgf?: string | null
}

type ListResultFilter = "all" | "win" | "loss" | "draw"

function normalizeWinner(result: string | null) {
  if (!result) return null
  const value = result.toLowerCase().trim()
  if (value.includes("draw")) return "draw" as const
  if (value.startsWith("b+") || value.includes("black")) return "black" as const
  if (value.startsWith("w+") || value.includes("white")) return "white" as const
  return null
}

function getOutcomeForUser({
  result,
  winner,
  myColor,
  isSelfPlay,
}: {
  result: string | null
  winner?: "black" | "white" | "draw" | null
  myColor: "black" | "white"
  isSelfPlay?: boolean
}): "win" | "loss" | "draw" | "pending" {
  if (isSelfPlay) return "pending"
  const normalizedWinner = winner ?? normalizeWinner(result)
  if (!normalizedWinner) return "pending"
  if (normalizedWinner === "draw") return "draw"
  return normalizedWinner === myColor ? "win" : "loss"
}

function parseDateParam(value: string | null, endOfDay = false) {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  if (endOfDay) {
    parsed.setHours(23, 59, 59, 999)
  } else {
    parsed.setHours(0, 0, 0, 0)
  }
  return parsed
}

function clampInteger(value: string | null, fallback: number, min: number, max: number) {
  if (!value) return fallback
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed)) return fallback
  return Math.max(min, Math.min(max, parsed))
}

function coerceMoves(moves: unknown): Move[] {
  if (!Array.isArray(moves)) return []

  return moves
    .filter((move): move is Move => {
      if (!move || typeof move !== "object") return false
      const candidate = move as Partial<Move>
      return (
        (candidate.player === "black" || candidate.player === "white") &&
        typeof candidate.isPass === "boolean" &&
        typeof candidate.x === "number" &&
        typeof candidate.y === "number"
      )
    })
    .map((move) => ({
      x: move.x,
      y: move.y,
      player: move.player,
      isPass: move.isPass,
    }))
}

function coerceBoardSize(value: unknown, sgf: string | null): 9 | 13 | 19 {
  if (value === 9 || value === 13 || value === 19) return value
  if (sgf) {
    try {
      const parsedSize = sgfToGame(sgf).metadata.size
      if (parsedSize === 9 || parsedSize === 13 || parsedSize === 19) {
        return parsedSize
      }
    } catch {
      return 19
    }
  }
  return 19
}

function coerceKomi(value: unknown, sgf: string | null) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.min(20, value))
  }
  if (sgf) {
    try {
      const parsedKomi = sgfToGame(sgf).metadata.komi
      if (Number.isFinite(parsedKomi)) {
        return parsedKomi
      }
    } catch {
      return 6.5
    }
  }
  return 6.5
}

function coerceWinner(
  value: unknown,
  result: string | null,
): "black" | "white" | "draw" | null {
  if (value === "black" || value === "white" || value === "draw") return value
  return normalizeWinner(result)
}

function coerceResultReason(
  value: unknown,
  result: string | null,
): "score" | "resignation" | "timeout" | null {
  if (value === "score" || value === "resignation" || value === "timeout") {
    return value
  }
  const normalized = result?.toLowerCase().trim() ?? ""
  if (!normalized) return null
  if (normalized.includes("resign")) return "resignation"
  if (normalized.includes("time")) return "timeout"
  return "score"
}

export async function POST(request: NextRequest) {
  const user = await getApiDbUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: SaveGamePayload
  try {
    body = (await request.json()) as SaveGamePayload
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 })
  }

  const mode =
    body.mode === "versus-ai" || body.mode === "online" ? body.mode : "local"

  if (mode === "local") {
    return NextResponse.json({
      skipped: true,
      reason: "Local casual games are not persisted.",
    })
  }

  const moves = coerceMoves(body.moves)
  const result = typeof body.result === "string" ? body.result.slice(0, 64) : null
  const sgf = typeof body.sgf === "string" ? body.sgf : null
  const boardSize = coerceBoardSize(body.boardSize, sgf)
  const komi = coerceKomi(body.komi, sgf)
  const ruleset =
    typeof body.ruleset === "string" && body.ruleset.trim().length > 0
      ? body.ruleset.trim().slice(0, 32)
      : "japanese"
  const winner = coerceWinner(body.winner, result)
  const resultReason = coerceResultReason(body.resultReason, result)

  let blackPlayerId = user.id
  let whitePlayerId = user.id

  if (mode === "versus-ai") {
    const aiUser = await db.user.upsert({
      where: { email: AI_EMAIL },
      update: { name: AI_NAME },
      create: {
        email: AI_EMAIL,
        name: AI_NAME,
        rating: 1500,
      },
    })
    whitePlayerId = aiUser.id
  }

  const moveCreates = moves.map((move, index) => ({
    moveNumber: index + 1,
    player: move.player,
    x: move.isPass ? null : move.x,
    y: move.isPass ? null : move.y,
    isPass: move.isPass,
  }))

  let game: { id: string }
  try {
    game = await db.game.create({
      data: {
        blackPlayerId,
        whitePlayerId,
        ownerId: user.id,
        mode,
        boardSize,
        komi,
        ruleset,
        result,
        resultReason,
        winner,
        sgf,
        endedAt: new Date(),
        moves: {
          create: moveCreates,
        },
      },
      select: { id: true },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : ""
    if (
      !message.includes("Unknown argument") &&
      !message.includes("Unknown field")
    ) {
      throw error
    }

    game = await db.game.create({
      data: {
        blackPlayerId,
        whitePlayerId,
        result,
        sgf,
        endedAt: new Date(),
        moves: {
          create: moveCreates,
        },
      },
      select: { id: true },
    })
  }

  return NextResponse.json({ id: game.id })
}

export async function GET(request: NextRequest) {
  const user = await getApiDbUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const resultFilterRaw = request.nextUrl.searchParams.get("result")
  const resultFilter: ListResultFilter =
    resultFilterRaw === "win" ||
    resultFilterRaw === "loss" ||
    resultFilterRaw === "draw"
      ? resultFilterRaw
      : "all"
  const opponentFilter = request.nextUrl.searchParams.get("opponent")?.trim().toLowerCase() ?? ""
  const from = parseDateParam(request.nextUrl.searchParams.get("from"))
  const to = parseDateParam(request.nextUrl.searchParams.get("to"), true)
  const limit = clampInteger(
    request.nextUrl.searchParams.get("limit"),
    60,
    10,
    200,
  )

  const games = await db.game.findMany({
    where: {
      OR: [{ blackPlayerId: user.id }, { whitePlayerId: user.id }],
      ...(from || to
        ? {
            startedAt: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
    },
    include: {
      blackPlayer: {
        select: { id: true, name: true, email: true },
      },
      whitePlayer: {
        select: { id: true, name: true, email: true },
      },
      _count: {
        select: { moves: true },
      },
    },
    orderBy: {
      startedAt: "desc",
    },
    take: limit,
  })

  const filteredGames = games
    .map((game) => {
      const myColor = game.blackPlayerId === user.id ? "black" : "white"
      const isSelfPlay = game.blackPlayerId === game.whitePlayerId
      const opponent = myColor === "black" ? game.whitePlayer : game.blackPlayer
      const opponentLabel = opponent.name?.trim() || opponent.email
      const outcome = getOutcomeForUser({
        result: game.result,
        winner:
          game.winner === "black" || game.winner === "white" || game.winner === "draw"
            ? game.winner
            : null,
        myColor,
        isSelfPlay,
      })

      return {
        id: game.id,
        startedAt: game.startedAt,
        endedAt: game.endedAt,
        mode: game.mode,
        boardSize: game.boardSize,
        result: game.result,
        resultReason: game.resultReason,
        winner: game.winner,
        outcome,
        myColor,
        opponent: {
          id: opponent.id,
          name: opponent.name,
          email: opponent.email,
          label: opponentLabel,
        },
        moveCount: game._count.moves,
      }
    })
    .filter((game) => {
      if (resultFilter !== "all" && game.outcome !== resultFilter) {
        return false
      }
      if (!opponentFilter) {
        return true
      }
      const haystack = `${game.opponent.label} ${game.opponent.email}`.toLowerCase()
      return haystack.includes(opponentFilter)
    })

  return NextResponse.json({
    games: filteredGames,
  })
}
