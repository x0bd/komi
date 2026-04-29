"use client"

import { useEffect, useMemo, useRef } from "react"
import { useStorage } from "@liveblocks/react"
import { useGameStore, type MultiplayerSnapshot } from "@/lib/stores/game-store"

function createSnapshotFingerprint(snapshot: MultiplayerSnapshot) {
  return [
    snapshot.moveNumber,
    snapshot.turn,
    snapshot.consecutivePasses,
    snapshot.captured.black,
    snapshot.captured.white,
    snapshot.timers.black,
    snapshot.timers.white,
    snapshot.size,
    snapshot.komi,
    snapshot.isGameOver ? 1 : 0,
    snapshot.winner ?? "-",
    snapshot.gameOverReason ?? "-",
    snapshot.board.join(""),
    snapshot.moveHistory.length,
  ].join("|")
}

export function OnlineRoomSync() {
  const mode = useGameStore((state) => state.mode)
  const hydrateFromMultiplayer = useGameStore((state) => state.hydrateFromMultiplayer)

  const remoteSnapshot = useStorage((root) => {
    if (!root) {
      return null
    }

    return {
      size: root.size === 9 || root.size === 13 || root.size === 19 ? root.size : 19,
      komi: typeof root.komi === "number" && Number.isFinite(root.komi) ? root.komi : 6.5,
      board: [...root.board],
      turn: root.turn,
      moveNumber: root.moveNumber,
      consecutivePasses: root.consecutivePasses,
      captured: {
        black: root.captured.black,
        white: root.captured.white,
      },
      ko: root.ko,
      history: [...root.history],
      moveHistory: root.moveHistory.map((move) => ({ ...move })),
      timers: {
        black: root.timers.black,
        white: root.timers.white,
      },
      isGameOver: root.isGameOver,
      winner: root.winner,
      gameOverReason: root.gameOverReason,
    } satisfies MultiplayerSnapshot
  })

  const remoteFingerprint = useMemo(
    () => (remoteSnapshot ? createSnapshotFingerprint(remoteSnapshot) : null),
    [remoteSnapshot],
  )
  const appliedFingerprintRef = useRef<string | null>(null)

  useEffect(() => {
    if (mode !== "online" || !remoteSnapshot || !remoteFingerprint) {
      return
    }

    if (appliedFingerprintRef.current === remoteFingerprint) {
      return
    }

    appliedFingerprintRef.current = remoteFingerprint
    hydrateFromMultiplayer(remoteSnapshot)
  }, [hydrateFromMultiplayer, mode, remoteFingerprint, remoteSnapshot])

  return null
}
