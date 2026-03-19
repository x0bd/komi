import { getValidMoves } from "../engine/game"
import { findGroup } from "../engine/groups"
import { applyMove } from "../engine/rules"
import { getIndex, getNeighbors } from "../engine/board"
import type { GameState, PlayerColor } from "../engine/types"
import type {
  EngineAnalysis,
  EngineCandidate,
  EngineDifficulty,
  EngineMove,
  EngineProvider,
  EngineRequest,
} from "./engine-provider"

type CandidateWithState = EngineCandidate & {
  nextState: GameState
}

const LETTERS = "ABCDEFGHJKLMNOPQRST"

function opponentOf(player: PlayerColor): PlayerColor {
  return player === "black" ? "white" : "black"
}

function delayForDifficulty(difficulty: EngineDifficulty) {
  if (difficulty === "hard") {
    return Math.floor(Math.random() * 420) + 480
  }
  if (difficulty === "medium") {
    return Math.floor(Math.random() * 360) + 380
  }
  return Math.floor(Math.random() * 320) + 300
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value))
}

function toCoordinate(x: number, y: number, size: number) {
  return `${LETTERS[x] ?? "?"}${size - y}`
}

function estimateWinRate(score: number) {
  return clamp01(0.5 + Math.tanh(score / 48) / 2)
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

function buildTags(captureGain: number, liberties: number) {
  const tags: string[] = []

  if (captureGain > 0) {
    tags.push(captureGain > 1 ? "capture-heavy" : "capture")
  }
  if (liberties >= 4) {
    tags.push("stable-shape")
  } else if (liberties <= 1) {
    tags.push("atari-risk")
  }

  return tags
}

function evaluateCandidate(
  state: GameState,
  size: number,
  x: number,
  y: number,
  player: PlayerColor,
): CandidateWithState | null {
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
    captureGain,
    liberties,
    confidence: 0.5,
    tags: buildTags(captureGain, liberties),
    nextState,
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

function evaluateBoardFast(state: GameState, player: PlayerColor) {
  const selfStone = player === "black" ? 1 : 2
  const oppStone = player === "black" ? 2 : 1
  let selfStones = 0
  let oppStones = 0

  for (const value of state.board) {
    if (value === selfStone) selfStones += 1
    if (value === oppStone) oppStones += 1
  }

  const captureDiff =
    player === "black"
      ? state.captured.black - state.captured.white
      : state.captured.white - state.captured.black

  return captureDiff * 13 + (selfStones - oppStones) * 0.8
}

function buildCandidates(
  state: GameState,
  size: number,
  player: PlayerColor,
): CandidateWithState[] {
  const validMoves = getValidMoves(state, size, player)
  const evaluated = validMoves
    .map((move) => evaluateCandidate(state, size, move.x, move.y, player))
    .filter((candidate): candidate is CandidateWithState => candidate !== null)
    .sort((a, b) => b.score - a.score)

  if (evaluated.length === 0) {
    return []
  }

  const bestScore = evaluated[0].score
  const tailScore = evaluated[evaluated.length - 1].score
  const spread = Math.max(1, bestScore - tailScore)

  return evaluated.map((candidate) => ({
    ...candidate,
    confidence: clamp01(0.25 + ((candidate.score - tailScore) / spread) * 0.75),
  }))
}

function pickWeighted(candidates: CandidateWithState[], temperature = 2.4) {
  if (candidates.length === 0) return null

  const top = candidates.slice(0, Math.min(6, candidates.length))
  const bestScore = top[0].score
  const weights = top.map((candidate) =>
    Math.exp((candidate.score - bestScore) / temperature),
  )
  const sum = weights.reduce((acc, next) => acc + next, 0)
  let roll = Math.random() * sum

  for (let i = 0; i < top.length; i++) {
    roll -= weights[i]
    if (roll <= 0) {
      return top[i]
    }
  }

  return top[top.length - 1]
}

function chooseHardCandidate(
  candidates: CandidateWithState[],
  size: number,
  player: PlayerColor,
  randomize: boolean,
) {
  if (candidates.length === 0) return null
  const opponent = opponentOf(player)
  const topCandidates = candidates.slice(0, Math.min(12, candidates.length))

  let best = topCandidates[0]
  let bestScore = Number.NEGATIVE_INFINITY

  for (const candidate of topCandidates) {
    const opponentMoves = sampleMoves(
      getValidMoves(candidate.nextState, size, opponent),
      12,
    )

    let worstReplyScore = Number.POSITIVE_INFINITY
    let maxCounterCapture = 0

    for (const move of opponentMoves) {
      const opponentState = applyMove(
        candidate.nextState,
        size,
        move.x,
        move.y,
        opponent,
      )
      if (!opponentState) continue

      const counterCapture = getCaptureGain(
        candidate.nextState,
        opponentState,
        opponent,
      )
      if (counterCapture > maxCounterCapture) {
        maxCounterCapture = counterCapture
      }

      const replyScore = evaluateBoardFast(opponentState, player)
      if (replyScore < worstReplyScore) {
        worstReplyScore = replyScore
      }
    }

    if (worstReplyScore === Number.POSITIVE_INFINITY) {
      worstReplyScore = evaluateBoardFast(candidate.nextState, player)
    }

    const riskPenalty = maxCounterCapture * 20 + (candidate.liberties <= 1 ? 12 : 0)
    const captureBonus = candidate.captureGain * 8
    const noise = randomize ? Math.random() * 0.45 : 0
    const score =
      candidate.score * 0.62 +
      worstReplyScore * 0.38 +
      captureBonus -
      riskPenalty +
      noise

    if (score > bestScore) {
      bestScore = score
      best = candidate
    }
  }

  return best
}

function chooseCandidate(
  candidates: CandidateWithState[],
  size: number,
  player: PlayerColor,
  difficulty: EngineDifficulty,
  randomize: boolean,
) {
  if (candidates.length === 0) return null

  if (difficulty === "easy") {
    if (!randomize) return candidates[0]
    const randomIndex = Math.floor(Math.random() * candidates.length)
    return candidates[randomIndex]
  }

  if (difficulty === "medium") {
    if (!randomize) return candidates[0]
    return pickWeighted(candidates, 2.5) ?? candidates[0]
  }

  return chooseHardCandidate(candidates, size, player, randomize) ?? candidates[0]
}

function toMove(candidate: CandidateWithState | null): EngineMove {
  if (!candidate) {
    return { x: -1, y: -1, isPass: true }
  }

  return { x: candidate.x, y: candidate.y, isPass: false }
}

function toDifficulty(value: EngineDifficulty | undefined): EngineDifficulty {
  return value ?? "easy"
}

async function maybeDelay(difficulty: EngineDifficulty, withDelay = true) {
  if (!withDelay) {
    return
  }
  await new Promise((resolve) => setTimeout(resolve, delayForDifficulty(difficulty)))
}

export function createSimpleEngine(): EngineProvider {
  return {
    id: "simple",
    label: "Simple Heuristic Engine",

    async pickMove(request: EngineRequest) {
      const difficulty = toDifficulty(request.difficulty)
      await maybeDelay(difficulty, request.withDelay ?? true)

      const candidates = buildCandidates(request.state, request.size, request.player)
      const selected = chooseCandidate(
        candidates,
        request.size,
        request.player,
        difficulty,
        true,
      )
      return toMove(selected)
    },

    async analyzePosition(request: EngineRequest): Promise<EngineAnalysis> {
      const difficulty = toDifficulty(request.difficulty)
      const candidates = buildCandidates(request.state, request.size, request.player)
      const selected = chooseCandidate(
        candidates,
        request.size,
        request.player,
        difficulty,
        false,
      )
      const recommendedMove = toMove(selected)
      const baseScore = selected
        ? evaluateBoardFast(selected.nextState, request.player)
        : evaluateBoardFast(request.state, request.player)
      const estimatedWinRate = estimateWinRate(baseScore)

      const topLimit = Math.max(1, Math.min(request.maxCandidates ?? 5, 10))
      const topMoves = candidates.slice(0, topLimit).map((candidate) => ({
        x: candidate.x,
        y: candidate.y,
        score: candidate.score,
        captureGain: candidate.captureGain,
        liberties: candidate.liberties,
        confidence: candidate.confidence,
        tags: [...candidate.tags],
      }))

      const summary = recommendedMove.isPass
        ? "No legal moves found; pass is recommended."
        : `Best move looks like ${toCoordinate(
            recommendedMove.x,
            recommendedMove.y,
            request.size,
          )} with a ${Math.round(estimatedWinRate * 100)}% win chance estimate.`

      return {
        providerId: "simple",
        difficulty,
        recommendedMove,
        estimatedWinRate,
        topMoves,
        summary,
      }
    },
  }
}

export const simpleEngine = createSimpleEngine()

