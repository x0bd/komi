"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function GameOverDialog({
  open,
  onOpenChange,
  result,
  reason = "score",
  moveCount = 0,
  saveState = "idle",
  onPlayAgain,
  onReview,
  onReplay,
  onExportSgf,
  onShare,
  className,
}: {
  open: boolean
  onOpenChange?: (open: boolean) => void
  result: "black-wins" | "white-wins" | "draw"
  reason?: "score" | "resignation" | "timeout"
  moveCount?: number
  saveState?: "idle" | "saving" | "saved" | "skipped" | "failed"
  onPlayAgain?: () => void
  onReview?: () => void
  onReplay?: () => void
  onExportSgf?: () => void
  onShare?: () => void
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

  const reasonLabel =
    reason === "resignation"
      ? "Resign"
      : reason === "timeout"
        ? "Time"
        : "Score"

  const saveLabel =
    saveState === "saving"
      ? "Saving"
      : saveState === "saved"
        ? "Saved"
        : saveState === "failed"
          ? "Save failed"
          : saveState === "skipped"
            ? "Casual"
            : "Ready"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={true}
        className={cn(
          "overflow-hidden rounded-none border-4 border-black bg-black p-0 text-white shadow-[8px_8px_0_0_var(--swiss-red)] sm:max-w-xl",
          className
        )}
      >
        <DialogHeader className="gap-0 border-b-2 border-white/20 px-6 pb-5 pt-7">
          <div className="mb-4 flex items-center justify-between gap-4">
            <span className="border-2 border-white bg-white px-3 py-1 font-mono text-[11px] font-black uppercase tracking-[0.18em] text-black">
              Game Over
            </span>
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">
              {moveCount} moves
            </span>
          </div>
          <DialogTitle className="font-display text-4xl font-black uppercase leading-[0.95] tracking-tighter text-white sm:text-5xl">
            {resultText}
          </DialogTitle>
          <DialogDescription className="mt-3 max-w-sm text-sm font-semibold text-white/60">
            Choose the next read: review the finish, replay the shape, export the SGF, or reset the board.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 border-b-2 border-white/20 text-center font-mono text-[11px] font-black uppercase tracking-[0.14em]">
          <div className="border-r-2 border-white/20 px-3 py-4">
            <span className="block text-white/40">Finish</span>
            <span className="mt-1 block text-white">{reasonLabel}</span>
          </div>
          <div className="border-r-2 border-white/20 px-3 py-4">
            <span className="block text-white/40">Record</span>
            <span className="mt-1 block text-white">{saveLabel}</span>
          </div>
          <div className="px-3 py-4">
            <span className="block text-white/40">Replay</span>
            <span className="mt-1 block text-white">
              {moveCount > 0 ? "Ready" : "Empty"}
            </span>
          </div>
        </div>

        <div className="grid gap-3 p-5 sm:grid-cols-2">
          <Button
            variant="outline"
            onClick={onReview ?? (() => onOpenChange?.(false))}
            className="h-12 rounded-none border-2 border-white bg-transparent font-display font-black uppercase text-white hover:bg-white hover:text-black"
          >
            Review Board
          </Button>

          <Button
            variant="outline"
            onClick={onReplay}
            disabled={!onReplay || moveCount === 0}
            className="h-12 rounded-none border-2 border-white bg-transparent font-display font-black uppercase text-white hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:border-white/20 disabled:text-white/30"
          >
            Watch Replay
          </Button>

          <Button
            variant="outline"
            onClick={onExportSgf}
            disabled={!onExportSgf || moveCount === 0}
            className="h-12 rounded-none border-2 border-white bg-transparent font-display font-black uppercase text-white hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:border-white/20 disabled:text-white/30"
          >
            Export SGF
          </Button>

          <Button
            variant="outline"
            onClick={onShare}
            disabled={!onShare}
            className="h-12 rounded-none border-2 border-white bg-transparent font-display font-black uppercase text-white hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:border-white/20 disabled:text-white/30"
          >
            Copy Link
          </Button>

          <Button
            variant="accent"
            onClick={onPlayAgain}
            className="h-12 rounded-none border-2 border-white font-display font-black uppercase shadow-[4px_4px_0_0_var(--swiss-red)] sm:col-span-2"
          >
            Play Again
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
