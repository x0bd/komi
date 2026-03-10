"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Timer } from "@/components/game/timer"
import { cn } from "@/lib/utils"

export type StoneColor = "black" | "white"

export function PlayerCard({
  name,
  initial,
  stoneColor,
  captures = 0,
  minutes,
  seconds,
  isActive = false,
  isLowTime = false,
  className,
}: {
  name: string
  initial: string
  stoneColor: StoneColor
  captures?: number
  minutes: number
  seconds: number
  isActive?: boolean
  isLowTime?: boolean
  className?: string
}) {
  return (
    <Card
      className={cn(
        "transition-all duration-200",
        isActive
          ? "border-accent shadow-lg -translate-y-0.5 ring-1 ring-accent/20"
          : "opacity-75",
        className
      )}
    >
      <CardContent className="flex items-center gap-4 p-5">
        <Avatar size="lg" className="shrink-0">
          <AvatarFallback
            className={cn(
              "font-display text-lg font-bold text-white",
              isActive ? "bg-status-active" : "bg-status-capture"
            )}
          >
            {initial}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <p className="font-display text-base font-bold truncate">{name}</p>
          <div className="mt-1 flex flex-wrap gap-2">
            <Badge variant={stoneColor === "black" ? "default" : "secondary"}>
              {stoneColor === "black" ? "Black" : "White"}
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <span
                className={cn(
                  "inline-block h-2.5 w-2.5 shrink-0 rounded-full",
                  stoneColor === "black"
                    ? "bg-stone-black"
                    : "bg-stone-white border border-border"
                )}
              />
              {captures}
            </Badge>
          </div>
        </div>

        <Timer
          minutes={minutes}
          seconds={seconds}
          isLowTime={isLowTime}
          className={cn(!isActive && "text-muted-foreground")}
        />
      </CardContent>
    </Card>
  )
}
