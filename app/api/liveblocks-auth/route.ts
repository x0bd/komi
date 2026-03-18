import { randomUUID } from "node:crypto"

import { NextRequest, NextResponse } from "next/server"

import { LiveblocksConfigError, getLiveblocksServer } from "@/lib/liveblocks/server"

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

  const body = (await request.json().catch(() => ({}))) as { room?: string }
  const room = body.room?.trim()

  if (!room) {
    return NextResponse.json({ error: "room is required" }, { status: 400 })
  }

  let userId = request.headers.get("x-user-id") ?? `guest-${randomUUID().slice(0, 8)}`

  try {
    const authModule = await import("@/lib/auth/server")
    const auth = (authModule as any).auth

    if (auth && typeof auth.getSession === "function") {
      const session = await auth.getSession(request)
      const signedInUserId = session?.user?.id ?? session?.id

      if (typeof signedInUserId === "string" && signedInUserId.length > 0) {
        userId = signedInUserId
      }
    }
  } catch {
    // Keep guest fallback user id when auth module or session is unavailable.
  }

  const session = (liveblocks as any).prepareSession(userId)
  session.allow(room, session.FULL_ACCESS)
  const { status, body: authBody } = await session.authorize()

  return new Response(authBody, { status })
}
