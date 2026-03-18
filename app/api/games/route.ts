import { NextResponse } from "next/server"
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
  const session = await getSession()
  const authUser = session?.user as
    | { id?: string; email?: string | null; name?: string | null; image?: string | null }
    | undefined

  if (!authUser?.id || !authUser.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await db.user.upsert({
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

  let body: SaveGamePayload
  try {
    body = (await request.json()) as SaveGamePayload
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 })
  }

  const mode = body.mode === "versus-ai" ? "versus-ai" : "local"
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
