"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { LuArrowLeft, LuClock3, LuRefreshCw, LuTrophy, LuSearch, LuCalendar } from "react-icons/lu"
import { cn } from "@/lib/utils"
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
        <header className="relative flex flex-col justify-end min-h-[160px] lg:min-h-[220px] rounded-none bg-black text-white border-b-[8px] border-b-swiss-red p-8 lg:p-12 overflow-hidden shadow-[4px_4px_0_0_var(--foreground)]">
          <div className="absolute top-0 right-0 w-2/3 h-full opacity-20 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_white,_transparent)]" />
          
          <div className="relative z-10 flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/50 mb-4">
                Komi Archive
              </p>
              <h1 className="font-sans text-5xl lg:text-[5rem] font-black tracking-widest text-white leading-[0.95] mb-6 uppercase">
                Game<br />History.
              </h1>
              <p className="text-[15px] lg:text-base text-white/80 leading-relaxed max-w-md">
                Review past matches, trace your improvement, and jump straight into deep replay analysis.
              </p>
            </div>
 
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="lg"
                className="rounded-none border-2 border-border bg-background h-12 px-6 font-mono font-bold uppercase tracking-widest text-[13px] shadow-[4px_4px_0_0_var(--foreground)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none hover:bg-foreground hover:text-primary-foreground transition-all"
                onClick={() => setRefreshTick((value) => value + 1)}
              >
                <LuRefreshCw className="size-4 mr-2" />
                Refresh
              </Button>
              <Button 
                variant="secondary"
                size="lg" 
                className="rounded-none border-2 border-border bg-background h-12 px-6 font-mono font-bold uppercase tracking-widest text-[13px] shadow-[4px_4px_0_0_var(--foreground)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none hover:bg-foreground hover:text-primary-foreground transition-all"
                render={<Link href="/" />}
              >
                <LuArrowLeft className="size-4 mr-2" />
                Back to Board
              </Button>
            </div>
          </div>
        </header>

        {/* Sleek Filter Control Bar */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-2 bg-card border-none shadow-none mt-2">
          
          <div className="flex items-center bg-border p-[2px] border-2 border-border w-full lg:w-auto overflow-x-auto scrollbar-none gap-[2px]">
            {RESULT_FILTERS.map((option) => {
              const isActive = resultFilter === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setResultFilter(option.value as any)}
                  className={cn(
                    "flex-1 lg:flex-none px-6 py-2.5 rounded-none font-mono text-[13px] font-bold tracking-widest uppercase transition-none whitespace-nowrap",
                    isActive 
                      ? "bg-foreground text-primary-foreground shadow-none" 
                      : "bg-background text-muted-foreground hover:bg-foreground hover:text-primary-foreground"
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto px-2 lg:px-2 pb-2 lg:pb-0">
            <div className="relative flex-1 lg:w-56">
              <LuSearch className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={opponentFilter}
                onChange={(event) => setOpponentFilter(event.target.value)}
                placeholder="Search opponent..."
                className="w-full pl-10 h-11 rounded-none border-2 border-border bg-background focus-visible:shadow-[4px_4px_0_0_var(--foreground)] transition-shadow font-mono font-bold text-[14px]"
              />
            </div>
            
            <div className="flex items-center gap-2 bg-background border-2 border-border rounded-none h-11 px-4 focus-within:shadow-[4px_4px_0_0_var(--foreground)] transition-shadow">
              <LuCalendar className="size-4 text-muted-foreground shrink-0" />
              <input
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
                className="bg-transparent text-[13px] font-medium text-foreground outline-none w-[110px] text-center [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
              />
              <span className="text-muted-foreground/30 font-light">—</span>
              <input
                type="date"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
                className="bg-transparent text-[13px] font-medium text-foreground outline-none w-[110px] text-center [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
              />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Match Archive</h2>
            <span className="text-sm font-medium text-muted-foreground">{games.length} games</span>
          </div>
          
          <div className="space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="size-8 rounded-full border-2 border-foreground border-t-transparent animate-spin" />
              </div>
            ) : null}

            {!isLoading && error ? (
              <div className="rounded-3xl border border-destructive/40 bg-destructive/5 p-8 text-center">
                <p className="text-[15px] font-medium text-destructive">{error}</p>
              </div>
            ) : null}

            {!isLoading && !error && games.length === 0 ? (
              <div className="rounded-3xl border border-border/50 bg-background/50 p-12 text-center flex flex-col items-center">
                <LuTrophy className="size-8 text-muted-foreground/40 mb-3" />
                <p className="text-[15px] font-medium text-muted-foreground">No matches found for these filters.</p>
              </div>
            ) : null}
          </div>

          {!isLoading && !error && games.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 lg:gap-6">
              {games.map((game) => {
                const isWin = game.outcome === "win";
                const isLoss = game.outcome === "loss";
                return (
                  <Link
                    key={game.id}
                    href={`/replay/${game.id}`}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-none border-2 border-border bg-card p-6 lg:p-8 shadow-[6px_6px_0_0_var(--foreground)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] dark:group-hover:opacity-10 pointer-events-none transition-opacity duration-300 bg-gradient-to-br from-foreground to-transparent" />
                    
                    <div className="relative z-10 flex items-start justify-between gap-4 mb-8">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "flex size-14 shrink-0 items-center justify-center rounded-none font-bold text-xl border-2 border-border",
                          isWin ? "bg-swiss-blue text-white" : 
                          isLoss ? "bg-swiss-red text-white" :
                          "bg-swiss-yellow text-black"
                        )}>
                          {game.opponent.label.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <h3 className="font-sans text-xl font-bold tracking-tight text-foreground truncate">
                            {game.opponent.label}
                          </h3>
                          <span className="text-[13px] font-medium text-muted-foreground mt-0.5 flex items-center gap-1.5">
                            <LuClock3 className="size-3.5" />
                            {formatDate(game.startedAt)}
                          </span>
                        </div>
                      </div>

                      <div className={cn(
                        "flex items-center justify-center px-4 py-1.5 rounded-none border-2 font-mono text-[11px] font-bold uppercase tracking-widest",
                        isWin ? "bg-swiss-blue text-white border-border" :
                        isLoss ? "bg-swiss-red text-white border-border" :
                        "bg-swiss-yellow text-black border-border"
                      )}>
                        {game.outcome}
                      </div>
                    </div>

                    <div className="relative z-10 flex items-end justify-between mt-auto pt-2">
                      <div className="flex items-center gap-3 lg:gap-4 text-sm font-medium">
                        <div className="flex items-center gap-2 bg-background px-3 py-1.5 rounded-none border-2 border-border shadow-[2px_2px_0_0_var(--foreground)]">
                          <div className={cn(
                            "size-3 rounded-none border border-border",
                            game.myColor === "black" ? "bg-[#111]" : "bg-stone-200 border-border"
                          )} />
                          <span className="text-foreground capitalize text-[13px]">{game.myColor}</span>
                        </div>
                        <span className="text-muted-foreground text-[13px]">{game.moveCount} moves</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-border" />
                        <span className="text-muted-foreground text-[13px]">{game.result ?? "Pending"}</span>
                      </div>

                      <div className="flex items-center text-foreground font-bold text-[13px] uppercase tracking-wide opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                        Review <LuArrowLeft className="ml-2 size-4 rotate-180" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </main>
  )
}
