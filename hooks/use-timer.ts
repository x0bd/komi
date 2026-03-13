import { useState, useEffect, useCallback, useRef } from "react"

export function useTimer(initialSeconds: number, isActive: boolean) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds)
  const lastUpdateRef = useRef<number | null>(null)
  
  useEffect(() => {
    setTimeLeft(initialSeconds)
  }, [initialSeconds])

  useEffect(() => {
    if (!isActive || timeLeft <= 0) {
      lastUpdateRef.current = null
      return
    }

    let animationFrameId: number

    const updateTimer = (timestamp: number) => {
      if (lastUpdateRef.current === null) {
        lastUpdateRef.current = timestamp
      }

      const elapsed = timestamp - lastUpdateRef.current

      if (elapsed >= 1000) {
        setTimeLeft((prev) => {
          const next = Math.max(0, prev - 1)
          return next
        })
        lastUpdateRef.current = timestamp
      }

      animationFrameId = requestAnimationFrame(updateTimer)
    }

    animationFrameId = requestAnimationFrame(updateTimer)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [isActive, timeLeft])

  const addTime = useCallback((seconds: number) => {
    setTimeLeft((prev) => prev + seconds)
  }, [])

  return {
    timeLeft,
    minutes: Math.floor(timeLeft / 60),
    seconds: timeLeft % 60,
    isLowTime: timeLeft > 0 && timeLeft <= 60,
    isOutOfTime: timeLeft <= 0,
    addTime,
  }
}
