import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { ensureDbUser } from "@/lib/auth/session"
import { LuArrowLeft, LuTrophy, LuSwords, LuMinus, LuClock3, LuStar } from "react-icons/lu"
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
  if (chunks.length >= 2) {
    return `${chunks[0][0]}${chunks[1][0]}`.toUpperCase()
  }
  return source.slice(0, 2).toUpperCase()
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

  const winRate = games.length > 0
    ? Math.round((summary.wins / games.length) * 100)
    : 0

  const displayName = user.name?.trim() || "Komi Player"

  return (
    <main className="min-h-svh bg-background">
      {/* ─── Hero Header ─── */}
      <div className="relative overflow-hidden border-b border-border/40 px-6 pb-10 pt-14 lg:px-14">
        <div className="absolute inset-0 bg-gradient-to-b from-background/0 to-background pointer-events-none" />

        <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-5">
              <div className="relative shrink-0">
                <Avatar className="size-20 rounded-full border-2 border-border/60 shadow-xl">
                  {user.avatar ? <AvatarImage src={user.avatar} alt={displayName} /> : null}
                  <AvatarFallback className="font-sans text-2xl font-bold text-foreground bg-secondary">
                    {initials(displayName, user.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 size-5 rounded-full bg-status-active border-2 border-background shadow-sm" />
              </div>

              <div className="flex flex-col gap-1">
                <h1 className="font-display text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-none">
                  {displayName}
                </h1>
                <p className="text-[14px] font-medium text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2 sm:mt-0 shrink-0">
              <Button
                render={<Link href="/" />}
                variant="ghost"
                className="rounded-full h-9 px-4 text-[13px] border border-border/60 hover:bg-secondary/60 transition-colors"
              >
                <LuArrowLeft className="size-4 mr-1.5" />
                Back to Board
              </Button>
              <Button
                render={<Link href="/account/settings" />}
                variant="outline"
                className="rounded-full h-9 px-4 text-[13px] border-border/60"
              >
                Settings
              </Button>
            </div>
          </div>

          {/* Rating pill */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-secondary/60 border border-border/50 rounded-full px-4 py-1.5">
              <LuStar className="size-3.5 text-amber-500" />
              <span className="text-[13px] font-bold text-foreground">Rating {user.rating}</span>
            </div>
            <div className="flex items-center gap-2 bg-secondary/60 border border-border/50 rounded-full px-4 py-1.5">
              <LuSwords className="size-3.5 text-muted-foreground" />
              <span className="text-[13px] font-bold text-foreground">{games.length} games played</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Body ─── */}
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-10 lg:px-14">

        {/* ─── Stat Blocks ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: "Wins",
              value: summary.wins,
              icon: <LuTrophy className="size-4" />,
              color: "text-status-active",
              bg: "bg-status-active/5 border-status-active/20",
            },
            {
              label: "Losses",
              value: summary.losses,
              icon: <LuSwords className="size-4" />,
              color: "text-destructive",
              bg: "bg-destructive/5 border-destructive/20",
            },
            {
              label: "Draws",
              value: summary.draws,
              icon: <LuMinus className="size-4" />,
              color: "text-muted-foreground",
              bg: "bg-secondary/60 border-border/50",
            },
            {
              label: "Win Rate",
              value: `${winRate}%`,
              icon: <LuStar className="size-4" />,
              color: "text-amber-500",
              bg: "bg-amber-500/5 border-amber-500/20",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={cn(
                "flex flex-col gap-3 rounded-[2rem] border p-6 shadow-sm transition-all hover:shadow-md",
                stat.bg,
              )}
            >
              <div className={cn("flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest", stat.color)}>
                {stat.icon}
                {stat.label}
              </div>
              <span className={cn("text-4xl font-mono font-bold tracking-tighter", stat.color)}>
                {stat.value}
              </span>
            </div>
          ))}
        </div>

        {/* ─── Recent Games ─── */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Recent Games</h2>
            <Link
              href="/games"
              className="text-[13px] font-bold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              View all
              <LuArrowLeft className="size-3.5 rotate-180" />
            </Link>
          </div>

          {games.length === 0 ? (
            <div className="rounded-[2rem] border border-border/50 bg-background/50 p-12 text-center flex flex-col items-center gap-3">
              <LuTrophy className="size-8 text-muted-foreground/40" />
              <p className="text-[15px] font-medium text-muted-foreground">No saved games yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5">
              {games.map((game) => {
                const isBlack = game.blackPlayerId === user.id
                const myColor = isBlack ? "black" : "white"
                const opponent = isBlack ? game.whitePlayer : game.blackPlayer
                const opponentLabel =
                  opponent.email === user.email
                    ? "Self play"
                    : opponent.name?.trim() || opponent.email
                const outcome = getOutcome(game.result, myColor)
                const isWin = outcome === "win"
                const isLoss = outcome === "loss"

                return (
                  <Link
                    key={game.id}
                    href={`/replay/${game.id}`}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-[2.5rem] border border-border/60 bg-card/60 hover:bg-card p-6 lg:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] dark:group-hover:opacity-10 pointer-events-none transition-opacity duration-300 bg-gradient-to-br from-foreground to-transparent" />

                    <div className="relative z-10 flex items-start justify-between gap-4 mb-6">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "flex size-14 shrink-0 items-center justify-center rounded-full font-bold text-xl shadow-inner",
                          isWin ? "bg-status-active/10 text-status-active border border-status-active/20" :
                          isLoss ? "bg-destructive/10 text-destructive border border-destructive/20" :
                          "bg-secondary text-muted-foreground border border-border"
                        )}>
                          {opponentLabel.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <h3 className="font-sans text-lg font-bold tracking-tight text-foreground truncate">
                            {opponentLabel}
                          </h3>
                          <span className="text-[12px] font-medium text-muted-foreground mt-0.5 flex items-center gap-1.5">
                            <LuClock3 className="size-3" />
                            {formatDate(game.startedAt)}
                          </span>
                        </div>
                      </div>

                      <div className={cn(
                        "flex items-center justify-center px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border shrink-0",
                        isWin ? "bg-status-active/10 text-status-active border-status-active/20" :
                        isLoss ? "bg-destructive/10 text-destructive border-destructive/20" :
                        "bg-secondary/50 text-muted-foreground border-border/50"
                      )}>
                        {outcome}
                      </div>
                    </div>

                    <div className="relative z-10 flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 bg-secondary/40 px-3 py-1.5 rounded-full border border-border/50">
                          <div className={cn(
                            "size-2 rounded-full",
                            myColor === "black" ? "bg-[#111]" : "bg-stone-200 border border-border/80"
                          )} />
                          <span className="text-foreground capitalize text-[12px] font-semibold">{myColor}</span>
                        </div>
                        {game.result && (
                          <span className="text-[12px] font-medium text-muted-foreground">{game.result}</span>
                        )}
                      </div>

                      <span className="text-foreground font-bold text-[12px] uppercase tracking-wide opacity-0 translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                        Replay →
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
