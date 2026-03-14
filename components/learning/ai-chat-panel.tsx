"use client"

import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LuBot, LuBrainCircuit, LuBookOpenText, LuSparkles, LuTarget } from "react-icons/lu"
import { cn } from "@/lib/utils"

export type ChatMessage = {
  id: string
  text: string
}

const QUICK_TIPS = [
  { label: "Opening tips", icon: LuBookOpenText },
  { label: "How to capture", icon: LuTarget },
  { label: "Territory", icon: LuBrainCircuit },
]

export function AIChatPanel({
  messages,
  onTipClick,
  className,
}: {
  messages: ChatMessage[]
  onTipClick?: (tip: string) => void
  className?: string
}) {
  return (
    <Card
      className={cn(
      "flex h-[280px] min-h-[280px] w-full flex-col shrink-0 overflow-hidden rounded-[1.75rem] border border-[--tutor-accent]/25 bg-card/95 shadow-[0_24px_70px_-40px_rgba(0,0,0,0.75)] ring-1 ring-white/6 transition-all",
        className
      )}
    >
      {/* Header */}
      <div className="relative shrink-0 overflow-hidden border-b border-white/10 bg-[linear-gradient(135deg,var(--tutor-accent),color-mix(in_oklab,var(--tutor-accent)_70%,black))] px-4 py-3.5 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_38%)]" />
        <div className="relative flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-white/15">
            <AvatarFallback className="bg-primary text-white">
              <LuBot className="size-4.5" />
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-bold tracking-wide">Sensei</span>
              <Badge className="border-white/15 bg-white/12 px-2 text-[10px] text-white">
                Live Tutor
              </Badge>
            </div>
            <p className="mt-0.5 text-[11px] text-white/80">
              Shape, captures, territory, and review prompts while you play.
            </p>
          </div>
          <span className="flex items-center gap-2 text-[11px] text-white/80">
            <span className="h-2 w-2 rounded-full bg-green-300 shadow-[0_0_10px] shadow-green-300" />
            Ready
          </span>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--card)_82%,transparent),color-mix(in_oklab,var(--secondary)_28%,transparent))]">
        <div className="flex flex-col gap-3 p-3 pb-4">
          <div className="rounded-2xl border border-border/60 bg-background/60 px-3 py-2 text-[11px] text-muted-foreground">
            Sensei keeps the tutoring lightweight during play. Tap a prompt when you want a quick nudge.
          </div>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="w-full max-w-[92%] rounded-2xl rounded-bl-md border border-border/60 bg-tutor-surface/75 px-3 py-2.5 text-xs leading-relaxed text-tutor-foreground shadow-sm"
            >
              {msg.text}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Quick Tips */}
      <div className="shrink-0 border-t border-border/60 bg-card/92 px-3 py-3">
        <div className="mb-2 flex items-center gap-2 px-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          <LuSparkles className="size-3" />
          Quick Prompts
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_TIPS.map(({ label, icon: Icon }) => (
            <Button
              key={label}
              type="button"
              variant="outline"
              size="xs"
              className="h-8 rounded-full border-border/70 bg-background/70 px-3 text-[11px] font-medium hover:bg-tutor-accent/8"
              onClick={() => onTipClick?.(label)}
            >
              <Icon className="size-3.5" />
              {label}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  )
}
