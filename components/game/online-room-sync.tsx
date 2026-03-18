"use client"

import { useEffect, useMemo, useRef } from "react"
import { useMutation, useStorage } from "@liveblocks/react"
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

  const localSnapshot = useGameStore(
    (state) =>
      ({
        board: [...state.gameState.board],
        turn: state.gameState.turn,
        moveNumber: state.gameState.moveNumber,
        consecutivePasses: state.gameState.consecutivePasses,
        captured: {
          black: state.gameState.captured.black,
          white: state.gameState.captured.white,
        },
        ko: state.gameState.ko,
        history: [...state.gameState.history],
        moveHistory: state.moveHistory.map((move) => ({ ...move })),
        timers: {
          black: state.timers.black,
          white: state.timers.white,
        },
        isGameOver: state.isGameOver,
        winner: state.winner,
        gameOverReason: state.gameOverReason,
      }) satisfies MultiplayerSnapshot,
  )

  const remoteSnapshot = useStorage((root) => {
    if (!root) {
      return null
    }

    return {
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

  const localFingerprint = useMemo(
    () => createSnapshotFingerprint(localSnapshot),
    [localSnapshot],
  )
  const remoteFingerprint = useMemo(
    () => (remoteSnapshot ? createSnapshotFingerprint(remoteSnapshot) : null),
    [remoteSnapshot],
  )
  const lastHydratedFingerprintRef = useRef<string | null>(null)
  const pendingPushFingerprintRef = useRef<string | null>(null)

  const writeSnapshot = useMutation(
    ({ storage }, snapshot: MultiplayerSnapshot) => {
      storage.set("board", [...snapshot.board])
      storage.set("turn", snapshot.turn)
      storage.set("moveNumber", snapshot.moveNumber)
      storage.set("consecutivePasses", snapshot.consecutivePasses)
      storage.set("captured", {
        black: snapshot.captured.black,
        white: snapshot.captured.white,
      })
      storage.set("ko", snapshot.ko)
      storage.set("history", [...snapshot.history])
      storage.set(
        "moveHistory",
        snapshot.moveHistory.map((move) => ({ ...move })),
      )
      storage.set("timers", {
        black: snapshot.timers.black,
        white: snapshot.timers.white,
      })
      storage.set("isGameOver", snapshot.isGameOver)
      storage.set("winner", snapshot.winner)
      storage.set("gameOverReason", snapshot.gameOverReason)
    },
    [],
  )

  useEffect(() => {
    if (mode !== "online" || !remoteSnapshot || !remoteFingerprint) {
      return
    }

    if (
      pendingPushFingerprintRef.current &&
      localFingerprint === pendingPushFingerprintRef.current &&
      remoteFingerprint !== pendingPushFingerprintRef.current
    ) {
      return
    }

    if (pendingPushFingerprintRef.current === remoteFingerprint) {
      pendingPushFingerprintRef.current = null
    }

    if (remoteFingerprint === localFingerprint) {
      return
    }

    lastHydratedFingerprintRef.current = remoteFingerprint
    hydrateFromMultiplayer(remoteSnapshot)
  }, [
    hydrateFromMultiplayer,
    localFingerprint,
    mode,
    remoteFingerprint,
    remoteSnapshot,
  ])

  useEffect(() => {
    if (mode !== "online" || !remoteSnapshot || !remoteFingerprint) {
      return
    }

    if (localFingerprint === remoteFingerprint) {
      return
    }

    if (lastHydratedFingerprintRef.current === localFingerprint) {
      return
    }

    pendingPushFingerprintRef.current = localFingerprint
    writeSnapshot(localSnapshot)
  }, [
    localFingerprint,
    localSnapshot,
    mode,
    remoteFingerprint,
    remoteSnapshot,
    writeSnapshot,
  ])

  return null
}
