import Link from "next/link"
import { LuArrowRight } from "react-icons/lu"

export default function LandingPage() {
  return (
    <main className="h-screen w-screen overflow-hidden bg-black flex flex-col">

      {/* ── NAV ── */}
      <nav className="flex items-center justify-between px-8 lg:px-12 py-6 border-b-[3px] border-white/10 shrink-0">
        <div>
          <span className="font-sans text-xl font-black tracking-tight text-white uppercase">Komi</span>
          <span className="ml-1 font-mono text-[10px] font-bold text-white/30 uppercase tracking-widest align-top">Go</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/auth/sign-in"
            className="font-mono text-[12px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/auth/sign-up"
            className="inline-flex items-center gap-2 h-10 px-5 border-[3px] border-white bg-white text-black font-mono font-black uppercase tracking-widest text-[12px] hover:bg-swiss-yellow hover:border-swiss-yellow transition-all"
          >
            Play free
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div className="flex-1 grid lg:grid-cols-2 min-h-0">

        {/* Left: headline */}
        <div className="flex flex-col justify-between px-8 lg:px-12 py-10 border-r-0 lg:border-r-[3px] border-white/10">
          {/* Top accent */}
          <div className="flex items-center gap-3">
            <div className="h-[3px] w-10 bg-swiss-red" />
            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-white/40">
              Ancient game. Clean interface.
            </span>
          </div>

          {/* Main heading */}
          <div className="my-auto">
            <h1 className="font-sans text-[5rem] lg:text-[8vw] font-black tracking-[-0.02em] text-white leading-[0.88] uppercase">
              Play Go.<br />
              <span className="text-swiss-red">Study.</span><br />
              Improve.
            </h1>
            <p className="mt-8 text-[15px] lg:text-base text-white/50 leading-relaxed max-w-md font-medium">
              Komi is a local-first Go board with a built-in AI tutor — Sensei — that watches every move and helps you understand the game at any level.
            </p>
            <div className="mt-10 flex items-center gap-4 flex-wrap">
              <Link
                href="/auth/sign-up"
                className="inline-flex items-center gap-3 h-14 px-8 border-[3px] border-white bg-white text-black font-mono font-black uppercase tracking-widest text-[13px] hover:bg-swiss-yellow hover:border-swiss-yellow transition-all shadow-[6px_6px_0_0_var(--swiss-red)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
              >
                Start playing free
                <LuArrowRight className="size-5" />
              </Link>
              <Link
                href="/auth/sign-in"
                className="inline-flex items-center gap-2 h-14 px-6 border-[3px] border-white/30 bg-transparent text-white/70 font-mono font-black uppercase tracking-widest text-[12px] hover:border-white hover:text-white transition-all"
              >
                Sign in
              </Link>
            </div>
          </div>

          {/* Bottom strip */}
          <div className="flex items-center gap-6 flex-wrap">
            {["Local play", "Vs AI", "Online rooms", "Sensei tutor", "Move history"].map((tag) => (
              <span key={tag} className="text-[10px] font-black uppercase tracking-widest text-white/25">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Right: visual board */}
        <div className="hidden lg:flex flex-col justify-center items-center relative overflow-hidden">
          {/* Grid texture */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
              backgroundSize: "36px 36px",
            }}
          />

          {/* Go board preview */}
          <div className="relative z-10 border-[4px] border-white shadow-[12px_12px_0_0_var(--swiss-red)]">
            <div
              className="bg-white/5"
              style={{ width: 320, height: 320, display: "grid", gridTemplateColumns: "repeat(9, 1fr)", gap: 0 }}
            >
              {/* Horizontal lines */}
              {Array.from({ length: 9 }).map((_, row) =>
                Array.from({ length: 9 }).map((_, col) => {
                  const stones: Record<string, "B" | "W"> = {
                    "2-2": "B", "2-6": "W", "4-4": "B",
                    "6-2": "W", "6-6": "B", "3-5": "W",
                    "5-3": "B", "1-4": "W", "7-4": "B",
                  }
                  const key = `${row}-${col}`
                  const stone = stones[key]
                  return (
                    <div
                      key={key}
                      className="relative flex items-center justify-center"
                      style={{ width: "100%", paddingBottom: "100%" }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        {/* Grid lines */}
                        <div className="absolute inset-0" style={{
                          borderRight: col < 8 ? "1px solid rgba(255,255,255,0.2)" : "none",
                          borderBottom: row < 8 ? "1px solid rgba(255,255,255,0.2)" : "none",
                        }} />
                        {/* Stones */}
                        {stone ? (
                          <div className={`size-6 rounded-full border-2 z-10 ${
                            stone === "B"
                              ? "bg-black border-white shadow-[0_0_0_2px_rgba(255,255,255,0.3)]"
                              : "bg-white border-black shadow-[0_0_0_2px_rgba(0,0,0,0.3)]"
                          }`} />
                        ) : null}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Floating label */}
          <div className="relative z-10 mt-6 border-[3px] border-white/30 px-5 py-3 bg-black/50 backdrop-blur-sm">
            <p className="font-mono text-[11px] font-black uppercase tracking-widest text-white/60">
              9×9 · Sensei active · 14 moves
            </p>
          </div>
        </div>
      </div>

      {/* ── BOTTOM BAR ── */}
      <div className="shrink-0 border-t-[3px] border-white/10 px-8 lg:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-[3px] w-6 bg-swiss-red" />
          <div className="h-[3px] w-3 bg-swiss-yellow" />
          <div className="h-[3px] w-2 bg-swiss-blue" />
        </div>
        <p className="font-mono text-[10px] font-bold text-white/20 uppercase tracking-widest">
          Komi © 2026
        </p>
      </div>
    </main>
  )
}
