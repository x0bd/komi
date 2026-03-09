import { GameLayout } from "@/components/layout/game-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function Home() {
  return (
    <GameLayout
      board={<BoardPlaceholder />}
      sidebar={<SidebarPlaceholder />}
    />
  )
}

function BoardPlaceholder() {
  return (
    <div className="rounded-3xl bg-board-frame p-4 shadow-[0_16px_48px_var(--stone-shadow),0_4px_12px_var(--stone-shadow)] md:p-6">
      <div className="relative rounded-2xl bg-board-surface board-texture">
        {/* Coordinate labels — top */}
        <div className="flex justify-around px-4 pb-0 pt-2">
          {"ABCDEFGHJ".split("").map((l) => (
            <span
              key={l}
              className="text-[10px] font-semibold text-board-grid/60 font-mono"
            >
              {l}
            </span>
          ))}
        </div>

        <div className="flex">
          {/* Coordinate labels — left */}
          <div className="flex flex-col justify-around py-1 pl-2 pr-0">
            {Array.from({ length: 9 }, (_, i) => (
              <span
                key={i}
                className="text-[10px] font-semibold text-board-grid/60 font-mono"
              >
                {9 - i}
              </span>
            ))}
          </div>

          {/* 9×9 grid */}
          <div className="grid flex-1 grid-cols-9 grid-rows-9 aspect-square p-1">
            {Array.from({ length: 81 }).map((_, i) => {
              const x = i % 9
              const y = Math.floor(i / 9)
              const isHoshi =
                (x === 2 && y === 2) ||
                (x === 6 && y === 2) ||
                (x === 4 && y === 4) ||
                (x === 2 && y === 6) ||
                (x === 6 && y === 6)
              const hasBlack =
                (x === 3 && y === 2) ||
                (x === 5 && y === 3) ||
                (x === 4 && y === 5) ||
                (x === 3 && y === 6) ||
                (x === 2 && y === 4)
              const hasWhite =
                (x === 5 && y === 2) ||
                (x === 4 && y === 3) ||
                (x === 5 && y === 5) ||
                (x === 6 && y === 4) ||
                (x === 5 && y === 6)
              const isLastMove = x === 5 && y === 6

              return (
                <div
                  key={i}
                  className="relative flex items-center justify-center border-[0.5px] border-board-grid/30"
                >
                  {isHoshi && !hasBlack && !hasWhite && (
                    <div className="absolute h-1.5 w-1.5 rounded-full bg-board-hoshi/70" />
                  )}
                  {hasBlack && (
                    <div className="animate-stone-place relative h-[85%] w-[85%] rounded-full bg-[radial-gradient(circle_at_30%_30%,_var(--stone-black-highlight),_var(--stone-black))] shadow-[1px_2px_4px_var(--stone-shadow)]">
                      <div className="absolute left-[15%] top-[12%] h-[20%] w-[20%] rounded-full bg-white/10" />
                    </div>
                  )}
                  {hasWhite && (
                    <div className="animate-stone-place relative h-[85%] w-[85%] rounded-full border border-stone-white/60 bg-[radial-gradient(circle_at_30%_30%,_var(--stone-white-highlight),_var(--stone-white))] shadow-[1px_2px_4px_var(--stone-shadow)]">
                      <div className="absolute left-[15%] top-[12%] h-[20%] w-[20%] rounded-full bg-white/40" />
                      {isLastMove && (
                        <div className="animate-marker-appear absolute left-1/2 top-1/2 h-[30%] w-[30%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_4px_var(--accent)]" />
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function SidebarPlaceholder() {
  return (
    <>
      {/* Mode toggle placeholder */}
      <div className="flex rounded-full bg-secondary p-1 border border-border">
        <div className="flex-1 rounded-full bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground font-display">
          Local
        </div>
        <div className="flex-1 rounded-full px-4 py-2.5 text-center text-sm font-semibold text-muted-foreground font-display">
          Versus AI
        </div>
      </div>

      {/* Player 1 */}
      <Card className="border-accent shadow-lg -translate-y-0.5 transition-all">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-status-active text-white font-display font-bold text-lg">
            Y
          </div>
          <div className="flex-1">
            <p className="font-display text-base font-bold">You</p>
            <div className="mt-1 flex gap-2">
              <Badge>Black</Badge>
              <Badge variant="secondary">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-stone-white border border-border" />
                0
              </Badge>
            </div>
          </div>
          <span className="font-mono text-xl font-bold tabular-nums">
            15:00
          </span>
        </CardContent>
      </Card>

      {/* Player 2 */}
      <Card className="opacity-75 transition-all">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-status-capture text-white font-display font-bold text-lg">
            P
          </div>
          <div className="flex-1">
            <p className="font-display text-base font-bold">Player 2</p>
            <div className="mt-1 flex gap-2">
              <Badge variant="secondary">White</Badge>
              <Badge variant="secondary">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-stone-black" />
                0
              </Badge>
            </div>
          </div>
          <span className="font-mono text-xl font-bold tabular-nums text-muted-foreground">
            15:00
          </span>
        </CardContent>
      </Card>

      {/* Move history */}
      <Card className="flex-1">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="font-display text-base font-bold">
              History
            </CardTitle>
            <Badge variant="outline" className="font-mono text-[10px]">
              Moves: 10
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center rounded-lg bg-secondary/50 px-3 py-2 text-xs text-muted-foreground justify-center">
              Game started
            </div>
            {[
              { n: 1, p: "black", c: "D7" },
              { n: 2, p: "white", c: "F7" },
              { n: 3, p: "black", c: "E4" },
              { n: 4, p: "white", c: "E6" },
              { n: 5, p: "black", c: "C5" },
              { n: 6, p: "white", c: "G5" },
              { n: 7, p: "black", c: "D3" },
              { n: 8, p: "white", c: "F4" },
              { n: 9, p: "black", c: "E2" },
              { n: 10, p: "white", c: "F3" },
            ].map((m) => (
              <div
                key={m.n}
                className="flex items-center gap-3 rounded-lg bg-secondary/50 px-3 py-2 text-xs font-medium"
              >
                <span className="w-5 font-mono text-[10px] font-bold text-muted-foreground">
                  {m.n}
                </span>
                <span
                  className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${
                    m.p === "black"
                      ? "bg-stone-black"
                      : "bg-stone-white border border-border"
                  }`}
                />
                <span className="text-foreground/80">
                  {m.p === "black" ? "Black" : "White"}
                </span>
                <span className="ml-auto font-mono font-bold text-foreground">
                  {m.c}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1 font-display">
          Pass
        </Button>
        <Button variant="destructive" className="flex-1 font-display">
          Resign
        </Button>
      </div>
    </>
  )
}
