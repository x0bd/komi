import { AccountView } from "@neondatabase/auth/react/ui"
import Link from "next/link"
import { LuArrowLeft, LuShield, LuSparkles } from "react-icons/lu"
import { ensureDbUser } from "@/lib/auth/session"

type AccountPageProps = {
  params: { path: string } | Promise<{ path: string }>
}

export const dynamic = "force-dynamic"

const ACCOUNT_COPY: Record<string, { eyebrow: string; title: string; description: string }> = {
  settings: {
    eyebrow: "Control Room",
    title: "Account settings",
    description:
      "Manage identity, security, and account preferences inside the same refined workspace as the rest of Komi.",
  },
  security: {
    eyebrow: "Security",
    title: "Security settings",
    description:
      "Keep your sessions, sign-in methods, and account access under tight control without losing the calm product feel.",
  },
  profile: {
    eyebrow: "Profile",
    title: "Profile settings",
    description:
      "Tune your public identity, avatar, and personal details with the same careful surface design as your profile view.",
  },
}

export default async function AccountPage({ params }: AccountPageProps) {
  await ensureDbUser()

  const resolvedParams = await params
  const { path } = resolvedParams
  const content = ACCOUNT_COPY[path] ?? {
    eyebrow: "Account",
    title: "Account workspace",
    description:
      "Handle the operational details of your Komi account inside a polished control surface built to match the rest of the app.",
  }

  return (
    <main className="account-page min-h-svh bg-background px-6 pb-10 pt-8 lg:px-10 lg:pb-14 lg:pt-10">
      <div className="account-page__glow account-page__glow--primary" />
      <div className="account-page__glow account-page__glow--secondary" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="account-hero rounded-none border-4 border-border bg-card px-7 py-8 shadow-[8px_8px_0_0_var(--foreground)] lg:px-10 lg:py-10">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
          <div className="absolute -right-20 top-0 h-56 w-56 rounded-full bg-[radial-gradient(circle,_rgba(225,147,63,0.16),_transparent_70%)] blur-3xl" />

          <div className="relative flex flex-col gap-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/profile"
                  className="inline-flex h-11 items-center gap-2 rounded-none border-2 border-border bg-background px-5 font-mono text-[11px] font-bold uppercase tracking-widest text-foreground shadow-[2px_2px_0_0_var(--foreground)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none hover:bg-foreground hover:text-primary-foreground transition-all"
                >
                  <LuArrowLeft className="size-4" />
                  Back to profile
                </Link>

                <div className="inline-flex h-11 items-center gap-2 rounded-none border-2 border-border bg-background px-5 font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground shadow-[2px_2px_0_0_var(--foreground)]">
                  <LuShield className="size-4 text-foreground/80" />
                  Protected workspace
                </div>
              </div>

              <Link
                href="/"
                className="inline-flex h-11 items-center gap-2 rounded-none border-2 border-border bg-background px-5 font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground shadow-[2px_2px_0_0_var(--foreground)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none hover:bg-foreground hover:text-primary-foreground transition-all"
              >
                Return to board
              </Link>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_auto] lg:items-end">
              <div className="max-w-3xl">
                <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.28em] text-muted-foreground">
                  {content.eyebrow}
                </p>
                <h1 className="max-w-2xl font-sans text-4xl font-bold tracking-tight text-foreground lg:text-6xl lg:leading-[0.94]">
                  {content.title}
                </h1>
                <p className="mt-5 max-w-2xl text-[15px] leading-7 text-muted-foreground lg:text-[16px]">
                  {content.description}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:w-[22rem]">
                <div className="rounded-none border-2 border-border bg-background px-5 py-4 shadow-[4px_4px_0_0_var(--foreground)]">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                    Surface
                  </p>
                  <p className="mt-2 text-lg font-bold text-foreground">Calm, focused</p>
                </div>
                <div className="rounded-none border-2 border-border bg-background px-5 py-4 shadow-[4px_4px_0_0_var(--foreground)]">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                    Feel
                  </p>
                  <div className="mt-2 inline-flex items-center gap-2 text-lg font-bold text-foreground">
                    <LuSparkles className="size-4 text-[#df7b38]" />
                    Apple precise
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="account-surface relative overflow-hidden rounded-none border-4 border-border bg-card px-4 py-4 shadow-[8px_8px_0_0_var(--foreground)] sm:px-5 sm:py-5 lg:px-6 lg:py-6">
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-secondary/18 to-transparent" />

          <div className="account-aesthetic relative rounded-none border-2 border-border bg-background p-3 sm:p-4 lg:p-5 shadow-[4px_4px_0_0_var(--foreground)]">
            <AccountView path={path} />
          </div>
        </section>
      </div>
    </main>
  )
}
