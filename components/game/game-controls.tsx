"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function GameControls({
  onPass,
  onResign,
  disabled = false,
  className,
}: {
  onPass?: () => void
  onResign?: () => void
  disabled?: boolean
  className?: string
}) {
  return (
    <div className={cn("flex gap-3", className)}>
      <Button
        variant="secondary"
        size="lg"
        className="min-h-[48px] flex-1 font-display"
        onClick={onPass}
        disabled={disabled}
      >
        Pass
      </Button>
      <Button
        variant="destructive"
        size="lg"
        className="min-h-[48px] flex-1 font-display"
        onClick={onResign}
        disabled={disabled}
      >
        Resign
      </Button>
    </div>
  )
}
