"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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

  const ghostMark =
    result === "black-wins" || result === "white-wins" ? "勝" : "形"

  const actionClass =
    "h-11 border border-border bg-background px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground transition-colors hover:bg-subtle disabled:cursor-not-allowed disabled:opacity-35"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={true}
        className={cn(
          "overflow-hidden border border-border bg-background p-0 text-foreground [border-radius:0] sm:max-w-2xl",
          className,
        )}
      >
        <span className="pointer-events-none absolute -right-4 top-8 font-sans text-[9rem] font-semibold leading-none text-foreground/10">
          {ghostMark}
        </span>

        <DialogHeader className="gap-0 border-b border-border px-6 pb-6 pt-7 text-left">
          <div className="mb-5 flex items-center justify-between gap-4">
            <span className="border border-border px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Match dossier
            </span>
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {moveCount} moves
            </span>
          </div>
          <DialogTitle className="max-w-lg font-sans text-4xl font-semibold leading-[0.95] tracking-[-0.06em] text-foreground sm:text-5xl">
            {resultText}
          </DialogTitle>
          <DialogDescription className="mt-4 max-w-md font-sans text-sm leading-relaxed text-muted-foreground">
            Review the finish, replay the shape, export the SGF, or reset the board.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
          <DossierMetric label="Finish" value={reasonLabel} />
          <DossierMetric label="Record" value={saveLabel} />
          <DossierMetric label="Replay" value={moveCount > 0 ? "Ready" : "Empty"} />
        </div>

        <div className="grid gap-px bg-border p-px sm:grid-cols-2">
          <button
            type="button"
            onClick={onReview ?? (() => onOpenChange?.(false))}
            className={actionClass}
          >
            Review Board
          </button>
          <button
            type="button"
            onClick={onReplay}
            disabled={!onReplay || moveCount === 0}
            className={actionClass}
          >
            Watch Replay
          </button>
          <button
            type="button"
            onClick={onExportSgf}
            disabled={!onExportSgf || moveCount === 0}
            className={actionClass}
          >
            Export SGF
          </button>
          <button
            type="button"
            onClick={onShare}
            disabled={!onShare}
            className={actionClass}
          >
            Copy Link
          </button>
          <button
            type="button"
            onClick={onPlayAgain}
            className="h-12 border border-border bg-accent px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-foreground transition-colors hover:bg-foreground hover:text-primary-foreground sm:col-span-2"
          >
            Play Again
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DossierMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-4">
      <span className="block font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </span>
      <span className="mt-1 block font-sans text-[15px] font-semibold tracking-[-0.03em] text-foreground">
        {value}
      </span>
    </div>
  )
}
