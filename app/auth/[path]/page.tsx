import { AuthView } from "@neondatabase/auth/react/ui"

type AuthPageProps = {
  params: Promise<{ path: string }>
}

export default async function AuthPage({ params }: AuthPageProps) {
  const { path } = await params

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-3xl items-center justify-center p-6">
      <div className="w-full max-w-md">
        <AuthView path={path} />
      </div>
    </main>
  )
}

