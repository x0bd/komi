import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth/session"
import type { Move } from "@/lib/engine/types"

const AI_EMAIL = "sensei-ai@komi.local"
const AI_NAME = "Sensei AI"

type SaveGamePayload = {
  mode?: "local" | "versus-ai" | "online"
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
  myColor,
}: {
  result: string | null
  myColor: "black" | "white"
}): "win" | "loss" | "draw" | "pending" {
  const winner = normalizeWinner(result)
  if (!winner) return "pending"
  if (winner === "draw") return "draw"
  return winner === myColor ? "win" : "loss"
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

async function getOrCreateDbUserFromSession() {
  const session = await getSession()
  const authUser = session?.user as
    | { id?: string; email?: string | null; name?: string | null; image?: string | null }
    | undefined

  if (!authUser?.id || !authUser.email) {
    return null
  }

  return db.user.upsert({
    where: { email: authUser.email },
    update: {
      name: authUser.name ?? undefined,
      avatar: authUser.image ?? undefined,
    },
    create: {
      email: authUser.email,
      name: authUser.name ?? undefined,
      avatar: authUser.image ?? undefined,
    },
  })
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

export async function POST(request: Request) {
  const user = await getOrCreateDbUserFromSession()
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
  const moves = coerceMoves(body.moves)
  const result = typeof body.result === "string" ? body.result.slice(0, 64) : null
  const sgf = typeof body.sgf === "string" ? body.sgf : null

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

  const game = await db.game.create({
    data: {
      blackPlayerId,
      whitePlayerId,
      result,
      sgf,
      endedAt: new Date(),
      moves: {
        create: moves.map((move, index) => ({
          moveNumber: index + 1,
          player: move.player,
          x: move.isPass ? null : move.x,
          y: move.isPass ? null : move.y,
          isPass: move.isPass,
        })),
      },
    },
    select: { id: true },
  })

  return NextResponse.json({ id: game.id })
}

export async function GET(request: NextRequest) {
  const user = await getOrCreateDbUserFromSession()
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
      const opponent = myColor === "black" ? game.whitePlayer : game.blackPlayer
      const opponentLabel = opponent.name?.trim() || opponent.email
      const outcome = getOutcomeForUser({
        result: game.result,
        myColor,
      })

      return {
        id: game.id,
        startedAt: game.startedAt,
        endedAt: game.endedAt,
        result: game.result,
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
