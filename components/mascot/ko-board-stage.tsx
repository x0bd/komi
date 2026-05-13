"use client"

import type { ReactNode } from "react"
import { LuClock3, LuSparkles } from "react-icons/lu"
import { cn } from "@/lib/utils"
import {
  MascotAvatar,
  type MascotId,
  type MascotMood,
} from "@/components/mascot/mascot-avatar"

export type KoBoardStageProps = {
  children: ReactNode
  mascot?: MascotId
  mood?: MascotMood
  message?: string
  signalLabel?: string
  mascotPulseKey?: string | number
  title?: string
  subtitle?: string
  pointsLabel?: string
  timeLabel?: string
  className?: string
}

export function KoBoardStage({
  children,
  mascot = "ko",
  mood = "idle",
  message = "Shape first. Attack second.",
  signalLabel,
  mascotPulseKey,
  title = "Play Go",
  subtitle = "先生 / live board",
  pointsLabel = "6 points",
  timeLabel = "19:30",
  className,
}: KoBoardStageProps) {
  return (
    <section
      className={cn(
        "relative flex h-full min-h-0 w-full min-w-0 flex-col justify-center overflow-hidden py-1",
        className
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-28 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(var(--hairline) 1px, transparent 1px), linear-gradient(90deg, var(--hairline) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 mx-auto grid h-full min-h-0 w-full max-w-[40rem] grid-rows-[auto_auto_minmax(0,1fr)] content-center gap-2">
        <div className="grid grid-cols-2 border border-border bg-background">
          <HudCell
            icon={<LuSparkles className="size-4 text-signal" />}
            value={pointsLabel}
          />
          <HudCell
            icon={<LuClock3 className="size-4 text-accent" />}
            value={timeLabel}
            className="border-l border-border"
          />
        </div>

        <div className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              {subtitle}
            </p>
            <h1 className="font-sans text-2xl font-semibold leading-none tracking-[-0.06em] text-foreground md:text-3xl">
              {title}
            </h1>
          </div>
          <span className="hidden font-sans text-5xl font-semibold leading-none text-foreground/10 sm:block">
            先生
          </span>
        </div>

        <div className="relative grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-2">
          <div className="grid shrink-0 items-end gap-2 sm:grid-cols-[auto_minmax(0,1fr)]">
            <div className="justify-self-center sm:justify-self-end">
              <MascotAvatar
                mascot={mascot}
                mood={mood}
                size="sm"
                animationKey={mascotPulseKey}
                className="sm:size-24"
              />
            </div>

            <div className="relative mb-1 border border-border bg-background px-4 py-2.5 sm:max-w-[23rem]">
              <span
                aria-hidden="true"
                className="absolute -left-2 bottom-6 hidden size-4 rotate-45 border-b border-l border-border bg-background sm:block"
              />
              {signalLabel ? (
                <p className="mb-1 font-mono text-[9px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  {signalLabel}
                </p>
              ) : null}
              <p className="max-h-12 overflow-hidden font-sans text-[13px] font-semibold leading-relaxed tracking-[-0.02em] text-foreground">
                {message}
              </p>
            </div>
          </div>

          <div className="relative min-h-0 border border-border bg-background p-2">
            <span className="pointer-events-none absolute -right-3 -top-6 hidden font-sans text-8xl font-semibold leading-none text-foreground/10 md:block">
              碁
            </span>
            <div
              className="relative z-10 mx-auto max-w-[36rem]"
              style={{
                width: "min(100%, calc(100svh - 15rem), 36rem)",
              }}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function HudCell({
  icon,
  value,
  className,
}: {
  icon: ReactNode
  value: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex h-9 items-center justify-center gap-2 px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.16em]",
        className
      )}
    >
      {icon}
      <span>{value}</span>
    </div>
  )
}
