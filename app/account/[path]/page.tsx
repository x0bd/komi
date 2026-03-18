import { AccountView } from "@neondatabase/auth/react/ui"
import { ensureDbUser } from "@/lib/auth/session"

type AccountPageProps = {
  params: { path: string } | Promise<{ path: string }>
}

export const dynamic = "force-dynamic"

export default async function AccountPage({ params }: AccountPageProps) {
  await ensureDbUser()

  const resolvedParams = await params
  const { path } = resolvedParams

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-5xl p-6">
      <div className="w-full">
        <AccountView path={path} />
      </div>
    </main>
  )
}
