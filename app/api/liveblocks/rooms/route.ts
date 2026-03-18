import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { db } from "@/lib/db"
import { createRoomId, isValidRoomId } from "@/lib/liveblocks/rooms"
import { getLiveblocksServer, LiveblocksConfigError } from "@/lib/liveblocks/server"

type RequestBody = {
  action?: "create" | "join"
  roomId?: string
}

async function getCurrentUser() {
  const session = await getSession()
  const authUser = session?.user as
    | { id?: string; email?: string | null; name?: string | null; image?: string | null }
    | undefined

  if (!authUser?.id || !authUser.email) return null

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

export async function POST(request: Request) {
  let liveblocks
  try {
    liveblocks = getLiveblocksServer()
  } catch (error) {
    if (error instanceof LiveblocksConfigError) {
      return NextResponse.json({ error: error.message }, { status: 503 })
    }
    throw error
  }

  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: RequestBody = {}
  try {
    body = (await request.json()) as RequestBody
  } catch {
    // Allow empty body for default create flow.
  }

  const action = body.action ?? "create"

  if (action === "join") {
    const roomId = body.roomId?.trim()
    if (!roomId || !isValidRoomId(roomId)) {
      return NextResponse.json({ error: "Invalid room id" }, { status: 400 })
    }

    try {
      await liveblocks.updateRoom(roomId, {
        usersAccesses: {
          [user.id]: ["room:write"],
        },
      })
    } catch {
      return NextResponse.json(
        { error: "Unable to join room. It may not exist or access is restricted." },
        { status: 404 }
      )
    }

    return NextResponse.json({ roomId })
  }

  const roomId = createRoomId()
  try {
    await liveblocks.createRoom(
      roomId,
      {
        defaultAccesses: [],
        usersAccesses: {
          [user.id]: ["room:write"],
        },
        metadata: {
          app: "komi",
          mode: "online",
        },
      },
      { idempotent: true }
    )
  } catch {
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 })
  }

  return NextResponse.json({ roomId })
}
