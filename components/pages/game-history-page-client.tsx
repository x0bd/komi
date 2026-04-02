"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { LuArrowRight, LuClock3, LuRefreshCw, LuTrophy, LuSearch, LuCalendar } from "react-icons/lu"
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
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)
}

function outcomeBadge(outcome: GameSummary["outcome"]) {
  if (outcome === "win")
    return "bg-swiss-blue text-white"
  if (outcome === "loss")
    return "bg-swiss-red text-white"
  if (outcome === "draw")
    return "bg-swiss-yellow text-black"
  return "bg-black/10 text-black"
}

function avatarBg(outcome: GameSummary["outcome"]) {
  if (outcome === "win") return "bg-swiss-blue text-white"
  if (outcome === "loss") return "bg-swiss-red text-white"
  if (outcome === "draw") return "bg-swiss-yellow text-black"
  return "bg-black/10 text-black"
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
    <main className="min-h-svh bg-white">
      {/* ── HERO HEADER ── */}
      <header className="bg-black text-white border-b-[8px] border-b-swiss-red">
        <div className="mx-auto max-w-5xl px-6 lg:px-10 py-10 lg:py-16 flex flex-wrap items-end justify-between gap-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-white/40 mb-3">
              Komi / Archive
            </p>
            <h1 className="font-sans text-[3.5rem] lg:text-[6rem] font-black tracking-tighter text-white leading-[0.9] uppercase">
              Game<br />History.
            </h1>
          </div>

          <div className="flex items-center gap-3 self-end">
            <button
              onClick={() => setRefreshTick((v) => v + 1)}
              className="inline-flex items-center gap-2 h-11 px-5 rounded-none border-[3px] border-white bg-transparent text-white font-mono font-black uppercase tracking-widest text-[12px] hover:bg-white hover:text-black transition-all"
            >
              <LuRefreshCw className="size-4" />
              Refresh
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 h-11 px-5 rounded-none border-[3px] border-white bg-white text-black font-mono font-black uppercase tracking-widest text-[12px] hover:bg-swiss-yellow hover:border-swiss-yellow transition-all"
            >
              ← Board
            </Link>
          </div>
        </div>
      </header>

      {/* ── FILTER BAR ── */}
      <div className="border-b-[3px] border-black bg-white sticky top-0 z-10 shadow-[0_4px_0_0_rgba(0,0,0,0.08)]">
        <div className="mx-auto max-w-5xl px-6 lg:px-10 py-4 flex flex-wrap items-center gap-4 justify-between">

          {/* Outcome pills */}
          <div className="flex items-center gap-[3px] bg-black p-[3px]">
            {RESULT_FILTERS.map((option) => {
              const isActive = resultFilter === option.value
              return (
                <button
                  key={option.value}
                  onClick={() => setResultFilter(option.value)}
                  className={cn(
                    "px-5 py-2 rounded-none font-mono text-[12px] font-black tracking-widest uppercase transition-none whitespace-nowrap",
                    isActive
                      ? "bg-white text-black"
                      : "text-white/50 hover:text-white"
                  )}
                >
                  {option.label}
                </button>
              )
            })}
          </div>

          {/* Search + Date */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-black/40" />
              <input
                value={opponentFilter}
                onChange={(e) => setOpponentFilter(e.target.value)}
                placeholder="Search opponent…"
                className="h-10 pl-9 pr-4 rounded-none border-[3px] border-black bg-white text-black font-mono font-bold text-[13px] placeholder:text-black/30 outline-none focus:border-swiss-blue w-44"
              />
            </div>

            <div className="flex items-center gap-2 border-[3px] border-black h-10 px-3">
              <LuCalendar className="size-4 text-black/40 shrink-0" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-transparent text-[12px] font-mono font-bold text-black outline-none w-[100px] [&::-webkit-calendar-picker-indicator]:opacity-40"
              />
              <span className="text-black/30 font-bold">—</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-transparent text-[12px] font-mono font-bold text-black outline-none w-[100px] [&::-webkit-calendar-picker-indicator]:opacity-40"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── TABLE ── */}
      <div className="mx-auto max-w-5xl px-6 lg:px-10 py-8">
        {/* Table Header */}
        <div className="grid grid-cols-[3fr_1fr_1fr_1fr_auto] gap-0 border-b-[3px] border-black pb-3 mb-1">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">Opponent</span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">Result</span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">Moves</span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">Date</span>
          <span className="sr-only">Actions</span>
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-[3px] border-black border-t-transparent animate-spin" />
          </div>
        ) : null}

        {/* Error */}
        {!isLoading && error ? (
          <div className="border-[3px] border-swiss-red bg-swiss-red/5 p-8 mt-4">
            <p className="font-mono font-black text-swiss-red text-sm uppercase tracking-wider">{error}</p>
          </div>
        ) : null}

        {/* Empty */}
        {!isLoading && !error && games.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <LuTrophy className="size-10 text-black/20" />
            <p className="font-mono font-black text-[13px] uppercase tracking-widest text-black/40">
              No matches found
            </p>
          </div>
        ) : null}

        {/* Rows */}
        {!isLoading && !error && games.length > 0 ? (
          <div className="divide-y-[2px] divide-black/10">
            {games.map((game) => (
              <Link
                key={game.id}
                href={`/replay/${game.id}`}
                className="group grid grid-cols-[3fr_1fr_1fr_1fr_auto] gap-0 items-center py-5 hover:bg-black hover:text-white transition-colors duration-100 -mx-2 px-2"
              >
                {/* Opponent col */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-none font-black text-[15px] border-[2px] border-black group-hover:border-white transition-colors",
                    avatarBg(game.outcome)
                  )}>
                    {game.opponent.label.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-sans font-black text-[15px] tracking-tight leading-tight truncate group-hover:text-white">
                      {game.opponent.label}
                    </p>
                    <p className="font-mono text-[11px] text-black/40 group-hover:text-white/50 uppercase tracking-wider mt-0.5">
                      Played as {game.myColor}
                    </p>
                  </div>
                </div>

                {/* Result col */}
                <div>
                  <span className={cn(
                    "inline-flex items-center px-3 py-1 font-mono text-[11px] font-black uppercase tracking-widest border-[2px] border-transparent group-hover:border-white/20",
                    outcomeBadge(game.outcome)
                  )}>
                    {game.outcome}
                  </span>
                </div>

                {/* Moves col */}
                <div className="font-mono font-black text-[15px] text-black group-hover:text-white tabular-nums">
                  {game.moveCount}
                </div>

                {/* Date col */}
                <div className="font-mono text-[12px] font-bold text-black/50 group-hover:text-white/60 flex items-center gap-1.5">
                  <LuClock3 className="size-3.5 shrink-0" />
                  {formatDate(game.startedAt)}
                </div>

                {/* Arrow col */}
                <div className="pl-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <LuArrowRight className="size-5 text-white" />
                </div>
              </Link>
            ))}
          </div>
        ) : null}

        {/* Count footer */}
        {!isLoading && games.length > 0 ? (
          <div className="mt-8 pt-4 border-t-[3px] border-black flex items-center justify-between">
            <span className="font-mono font-black text-[11px] uppercase tracking-widest text-black/40">
              {games.length} match{games.length !== 1 ? "es" : ""} found
            </span>
            <span className="font-mono font-black text-[11px] uppercase tracking-widest text-black/40">
              Komi Archive
            </span>
          </div>
        ) : null}
      </div>
    </main>
  )
}
