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
        className="flex-1 font-display"
        onClick={onPass}
        disabled={disabled}
      >
        Pass
      </Button>
      <Button
        variant="destructive"
        className="flex-1 font-display"
        onClick={onResign}
        disabled={disabled}
      >
        Resign
      </Button>
    </div>
  )
}
