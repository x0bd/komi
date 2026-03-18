import { randomUUID } from "node:crypto"

import { NextRequest, NextResponse } from "next/server"

import { LiveblocksConfigError, getLiveblocksServer } from "@/lib/liveblocks/server"

type RoomsRequestBody = {
  action?: "create" | "join"
  roomId?: string
}

export async function POST(request: NextRequest) {
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
    const roomId = body.roomId?.trim() || `komi-${randomUUID().slice(0, 8)}`

    try {
      await (liveblocks as any).createRoom(roomId, {
        defaultAccesses: ["room:write"],
      })
    } catch {
      // If room creation fails because it already exists, we can still reuse it.
    }

    return NextResponse.json({ roomId })
  }

  if (action === "join") {
    const roomId = body.roomId?.trim()

    if (!roomId) {
      return NextResponse.json({ error: "roomId is required to join a room" }, { status: 400 })
    }

    try {
      if (typeof (liveblocks as any).getRoom === "function") {
        const room = await (liveblocks as any).getRoom(roomId)
        if (!room) {
          return NextResponse.json({ error: "Room not found" }, { status: 404 })
        }
      }
    } catch {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    return NextResponse.json({ roomId })
  }

  return NextResponse.json({ error: "Unsupported action" }, { status: 400 })
}
