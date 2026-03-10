"use client"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"

export type GameMode = "local" | "versus-ai"

export function ModeToggle({
  value = "local",
  onValueChange,
  className,
}: {
  value?: GameMode
  onValueChange?: (value: GameMode) => void
  className?: string
}) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => v && onValueChange?.(v as GameMode)}
      variant="outline"
      spacing={0}
      className={cn(
        "w-full rounded-full border border-border bg-secondary p-1",
        "[&_[data-slot=toggle-group-item][data-state=on]]:bg-primary [&_[data-slot=toggle-group-item][data-state=on]]:text-primary-foreground [&_[data-slot=toggle-group-item][data-state=on]]:shadow-sm",
        "[&_[data-slot=toggle-group-item]:not([data-state=on])]:text-muted-foreground [&_[data-slot=toggle-group-item]:not([data-state=on])]:hover:bg-transparent",
        className
      )}
    >
      <ToggleGroupItem value="local" className="flex-1 rounded-full font-display font-semibold">
        Local
      </ToggleGroupItem>
      <ToggleGroupItem value="versus-ai" className="flex-1 rounded-full font-display font-semibold">
        Versus AI
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
