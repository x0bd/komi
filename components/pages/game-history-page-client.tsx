"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import { useEffect, useMemo, useState } from "react"
import {
  LuArrowRight,
  LuCalendar,
  LuClock3,
  LuRefreshCw,
  LuSearch,
  LuTrophy,
} from "react-icons/lu"
import { cn } from "@/lib/utils"

type GameSummary = {
  id: string
  startedAt: string
  endedAt: string | null
  result: string | null
  outcome: "win" | "loss" | "draw" | "pending"
  myColor: "black" | "white"
  opponent: {
    id: string
    name: string | null
    email: string
    label: string
  }
  moveCount: number
}

const RESULT_FILTERS: Array<{
  value: "all" | "win" | "loss" | "draw"
  label: string
}> = [
  { value: "all", label: "All" },
  { value: "win", label: "Wins" },
  { value: "loss", label: "Losses" },
  { value: "draw", label: "Draws" },
]

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "--"
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)
}

function outcomeLabel(outcome: GameSummary["outcome"]) {
  if (outcome === "win") return "Win"
  if (outcome === "loss") return "Loss"
  if (outcome === "draw") return "Draw"
  return "Pending"
}

function outcomeAccent(outcome: GameSummary["outcome"]) {
  if (outcome === "win") return "bg-signal"
  if (outcome === "loss") return "bg-accent"
  if (outcome === "draw") return "bg-warning"
  return "bg-foreground"
}

export function GameHistoryPageClient() {
  const [games, setGames] = useState<GameSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [resultFilter, setResultFilter] = useState<"all" | "win" | "loss" | "draw">("all")
  const [opponentFilter, setOpponentFilter] = useState("")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [refreshTick, setRefreshTick] = useState(0)

  const queryString = useMemo(() => {
    const params = new URLSearchParams()
    if (resultFilter !== "all") params.set("result", resultFilter)
    if (opponentFilter.trim()) params.set("opponent", opponentFilter.trim())
    if (fromDate) params.set("from", fromDate)
    if (toDate) params.set("to", toDate)
    params.set("limit", "120")
    return params.toString()
  }, [fromDate, opponentFilter, resultFilter, toDate])

  useEffect(() => {
    const controller = new AbortController()

    async function loadGames() {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/games?${queryString}`, {
          signal: controller.signal,
        })

        if (!response.ok) throw new Error("Failed to load game history")

        const payload = (await response.json()) as { games?: GameSummary[] }
        setGames(Array.isArray(payload.games) ? payload.games : [])
      } catch (fetchError) {
        if (controller.signal.aborted) return
        const message =
          fetchError instanceof Error ? fetchError.message : "Failed to load game history"
        setError(message)
        setGames([])
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    void loadGames()
    return () => { controller.abort() }
  }, [queryString, refreshTick])

  return (
    <main className="min-h-svh bg-background text-foreground">
      <header className="relative overflow-hidden border-b border-border">
        <span className="pointer-events-none absolute right-8 top-6 hidden font-sans text-[9rem] font-semibold leading-none text-foreground/10 md:block">
          記録
        </span>
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[1fr_auto] lg:px-10 lg:py-14">
          <div className="min-w-0">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              Komi / Record
            </p>
            <h1 className="mt-4 font-sans text-5xl font-semibold leading-[0.9] tracking-[-0.07em] text-foreground lg:text-7xl">
              Game History
            </h1>
            <p className="mt-5 max-w-xl font-sans text-[15px] leading-relaxed text-muted-foreground">
              A match archive for replay, review, and shape memory.
            </p>
          </div>

          <div className="flex items-end gap-px bg-border p-px self-end">
            <button
              type="button"
              onClick={() => setRefreshTick((value) => value + 1)}
              className="inline-flex h-11 items-center gap-2 bg-background px-5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-subtle"
            >
              <LuRefreshCw className="size-4" />
              Refresh
            </button>
            <Link
              href="/"
              className="inline-flex h-11 items-center gap-2 bg-foreground px-5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Board
              <LuArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </header>

      <section className="sticky top-0 z-20 border-b border-border bg-background">
        <div className="mx-auto grid max-w-6xl gap-4 px-6 py-4 lg:grid-cols-[auto_1fr] lg:px-10">
          <div className="grid grid-cols-4 gap-px border border-border bg-border">
            {RESULT_FILTERS.map((option) => {
              const isActive = resultFilter === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setResultFilter(option.value)}
                  className={cn(
                    "h-10 bg-background px-4 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:bg-subtle hover:text-foreground",
                    isActive && "bg-foreground text-primary-foreground hover:bg-foreground hover:text-primary-foreground",
                  )}
                >
                  {option.label}
                </button>
              )
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            <label className="relative min-w-[13rem] flex-1 lg:flex-none">
              <LuSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={opponentFilter}
                onChange={(event) => setOpponentFilter(event.target.value)}
                placeholder="Search opponent..."
                className="h-10 w-full border border-border bg-background pl-9 pr-3 font-mono text-[12px] font-semibold text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground lg:w-56"
              />
            </label>

            <div className="flex h-10 items-center gap-2 border border-border bg-background px-3">
              <LuCalendar className="size-4 shrink-0 text-muted-foreground" />
              <input
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
                className="w-[100px] bg-transparent font-mono text-[11px] font-semibold text-foreground outline-none"
              />
              <span className="h-4 w-px bg-border" />
              <input
                type="date"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
                className="w-[100px] bg-transparent font-mono text-[11px] font-semibold text-foreground outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8 lg:px-10">
        <div className="grid grid-cols-[minmax(0,3fr)_0.8fr_0.8fr_1fr_48px] border-b border-border pb-3">
          <TableHead>Opponent</TableHead>
          <TableHead>Result</TableHead>
          <TableHead>Moves</TableHead>
          <TableHead>Date</TableHead>
          <span className="sr-only">Actions</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="size-10 animate-spin border border-border border-t-foreground" />
          </div>
        ) : null}

        {!isLoading && error ? (
          <div className="mt-4 border border-accent bg-background p-6">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
              {error}
            </p>
          </div>
        ) : null}

        {!isLoading && !error && games.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 border-b border-border py-24">
            <LuTrophy className="size-9 text-foreground/20" />
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              No record yet
            </p>
          </div>
        ) : null}

        {!isLoading && !error && games.length > 0 ? (
          <div className="divide-y divide-border">
            {games.map((game) => (
              <Link
                key={game.id}
                href={`/replay/${game.id}`}
                className="group grid grid-cols-[minmax(0,3fr)_0.8fr_0.8fr_1fr_48px] items-center transition-colors hover:bg-subtle"
              >
                <div className="flex min-w-0 items-center gap-4 py-4 pr-4">
                  <span className="flex size-9 shrink-0 items-center justify-center border border-border bg-background font-mono text-[12px] font-semibold uppercase text-foreground">
                    {game.opponent.label.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-sans text-[15px] font-semibold tracking-[-0.03em] text-foreground">
                      {game.opponent.label}
                    </p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Played as {game.myColor}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 py-4">
                  <span className={cn("size-2", outcomeAccent(game.outcome))} />
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground">
                    {outcomeLabel(game.outcome)}
                  </span>
                </div>

                <div className="py-4 font-mono text-[15px] font-semibold tabular-nums tracking-[-0.04em] text-foreground">
                  {game.moveCount}
                </div>

                <div className="flex items-center gap-2 py-4 font-mono text-[11px] font-semibold text-muted-foreground">
                  <LuClock3 className="size-3.5 shrink-0" />
                  {formatDate(game.startedAt)}
                </div>

                <div className="flex h-full items-center justify-center border-l border-border text-muted-foreground transition-colors group-hover:bg-foreground group-hover:text-primary-foreground">
                  <LuArrowRight className="size-4" />
                </div>
              </Link>
            ))}
          </div>
        ) : null}

        {!isLoading && games.length > 0 ? (
          <footer className="mt-8 flex items-center justify-between border-t border-border pt-4">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {games.length} match{games.length !== 1 ? "es" : ""} found
            </span>
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              記録 / archive
            </span>
          </footer>
        ) : null}
      </section>
    </main>
  )
}

function TableHead({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
      {children}
    </span>
  )
}
