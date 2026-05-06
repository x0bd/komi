"use client"

export function LastMoveMarker() {
  return (
    <div className="animate-marker-appear absolute left-1/2 top-1/2 size-[46%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent">
      <span className="absolute left-1/2 top-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent" />
    </div>
  )
}
