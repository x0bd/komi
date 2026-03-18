import { AccountView } from "@neondatabase/auth/react/ui"

type AccountPageProps = {
  params: { path: string } | Promise<{ path: string }>
}

export default async function AccountPage({ params }: AccountPageProps) {
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
