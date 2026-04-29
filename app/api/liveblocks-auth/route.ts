import { NextRequest, NextResponse } from "next/server"

import { getApiDbUser } from "@/lib/auth/api"
import { LiveblocksConfigError, getLiveblocksServer } from "@/lib/liveblocks/server"

const ROOM_ID_PATTERN = /^komi-[a-z0-9-]{4,48}$/

export async function POST(request: NextRequest) {
  const user = await getApiDbUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let liveblocks: ReturnType<typeof getLiveblocksServer>

  try {
    liveblocks = getLiveblocksServer()
  } catch (error) {
    if (error instanceof LiveblocksConfigError) {
      return NextResponse.json({ error: error.message }, { status: 503 })
    }

    throw error
  }

  const body = (await request.json().catch(() => ({}))) as { room?: string }
  const room = body.room?.trim()

  if (!room) {
    return NextResponse.json({ error: "room is required" }, { status: 400 })
  }

  if (!ROOM_ID_PATTERN.test(room)) {
    return NextResponse.json({ error: "Invalid room id" }, { status: 400 })
  }

  try {
    const liveblocksRoom = await liveblocks.getRoom(room)
    const access = liveblocksRoom.usersAccesses[user.id]

    if (!access?.includes("room:write")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  } catch {
    return NextResponse.json({ error: "Room not found" }, { status: 404 })
  }

  const session = liveblocks.prepareSession(user.id, {
    userInfo: {
      name: user.name ?? user.email,
      email: user.email,
      avatar: user.avatar ?? undefined,
    },
  })
  session.allow(room, session.FULL_ACCESS)
  const { status, body: authBody } = await session.authorize()

  return new Response(authBody, { status })
}
