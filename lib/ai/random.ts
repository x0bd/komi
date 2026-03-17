import type { GameState, PlayerColor } from "../engine/types"
import { getValidMoves } from "../engine/game"
import { applyMove } from "../engine/rules"
import { findGroup } from "../engine/groups"
import { getIndex, getNeighbors } from "../engine/board"
import type { AIDifficulty } from "../stores/game-store"

type Candidate = {
  x: number
  y: number
  score: number
  nextState: GameState
  captureGain: number
  liberties: number
}

function opponentOf(player: PlayerColor): PlayerColor {
  return player === "black" ? "white" : "black"
}

function getCaptureGain(before: GameState, after: GameState, player: PlayerColor) {
  return player === "black"
    ? after.captured.black - before.captured.black
    : after.captured.white - before.captured.white
}

function getCenterBias(size: number, x: number, y: number) {
  const center = (size - 1) / 2
  const dx = Math.abs(x - center)
  const dy = Math.abs(y - center)
  const distance = dx + dy
  const maxDistance = center * 2
  return 1 - distance / Math.max(1, maxDistance)
}

function evaluateBaseMove(
  state: GameState,
  size: number,
  x: number,
  y: number,
  player: PlayerColor
): Candidate | null {
  const nextState = applyMove(state, size, x, y, player)
  if (!nextState) return null

  const moveIndex = getIndex(x, y, size)
  const group = findGroup(nextState.board, size, moveIndex)
  const liberties = group ? group.liberties.size : 0
  const captureGain = getCaptureGain(state, nextState, player)

  const neighbors = getNeighbors(moveIndex, size)
  const selfStone = player === "black" ? 1 : 2
  const oppStone = player === "black" ? 2 : 1
  let adjacentAllies = 0
  let adjacentOpponents = 0

  for (const n of neighbors) {
    if (nextState.board[n] === selfStone) adjacentAllies += 1
    if (nextState.board[n] === oppStone) adjacentOpponents += 1
  }

  const phase = state.moveNumber / (size * size)
  const centerBias = getCenterBias(size, x, y)
  const edgePenalty =
    phase < 0.18 && (x === 0 || y === 0 || x === size - 1 || y === size - 1)
      ? -2.2
      : 0
  const atariPenalty = liberties <= 1 ? -8 : 0

  const score =
    captureGain * 24 +
    Math.min(liberties, 6) * 2.2 +
    adjacentAllies * 0.8 +
    adjacentOpponents * 1.2 +
    centerBias * (phase < 0.35 ? 6 : 2.5) +
    edgePenalty +
    atariPenalty

  return {
    x,
    y,
    score,
    nextState,
    captureGain,
    liberties,
  }
}

function sampleMoves<T>(moves: T[], limit: number) {
  if (moves.length <= limit) return moves
  const step = Math.ceil(moves.length / limit)
  const sampled: T[] = []
  for (let i = 0; i < moves.length; i += step) {
    sampled.push(moves[i])
  }
  return sampled
}

function getMaxImmediateCounterCapture(
  nextState: GameState,
  size: number,
  opponent: PlayerColor
) {
  const opponentMoves = sampleMoves(
    getValidMoves(nextState, size, opponent),
    18
  )

  let maxCapture = 0
  for (const move of opponentMoves) {
    const responseState = applyMove(nextState, size, move.x, move.y, opponent)
    if (!responseState) continue
    const responseCapture = getCaptureGain(nextState, responseState, opponent)
    if (responseCapture > maxCapture) {
      maxCapture = responseCapture
    }
  }

  return maxCapture
}

function pickWeighted(candidates: Candidate[], temperature = 2.4) {
  if (candidates.length === 0) return null
  const sorted = [...candidates].sort((a, b) => b.score - a.score)
  const top = sorted.slice(0, Math.min(6, sorted.length))
  const bestScore = top[0].score

  const weights = top.map((c) => Math.exp((c.score - bestScore) / temperature))
  const sum = weights.reduce((acc, w) => acc + w, 0)
  let r = Math.random() * sum
  for (let i = 0; i < top.length; i++) {
    r -= weights[i]
    if (r <= 0) return top[i]
  }
  return top[top.length - 1]
}

export async function getRandomAIMove(
  state: GameState,
  size: number,
  player: PlayerColor,
  difficulty: AIDifficulty = "easy"
): Promise<{ x: number; y: number; isPass: boolean }> {
  const delayMs =
    difficulty === "hard"
      ? Math.floor(Math.random() * 420) + 480
      : difficulty === "medium"
        ? Math.floor(Math.random() * 360) + 380
        : Math.floor(Math.random() * 320) + 300
  await new Promise(resolve => setTimeout(resolve, delayMs))

  const validMoves = getValidMoves(state, size, player)
  
  if (validMoves.length === 0) {
    return { x: -1, y: -1, isPass: true }
  }

  if (difficulty === "easy") {
    const randomIdx = Math.floor(Math.random() * validMoves.length)
    const selectedMove = validMoves[randomIdx]
    return { ...selectedMove, isPass: false }
  }

  const candidates = validMoves
    .map((move) => evaluateBaseMove(state, size, move.x, move.y, player))
    .filter((candidate): candidate is Candidate => candidate !== null)

  if (candidates.length === 0) {
    const fallback = validMoves[Math.floor(Math.random() * validMoves.length)]
    return { ...fallback, isPass: false }
  }

  if (difficulty === "medium") {
    const chosen = pickWeighted(candidates, 2.5) ?? candidates[0]
    return { x: chosen.x, y: chosen.y, isPass: false }
  }

  const opponent = opponentOf(player)
  const topCandidates = [...candidates]
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.min(10, candidates.length))

  let best = topCandidates[0]
  let bestScore = Number.NEGATIVE_INFINITY

  for (const candidate of topCandidates) {
    const counterCapture = getMaxImmediateCounterCapture(
      candidate.nextState,
      size,
      opponent
    )
    const riskPenalty = counterCapture * 20 + (candidate.liberties <= 1 ? 12 : 0)
    const captureBonus = candidate.captureGain * 8
    const noise = Math.random() * 0.45
    const score = candidate.score + captureBonus - riskPenalty + noise

    if (score > bestScore) {
      bestScore = score
      best = candidate
    }
  }

  return { x: best.x, y: best.y, isPass: false }
}
