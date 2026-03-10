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
      <CardContent className="flex items-center gap-3 p-3 lg:gap-4 lg:p-5">
        <Avatar className="size-9 shrink-0 lg:!size-12">
          <AvatarFallback
            className={cn(
              "font-display text-sm font-bold text-white lg:text-lg",
              isActive ? "bg-status-active" : "bg-status-capture"
            )}
          >
            {initial}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-bold truncate lg:text-base">{name}</p>
          <div className="mt-0.5 flex flex-wrap gap-1.5 lg:mt-1 lg:gap-2">
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
