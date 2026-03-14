"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { Button } from "@/components/ui/button"
import { AIChatPanel } from "@/components/learning/ai-chat-panel"
import { useLearningStore } from "@/lib/stores/learning-store"
import { cn } from "@/lib/utils"
import { LuBot, LuBrainCircuit, LuChevronDown, LuSparkles } from "react-icons/lu"

export function ChatDock({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)
  const [canHover, setCanHover] = useState(false)
  const [hovered, setHovered] = useState(false)
  const learningStore = useLearningStore()
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const contentRef = useRef<HTMLSpanElement | null>(null)
  const iconRef = useRef<HTMLSpanElement | null>(null)
  const ringRef = useRef<HTMLSpanElement | null>(null)
  const labelRef = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)")
    const sync = () => setCanHover(mediaQuery.matches)

    sync()
    mediaQuery.addEventListener("change", sync)

    return () => mediaQuery.removeEventListener("change", sync)
  }, [])

  useEffect(() => {
    const button = buttonRef.current
    const content = contentRef.current
    const icon = iconRef.current
    const ring = ringRef.current
    const label = labelRef.current
    if (!button || !content || !icon || !ring || !label) return

    const shouldExpand = open || hovered || !canHover

    gsap.killTweensOf([button, content, icon, ring, label])

    const timeline = gsap.timeline({
      defaults: {
        duration: shouldExpand ? 0.32 : 0.22,
        ease: shouldExpand ? "power3.out" : "power2.inOut",
      },
    })

    timeline.to(
      button,
      {
        width: shouldExpand ? 220 : 58,
      },
      0
    )

    timeline.to(
      content,
      {
        autoAlpha: shouldExpand ? 1 : 0,
        x: shouldExpand ? 0 : -10,
      },
      0
    )

    timeline.to(
      label,
      {
        autoAlpha: shouldExpand ? 1 : 0,
        y: shouldExpand ? 0 : 2,
      },
      0
    )

    timeline.to(
      icon,
      {
        scale: shouldExpand ? 1.05 : 1,
        rotate: shouldExpand ? 4 : 0,
      },
      0
    )

    timeline.to(
      ring,
      {
        opacity: shouldExpand ? 1 : 0.72,
        scale: shouldExpand ? 1.08 : 1,
      },
      0
    )

    return () => timeline.kill()
  }, [canHover, hovered, open])

  const buttonLabel = open ? "Hide Sensei" : "Open Sensei"
  const shouldShowPill = open || hovered || !canHover

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-4 bottom-4 z-30 flex justify-start lg:inset-x-6 lg:bottom-6",
        className
      )}
    >
      <div className="pointer-events-auto flex flex-col items-start gap-3">
        {open ? (
          <div className="w-[min(28rem,calc(100vw-1.5rem))] rounded-[2rem] border border-border/70 bg-background/88 p-3 shadow-[0_28px_90px_-42px_rgba(0,0,0,0.72)] ring-1 ring-white/8 backdrop-blur-2xl">
            <AIChatPanel
              messages={learningStore.chatMessages}
              onTipClick={learningStore.requestTip}
              className="h-[380px] min-h-[380px] rounded-[1.6rem] border border-border/60 shadow-none"
            />
          </div>
        ) : null}

        <Button
          ref={buttonRef}
          variant="outline"
          type="button"
          aria-expanded={open}
          aria-label={buttonLabel}
          className={cn(
            "h-[58px] w-[58px] justify-start overflow-hidden rounded-full border border-border/70 px-0 shadow-[0_18px_45px_-24px_rgba(0,0,0,0.65)] ring-1 ring-white/8 backdrop-blur-xl",
            shouldShowPill
              ? "bg-[linear-gradient(90deg,color-mix(in_oklab,var(--accent)_22%,var(--background)),var(--background))]"
              : "bg-background/90"
          )}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocus={() => setHovered(true)}
          onBlur={() => setHovered(false)}
          onClick={() => setOpen((current) => !current)}
        >
          <span className="flex w-full items-center gap-0 px-[7px]">
            <span
              ref={iconRef}
              className={cn(
                "relative flex size-11 shrink-0 items-center justify-center rounded-full border border-white/20 shadow-[0_0_24px_-8px_rgba(255,255,255,0.35)]",
                open ? "bg-primary text-primary-foreground" : "bg-accent/20 text-accent"
              )}
            >
              <span
                ref={ringRef}
                className="absolute inset-0 rounded-full border border-white/20 opacity-80"
              />
              {open ? <LuBot className="size-[18px]" /> : <LuBrainCircuit className="size-[18px]" />}
            </span>
            <span
              ref={contentRef}
              className="ml-3 block whitespace-nowrap opacity-0"
            >
              <span className="flex items-center gap-3 pr-4">
                <span ref={labelRef} className="flex flex-col items-start leading-none opacity-0">
                  <span className="font-display text-sm font-semibold">
                    {buttonLabel}
                  </span>
                  <span className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <LuSparkles className="size-3" />
                    Sensei Coach
                  </span>
                </span>
                {open ? <LuChevronDown className="size-4 text-muted-foreground" /> : null}
              </span>
            </span>
          </span>
        </Button>
      </div>
    </div>
  )
}
