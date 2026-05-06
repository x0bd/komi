import { AccountView } from "@neondatabase/auth/react/ui"
import Link from "next/link"
import { LuArrowLeft, LuArrowRight, LuLayoutGrid, LuShieldCheck } from "react-icons/lu"
import { ensureDbUser } from "@/lib/auth/session"
import { cn } from "@/lib/utils"

type AccountPageProps = {
  params: { path: string } | Promise<{ path: string }>
}

export const dynamic = "force-dynamic"

const ACCOUNT_COPY: Record<string, { eyebrow: string; title: string; description: string }> = {
  settings: {
    eyebrow: "Control Room",
    title: "Account Settings",
    description: "Manage identity, security, and account preferences.",
  },
  security: {
    eyebrow: "Security",
    title: "Security Settings",
    description: "Control sessions, sign-in methods, and account access.",
  },
  profile: {
    eyebrow: "Profile",
    title: "Profile Settings",
    description: "Tune your public identity, avatar, and personal details.",
  },
}

const ACCOUNT_TABS = ["settings", "security", "profile"]

export default async function AccountPage({ params }: AccountPageProps) {
  await ensureDbUser()

  const resolvedParams = await params
  const { path } = resolvedParams
  const content = ACCOUNT_COPY[path] ?? {
    eyebrow: "Account",
    title: "Account Workspace",
    description: "Handle the operational details of your Komi account.",
  }

  return (
    <main className="min-h-svh bg-background text-foreground">
      <div className="mx-auto grid min-h-svh max-w-7xl border-x border-border lg:grid-cols-[132px_minmax(0,1fr)]">
        <aside className="relative hidden border-r border-border lg:block">
          <div className="sticky top-0 flex h-svh flex-col justify-between px-6 py-8">
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.32em]">
                Komi
              </p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                設定
              </p>
            </div>
            <span className="pointer-events-none font-sans text-[7rem] font-semibold leading-none text-foreground/10 [writing-mode:vertical-rl]">
              設定
            </span>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground [writing-mode:vertical-rl]">
              control panel
            </p>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="relative overflow-hidden border-b border-border px-6 py-10 lg:px-10 lg:py-14">
            <span className="pointer-events-none absolute right-6 top-5 font-sans text-[8rem] font-semibold leading-none text-foreground/10">
              対局
            </span>

            <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto]">
              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                  Komi / {content.eyebrow}
                </p>
                <h1 className="mt-5 max-w-3xl font-sans text-5xl font-semibold leading-[0.9] tracking-[-0.07em] lg:text-7xl">
                  {content.title}
                </h1>
                <p className="mt-5 max-w-lg font-sans text-[15px] leading-relaxed text-muted-foreground">
                  {content.description}
                </p>
              </div>

              <div className="flex flex-wrap items-end gap-px self-end bg-border p-px">
                <div className="inline-flex h-11 items-center gap-2 bg-background px-4 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  <LuShieldCheck className="size-4" />
                  Protected
                </div>
                <Link
                  href="/profile"
                  className="inline-flex h-11 items-center gap-2 bg-background px-4 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-subtle"
                >
                  <LuArrowLeft className="size-4" />
                  Profile
                </Link>
                <Link
                  href="/"
                  className="inline-flex h-11 items-center gap-2 bg-foreground px-4 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  Board
                  <LuLayoutGrid className="size-4" />
                </Link>
              </div>
            </div>
          </header>

          <section className="border-b border-border px-6 py-5 lg:px-10">
            <div className="grid gap-px border border-border bg-border sm:grid-cols-3">
              {ACCOUNT_TABS.map((tab) => {
                const isActive = path === tab
                return (
                  <Link
                    key={tab}
                    href={`/account/${tab}`}
                    className={cn(
                      "flex h-12 items-center justify-between bg-background px-4 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:bg-subtle hover:text-foreground",
                      isActive &&
                        "bg-foreground text-primary-foreground hover:bg-foreground hover:text-primary-foreground"
                    )}
                  >
                    {tab}
                    <LuArrowRight className="size-3.5" />
                  </Link>
                )
              })}
            </div>
          </section>

          <section className="px-6 py-8 lg:px-10 lg:py-10">
            <div className="grid border border-border bg-background lg:grid-cols-[220px_minmax(0,1fr)]">
              <div className="border-b border-border p-6 lg:border-b-0 lg:border-r">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Live module
                </p>
                <p className="mt-4 font-sans text-2xl font-semibold tracking-[-0.06em]">
                  Identity controls
                </p>
                <p className="mt-4 font-sans text-[13px] leading-relaxed text-muted-foreground">
                  Neon Auth owns the secure form. Komi frames it as an operational panel.
                </p>
              </div>

              <div className="min-w-0 p-4 sm:p-6">
                <div className="border border-border bg-subtle/45 p-4 sm:p-6 [&_button]:font-mono [&_button]:text-[11px] [&_button]:font-semibold [&_button]:uppercase [&_button]:tracking-[0.14em] [&_input]:border-border [&_input]:bg-background">
                  <AccountView path={path} />
                </div>
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  )
}
