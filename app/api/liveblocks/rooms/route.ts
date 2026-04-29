import { randomUUID } from "node:crypto"

import { NextRequest, NextResponse } from "next/server"

import { getApiDbUser } from "@/lib/auth/api"
import { LiveblocksConfigError, getLiveblocksServer } from "@/lib/liveblocks/server"

type RoomsRequestBody = {
  action?: "create" | "join"
  roomId?: string
}

const ROOM_ID_PATTERN = /^komi-[a-z0-9-]{4,48}$/
const ROOM_WRITE_ACCESS = ["room:write"] as const

function createRoomId() {
  return `komi-${randomUUID().slice(0, 8)}`
}

function isValidRoomId(roomId: string) {
  return ROOM_ID_PATTERN.test(roomId)
}

function roomRole(room: Awaited<ReturnType<ReturnType<typeof getLiveblocksServer>["getRoom"]>>, userId: string) {
  return room.metadata?.ownerId === userId ? "host" : "guest"
}

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

  const body = (await request.json().catch(() => ({}))) as RoomsRequestBody
  const action = body.action ?? "create"

  if (action === "create") {
    let roomId = body.roomId?.trim() || createRoomId()
    if (!isValidRoomId(roomId)) {
      roomId = createRoomId()
    }

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const room = await liveblocks.createRoom(roomId, {
          defaultAccesses: [],
          usersAccesses: {
            [user.id]: ROOM_WRITE_ACCESS,
          },
          metadata: {
            app: "komi",
            ownerId: user.id,
            status: "open",
            createdAt: new Date().toISOString(),
          },
        })

        return NextResponse.json({ roomId: room.id, role: "host" })
      } catch {
        roomId = createRoomId()
      }
    }

    return NextResponse.json({ error: "Failed to create room" }, { status: 500 })
  }

  if (action === "join") {
    const roomId = body.roomId?.trim()

    if (!roomId) {
      return NextResponse.json({ error: "roomId is required to join a room" }, { status: 400 })
    }

    if (!isValidRoomId(roomId)) {
      return NextResponse.json({ error: "Invalid room id" }, { status: 400 })
    }

    try {
      const room = await liveblocks.getRoom(roomId)
      const currentAccess = room.usersAccesses[user.id]

      if (currentAccess?.includes("room:write")) {
        return NextResponse.json({ roomId, role: roomRole(room, user.id) })
      }

      const memberIds = Object.entries(room.usersAccesses)
        .filter(([, access]) => access.includes("room:write"))
        .map(([memberId]) => memberId)

      if (memberIds.length >= 2) {
        return NextResponse.json({ error: "Room is full" }, { status: 403 })
      }

      const updatedRoom = await liveblocks.updateRoom(roomId, {
        usersAccesses: {
          [user.id]: ROOM_WRITE_ACCESS,
        },
        metadata: {
          challengerId: user.id,
          status: "matched",
        },
      })

      return NextResponse.json({ roomId, role: roomRole(updatedRoom, user.id) })
    } catch {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }
  }

  return NextResponse.json({ error: "Unsupported action" }, { status: 400 })
}
