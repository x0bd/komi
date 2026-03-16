import { useEffect } from "react"
import { useGameStore } from "@/lib/stores/game-store"

export function useGameClock() {
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      useGameStore.getState().tickActiveTimer(1)
    }, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])
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
