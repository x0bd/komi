import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { db } from "@/lib/db"
import { ensureDbUser } from "@/lib/auth/session"

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

function getOutcome(result: string | null, myColor: "black" | "white"): Outcome {
  const winner = normalizeResult(result)

  if (!winner) return "pending"
  if (winner === "draw") return "draw"
  if (winner === myColor) return "win"
  return "loss"
}

function outcomeClasses(outcome: Outcome) {
  if (outcome === "win") return "text-status-active"
  if (outcome === "loss") return "text-destructive"
  if (outcome === "draw") return "text-muted-foreground"
  return "text-muted-foreground"
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)
}

function initials(name: string, email: string) {
  const source = name.trim() || email.trim()
  const chunks = source.split(/\s+/).filter(Boolean)
  if (chunks.length >= 2) {
    return `${chunks[0][0]}${chunks[1][0]}`.toUpperCase()
  }
  return source.slice(0, 2).toUpperCase()
}

export default async function ProfilePage() {
  const user = await ensureDbUser()

  const games = await db.game.findMany({
    where: {
      OR: [{ blackPlayerId: user.id }, { whitePlayerId: user.id }],
    },
    include: {
      blackPlayer: { select: { name: true, email: true } },
      whitePlayer: { select: { name: true, email: true } },
    },
    orderBy: { startedAt: "desc" },
    take: 20,
  })

  const summary = games.reduce(
    (acc, game) => {
      const myColor = game.blackPlayerId === user.id ? "black" : "white"
      const outcome = getOutcome(game.result, myColor)
      if (outcome === "win") acc.wins += 1
      if (outcome === "loss") acc.losses += 1
      if (outcome === "draw") acc.draws += 1
      return acc
    },
    { wins: 0, losses: 0, draws: 0 }
  )

  const displayName = user.name?.trim() || "Komi Player"

  return (
    <main className="min-h-svh bg-background px-6 py-10 lg:px-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <Card>
          <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar size="lg">
                {user.avatar ? <AvatarImage src={user.avatar} alt={displayName} /> : null}
                <AvatarFallback>{initials(displayName, user.email)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-display text-2xl font-semibold">{displayName}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">Rating {user.rating}</Badge>
              <Badge variant="outline">{games.length} games</Badge>
              <Button render={<Link href="/" />} variant="secondary" size="sm">
                Back To Game
              </Button>
              <Button render={<Link href="/account/settings" />} variant="outline" size="sm">
                Account
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card size="sm">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Wins</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-display text-3xl font-semibold text-status-active">{summary.wins}</p>
            </CardContent>
          </Card>
          <Card size="sm">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Losses</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-display text-3xl font-semibold text-destructive">{summary.losses}</p>
            </CardContent>
          </Card>
          <Card size="sm">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Draws</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-display text-3xl font-semibold">{summary.draws}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Games</CardTitle>
          </CardHeader>
          <CardContent>
            {games.length === 0 ? (
              <p className="rounded-xl bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                No saved games yet. Finish a game and we will list it here.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Opponent</TableHead>
                    <TableHead>Result</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {games.map((game) => {
                    const isBlack = game.blackPlayerId === user.id
                    const myColor = isBlack ? "black" : "white"
                    const opponent = isBlack ? game.whitePlayer : game.blackPlayer
                    const opponentLabel =
                      opponent.email === user.email
                        ? "Self play"
                        : opponent.name?.trim() || opponent.email
                    const outcome = getOutcome(game.result, myColor)

                    return (
                      <TableRow key={game.id}>
                        <TableCell>{formatDate(game.startedAt)}</TableCell>
                        <TableCell className="capitalize">{myColor}</TableCell>
                        <TableCell>{opponentLabel}</TableCell>
                        <TableCell className={`capitalize ${outcomeClasses(outcome)}`}>
                          {outcome}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
