import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { db } from "@/lib/db"
import { ensureDbUser } from "@/lib/auth/session"
import { LuArrowRight, LuTrophy, LuSwords, LuMinus, LuClock3, LuStar } from "react-icons/lu"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

type Outcome = "win" | "loss" | "draw" | "pending"

function normalizeResult(result: string | null): "black" | "white" | "draw" | null {
  if (!result) return null
  const value = result.toLowerCase().trim()
  if (value.includes("draw")) return "draw"
  if (value.includes("black") || value.startsWith("b+")) return "black"
  if (value.includes("white") || value.startsWith("w+")) return "white"
  return null
}

function getOutcome(result: string | null, myColor: "black" | "white"): Outcome {
  const winner = normalizeResult(result)
  if (!winner) return "pending"
  if (winner === "draw") return "draw"
  if (winner === myColor) return "win"
  return "loss"
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)
}

function initials(name: string, email: string) {
  const source = name.trim() || email.trim()
  const chunks = source.split(/\s+/).filter(Boolean)
  if (chunks.length >= 2) return `${chunks[0][0]}${chunks[1][0]}`.toUpperCase()
  return source.slice(0, 2).toUpperCase()
}

function outcomeBg(outcome: Outcome) {
  if (outcome === "win") return "bg-[var(--swiss-blue)] text-white"
  if (outcome === "loss") return "bg-[var(--swiss-red)] text-white"
  if (outcome === "draw") return "bg-[var(--swiss-yellow)] text-black"
  return "bg-black text-white"
}

export default async function ProfilePage() {
  const user = await ensureDbUser()

  const games = await db.game.findMany({
    where: {
      OR: [{ blackPlayerId: user.id }, { whitePlayerId: user.id }],
    },
    include: {
      blackPlayer: { select: { name: true, email: true } },
      whitePlayer: { select: { name: true, email: true } },
    },
    orderBy: { startedAt: "desc" },
    take: 20,
  })

  const summary = games.reduce(
    (acc, game) => {
      const myColor = game.blackPlayerId === user.id ? "black" : "white"
      const outcome = getOutcome(game.result, myColor)
      if (outcome === "win") acc.wins += 1
      if (outcome === "loss") acc.losses += 1
      if (outcome === "draw") acc.draws += 1
      return acc
    },
    { wins: 0, losses: 0, draws: 0 }
  )

  const winRate = games.length > 0 ? Math.round((summary.wins / games.length) * 100) : 0
  const displayName = user.name?.trim() || "Komi Player"

  return (
    <main className="min-h-svh bg-white">

      {/* ── HERO ── */}
      <header className="bg-black border-b-[8px] border-b-swiss-red">
        <div className="mx-auto max-w-5xl px-6 lg:px-10 py-10 lg:py-16">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-white/40 mb-4">
            Komi / Profile
          </p>

          <div className="flex flex-wrap items-end justify-between gap-8">
            {/* Avatar + name */}
            <div className="flex items-center gap-6">
              <Avatar className="size-20 rounded-none border-[3px] border-white shadow-[6px_6px_0_0_var(--swiss-red)]">
                {user.avatar ? <AvatarImage src={user.avatar} alt={displayName} /> : null}
                <AvatarFallback className="font-black text-2xl bg-white text-black rounded-none">
                  {initials(displayName, user.email)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="font-sans text-4xl lg:text-[3.5rem] font-black tracking-tight text-white leading-none uppercase">
                  {displayName}
                </h1>
                <p className="mt-2 font-mono text-[12px] text-white/40 uppercase tracking-widest">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Header actions */}
            <div className="flex items-center gap-3 self-end">
              <Link
                href="/account/settings"
                className="inline-flex items-center gap-2 h-11 px-5 rounded-none border-[3px] border-white bg-transparent text-white font-mono font-black uppercase tracking-widest text-[12px] hover:bg-white hover:text-black transition-all"
              >
                Settings
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 h-11 px-5 rounded-none border-[3px] border-white bg-white text-black font-mono font-black uppercase tracking-widest text-[12px] hover:bg-swiss-yellow hover:border-swiss-yellow transition-all"
              >
                ← Board
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ── STAT ROW ── */}
      <div className="border-b-[3px] border-black bg-white">
        <div className="mx-auto max-w-5xl px-6 lg:px-10">
          <div className="grid grid-cols-4 divide-x-[3px] divide-black">
            {[
              { label: "Wins", value: summary.wins, accent: "var(--swiss-blue)" },
              { label: "Losses", value: summary.losses, accent: "var(--swiss-red)" },
              { label: "Draws", value: summary.draws, accent: "black" },
              { label: "Win Rate", value: `${winRate}%`, accent: "var(--swiss-yellow)" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1 py-6 px-6 first:pl-0 last:pr-0">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">
                  {stat.label}
                </span>
                <span
                  className="text-4xl font-mono font-black tabular-nums leading-none mt-1"
                  style={{ color: stat.accent }}
                >
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── META PILLS ── */}
      <div className="border-b-[2px] border-black/10 bg-white">
        <div className="mx-auto max-w-5xl px-6 lg:px-10 py-4 flex items-center gap-4 flex-wrap">
          <div className="inline-flex items-center gap-2 border-[2px] border-black px-3 py-1.5">
            <LuStar className="size-3.5 text-black" />
            <span className="font-mono text-[11px] font-black uppercase tracking-widest text-black">
              Rating {user.rating}
            </span>
          </div>
          <div className="inline-flex items-center gap-2 border-[2px] border-black px-3 py-1.5">
            <LuSwords className="size-3.5 text-black" />
            <span className="font-mono text-[11px] font-black uppercase tracking-widest text-black">
              {games.length} games played
            </span>
          </div>
        </div>
      </div>

      {/* ── RECENT GAMES ── */}
      <div className="mx-auto max-w-5xl px-6 lg:px-10 py-10">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-sans text-[11px] font-black uppercase tracking-[0.25em] text-black/40">
            Recent Games
          </h2>
          <Link
            href="/games"
            className="inline-flex items-center gap-1 font-mono text-[11px] font-black uppercase tracking-widest text-black hover:text-swiss-red transition-colors"
          >
            View all <LuArrowRight className="size-3.5" />
          </Link>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-[3fr_1fr_1fr_1fr] border-b-[3px] border-black pb-3 mt-4 mb-1">
          {["Opponent", "Result", "Color", "Date"].map((col) => (
            <span key={col} className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">
              {col}
            </span>
          ))}
        </div>

        {games.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <LuTrophy className="size-8 text-black/20" />
            <p className="font-mono font-black text-[12px] uppercase tracking-widest text-black/40">
              No saved games yet
            </p>
          </div>
        ) : (
          <div className="divide-y-[2px] divide-black/10">
            {games.map((game) => {
              const isBlack = game.blackPlayerId === user.id
              const myColor = isBlack ? "black" : "white"
              const opponent = isBlack ? game.whitePlayer : game.blackPlayer
              const opponentLabel =
                opponent.email === user.email
                  ? "Self play"
                  : opponent.name?.trim() || opponent.email
              const outcome = getOutcome(game.result, myColor)

              return (
                <Link
                  key={game.id}
                  href={`/replay/${game.id}`}
                  className="group grid grid-cols-[3fr_1fr_1fr_1fr] items-center py-5 hover:bg-black -mx-2 px-2 transition-colors duration-100"
                >
                  {/* Opponent */}
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex size-8 shrink-0 items-center justify-center font-black text-[13px] bg-black text-white border-[2px] border-black group-hover:border-white">
                      {opponentLabel.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="font-sans font-black text-[14px] tracking-tight truncate text-black group-hover:text-white">
                        {opponentLabel}
                      </p>
                    </div>
                  </div>

                  {/* Result */}
                  <span className="font-mono text-[12px] font-black uppercase tracking-widest text-black group-hover:text-white">
                    {outcome}
                  </span>

                  {/* Color */}
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "size-3 border-[2px] border-black group-hover:border-white",
                      myColor === "black" ? "bg-black group-hover:bg-white" : "bg-white"
                    )} />
                    <span className="font-mono text-[11px] font-bold text-black/50 group-hover:text-white/60 capitalize">
                      {myColor}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-black/40 group-hover:text-white/50">
                    <LuClock3 className="size-3 shrink-0" />
                    {formatDate(game.startedAt)}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
