import { getSession } from "@/lib/auth/session"
import { db } from "@/lib/db"
import { getLiveblocksServer, LiveblocksConfigError } from "@/lib/liveblocks/server"

export async function POST() {
  let liveblocks
  try {
    liveblocks = getLiveblocksServer()
  } catch (error) {
    if (error instanceof LiveblocksConfigError) {
      return new Response(error.message, { status: 503 })
    }
    throw error
  }

  const session = await getSession()
  const authUser = session?.user as
    | { id?: string; email?: string | null; name?: string | null; image?: string | null }
    | undefined

  if (!authUser?.id || !authUser.email) {
    return new Response("Unauthorized", { status: 401 })
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

  const { status, body } = await liveblocks.identifyUser(
    {
      userId: user.id,
      groupIds: [],
    },
    {
      userInfo: {
        name: user.name ?? "Komi Player",
        avatar: user.avatar ?? undefined,
        email: user.email,
      },
    }
  )

  return new Response(body, { status })
}
