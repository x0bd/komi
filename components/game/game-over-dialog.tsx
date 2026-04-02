"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function GameOverDialog({
  open,
  onOpenChange,
  result,
  reason = "score",
  onPlayAgain,
  className,
}: {
  open: boolean
  onOpenChange?: (open: boolean) => void
  result: "black-wins" | "white-wins" | "draw"
  reason?: "score" | "resignation" | "timeout"
  onPlayAgain?: () => void
  className?: string
}) {
  const winnerText =
    result === "black-wins"
      ? "Black wins"
      : result === "white-wins"
        ? "White wins"
        : "Draw"

  const resultText =
    reason === "resignation"
      ? `${winnerText} by resignation`
      : reason === "timeout"
        ? `${winnerText} on time`
        : winnerText

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={true}
        className={cn(
          "rounded-none border-4 border-black bg-black text-white shadow-[8px_8px_0_0_var(--swiss-red)]",
          className
        )}
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-bold text-center">
            {resultText}
          </DialogTitle>
        </DialogHeader>
        <DialogFooter className="sm:justify-center pt-2">
          <Button variant="accent" onClick={onPlayAgain} className="font-display">
            Play Again
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
