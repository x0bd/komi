"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

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

  return (
    <Card
      className={cn(
        "flex min-h-0 flex-1 flex-col lg:min-h-[240px]",
        isEmbedded && "border-0 shadow-none rounded-none bg-transparent",
        className
      )}
    >
      {!isEmbedded && (
        <CardHeader className="shrink-0 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="font-display text-base font-bold">
              History
            </CardTitle>
            <Badge variant="outline" className="font-mono text-[10px]">
              Moves: {moveCount}
            </Badge>
          </div>
        </CardHeader>
      )}
      <CardContent className={cn("flex-1 min-h-0 p-0", !isEmbedded && "pt-0")}>
        <ScrollArea
          className={cn(
            isEmbedded ? "h-[min(55vh,380px)]" : "h-[188px] lg:h-full lg:min-h-[220px]"
          )}
        >
          <div
            className={cn(
              "flex flex-col gap-1.5 pb-4",
              isEmbedded ? "px-4 pt-2" : "px-5"
            )}
          >
            <div className="flex items-center rounded-lg bg-secondary/50 px-3 py-2 text-xs text-muted-foreground justify-center">
              Game started
            </div>
            {moves.map((m) => (
              <div
                key={m.moveNumber}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium",
                  m.isPass
                    ? "bg-transparent text-muted-foreground"
                    : "bg-secondary/50"
                )}
              >
                <span className="w-5 shrink-0 font-mono text-[10px] font-bold text-muted-foreground">
                  {m.moveNumber}
                </span>
                <span
                  className={cn(
                    "inline-block h-2.5 w-2.5 shrink-0 rounded-full",
                    m.player === "black"
                      ? "bg-stone-black"
                      : "bg-stone-white border border-border"
                  )}
                />
                <span className="text-foreground/80">
                  {m.player === "black" ? "Black" : "White"}
                </span>
                <span
                  className={cn(
                    "ml-auto font-mono font-bold",
                    m.isPass ? "text-muted-foreground" : "text-foreground"
                  )}
                >
                  {m.isPass ? "Pass" : m.coordinate ?? "—"}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
