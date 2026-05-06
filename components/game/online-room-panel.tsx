"use client"

import { useMemo, useState } from "react"
import { useOthersConnectionIds, useStatus } from "@liveblocks/react"
import { LuCheck, LuCopy, LuLogOut, LuUsers, LuWifi } from "react-icons/lu"
import { cn } from "@/lib/utils"

export function OnlineRoomPanel({
  roomId,
  shareUrl,
  isConnecting,
  error,
  onCreateRoom,
  onJoinRoom,
  onLeaveRoom,
}: {
  roomId: string | null
  shareUrl: string | null
  isConnecting: boolean
  error: string | null
  onCreateRoom: () => void
  onJoinRoom: (roomId: string) => void
  onLeaveRoom: () => void
}) {
  const [roomInput, setRoomInput] = useState("")

  return (
    <div className="flex flex-col border border-border bg-background">
      <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Online Room
          </span>
          <p className="font-sans text-[15px] font-semibold tracking-[-0.03em] text-foreground">
            {roomId ? "Room active" : "Play with a friend"}
          </p>
        </div>
        <div
          className={cn(
            "flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em]",
            roomId
              ? "border-status-active text-status-active"
              : "border-border text-muted-foreground",
          )}
        >
          <LuWifi className="size-3" />
          {roomId ? "Live" : "Offline"}
        </div>
      </div>

      <div className="flex flex-col gap-4 p-4">
        {roomId ? (
          <ConnectedRoomDetails
            roomId={roomId}
            shareUrl={shareUrl}
            onLeaveRoom={onLeaveRoom}
          />
        ) : (
          <p className="border-l border-border pl-3 font-sans text-[13px] leading-relaxed text-muted-foreground">
            Create a room to invite someone, or paste a room ID to join.
          </p>
        )}

        <div className="grid h-11 grid-cols-2 border border-border">
          <button
            type="button"
            disabled={isConnecting}
            onClick={onCreateRoom}
            className="border-r border-border font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground transition-colors hover:bg-subtle disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isConnecting ? "Creating" : "Create Room"}
          </button>
          <button
            type="button"
            disabled={isConnecting || roomInput.trim().length < 6}
            onClick={() => onJoinRoom(roomInput)}
            className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-45"
          >
            Join Room
          </button>
        </div>

        <input
          value={roomInput}
          onChange={(event) => setRoomInput(event.target.value)}
          placeholder="Paste room ID..."
          className="h-11 w-full border border-border bg-background px-3 font-mono text-[12px] font-semibold text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
        />

        {error ? (
          <p className="font-mono text-[11px] font-semibold text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  )
}

function ConnectedRoomDetails({
  roomId,
  shareUrl,
  onLeaveRoom,
}: {
  roomId: string
  shareUrl: string | null
  onLeaveRoom: () => void
}) {
  const status = useStatus()
  const otherConnectionIds = useOthersConnectionIds()
  const [copied, setCopied] = useState(false)

  const connectionText = useMemo(() => {
    if (status === "connecting") return "Connecting"
    if (status === "connected") return "Live"
    if (status === "reconnecting") return "Reconnecting"
    return "Disconnected"
  }, [status])

  const opponentStatus = otherConnectionIds.length > 0 ? "Rival seated" : "Seat open"

  function handleCopy() {
    if (!shareUrl) return
    void navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="flex flex-col border border-border bg-background">
      <div className="flex items-center justify-between">
        <span className="max-w-[180px] truncate border-r border-border px-3 py-2 font-mono text-[11px] text-muted-foreground">
          {roomId}
        </span>
        <span
          className={cn(
            "px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em]",
            status === "connected" ? "text-status-active" : "text-destructive",
          )}
        >
          {connectionText}
        </span>
      </div>

      <div className="flex items-center gap-2 border-t border-border px-3 py-2 font-mono text-[11px] font-semibold text-muted-foreground">
        <LuUsers className="size-3.5" />
        <span>{otherConnectionIds.length + 1} in room</span>
        <div className="h-3 w-px bg-border" />
        <span>{opponentStatus}</span>
      </div>

      {shareUrl ? (
        <button
          type="button"
          onClick={handleCopy}
          className="group flex h-9 items-center justify-between gap-3 border-t border-border bg-background px-3 font-mono text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-subtle hover:text-foreground"
        >
          <span className="truncate">{copied ? "Invite copied" : shareUrl}</span>
          {copied ? (
            <LuCheck className="size-3.5 shrink-0 text-status-active" />
          ) : (
            <LuCopy className="size-3.5 shrink-0 opacity-40 transition-opacity group-hover:opacity-100" />
          )}
        </button>
      ) : null}

      <button
        type="button"
        onClick={onLeaveRoom}
        className="flex h-9 items-center justify-center gap-2 border-t border-border bg-background px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
      >
        <LuLogOut className="size-3.5" />
        Leave Room
      </button>
    </div>
  )
}
