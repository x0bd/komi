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
  onPlayAgain,
  className,
}: {
  open: boolean
  onOpenChange?: (open: boolean) => void
  result: "black-wins" | "white-wins" | "draw" | "resignation"
  onPlayAgain?: () => void
  className?: string
}) {
  const resultText =
    result === "black-wins"
      ? "Black wins"
      : result === "white-wins"
        ? "White wins"
        : result === "draw"
          ? "Draw"
          : "Game over (resignation)"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={true}
        className={cn(
          "backdrop-blur-xl bg-background/95 dark:bg-background/95",
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
