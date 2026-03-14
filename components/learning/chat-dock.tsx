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
          <div className="w-[min(24rem,calc(100vw-2rem))] rounded-[1.75rem] border border-border/70 bg-background/85 p-2 shadow-board backdrop-blur-xl">
            <AIChatPanel
              messages={learningStore.chatMessages}
              onTipClick={learningStore.requestTip}
              className="h-[320px] min-h-[320px] shadow-none"
            />
          </div>
        ) : null}

        <Button
          variant={open ? "secondary" : "accent"}
          size="lg"
          className="min-h-[54px] rounded-full px-4 shadow-lg shadow-foreground/8"
          onClick={() => setOpen((current) => !current)}
        >
          <span className="flex items-center gap-3">
            <span
              className={cn(
                "flex size-8 items-center justify-center rounded-full border border-white/20",
                open ? "bg-primary text-primary-foreground" : "bg-primary/15 text-primary"
              )}
            >
              {open ? <LuBot className="size-4" /> : <LuMessageSquareMore className="size-4" />}
            </span>
            <span className="flex flex-col items-start leading-none">
              <span className="font-display text-sm font-semibold">
                {open ? "Hide Sensei" : "Open Sensei"}
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <LuSparkles className="size-3" />
                Tips and learning prompts
              </span>
            </span>
            {open ? <LuChevronDown className="size-4 text-muted-foreground" /> : null}
          </span>
        </Button>
      </div>
    </div>
  )
}
