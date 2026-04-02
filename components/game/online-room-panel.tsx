"use client"

import { useMemo, useState } from "react"
import { useOthersConnectionIds, useStatus } from "@liveblocks/react"
import { Button } from "@/components/ui/button"
import { LuWifi, LuCopy, LuCheck, LuUsers } from "react-icons/lu"
import { cn } from "@/lib/utils"

export function OnlineRoomPanel({
  roomId,
  shareUrl,
  isConnecting,
  error,
  onCreateRoom,
  onJoinRoom,
}: {
  roomId: string | null
  shareUrl: string | null
  isConnecting: boolean
  error: string | null
  onCreateRoom: () => void
  onJoinRoom: (roomId: string) => void
}) {
  const [roomInput, setRoomInput] = useState("")

  return (
    <div className="flex flex-col gap-4 rounded-none border-2 border-border bg-card shadow-[4px_4px_0_0_var(--foreground)] p-6">
      <div className="flex items-center justify-between px-1">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-mono font-bold uppercase tracking-[0.15em] text-muted-foreground">
            Online Room
          </span>
          <p className="text-[15px] font-semibold text-foreground">
            {roomId ? "Room Active" : "Play with a Friend"}
          </p>
        </div>
        <div className={cn(
          "flex items-center gap-1.5 px-3 py-1 rounded-none text-[11px] font-mono font-bold uppercase tracking-widest border-2",
          roomId
            ? "bg-status-active text-background border-status-active"
            : "bg-background text-muted-foreground border-border"
        )}>
          <LuWifi className="size-3" />
          {roomId ? "Live" : "Offline"}
        </div>
      </div>

      {roomId ? (
        <ConnectedRoomDetails roomId={roomId} shareUrl={shareUrl} />
      ) : (
        <p className="text-[13px] text-muted-foreground font-medium px-1">
          Create a room to invite someone, or paste a room ID to join.
        </p>
      )}

      <div className="flex gap-2 mt-1">
        <Button
          type="button"
          disabled={isConnecting}
          onClick={onCreateRoom}
          className="flex-1 h-11 rounded-none font-mono font-bold uppercase tracking-widest text-[11px] border border-transparent shadow-[2px_2px_0_0_var(--foreground)]"
        >
          {isConnecting ? "Creating..." : "Create Room"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isConnecting || roomInput.trim().length < 6}
          onClick={() => onJoinRoom(roomInput)}
          className="flex-1 h-11 rounded-none font-mono font-bold uppercase tracking-widest text-[11px] border-2 border-border shadow-[2px_2px_0_0_var(--border)]"
        >
          Join Room
        </Button>
      </div>

      <input
        value={roomInput}
        onChange={(event) => setRoomInput(event.target.value)}
        placeholder="Paste room ID..."
        className="h-11 w-full rounded-none border-2 border-border bg-background px-4 font-mono text-[13px] font-bold text-foreground placeholder:text-muted-foreground outline-none focus:border-foreground focus:shadow-[2px_2px_0_0_var(--foreground)] transition-shadow"
      />

      {error ? (
        <p className="text-[12px] font-medium text-destructive px-1">{error}</p>
      ) : null}
    </div>
  )
}

function ConnectedRoomDetails({
  roomId,
  shareUrl,
}: {
  roomId: string
  shareUrl: string | null
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

  const opponentStatus = otherConnectionIds.length > 0 ? "Online" : "Waiting..."

  function handleCopy() {
    if (!shareUrl) return
    void navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-3 rounded-none bg-background border-2 border-border p-4 shadow-[2px_2px_0_0_var(--foreground)]">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[12px] text-muted-foreground truncate max-w-[160px]">{roomId}</span>
        <span className={cn(
          "text-[11px] font-bold uppercase",
          status === "connected" ? "text-status-active" : "text-destructive"
        )}>
          {connectionText}
        </span>
      </div>

      <div className="flex items-center gap-2 text-[12px] text-muted-foreground font-mono font-bold">
        <LuUsers className="size-3.5" />
        <span>{otherConnectionIds.length + 1} in room</span>
        <div className="w-[2px] h-[2px] rounded-none bg-border" />
        <span>Opponent: {opponentStatus}</span>
      </div>

      {shareUrl ? (
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center justify-between gap-3 h-9 rounded-none border border-border bg-background px-3 font-mono text-[12px] font-bold text-muted-foreground transition-colors hover:text-foreground hover:bg-foreground hover:border-transparent group"
        >
          <span className="truncate">{shareUrl}</span>
          {copied
            ? <LuCheck className="size-3.5 shrink-0 text-status-active" />
            : <LuCopy className="size-3.5 shrink-0 hover:text-primary-foreground opacity-30 group-hover:opacity-100 transition-opacity" />
          }
        </button>
      ) : null}
    </div>
  )
}
