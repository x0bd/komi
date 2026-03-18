import { redirect } from "next/navigation"
import { auth } from "@/lib/auth/server"
import { db } from "@/lib/db"

export async function getSession() {
  const { data: session } = await auth.getSession()
  return session
}

export async function requireSession() {
  const session = await getSession()

  if (!session?.user) {
    redirect("/auth/sign-in")
  }

  return session
}

type SessionUser = {
  id: string
  email?: string | null
  name?: string | null
  image?: string | null
}

export async function requireSessionUser(): Promise<SessionUser> {
  const session = await requireSession()
  const user = session.user as SessionUser | undefined

  if (!user?.id) {
    redirect("/auth/sign-in")
  }

  return user
}

export async function ensureDbUser() {
  const user = await requireSessionUser()

  if (!user.email) {
    throw new Error(
      "Signed-in user is missing an email. Neon Auth email is required to sync profile to Prisma."
    )
  }

  return db.user.upsert({
    where: { email: user.email },
    update: {
      name: user.name ?? undefined,
      avatar: user.image ?? undefined,
    },
    create: {
      email: user.email,
      name: user.name ?? undefined,
      avatar: user.image ?? undefined,
    },
  })
}
