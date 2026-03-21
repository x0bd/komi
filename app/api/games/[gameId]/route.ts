import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { db } from "@/lib/db"
import { sgfToGame } from "@/lib/engine/sgf"

type RouteContext = {
  params: Promise<{
    gameId: string
  }>
}

async function getSessionUser() {
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

function inferBoardSize(sgf: string | null) {
  if (!sgf) return 19

  try {
    return sgfToGame(sgf).metadata.size
  } catch {
    return 19
  }
}

export async function GET(_: Request, context: RouteContext) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { gameId } = await context.params

  const game = await db.game.findUnique({
    where: { id: gameId },
    include: {
      blackPlayer: {
        select: { id: true, name: true, email: true },
      },
      whitePlayer: {
        select: { id: true, name: true, email: true },
      },
      moves: {
        orderBy: {
          moveNumber: "asc",
        },
      },
    },
  })

  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 })
  }

  if (game.blackPlayerId !== user.id && game.whitePlayerId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const boardSize = inferBoardSize(game.sgf)

  return NextResponse.json({
    game: {
      id: game.id,
      result: game.result,
      sgf: game.sgf,
      startedAt: game.startedAt,
      endedAt: game.endedAt,
      size: boardSize,
      blackPlayer: game.blackPlayer,
      whitePlayer: game.whitePlayer,
      moves: game.moves.map((move) => ({
        moveNumber: move.moveNumber,
        player: move.player === "white" ? "white" : "black",
        x: move.x,
        y: move.y,
        isPass: move.isPass,
      })),
    },
  })
}
