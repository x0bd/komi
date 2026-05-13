"use client"

import { useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"

export type SpriteAnimation = {
  frames: number[]
  fps?: number
  loop?: boolean
}

export type SpriteAnimationMap = Record<string, SpriteAnimation>

export type SpriteAnimatorProps = {
  src: string
  columns: number
  rows: number
  frameCount: number
  animation?: string
  animations?: SpriteAnimationMap
  frame?: number
  fps?: number
  loop?: boolean
  play?: boolean
  animationKey?: string | number
  label?: string
  className?: string
  spriteClassName?: string
}

export function SpriteAnimator({
  src,
  columns,
  rows,
  frameCount,
  animation = "idle",
  animations,
  frame,
  fps = 8,
  loop = true,
  play = true,
  animationKey,
  label,
  className,
  spriteClassName,
}: SpriteAnimatorProps) {
  const [step, setStep] = useState(0)
  const prefersReducedMotion = usePrefersReducedMotion()

  const sequence = useMemo(() => {
    if (typeof frame === "number") return [clampFrame(frame, frameCount)]
    const selected = animations?.[animation]
    const frames = selected?.frames?.length ? selected.frames : [0]
    return frames.map((item) => clampFrame(item, frameCount))
  }, [animation, animations, frame, frameCount])

  const selectedAnimation = animations?.[animation]
  const effectiveFps = selectedAnimation?.fps ?? fps
  const shouldLoop = selectedAnimation?.loop ?? loop
  const activeFrame = sequence[step % sequence.length] ?? 0
  const column = activeFrame % columns
  const row = Math.floor(activeFrame / columns)
  const x = columns <= 1 ? 0 : (column / (columns - 1)) * 100
  const y = rows <= 1 ? 0 : (row / (rows - 1)) * 100

  useEffect(() => {
    setStep(0)
  }, [animation, animationKey, frame])

  useEffect(() => {
    if (!play || prefersReducedMotion || sequence.length <= 1 || effectiveFps <= 0) {
      return
    }

    const interval = window.setInterval(() => {
      setStep((current) => {
        const next = current + 1
        if (shouldLoop) return next % sequence.length
        return Math.min(next, sequence.length - 1)
      })
    }, 1000 / effectiveFps)

    return () => window.clearInterval(interval)
  }, [effectiveFps, play, prefersReducedMotion, sequence.length, shouldLoop])

  return (
    <span
      aria-label={label}
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      className={cn("relative inline-block aspect-square overflow-hidden", className)}
    >
      <span
        className={cn("absolute inset-0 bg-no-repeat", spriteClassName)}
        style={{
          backgroundImage: `url(${src})`,
          backgroundSize: `${columns * 100}% ${rows * 100}%`,
          backgroundPosition: `${x}% ${y}%`,
        }}
      />
    </span>
  )
}

function clampFrame(frame: number, frameCount: number) {
  return Math.min(Math.max(Math.floor(frame), 0), Math.max(frameCount - 1, 0))
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(query.matches)

    function handleChange(event: MediaQueryListEvent) {
      setReduced(event.matches)
    }

    query.addEventListener("change", handleChange)
    return () => query.removeEventListener("change", handleChange)
  }, [])

  return reduced
}
