import { useEffect } from "react"
import { useGameStore } from "@/lib/stores/game-store"

export function useGameClock(enabled = true) {
  useEffect(() => {
    if (!enabled) {
      return
    }

    let lastTickAt = Date.now()
    const intervalId = window.setInterval(() => {
      const now = Date.now()
      const elapsedSeconds = Math.floor((now - lastTickAt) / 1000)

      if (elapsedSeconds <= 0) {
        return
      }

      lastTickAt += elapsedSeconds * 1000
      useGameStore.getState().tickActiveTimer(elapsedSeconds)
    }, 250)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [enabled])
}

export function splitClock(totalSeconds: number) {
  const safeSeconds = Math.max(0, totalSeconds)

  return {
    timeLeft: safeSeconds,
    minutes: Math.floor(safeSeconds / 60),
    seconds: safeSeconds % 60,
    isLowTime: safeSeconds > 0 && safeSeconds <= 60,
    isOutOfTime: safeSeconds <= 0,
  }
}
