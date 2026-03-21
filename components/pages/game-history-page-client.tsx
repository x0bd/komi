"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { LuArrowLeft, LuClock3, LuFilter, LuRefreshCw, LuTrophy } from "react-icons/lu"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

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
  { value: "all", label: "All results" },
  { value: "win", label: "Wins" },
  { value: "loss", label: "Losses" },
  { value: "draw", label: "Draws" },
]

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Unknown date"

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)
}

function outcomeStyles(outcome: GameSummary["outcome"]) {
  if (outcome === "win") return "text-status-active"
  if (outcome === "loss") return "text-destructive"
  if (outcome === "draw") return "text-muted-foreground"
  return "text-muted-foreground"
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

        if (!response.ok) {
          throw new Error("Failed to load game history")
        }

        const payload = (await response.json()) as { games?: GameSummary[] }
        setGames(Array.isArray(payload.games) ? payload.games : [])
      } catch (fetchError) {
        if (controller.signal.aborted) return
        const message =
          fetchError instanceof Error ? fetchError.message : "Failed to load game history"
        setError(message)
        setGames([])
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    void loadGames()

    return () => {
      controller.abort()
    }
  }, [queryString, refreshTick])

  return (
    <main className="min-h-svh bg-background px-6 py-10 lg:px-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Phase 13
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">
              Game History
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Review past games, filter quickly, and jump straight into replay mode.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRefreshTick((value) => value + 1)}
            >
              <LuRefreshCw className="size-4" />
              Refresh
            </Button>
            <Button variant="secondary" size="sm" render={<Link href="/" />}>
              <LuArrowLeft className="size-4" />
              Back to Board
            </Button>
          </div>
        </header>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <LuFilter className="size-4 text-muted-foreground" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">Result</span>
              <select
                className="h-9 w-full rounded-4xl border border-input bg-input/30 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                value={resultFilter}
                onChange={(event) =>
                  setResultFilter(event.target.value as "all" | "win" | "loss" | "draw")
                }
              >
                {RESULT_FILTERS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">Opponent</span>
              <Input
                value={opponentFilter}
                onChange={(event) => setOpponentFilter(event.target.value)}
                placeholder="Search name or email"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">From</span>
              <Input
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">To</span>
              <Input
                type="date"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
              />
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Saved Games</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <p className="rounded-xl border border-border/70 bg-secondary/25 px-4 py-3 text-sm text-muted-foreground">
                Loading games...
              </p>
            ) : null}

            {!isLoading && error ? (
              <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </p>
            ) : null}

            {!isLoading && !error && games.length === 0 ? (
              <p className="rounded-xl border border-border/70 bg-secondary/20 px-4 py-3 text-sm text-muted-foreground">
                No games matched these filters yet.
              </p>
            ) : null}

            {!isLoading && !error
              ? games.map((game) => (
                  <article
                    key={game.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card/70 p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {game.myColor}
                        </Badge>
                        <Badge variant="secondary" className={`capitalize ${outcomeStyles(game.outcome)}`}>
                          {game.outcome}
                        </Badge>
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <LuClock3 className="size-3.5" />
                          {formatDate(game.startedAt)}
                        </span>
                      </div>
                      <p className="mt-2 truncate text-sm font-semibold">
                        vs {game.opponent.label}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span>{game.moveCount} moves</span>
                        <span className="truncate">Result: {game.result ?? "Pending"}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        render={<Link href={`/replay/${game.id}`} />}
                      >
                        <LuTrophy className="size-4" />
                        Replay
                      </Button>
                    </div>
                  </article>
                ))
              : null}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
