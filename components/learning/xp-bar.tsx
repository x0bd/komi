"use client"

import { useEffect, useMemo, useRef } from "react"
import { gsap } from "gsap"
import { LuActivity, LuFlame, LuSparkles } from "react-icons/lu"
import { Card, CardContent } from "@/components/ui/card"
import { useLearningStore } from "@/lib/stores/learning-store"
import { cn } from "@/lib/utils"

const BAR_HEIGHTS = [18, 24, 30, 22, 36, 28, 42, 32, 48, 36, 54, 42]
const BAR_COUNT = BAR_HEIGHTS.length

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function getMomentumTone(energy: number) {
  if (energy >= 80) return "Burning hot"
  if (energy >= 60) return "Charging fast"
  if (energy >= 40) return "Holding shape"
  if (energy >= 20) return "Finding rhythm"
  return "Low pressure"
}

export function XPBar() {
  const streak = useLearningStore((state) => state.streak)
  const xp = useLearningStore((state) => state.xp)
  const liveStreak = useLearningStore((state) => state.liveStreak)
  const lastStreakEvent = useLearningStore((state) => state.lastStreakEvent)
  const lastStreakDelta = useLearningStore((state) => state.lastStreakDelta)
  const streakPulseKey = useLearningStore((state) => state.streakPulseKey)

  const barRefs = useRef<Array<HTMLDivElement | null>>([])
  const glowRef = useRef<HTMLDivElement | null>(null)
  const valueRef = useRef<HTMLDivElement | null>(null)
  const eventRef = useRef<HTMLDivElement | null>(null)

  const energy = clamp(liveStreak, 0, 100)
  const levelCharge = clamp(Math.round((xp / 1000) * 100), 0, 100)
  const momentumTone = getMomentumTone(energy)

  const bars = useMemo(() => {
    const level = (energy / 100) * BAR_COUNT

    return BAR_HEIGHTS.map((maxHeight, index) => {
      const fill = clamp(level - index, 0, 1)
      const height = 10 + fill * maxHeight
      const opacity = 0.22 + fill * 0.78
      const isActive = fill > 0.03

      return { height, opacity, isActive }
    })
  }, [energy])

  useEffect(() => {
    const activeBars = barRefs.current.filter((bar): bar is HTMLDivElement => Boolean(bar))
    if (!activeBars.length) return

    const highlightColor =
      lastStreakDelta >= 0
        ? "rgba(244, 176, 58, 0.42)"
        : "rgba(239, 68, 68, 0.22)"

    const timeline = gsap.timeline({
      defaults: { duration: 0.55, ease: "power3.out" },
    })

    timeline.to(
      activeBars,
      {
        height: (index) => bars[index]?.height ?? 10,
        opacity: (index) => bars[index]?.opacity ?? 0.22,
        y: 0,
        stagger: 0.024,
      },
      0
    )

    if (glowRef.current) {
      timeline.fromTo(
        glowRef.current,
        { opacity: 0.12 },
        { opacity: 0.34, backgroundColor: highlightColor, duration: 0.28, repeat: 1, yoyo: true },
        0
      )
    }

    if (valueRef.current) {
      timeline.fromTo(
        valueRef.current,
        { scale: 1 },
        { scale: lastStreakDelta >= 0 ? 1.08 : 0.96, duration: 0.2, repeat: 1, yoyo: true },
        0.06
      )
    }

    if (eventRef.current) {
      timeline.fromTo(
        eventRef.current,
        { y: 6, opacity: 0.55 },
        { y: 0, opacity: 1, duration: 0.36 },
        0.08
      )
    }

    return () => timeline.kill()
  }, [bars, lastStreakDelta, streakPulseKey])

  return (
    <Card className="overflow-hidden rounded-[1.9rem] border border-border/70 bg-gradient-to-br from-card via-card to-secondary/35 shadow-[0_24px_60px_-40px_rgba(0,0,0,0.6)]">
      <CardContent className="p-0">
        <div className="relative px-5 py-4">
          <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
          <div
            ref={glowRef}
            className="pointer-events-none absolute inset-x-4 bottom-3 top-3 rounded-[1.6rem] opacity-0 blur-2xl"
          />

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-[1.15rem] border border-border/70 bg-secondary/60 text-accent shadow-inner">
                <LuFlame className="size-[18px]" />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Live Streak
                </p>
                <p className="font-display text-lg font-semibold tracking-[-0.03em] text-foreground/[0.9]">
                  {momentumTone}
                </p>
              </div>
            </div>

            <div ref={valueRef} className="text-right">
              <div className="font-display text-3xl font-extrabold leading-none tracking-[-0.05em] text-xp-streak">
                {streak}
              </div>
              <p className="mt-1 text-[11px] font-medium text-muted-foreground">
                {energy}% live
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-[1.45rem] border border-border/65 bg-background/65 p-3 shadow-inner">
            <div className="flex h-[92px] items-end gap-1.5">
              {bars.map((bar, index) => (
                <div key={index} className="flex h-full flex-1 items-end">
                  <div
                    ref={(node) => {
                      barRefs.current[index] = node
                    }}
                    className={cn(
                      "w-full rounded-full bg-gradient-to-t shadow-[0_10px_24px_-18px_rgba(0,0,0,0.65)]",
                      bar.isActive
                        ? "from-status-active via-accent to-xp-streak"
                        : "from-border/45 via-border/30 to-border/10"
                    )}
                    style={{
                      height: `${bar.height}px`,
                      opacity: bar.opacity,
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <div
                ref={eventRef}
                className={cn(
                  "inline-flex min-h-8 items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium",
                  lastStreakDelta > 0
                    ? "border-status-active/35 bg-status-active/10 text-status-active"
                    : lastStreakDelta < 0
                      ? "border-destructive/30 bg-destructive/10 text-destructive"
                      : "border-border/60 bg-secondary/35 text-muted-foreground"
                )}
              >
                {lastStreakDelta > 0 ? (
                  <LuSparkles className="size-[14px]" />
                ) : (
                  <LuActivity className="size-[14px]" />
                )}
                <span className="truncate">{lastStreakEvent}</span>
              </div>

              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Level Charge
                </p>
                <p className="font-mono text-xs font-bold text-foreground/[0.82]">
                  {levelCharge}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
