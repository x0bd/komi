import { GameHistoryPageClient } from "@/components/pages/game-history-page-client"
import { ensureDbUser } from "@/lib/auth/session"

export const dynamic = "force-dynamic"

export default async function GamesPage() {
  await ensureDbUser()
  return <GameHistoryPageClient />
}
