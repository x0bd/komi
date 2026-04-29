import type { NextRequest } from "next/server"

import { auth } from "@/lib/auth/server"
import { db } from "@/lib/db"

type AuthSessionUser = {
  id?: string
  email?: string | null
  name?: string | null
  image?: string | null
}

export type ApiDbUser = {
  id: string
  email: string
  name: string | null
  avatar: string | null
}

function unwrapSession(result: unknown) {
  if (!result || typeof result !== "object") {
    return null
  }

  if ("data" in result) {
    return (result as { data?: { user?: AuthSessionUser } | null }).data ?? null
  }

  return result as { user?: AuthSessionUser }
}

export async function getApiDbUser(request?: NextRequest): Promise<ApiDbUser | null> {
  let rawSession: unknown

  try {
    rawSession = request
      ? await (auth as unknown as { getSession: (request: NextRequest) => Promise<unknown> }).getSession(request)
      : await auth.getSession()
  } catch {
    rawSession = await auth.getSession().catch(() => null)
  }

  const session = unwrapSession(rawSession)
  const authUser = session?.user

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
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
    },
  })
}
