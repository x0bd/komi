import { redirect } from "next/navigation"
import { auth } from "@/lib/auth/server"

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

