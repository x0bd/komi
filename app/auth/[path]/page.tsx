import { AuthView } from "@neondatabase/auth/react/ui"
import Link from "next/link"

type AuthPageProps = {
  params: { path: string } | Promise<{ path: string }>
}

export default async function AuthPage({ params }: AuthPageProps) {
  const resolvedParams = await params
  const { path } = resolvedParams

  const isSignUp = path === "sign-up"

  return (
    <main className="min-h-svh bg-black flex flex-col lg:flex-row">
      {/* ── Left panel: brand ── */}
      <div className="relative flex flex-col justify-between bg-black border-b-[6px] lg:border-b-0 lg:border-r-[6px] border-swiss-red lg:w-[42%] shrink-0 px-10 py-12 lg:py-16 overflow-hidden">
        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-block group">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mb-1 group-hover:text-white/60 transition-colors">
              Komi
            </p>
            <p className="font-sans text-[2rem] font-black tracking-tight text-white leading-none uppercase">
              Go.
            </p>
          </Link>
        </div>

        {/* Big headline */}
        <div className="relative z-10 my-auto py-12">
          <div className="inline-block bg-swiss-red px-1 mb-4">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">
              {isSignUp ? "New player" : "Welcome back"}
            </span>
          </div>
          <h1 className="font-sans text-[4rem] lg:text-[5.5rem] font-black tracking-tight text-white leading-[0.9] uppercase">
            {isSignUp ? "Join\nKomi." : "Sign\nBack In."}
          </h1>
          <p className="mt-6 text-[14px] text-white/50 leading-relaxed max-w-xs font-medium">
            {isSignUp
              ? "Create an account to track games, challenge AI, and study your matches with Sensei."
              : "Pick up where you left off. Your board, your history, your Sensei."}
          </p>
        </div>

        {/* Bottom accent strip */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-[3px] w-8 bg-swiss-red" />
          <div className="h-[3px] w-4 bg-swiss-yellow" />
          <div className="h-[3px] w-2 bg-white/20" />
        </div>
      </div>

      {/* ── Right panel: auth form ── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-12 lg:py-16">
        <div className="w-full max-w-md">
          {/* Form header */}
          <div className="mb-8 border-b-[3px] border-black pb-6">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40 mb-2">
              {isSignUp ? "Create account" : "Sign in"}
            </p>
            <h2 className="font-sans text-3xl font-black tracking-tight text-black uppercase">
              {isSignUp ? "Get started" : "Continue"}
            </h2>
          </div>

          {/* The auth widget */}
          <AuthView path={path} />

          {/* Toggle link */}
          <div className="mt-8 pt-6 border-t-[2px] border-black/10 text-center">
            <span className="font-mono text-[12px] font-bold text-black/40 uppercase tracking-widest">
              {isSignUp ? "Already have an account?" : "No account yet?"}
            </span>
            <Link
              href={isSignUp ? "/auth/sign-in" : "/auth/sign-up"}
              className="ml-2 font-mono text-[12px] font-black uppercase tracking-widest text-black underline hover:text-swiss-red transition-colors"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
