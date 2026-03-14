"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AIChatPanel } from "@/components/learning/ai-chat-panel"
import { useLearningStore } from "@/lib/stores/learning-store"
import { cn } from "@/lib/utils"
import { LuBot, LuChevronDown, LuMessageSquareMore, LuSparkles } from "react-icons/lu"

export function ChatDock({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)
  const learningStore = useLearningStore()

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
          variant={open ? "secondary" : "accent"}
          size="lg"
          className="min-h-[58px] rounded-[1.45rem] border border-border/70 bg-background/82 px-4 shadow-[0_18px_45px_-24px_rgba(0,0,0,0.65)] ring-1 ring-white/8 backdrop-blur-xl"
          onClick={() => setOpen((current) => !current)}
        >
          <span className="flex items-center gap-3">
            <span
              className={cn(
                "flex size-10 items-center justify-center rounded-full border border-white/20 shadow-[0_0_24px_-8px_rgba(255,255,255,0.35)]",
                open ? "bg-primary text-primary-foreground" : "bg-primary/15 text-primary"
              )}
            >
              {open ? <LuBot className="size-[18px]" /> : <LuMessageSquareMore className="size-[18px]" />}
            </span>
            <span className="flex flex-col items-start leading-none">
              <span className="font-display text-sm font-semibold">
                {open ? "Hide Sensei" : "Open Sensei"}
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <LuSparkles className="size-3" />
                Designed for thoughtful, quick coaching
              </span>
            </span>
            {open ? <LuChevronDown className="size-4 text-muted-foreground" /> : null}
          </span>
        </Button>
      </div>
    </div>
  )
}
