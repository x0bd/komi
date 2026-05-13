import Link from "next/link"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"
import {
  LuArrowRight,
  LuBookOpen,
  LuClock3,
  LuLayoutGrid,
  LuSettings,
  LuTrophy,
} from "react-icons/lu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { KoMascot } from "@/components/mascot"
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
    month: "short",
    day: "numeric",
    year: "numeric",
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

function coachLine(winRate: number, totalGames: number) {
  if (totalGames === 0) return "Start with one calm game. I will keep the record tidy."
  if (winRate >= 60) return "Strong rhythm. Protect shape, then press advantage."
  if (winRate >= 40) return "Balanced record. One clean review can shift the next match."
  return "We rebuild from fundamentals: shape, liberties, timing."
}

export default async function ProfilePage() {
  const user = await ensureDbUser()
  if (!user) redirect("/")

  const games = await db.game.findMany({
    where: {
      OR: [{ blackPlayerId: user.id }, { whitePlayerId: user.id }],
    },
    include: {
      blackPlayer: { select: { name: true, email: true } },
      whitePlayer: { select: { name: true, email: true } },
      _count: { select: { moves: true } },
    },
    orderBy: { startedAt: "desc" },
    take: 12,
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

  const displayName = user.name?.trim() || "Komi Player"
  const winRate = games.length > 0 ? Math.round((summary.wins / games.length) * 100) : 0
  const recentGames = games.slice(0, 6)
  const latestGame = games[0]

  return (
    <main className="min-h-svh bg-background text-foreground">
      <div className="mx-auto min-h-svh max-w-7xl border-x border-border">
        <header className="grid min-h-14 grid-cols-[1fr_auto] border-b border-border">
          <div className="flex min-w-0 items-center gap-4 px-5 lg:px-8">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-foreground">
              Komi
            </span>
            <span className="h-4 w-px bg-border" />
            <span className="truncate font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              棋士 / player passport
            </span>
          </div>
          <Link
            href="/"
            className="hidden items-center gap-2 border-l border-border px-5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] transition-colors hover:bg-subtle sm:inline-flex"
          >
            Board
            <LuArrowRight className="size-4" />
          </Link>
        </header>

        <section className="relative grid border-b border-border lg:grid-cols-[minmax(0,1fr)_22rem]">
          <span className="pointer-events-none absolute right-6 top-5 hidden font-sans text-[9rem] font-semibold leading-none text-foreground/10 md:block">
            棋士
          </span>

          <div className="relative min-w-0 px-6 py-8 lg:px-10 lg:py-12">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              Profile
            </p>
            <div className="mt-7 flex flex-wrap items-end gap-5">
              <Avatar className="size-20 border border-border bg-subtle after:border-border">
                {user.avatar ? <AvatarImage src={user.avatar} alt={displayName} /> : null}
                <AvatarFallback className="bg-subtle font-mono text-xl font-semibold text-foreground">
                  {initials(displayName, user.email)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h1 className="max-w-3xl truncate font-sans text-5xl font-semibold leading-[0.9] tracking-[-0.075em] lg:text-7xl">
                  {displayName}
                </h1>
                <p className="mt-4 truncate font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="mt-8 grid max-w-3xl border border-border bg-background sm:grid-cols-3">
              <PassportCell label="Rating" value={user.rating} mark="級" />
              <PassportCell label="Games" value={games.length} mark="局" />
              <PassportCell label="Win rate" value={`${winRate}%`} mark="形" />
            </div>
          </div>

          <aside className="relative border-t border-border px-6 py-7 lg:border-l lg:border-t-0 lg:px-7">
            <div className="flex items-end gap-4">
              <KoMascot mood={games.length > 0 ? "review" : "bow"} size="md" />
              <div className="min-w-0 border border-border bg-background px-4 py-3">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Ko note
                </p>
                <p className="mt-2 font-sans text-[15px] font-semibold leading-snug tracking-[-0.035em]">
                  {coachLine(winRate, games.length)}
                </p>
              </div>
            </div>

            <div className="mt-7 grid gap-px border border-border bg-border">
              <ActionLink href="/" icon={<LuLayoutGrid className="size-4" />} label="Play board" />
              <ActionLink
                href="/games"
                icon={<LuBookOpen className="size-4" />}
                label="Game archive"
              />
              <ActionLink
                href="/account/settings"
                icon={<LuSettings className="size-4" />}
                label="Account settings"
              />
            </div>
          </aside>
        </section>

        <section className="grid border-b border-border md:grid-cols-4">
          <StatCell label="Wins" value={summary.wins} kanji="勝" accent="bg-signal" />
          <StatCell label="Losses" value={summary.losses} kanji="敗" accent="bg-accent" />
          <StatCell label="Draws" value={summary.draws} kanji="和" accent="bg-warning" />
          <StatCell
            label="Last played"
            value={latestGame ? formatDate(latestGame.startedAt) : "None"}
            kanji="今"
            accent="bg-foreground"
            compact
          />
        </section>

        <section className="grid lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0 border-b border-border px-6 py-8 lg:border-b-0 lg:px-10 lg:py-10">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  Recent record
                </p>
                <h2 className="mt-2 font-sans text-3xl font-semibold tracking-[-0.06em]">
                  Last six games
                </h2>
              </div>
              <Link
                href="/games"
                className="inline-flex h-10 items-center gap-2 border border-border bg-background px-4 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors hover:bg-foreground hover:text-primary-foreground"
              >
                View all
                <LuArrowRight className="size-4" />
              </Link>
            </div>

            {recentGames.length === 0 ? (
              <div className="grid min-h-52 place-items-center border border-dashed border-border bg-background px-6 text-center">
                <div>
                  <LuTrophy className="mx-auto size-8 text-foreground/25" />
                  <p className="mt-4 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    No games recorded yet
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-border border-y border-border">
                {recentGames.map((game) => {
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
                    <RecentGameRow
                      key={game.id}
                      href={`/replay/${game.id}`}
                      opponent={opponentLabel}
                      outcome={outcome}
                      color={myColor}
                      date={formatDate(game.startedAt)}
                      moves={game._count.moves}
                    />
                  )
                })}
              </div>
            )}
          </div>

          <aside className="border-border px-6 py-8 lg:border-l lg:px-7 lg:py-10">
            <div className="border border-border bg-background">
              <div className="border-b border-border px-5 py-4">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Focus
                </p>
                <h3 className="mt-2 font-sans text-2xl font-semibold tracking-[-0.06em]">
                  Next session
                </h3>
              </div>
              <div className="space-y-5 p-5">
                <FocusItem label="Shape" value="Keep groups connected before attack." />
                <FocusItem label="Review" value="Open the newest replay and find one repair." />
                <FocusItem label="Tempo" value="Play slower when liberties get thin." />
              </div>
            </div>

            <div className="mt-5 border border-border bg-subtle/55 px-5 py-4">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Joined
              </p>
              <p className="mt-2 font-mono text-xl font-semibold tracking-[-0.05em] tabular-nums">
                {formatDate(user.createdAt)}
              </p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  )
}

function PassportCell({
  label,
  value,
  mark,
}: {
  label: string
  value: string | number
  mark: string
}) {
  return (
    <div className="grid min-h-24 grid-cols-[1fr_auto] border-b border-border p-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <div>
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-3 font-mono text-3xl font-semibold leading-none tracking-[-0.06em] tabular-nums">
          {value}
        </p>
      </div>
      <span className="self-end font-sans text-4xl font-semibold leading-none text-foreground/10">
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
  compact,
}: {
  label: string
  value: string | number
  kanji: string
  accent: string
  compact?: boolean
}) {
  return (
    <div className="relative min-h-32 overflow-hidden border-b border-border p-5 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
      <span className="absolute right-4 top-3 font-sans text-6xl font-semibold leading-none text-foreground/10">
        {kanji}
      </span>
      <span className={cn("mb-5 block size-2", accent)} />
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-3 font-mono font-semibold leading-none tracking-[-0.06em] tabular-nums",
          compact ? "text-xl" : "text-4xl"
        )}
      >
        {value}
      </p>
    </div>
  )
}

function ActionLink({
  href,
  icon,
  label,
}: {
  href: string
  icon: ReactNode
  label: string
}) {
  return (
    <Link
      href={href}
      className="group flex h-12 items-center justify-between bg-background px-4 font-mono text-[10px] font-semibold uppercase tracking-[0.17em] transition-colors hover:bg-foreground hover:text-primary-foreground"
    >
      <span className="flex items-center gap-3">
        {icon}
        {label}
      </span>
      <LuArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
    </Link>
  )
}

function RecentGameRow({
  href,
  opponent,
  outcome,
  color,
  date,
  moves,
}: {
  href: string
  opponent: string
  outcome: Outcome
  color: "black" | "white"
  date: string
  moves: number
}) {
  return (
    <Link
      href={href}
      className="group grid gap-3 py-4 transition-colors hover:bg-subtle sm:grid-cols-[minmax(0,1fr)_7rem_6rem_7rem_42px] sm:items-center sm:px-3"
    >
      <div className="flex min-w-0 items-center gap-4 px-3 sm:px-0">
        <span className="flex size-9 shrink-0 items-center justify-center border border-border bg-background font-mono text-[12px] font-semibold uppercase">
          {opponent.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate font-sans text-[15px] font-semibold tracking-[-0.035em]">
            {opponent}
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            {moves} moves
          </p>
        </div>
      </div>

      <MetaPill>
        <span className={cn("size-2", outcomeTone(outcome))} />
        {outcomeLabel(outcome)}
      </MetaPill>
      <MetaPill>
        <span
          className={cn(
            "size-3 border border-border",
            color === "black" ? "bg-stone-black" : "bg-stone-white"
          )}
        />
        {color === "black" ? "Black" : "White"}
      </MetaPill>
      <div className="flex items-center gap-2 px-3 font-mono text-[11px] font-semibold text-muted-foreground sm:px-0">
        <LuClock3 className="size-3.5 shrink-0" />
        {date}
      </div>
      <div className="hidden h-full items-center justify-center border-l border-border text-muted-foreground transition-colors group-hover:bg-foreground group-hover:text-primary-foreground sm:flex">
        <LuArrowRight className="size-4" />
      </div>
    </Link>
  )
}

function MetaPill({ children }: { children: ReactNode }) {
  return (
    <div className="mx-3 flex h-8 items-center gap-2 border border-border bg-background px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] sm:mx-0">
      {children}
    </div>
  )
}

function FocusItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-l border-border pl-4">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-sans text-[14px] font-semibold leading-snug tracking-[-0.03em]">
        {value}
      </p>
    </div>
  )
}
