import HomePageClient from "@/components/pages/home-page-client"
import { ensureDbUser } from "@/lib/auth/session"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  await ensureDbUser()

  return <HomePageClient />
}
