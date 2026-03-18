"use client"

import { useMemo, useState } from "react"
import { useOthersConnectionIds, useStatus } from "@liveblocks/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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
    <Card size="sm" className="border-status-active/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2 text-sm">
          <span>Online Room</span>
          <Badge variant="outline">{roomId ? "Connected" : "Not Joined"}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {roomId ? (
          <ConnectedRoomDetails roomId={roomId} shareUrl={shareUrl} />
        ) : (
          <p className="text-xs text-muted-foreground">
            Create a room to invite someone, or paste a room id to join.
          </p>
        )}

        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={isConnecting}
            onClick={onCreateRoom}
            className="flex-1"
          >
            Create Room
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isConnecting || roomInput.trim().length < 6}
            onClick={() => onJoinRoom(roomInput)}
            className="flex-1"
          >
            Join Room
          </Button>
        </div>

        <input
          value={roomInput}
          onChange={(event) => setRoomInput(event.target.value)}
          placeholder="komi-room:..."
          className="h-9 w-full rounded-full border border-input bg-input/40 px-3 text-xs outline-none transition-colors focus:border-ring"
        />

        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </CardContent>
    </Card>
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

  const connectionText = useMemo(() => {
    if (status === "connecting") return "Connecting"
    if (status === "connected") return "Live"
    if (status === "reconnecting") return "Reconnecting"
    return "Disconnected"
  }, [status])

  const connectionQuality = useMemo(() => {
    if (status === "connected") return "Good"
    if (status === "reconnecting") return "Poor"
    return "Offline"
  }, [status])

  const opponentStatus = otherConnectionIds.length > 0 ? "Online" : "Waiting"

  return (
    <div className="space-y-2 rounded-xl bg-muted/30 p-3">
      <div className="flex items-center justify-between">
        <span className="truncate font-mono text-xs">{roomId}</span>
        <Badge variant="outline">{connectionText}</Badge>
      </div>
      <p className="text-xs text-muted-foreground">
        Players in room: {otherConnectionIds.length + 1}
      </p>
      <p className="text-xs text-muted-foreground">
        Opponent: {opponentStatus}
      </p>
      <p className="text-xs text-muted-foreground">
        Connection quality: {connectionQuality}
      </p>
      {shareUrl ? (
        <a
          href={shareUrl}
          className="block truncate text-xs text-primary hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          {shareUrl}
        </a>
      ) : null}
    </div>
  )
}
