import { NextRequest, NextResponse } from "next/server"
import { getApiDbUser } from "@/lib/auth/api"
import { db } from "@/lib/db"
import { sgfToGame } from "@/lib/engine/sgf"

type RouteContext = {
  params: Promise<{
    gameId: string
  }>
}

function inferBoardSize(boardSize: number | null | undefined, sgf: string | null) {
  if (boardSize === 9 || boardSize === 13 || boardSize === 19) return boardSize

  try {
    const parsedSize = sgf ? sgfToGame(sgf).metadata.size : 19
    return parsedSize === 9 || parsedSize === 13 || parsedSize === 19 ? parsedSize : 19
  } catch {
    return 19
  }
}

function inferKomi(komi: number | null | undefined, sgf: string | null) {
  if (typeof komi === "number" && Number.isFinite(komi)) return komi

  try {
    const parsedKomi = sgf ? sgfToGame(sgf).metadata.komi : 6.5
    return Number.isFinite(parsedKomi) ? parsedKomi : 6.5
  } catch {
    return 6.5
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  const user = await getApiDbUser(request)
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

  const boardSize = inferBoardSize(game.boardSize, game.sgf)
  const komi = inferKomi(game.komi, game.sgf)

  return NextResponse.json({
    game: {
      id: game.id,
      mode: game.mode,
      boardSize,
      komi,
      result: game.result,
      resultReason: game.resultReason,
      winner: game.winner,
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
