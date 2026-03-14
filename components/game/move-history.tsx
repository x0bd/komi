"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { LuHistory, LuSparkles } from "react-icons/lu"

export type MoveEntry = {
  moveNumber: number
  player: "black" | "white"
  coordinate?: string
  isPass?: boolean
}

export function MoveHistory({
  moves,
  moveCount = 0,
  variant = "default",
  className,
}: {
  moves: MoveEntry[]
  moveCount?: number
  variant?: "default" | "embedded"
  className?: string
}) {
  const isEmbedded = variant === "embedded"
  const hasMoves = moves.length > 0

  return (
    <Card
      className={cn(
        "relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.8rem] border border-border/70 bg-gradient-to-b from-card via-card to-card/[0.94] shadow-[0_24px_60px_-44px_rgba(0,0,0,0.55)]",
        isEmbedded && "rounded-none border-0 bg-transparent shadow-none",
        className
      )}
    >
      {!isEmbedded ? (
        <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-foreground/12 to-transparent" />
      ) : null}

      {!isEmbedded && (
        <CardHeader className="shrink-0 px-5 pb-3 pt-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl border border-border/70 bg-secondary/55 text-foreground/[0.75] shadow-inner">
                <LuHistory className="size-[18px]" />
              </div>
              <div className="space-y-0.5">
                <CardTitle className="font-display text-[1.85rem] font-bold leading-none tracking-[-0.03em]">
                  History
                </CardTitle>
                <p className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                  Replay Log
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="h-8 rounded-full border-border/80 bg-background/75 px-3 font-mono text-[11px] tracking-[0.08em] shadow-sm"
            >
              Moves: {moveCount}
            </Badge>
          </div>
        </CardHeader>
      )}

      <CardContent className={cn("min-h-0 flex-1 p-0", !isEmbedded && "pt-0")}>
        <ScrollArea
          className={cn(
            isEmbedded ? "h-[min(55vh,380px)]" : "h-[188px] lg:h-full lg:min-h-[220px]"
          )}
        >
          <div
            className={cn(
              "flex min-h-full flex-col",
              isEmbedded ? "px-4 pb-6 pt-2" : "px-5 pb-5"
            )}
          >
            <div className="flex items-center justify-center rounded-[1.05rem] border border-border/50 bg-secondary/45 px-3 py-2.5 text-center text-xs font-medium text-muted-foreground shadow-inner">
              Game started
            </div>

            {hasMoves ? (
              <div className="mt-3 flex flex-col gap-2">
                {moves.map((m) => (
                  <div
                    key={m.moveNumber}
                    className={cn(
                      "flex items-center gap-3 rounded-[1.15rem] border px-3 py-3 transition-colors",
                      m.isPass
                        ? "border-border/45 bg-secondary/20 text-muted-foreground"
                        : "border-border/55 bg-background/65 shadow-[0_10px_24px_-22px_rgba(0,0,0,0.55)]"
                    )}
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary font-mono text-[10px] font-bold text-muted-foreground shadow-inner">
                      {m.moveNumber}
                    </span>
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-full border shadow-sm",
                        m.player === "black"
                          ? "border-stone-black/80 bg-stone-black/10"
                          : "border-border bg-stone-white/90"
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block h-3 w-3 rounded-full",
                          m.player === "black"
                            ? "bg-stone-black"
                            : "border border-border bg-stone-white"
                        )}
                      />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground/[0.88]">
                        {m.player === "black" ? "Black" : "White"}
                      </p>
                      <p className="text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
                        {m.isPass ? "Pass turn" : "Placed stone"}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "ml-auto rounded-full border px-3 py-1 font-mono text-[11px] font-bold tracking-[0.08em]",
                        m.isPass
                          ? "border-border/55 bg-transparent text-muted-foreground"
                          : "border-border/55 bg-secondary/55 text-foreground"
                      )}
                    >
                      {m.isPass ? "Pass" : m.coordinate ?? "—"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 flex flex-1 flex-col items-center justify-center rounded-[1.4rem] border border-dashed border-border/65 bg-gradient-to-b from-secondary/35 via-secondary/20 to-transparent px-6 text-center">
                <div className="mb-4 flex size-12 items-center justify-center rounded-2xl border border-border/60 bg-background/[0.72] text-primary shadow-sm">
                  <LuSparkles className="size-5" />
                </div>
                <p className="font-display text-lg font-semibold tracking-[-0.02em] text-foreground/[0.88]">
                  Waiting for the opening move
                </p>
                <p className="mt-2 max-w-[16rem] text-sm leading-6 text-muted-foreground">
                  Stones, passes, and captures will build a clear replay log here as the game unfolds.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
