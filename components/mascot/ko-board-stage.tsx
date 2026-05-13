"use client"

import type { ReactNode } from "react"
import { LuClock3, LuSparkles } from "react-icons/lu"
import { cn } from "@/lib/utils"
import { KoMascot, type KoMood } from "@/components/mascot/ko-mascot"

export type KoBoardStageProps = {
  children: ReactNode
  mood?: KoMood
  message?: string
  title?: string
  subtitle?: string
  pointsLabel?: string
  timeLabel?: string
  className?: string
}

export function KoBoardStage({
  children,
  mood = "idle",
  message = "Shape first. Attack second.",
  title = "Play Go",
  subtitle = "先生 / live board",
  pointsLabel = "6 points",
  timeLabel = "19:30",
  className,
}: KoBoardStageProps) {
  return (
    <section
      className={cn(
        "relative flex h-full w-full min-w-0 flex-col justify-center overflow-hidden py-3",
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

      <div className="relative z-10 mx-auto flex w-full max-w-[42rem] flex-col gap-3">
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

        <div className="grid gap-1">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            {subtitle}
          </p>
          <h1 className="font-sans text-3xl font-semibold leading-none tracking-[-0.06em] text-foreground md:text-4xl">
            {title}
          </h1>
        </div>

        <div className="grid items-end gap-3 sm:grid-cols-[auto_minmax(0,1fr)]">
          <div className="justify-self-center sm:justify-self-end">
            <KoMascot mood={mood} size="lg" />
          </div>

          <div className="relative mb-2 border border-border bg-background px-4 py-3 sm:max-w-[24rem]">
            <span
              aria-hidden="true"
              className="absolute -left-2 bottom-6 hidden size-4 rotate-45 border-b border-l border-border bg-background sm:block"
            />
            <p className="font-sans text-[14px] font-semibold leading-relaxed tracking-[-0.02em] text-foreground">
              {message}
            </p>
          </div>
        </div>

        <div className="relative border border-border bg-background p-2">
          <span className="pointer-events-none absolute -right-3 -top-6 hidden font-sans text-8xl font-semibold leading-none text-foreground/10 md:block">
            碁
          </span>
          <div className="relative z-10">{children}</div>
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
        "flex h-10 items-center justify-center gap-2 px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.16em]",
        className
      )}
    >
      {icon}
      <span>{value}</span>
    </div>
  )
}
