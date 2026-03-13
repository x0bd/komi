"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function XPBar({
  streak = 0,
  xpPercent = 0,
}: {
  streak?: number
  xpPercent?: number
}) {
  return (
    <Card className="rounded-2xl shadow-sm border-border bg-card">
      <CardContent className="flex items-center gap-3 p-4">
        <span className="text-xl leading-none">🔥</span>
        <div className="flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
            Today's Streak
          </p>
          <Progress
            value={xpPercent}
            className="h-2 rounded-full bg-muted/50 [&>div]:bg-gradient-to-r [&>div]:from-status-active [&>div]:to-accent"
          />
        </div>
        <span className="font-display font-extrabold text-xp-streak text-2xl leading-none tracking-tight">
          {streak}
        </span>
      </CardContent>
    </Card>
  )
}
