import { AuthView } from "@neondatabase/auth/react/ui"
import Link from "next/link"
import { LuArrowRight, LuKeyRound, LuLayoutGrid } from "react-icons/lu"

type AuthPageProps = {
  params: { path: string } | Promise<{ path: string }>
}

export default async function AuthPage({ params }: AuthPageProps) {
  const resolvedParams = await params
  const { path } = resolvedParams

  const isSignUp = path === "sign-up"

  return (
    <main className="min-h-svh bg-background text-foreground">
      <div className="mx-auto grid min-h-svh max-w-7xl border-x border-border lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,0.7fr)]">
        <section className="relative flex min-h-[46svh] flex-col justify-between overflow-hidden border-b border-border px-6 py-8 lg:min-h-svh lg:border-b-0 lg:border-r lg:px-10 lg:py-10">
          <span className="pointer-events-none absolute -left-4 top-24 font-sans text-[10rem] font-semibold leading-none text-foreground/10 lg:text-[13rem]">
            碁
          </span>

          <header className="relative z-10 flex items-center justify-between gap-4">
            <Link href="/" className="group">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.32em] text-foreground transition-colors group-hover:text-accent">
                Komi
              </p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                対局 / auth
              </p>
            </Link>
            <Link
              href="/"
              className="inline-flex h-10 items-center gap-2 border border-border bg-background px-4 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-subtle"
            >
              Board
              <LuLayoutGrid className="size-4" />
            </Link>
          </header>

          <div className="relative z-10 my-12 max-w-xl lg:my-auto">
            <div className="mb-6 inline-flex items-center gap-2 border border-border bg-subtle px-3 py-2">
              <LuKeyRound className="size-4 text-accent" />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {isSignUp ? "New player" : "Returning player"}
              </span>
            </div>
            <h1 className="font-sans text-6xl font-semibold leading-[0.86] tracking-[-0.08em] lg:text-8xl">
              {isSignUp ? (
                <>
                  Join
                  <br />
                  Komi.
                </>
              ) : (
                <>
                  Sign
                  <br />
                  back in.
                </>
              )}
            </h1>
            <p className="mt-7 max-w-sm font-sans text-[15px] leading-relaxed text-muted-foreground">
              {isSignUp
                ? "Create a record, study your games, and keep Sensei close without leaving the board."
                : "Return to your board, saved games, and Sensei notes with one clean handoff."}
            </p>
          </div>

          <footer className="relative z-10 grid grid-cols-3 border border-border font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <span className="border-r border-border px-3 py-3">record</span>
            <span className="border-r border-border px-3 py-3">sensei</span>
            <span className="px-3 py-3">review</span>
          </footer>
        </section>

        <section className="flex min-h-[54svh] flex-col justify-center px-6 py-10 lg:min-h-svh lg:px-10">
          <div className="w-full max-w-md">
            <div className="mb-7 border-b border-border pb-6">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                {isSignUp ? "Create account" : "Sign in"}
              </p>
              <h2 className="mt-3 font-sans text-4xl font-semibold tracking-[-0.07em]">
                {isSignUp ? "Start a dossier" : "Continue play"}
              </h2>
            </div>

            <div className="border border-border bg-subtle/45 p-4 sm:p-6 [&_button]:font-mono [&_button]:text-[11px] [&_button]:font-semibold [&_button]:uppercase [&_button]:tracking-[0.14em] [&_input]:border-border [&_input]:bg-background">
              <AuthView path={path} />
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {isSignUp ? "Already registered?" : "No account yet?"}
              </span>
              <Link
                href={isSignUp ? "/auth/sign-in" : "/auth/sign-up"}
                className="inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground transition-colors hover:text-accent"
              >
                {isSignUp ? "Sign in" : "Sign up"}
                <LuArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
