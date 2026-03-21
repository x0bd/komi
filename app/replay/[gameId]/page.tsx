import { ReplayPageClient } from "@/components/pages/replay-page-client"
import { ensureDbUser } from "@/lib/auth/session"

export const dynamic = "force-dynamic"

type ReplayPageProps = {
  params: Promise<{
    gameId: string
  }>
}

export default async function ReplayPage({ params }: ReplayPageProps) {
  await ensureDbUser()
  const { gameId } = await params
  return <ReplayPageClient gameId={gameId} />
}
