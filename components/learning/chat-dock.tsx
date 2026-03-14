"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { Button } from "@/components/ui/button"
import { AIChatPanel } from "@/components/learning/ai-chat-panel"
import { useLearningStore } from "@/lib/stores/learning-store"
import { cn } from "@/lib/utils"
import { LuBot, LuChevronDown, LuMessageSquareMore, LuSparkles } from "react-icons/lu"

export function ChatDock({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)
  const [canHover, setCanHover] = useState(false)
  const [hovered, setHovered] = useState(false)
  const learningStore = useLearningStore()
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const contentRef = useRef<HTMLSpanElement | null>(null)
  const contentInnerRef = useRef<HTMLSpanElement | null>(null)
  const iconRef = useRef<HTMLSpanElement | null>(null)
  const ringRef = useRef<HTMLSpanElement | null>(null)

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
    const contentInner = contentInnerRef.current
    const icon = iconRef.current
    const ring = ringRef.current
    if (!button || !content || !contentInner || !icon || !ring) return

    const shouldExpand = open || hovered || !canHover
    const contentWidth = contentInner.offsetWidth
    const expandedWidth = 68 + contentWidth

    gsap.killTweensOf([button, content, contentInner, icon, ring])

    const timeline = gsap.timeline({
      defaults: {
        duration: shouldExpand ? 0.34 : 0.24,
        ease: shouldExpand ? "power3.out" : "power2.inOut",
      },
    })

    timeline.to(
      button,
      {
        width: shouldExpand ? expandedWidth : 58,
      },
      0
    )

    timeline.to(
      content,
      {
        width: shouldExpand ? contentWidth : 0,
        opacity: shouldExpand ? 1 : 0,
      },
      0
    )

    timeline.to(
      contentInner,
      {
        x: shouldExpand ? 0 : -10,
        opacity: shouldExpand ? 1 : 0,
      },
      0
    )

    timeline.to(
      icon,
      {
        scale: shouldExpand ? 1.04 : 1,
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
          variant={open ? "secondary" : "accent"}
          type="button"
          aria-expanded={open}
          aria-label={buttonLabel}
          title={buttonLabel}
          className="h-[58px] w-[58px] justify-start overflow-hidden rounded-full border border-border/70 bg-background/82 px-0 shadow-[0_18px_45px_-24px_rgba(0,0,0,0.65)] ring-1 ring-white/8 backdrop-blur-xl"
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
                open ? "bg-primary text-primary-foreground" : "bg-primary/15 text-primary"
              )}
            >
              <span
                ref={ringRef}
                className="absolute inset-0 rounded-full border border-white/20 opacity-80"
              />
              {open ? <LuBot className="size-[18px]" /> : <LuMessageSquareMore className="size-[18px]" />}
            </span>
            <span
              ref={contentRef}
              className="ml-3 block w-0 overflow-hidden whitespace-nowrap opacity-0"
            >
              <span
                ref={contentInnerRef}
                className="flex items-center gap-3 pr-4 opacity-0"
              >
                <span className="flex flex-col items-start leading-none">
                  <span className="font-display text-sm font-semibold">
                    {buttonLabel}
                  </span>
                  <span className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <LuSparkles className="size-3" />
                    Thoughtful coaching
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
