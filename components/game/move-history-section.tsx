"use client"

import { useState } from "react"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { MoveHistory, type MoveEntry } from "@/components/game/move-history"
import { HugeiconsIcon } from "@hugeicons/react"
import { SearchIcon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

export function MoveHistorySection({
  moves,
  moveCount = 0,
  collapsed = false,
  highlightedMoveNumber,
  onMoveSelect,
  onToggle,
  className,
}: {
  moves: MoveEntry[]
  moveCount?: number
  collapsed?: boolean
  highlightedMoveNumber?: number
  onMoveSelect?: (moveNumber: number) => void
  onToggle?: () => void
  className?: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className={cn("hidden min-h-0 flex-1 flex-col lg:flex", className)}>
        <MoveHistory
          moves={moves}
          moveCount={moveCount}
          collapsed={collapsed}
          highlightedMoveNumber={highlightedMoveNumber}
          onMoveSelect={onMoveSelect}
          onToggle={onToggle}
        />
      </div>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <button
            type="button"
            className="flex min-h-[48px] w-full items-center gap-3 border border-border bg-background px-4 font-sans text-sm font-semibold lg:hidden"
          >
            <HugeiconsIcon icon={SearchIcon} strokeWidth={2} className="size-5" />
            <span>History</span>
            <span className="ml-auto font-mono text-xs font-bold tabular-nums text-muted-foreground">
              {moveCount} moves
            </span>
          </button>
        </DrawerTrigger>
        <DrawerContent className="max-h-[85vh] border-t [border-radius:0]">
          <DrawerHeader className="border-b pb-4">
            <DrawerTitle className="font-mono text-[12px] font-semibold uppercase tracking-[0.18em]">
              Move History
            </DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 overflow-hidden">
            <MoveHistory
              moves={moves}
              moveCount={moveCount}
              highlightedMoveNumber={highlightedMoveNumber}
              onMoveSelect={onMoveSelect}
              variant="embedded"
            />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export type { MoveEntry }
