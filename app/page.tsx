import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function Home() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-8">
      <div className="flex w-full max-w-2xl flex-col gap-8">
        <div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground">
            Komi
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Design system foundation check
          </p>
        </div>

        {/* Typography */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg font-bold">
              Typography
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="font-display text-2xl font-bold">
              Bricolage Grotesque — Display
            </p>
            <p className="text-base">
              DM Sans — Body text for readability and warmth
            </p>
            <p className="font-mono text-sm tabular-nums">
              JetBrains Mono — 15:00 → A4, Q16, Pass
            </p>
          </CardContent>
        </Card>

        {/* Colors */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg font-bold">
              Palette
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3">
              <Swatch label="Primary" className="bg-primary" />
              <Swatch label="Accent" className="bg-accent" />
              <Swatch label="Secondary" className="bg-secondary" />
              <Swatch label="Muted" className="bg-muted" />
              <Swatch label="Destructive" className="bg-destructive" />
              <Swatch label="Board" className="bg-board-surface" />
              <Swatch label="Frame" className="bg-board-frame" />
              <Swatch label="Tutor" className="bg-tutor-accent" />
              <Swatch label="Active" className="bg-status-active" />
              <Swatch label="Capture" className="bg-status-capture" />
              <Swatch label="Stone B" className="bg-stone-black" />
              <Swatch label="XP" className="bg-xp-streak" />
            </div>
          </CardContent>
        </Card>

        {/* Buttons */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg font-bold">
              Buttons
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="accent">Play Again</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Resign</Button>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg font-bold">
              Badges
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Badge>Black</Badge>
            <Badge variant="secondary">White</Badge>
            <Badge variant="outline">Captures: 3</Badge>
            <Badge variant="destructive">Low Time</Badge>
          </CardContent>
        </Card>

        {/* Animations */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg font-bold">
              Stone Animations
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            <div className="animate-stone-place h-12 w-12 rounded-full bg-stone-black shadow-md" />
            <div className="animate-stone-place h-12 w-12 rounded-full border border-stone-white/80 bg-stone-white shadow-md" />
            <div className="animate-pulse-gentle h-3 w-3 rounded-full bg-status-active" />
            <span className="font-mono text-2xl font-bold tabular-nums">
              14:32
            </span>
          </CardContent>
        </Card>

        {/* Board preview */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg font-bold">
              9×9 Board Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="rounded-2xl bg-board-frame p-3 shadow-lg">
              <div className="relative grid h-52 w-52 grid-cols-9 grid-rows-9 rounded-xl bg-board-surface board-texture">
                {Array.from({ length: 81 }).map((_, i) => {
                  const x = i % 9
                  const y = Math.floor(i / 9)
                  const hasBlack =
                    (x === 2 && y === 2) ||
                    (x === 6 && y === 2) ||
                    (x === 4 && y === 4) ||
                    (x === 3 && y === 5)
                  const hasWhite =
                    (x === 2 && y === 6) ||
                    (x === 6 && y === 6) ||
                    (x === 5 && y === 4) ||
                    (x === 4 && y === 3)
                  return (
                    <div
                      key={i}
                      className="relative flex items-center justify-center border-[0.5px] border-board-grid/40"
                    >
                      {hasBlack && (
                        <div className="animate-stone-place h-[85%] w-[85%] rounded-full bg-stone-black shadow-[1px_2px_4px_var(--stone-shadow)]" />
                      )}
                      {hasWhite && (
                        <div className="animate-stone-place h-[85%] w-[85%] rounded-full border border-stone-white/80 bg-stone-white shadow-[1px_2px_4px_var(--stone-shadow)]" />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Board frame + surface + stones with washi tokens
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Swatch({
  label,
  className,
}: {
  label: string
  className: string
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={`h-10 w-full rounded-lg ${className}`} />
      <span className="text-[11px] font-medium text-muted-foreground">
        {label}
      </span>
    </div>
  )
}
