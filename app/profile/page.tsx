import Link from "next/link"
import {
  LuArrowRight,
  LuClock3,
  LuLayoutGrid,
  LuSettings,
  LuSwords,
  LuTrophy,
  LuUserRound,
} from "react-icons/lu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ensureDbUser } from "@/lib/auth/session"
import { db } from "@/lib/db"
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

function getOutcome({
  result,
  winner,
  myColor,
  isSelfPlay,
}: {
  result: string | null
  winner?: string | null
  myColor: "black" | "white"
  isSelfPlay?: boolean
}): Outcome {
  if (isSelfPlay) return "pending"
  const normalizedWinner =
    winner === "black" || winner === "white" || winner === "draw"
      ? winner
      : normalizeResult(result)
  if (!normalizedWinner) return "pending"
  if (normalizedWinner === "draw") return "draw"
  if (normalizedWinner === myColor) return "win"
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

function outcomeLabel(outcome: Outcome) {
  if (outcome === "win") return "Win"
  if (outcome === "loss") return "Loss"
  if (outcome === "draw") return "Draw"
  return "Review"
}

function outcomeTone(outcome: Outcome) {
  if (outcome === "win") return "bg-signal"
  if (outcome === "loss") return "bg-accent"
  if (outcome === "draw") return "bg-warning"
  return "bg-foreground/45"
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
      const outcome = getOutcome({
        result: game.result,
        winner: game.winner,
        myColor,
        isSelfPlay: game.blackPlayerId === game.whitePlayerId,
      })
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
    <main className="min-h-svh bg-background text-foreground">
      <div className="mx-auto grid min-h-svh max-w-7xl border-x border-border lg:grid-cols-[132px_minmax(0,1fr)]">
        <aside className="relative hidden border-r border-border lg:block">
          <div className="sticky top-0 flex h-svh flex-col justify-between px-6 py-8">
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.32em] text-foreground">
                Komi
              </p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                棋士
              </p>
            </div>
            <span className="pointer-events-none font-sans text-[7.5rem] font-semibold leading-none text-foreground/10 [writing-mode:vertical-rl]">
              棋士
            </span>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground [writing-mode:vertical-rl]">
              player dossier
            </p>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="grid border-b border-border lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="relative overflow-hidden px-6 py-10 lg:px-10 lg:py-14">
              <span className="pointer-events-none absolute right-6 top-4 font-sans text-[8rem] font-semibold leading-none text-foreground/10">
                記録
              </span>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                Komi / Player
              </p>
              <div className="mt-8 flex flex-wrap items-end gap-6">
                <Avatar className="size-20 border border-border bg-subtle after:border-border">
                  {user.avatar ? <AvatarImage src={user.avatar} alt={displayName} /> : null}
                  <AvatarFallback className="bg-subtle font-mono text-xl font-semibold text-foreground">
                    {initials(displayName, user.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h1 className="max-w-2xl truncate font-sans text-5xl font-semibold leading-[0.9] tracking-[-0.07em] lg:text-7xl">
                    {displayName}
                  </h1>
                  <p className="mt-4 truncate font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid border-t border-border lg:border-l lg:border-t-0">
              <DossierMetric label="Rating" value={user.rating} mark="級" />
              <DossierMetric label="Games" value={games.length} mark="局" />
            </div>
          </header>

          <nav className="grid border-b border-border sm:grid-cols-2">
            <Link
              href="/account/settings"
              className="group flex items-center justify-between border-b border-border px-6 py-5 transition-colors hover:bg-subtle sm:border-b-0 sm:border-r lg:px-10"
            >
              <span className="flex items-center gap-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground group-hover:text-foreground">
                <LuSettings className="size-4" />
                Context & settings
              </span>
              <LuArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
            </Link>
            <Link
              href="/"
              className="group flex items-center justify-between px-6 py-5 transition-colors hover:bg-subtle lg:px-10"
            >
              <span className="flex items-center gap-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground group-hover:text-foreground">
                <LuLayoutGrid className="size-4" />
                Return to board
              </span>
              <LuArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
            </Link>
          </nav>

          <section className="grid border-b border-border lg:grid-cols-4">
            <StatCell label="Wins" value={summary.wins} kanji="勝" accent="bg-signal" />
            <StatCell label="Losses" value={summary.losses} kanji="敗" accent="bg-accent" />
            <StatCell label="Draws" value={summary.draws} kanji="和" accent="bg-warning" />
            <StatCell label="Win rate" value={`${winRate}%`} kanji="形" accent="bg-foreground" />
          </section>

          <section className="px-6 py-8 lg:px-10 lg:py-10">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  Recent record
                </p>
                <h2 className="mt-2 font-sans text-3xl font-semibold tracking-[-0.06em]">
                  Match itinerary
                </h2>
              </div>
              <Link
                href="/games"
                className="inline-flex h-10 items-center gap-2 border border-border bg-background px-4 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground"
              >
                View all
                <LuArrowRight className="size-4" />
              </Link>
            </div>

            <div className="grid grid-cols-[minmax(0,2.4fr)_0.75fr_0.75fr_1fr_42px] border-b border-border pb-3">
              {["Opponent", "Result", "Color", "Date"].map((col) => (
                <span
                  key={col}
                  className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground"
                >
                  {col}
                </span>
              ))}
              <span className="sr-only">Open replay</span>
            </div>

            {games.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 border-b border-border py-24">
                <LuTrophy className="size-9 text-foreground/20" />
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  No record yet
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {games.map((game) => {
                  const isBlack = game.blackPlayerId === user.id
                  const myColor = isBlack ? "black" : "white"
                  const opponent = isBlack ? game.whitePlayer : game.blackPlayer
                  const isSelfPlay = game.blackPlayerId === game.whitePlayerId
                  const opponentLabel =
                    opponent.email === user.email
                      ? "Self play"
                      : opponent.name?.trim() || opponent.email
                  const outcome = getOutcome({
                    result: game.result,
                    winner: game.winner,
                    myColor,
                    isSelfPlay,
                  })

                  return (
                    <Link
                      key={game.id}
                      href={`/replay/${game.id}`}
                      className="group grid grid-cols-[minmax(0,2.4fr)_0.75fr_0.75fr_1fr_42px] items-center transition-colors hover:bg-subtle"
                    >
                      <div className="flex min-w-0 items-center gap-4 py-4 pr-4">
                        <span className="flex size-9 shrink-0 items-center justify-center border border-border bg-background font-mono text-[12px] font-semibold uppercase text-foreground">
                          {opponentLabel.charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-sans text-[15px] font-semibold tracking-[-0.03em] text-foreground">
                            {opponentLabel}
                          </p>
                          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                            replay / {game.id.slice(0, 8)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 py-4">
                        <span className={cn("size-2", outcomeTone(outcome))} />
                        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground">
                          {outcomeLabel(outcome)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 py-4">
                        <span
                          className={cn(
                            "size-3 border border-border",
                            myColor === "black" ? "bg-stone-black" : "bg-stone-white"
                          )}
                        />
                        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          {myColor === "black" ? "黒" : "白"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 py-4 font-mono text-[11px] font-semibold text-muted-foreground">
                        <LuClock3 className="size-3.5 shrink-0" />
                        {formatDate(game.startedAt)}
                      </div>

                      <div className="flex h-full items-center justify-center border-l border-border text-muted-foreground transition-colors group-hover:bg-foreground group-hover:text-primary-foreground">
                        <LuArrowRight className="size-4" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  )
}

function DossierMetric({
  label,
  value,
  mark,
}: {
  label: string
  value: string | number
  mark: string
}) {
  return (
    <div className="grid min-h-32 grid-cols-[1fr_auto] border-b border-border p-6 last:border-b-0">
      <div>
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-3 font-mono text-4xl font-semibold leading-none tracking-[-0.06em] tabular-nums">
          {value}
        </p>
      </div>
      <span className="self-end font-sans text-5xl font-semibold leading-none text-foreground/10">
        {mark}
      </span>
    </div>
  )
}

function StatCell({
  label,
  value,
  kanji,
  accent,
}: {
  label: string
  value: string | number
  kanji: string
  accent: string
}) {
  return (
    <div className="relative min-h-36 overflow-hidden border-b border-border p-6 last:border-b-0 sm:border-r lg:border-b-0 lg:last:border-r-0">
      <span className="absolute right-4 top-3 font-sans text-6xl font-semibold leading-none text-foreground/10">
        {kanji}
      </span>
      <span className={cn("mb-5 block size-2", accent)} />
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-3 font-mono text-4xl font-semibold leading-none tracking-[-0.06em] tabular-nums">
        {value}
      </p>
    </div>
  )
}
