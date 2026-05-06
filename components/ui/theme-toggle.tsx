"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Sun01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

export function ThemeToggle({ className }: { className?: string }) {
  return (
    <button
      type="button"
      aria-label="Fixed light theme"
      aria-disabled="true"
      disabled
      className={cn(
        "flex size-10 items-center justify-center rounded-[10px] border border-border bg-subtle/50 text-muted-foreground",
        className
      )}
    >
      <HugeiconsIcon
        icon={Sun01Icon}
        size={16}
        color="currentColor"
        strokeWidth={2}
      />
    </button>
  )
}
