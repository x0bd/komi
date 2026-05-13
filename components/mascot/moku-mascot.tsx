"use client"

import { cn } from "@/lib/utils"
import {
  SpriteAnimator,
  type SpriteAnimationMap,
} from "@/components/mascot/sprite-animator"
import type { MascotMood } from "@/lib/mascot"

export type MokuMood = MascotMood

export const MOKU_SPRITE_SHEET = {
  src: "/mascots/moku-sprite-sheet.png",
  columns: 4,
  rows: 3,
  frameCount: 12,
} as const

export const MOKU_ANIMATIONS: SpriteAnimationMap = {
  idle: { frames: [0, 0, 1, 0], fps: 2.2 },
  blink: { frames: [0, 1, 0], fps: 7, loop: false },
  thinking: { frames: [2, 2, 0, 2], fps: 3.4 },
  praise: { frames: [3, 11, 3], fps: 5.5, loop: false },
  warning: { frames: [4, 4, 0], fps: 5, loop: false },
  teaching: { frames: [5, 5, 2, 5], fps: 3.5 },
  confused: { frames: [6, 6, 0], fps: 3.2, loop: false },
  focused: { frames: [7], fps: 1 },
  happy: { frames: [3, 11, 3, 1], fps: 5, loop: false },
  review: { frames: [10, 2, 10], fps: 3.5 },
  sleep: { frames: [8], fps: 1 },
  bow: { frames: [9, 9, 0], fps: 3.5, loop: false },
}

export type MokuMascotProps = {
  mood?: MokuMood
  size?: "sm" | "md" | "lg" | "hero"
  play?: boolean
  animationKey?: string | number
  className?: string
}

const MOKU_SIZE_CLASS: Record<NonNullable<MokuMascotProps["size"]>, string> = {
  sm: "size-16",
  md: "size-24",
  lg: "size-36",
  hero: "size-44 md:size-56",
}

export function MokuMascot({
  mood = "idle",
  size = "md",
  play = true,
  animationKey,
  className,
}: MokuMascotProps) {
  return (
    <SpriteAnimator
      {...MOKU_SPRITE_SHEET}
      animation={mood}
      animations={MOKU_ANIMATIONS}
      play={play}
      animationKey={animationKey}
      label={`Moku board fox, ${mood}`}
      className={cn(MOKU_SIZE_CLASS[size], "select-none", className)}
      spriteClassName="[image-rendering:auto]"
    />
  )
}
