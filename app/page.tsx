import { GameLayout } from "@/components/layout/game-layout"
import { GoBoard } from "@/components/game/go-board"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function Home() {
  return (
    <GameLayout
      board={<BoardPreview />}
      sidebar={<SidebarPlaceholder />}
    />
  )
}

function BoardPreview() {
  return (
    <GoBoard
      board={createSampleBoard()}
      size={19}
      currentPlayer="black"
      lastMove={{ x: 10, y: 10 }}
    />
  )
}

function createSampleBoard() {
  const board = Array.from({ length: 19 }, () =>
    Array.from({ length: 19 }, () => null as "black" | "white" | null)
  )

  const blackStones = [
    [3, 3],
    [4, 3],
    [15, 3],
    [3, 9],
    [8, 8],
    [9, 8],
    [9, 9],
    [10, 9],
    [11, 10],
    [7, 12],
    [3, 15],
    [15, 15],
  ]

  const whiteStones = [
    [14, 3],
    [15, 4],
    [4, 9],
    [10, 8],
    [8, 9],
    [10, 10],
    [11, 9],
    [12, 10],
    [8, 12],
    [4, 15],
    [14, 15],
  ]

  blackStones.forEach(([x, y]) => {
    board[y][x] = "black"
  })

  whiteStones.forEach(([x, y]) => {
    board[y][x] = "white"
  })

  return board
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
