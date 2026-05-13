"use client"

import type { ReactNode } from "react"
import { LuClock3, LuSparkles, LuX } from "react-icons/lu"
import { cn } from "@/lib/utils"
import { KoMascot, type KoMood } from "@/components/mascot/ko-mascot"

export type KoCoachStageProps = {
  children?: ReactNode
  mood?: KoMood
  message?: string
  points?: number
  timeLabel?: string
  title?: string
  subtitle?: string
  onClose?: () => void
  className?: string
}

export function KoCoachStage({
  children,
  mood = "idle",
  message = "Shape first. Attack second.",
  points = 6,
  timeLabel = "19:30",
  title = "Play Go",
  subtitle = "先生 / live board",
  onClose,
  className,
}: KoCoachStageProps) {
  return (
    <section
      className={cn(
        "relative min-h-svh overflow-hidden bg-background text-foreground",
        className
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.32]"
        style={{
          backgroundImage:
            "linear-gradient(var(--hairline) 1px, transparent 1px), linear-gradient(90deg, var(--hairline) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <span className="pointer-events-none absolute -left-5 top-24 hidden font-sans text-[10rem] font-semibold leading-none text-foreground/10 md:block">
        先生
      </span>

      <div className="relative z-10 mx-auto flex min-h-svh w-full max-w-5xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="grid grid-cols-[auto_1fr] items-center gap-3">
          {onClose ? (
            <button
              type="button"
              aria-label="Close Ko coach"
              onClick={onClose}
              className="flex size-10 items-center justify-center border border-border bg-background text-muted-foreground transition-colors hover:bg-subtle hover:text-foreground"
            >
              <LuX className="size-5" />
            </button>
          ) : (
            <div className="size-10" />
          )}

          <div className="grid grid-cols-2 border border-border bg-background">
            <HudCell
              icon={<LuSparkles className="size-4 text-signal" />}
              value={`${points} points`}
              align="center"
            />
            <HudCell
              icon={<LuClock3 className="size-4 text-accent" />}
              value={timeLabel}
              align="center"
              className="border-l border-border"
            />
          </div>
        </header>

        <div className="mt-5">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            {subtitle}
          </p>
          <h1 className="mt-2 font-sans text-3xl font-semibold tracking-[-0.06em] sm:text-4xl">
            {title}
          </h1>
        </div>

        <div className="flex flex-1 flex-col justify-center gap-5 pb-8 pt-10">
          <div className="mx-auto grid w-full max-w-3xl items-end gap-4 sm:grid-cols-[auto_minmax(0,1fr)]">
            <div className="justify-self-center sm:justify-self-end">
              <KoMascot mood={mood} size="hero" />
            </div>

            <div className="relative mb-4 max-w-md border border-border bg-background px-5 py-4">
              <span
                aria-hidden="true"
                className="absolute -left-2 bottom-7 hidden size-4 rotate-45 border-b border-l border-border bg-background sm:block"
              />
              <p className="font-sans text-[15px] font-semibold leading-relaxed tracking-[-0.02em]">
                {message}
              </p>
            </div>
          </div>

          <div className="mx-auto w-full max-w-2xl">
            <div className="border border-border bg-background p-2">
              {children ? (
                children
              ) : (
                <div className="flex aspect-square items-center justify-center border border-dashed border-border bg-subtle/45">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Board slot
                  </p>
                </div>
              )}
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
  align,
  className,
}: {
  icon: ReactNode
  value: string
  align?: "center" | "start"
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex h-10 items-center gap-2 px-4",
        align === "center" && "justify-center",
        className
      )}
    >
      {icon}
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em]">
        {value}
      </span>
    </div>
  )
}
