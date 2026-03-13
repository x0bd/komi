"use client"

import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

export type ChatMessage = {
  id: string
  text: string
}

export function AIChatPanel({
  messages,
  onTipClick,
}: {
  messages: ChatMessage[]
  onTipClick?: (tip: string) => void
}) {
  return (
    <Card className="flex flex-col rounded-2xl overflow-hidden border-[--tutor-accent]/30 shadow-sm transition-all h-[240px]">
      {/* Header */}
      <div className="bg-tutor-accent px-4 py-3 flex items-center gap-3 shrink-0">
        <Avatar className="h-8 w-8 border border-white/20">
          <AvatarFallback className="bg-primary text-xl">🤖</AvatarFallback>
        </Avatar>
        <span className="font-display font-bold text-sm text-white flex-1">Sensei</span>
        <span className="h-2 w-2 rounded-full bg-green-300 shadow-[0_0_6px] shadow-green-300" />
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3 bg-card/50">
        <div className="flex flex-col gap-2 pb-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="rounded-xl rounded-bl-sm px-3 py-2 text-xs bg-tutor-surface text-tutor-foreground max-w-[90%] leading-relaxed"
            >
              {msg.text}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Quick Tips */}
      <div className="flex gap-1.5 px-3 pb-3 pt-2 bg-card shrink-0 flex-wrap border-t border-border/50">
        {["Opening tips", "How to capture", "Territory"].map((tip) => (
          <Badge
            key={tip}
            variant="outline"
            className="cursor-pointer hover:bg-tutor-accent/10 transition-colors text-[10px] py-0.5 px-2"
            onClick={() => onTipClick?.(tip)}
          >
            {tip}
          </Badge>
        ))}
      </div>
    </Card>
  )
}
