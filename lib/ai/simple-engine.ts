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
  EngineSearchBudget,
} from "./engine-provider"

type CandidateWithState = EngineCandidate & {
  nextState: GameState
}

type EngineProfile = {
  searchBudget: EngineSearchBudget
  topCandidateLimit: number
  opponentReplySample: number
  mediumTemperature: number
  openingBiasWeight: number
  applySafetyFilter: boolean
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

function defaultSearchBudget(difficulty: EngineDifficulty): EngineSearchBudget {
  if (difficulty === "hard") return "deep"
  if (difficulty === "medium") return "standard"
  return "fast"
}

function profileForRequest(
  difficulty: EngineDifficulty,
  requestedBudget?: EngineSearchBudget,
): EngineProfile {
  const searchBudget = requestedBudget ?? defaultSearchBudget(difficulty)

  if (searchBudget === "deep") {
    return {
      searchBudget,
      topCandidateLimit: 18,
      opponentReplySample: 20,
      mediumTemperature: 2.1,
      openingBiasWeight: difficulty === "hard" ? 7.5 : 6.2,
      applySafetyFilter: difficulty !== "easy",
    }
  }

  if (searchBudget === "standard") {
    return {
      searchBudget,
      topCandidateLimit: 12,
      opponentReplySample: 12,
      mediumTemperature: 2.35,
      openingBiasWeight: difficulty === "easy" ? 3.8 : 5.6,
      applySafetyFilter: difficulty !== "easy",
    }
  }

  return {
    searchBudget: "fast",
    topCandidateLimit: 8,
    opponentReplySample: 8,
    mediumTemperature: 2.7,
    openingBiasWeight: difficulty === "easy" ? 2.5 : 4.4,
    applySafetyFilter: false,
  }
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

function getOpeningPatternBias(
  size: number,
  x: number,
  y: number,
  moveNumber: number,
) {
  if (moveNumber > 16) {
    return 0
  }

  const star = size >= 13 ? 3 : 2
  const nearStar = star - 1
  const edgeX = Math.min(x, size - 1 - x)
  const edgeY = Math.min(y, size - 1 - y)
  const center = (size - 1) / 2
  const centerDistance = Math.abs(x - center) + Math.abs(y - center)

  let score = 0

  // Strong preference for corner star points in early opening.
  if (edgeX === star && edgeY === star) {
    score += 4.2
  }

  // 3-4 / 4-3 style points for shape development.
  const isThreeFour =
    (edgeX === nearStar && edgeY === star) ||
    (edgeX === star && edgeY === nearStar)
  if (isThreeFour) {
    score += 3.1
  }

  // Gentle penalty for first few moves being too central.
  if (moveNumber <= 6 && centerDistance <= 2) {
    score -= 2.8
  }

  // Avoid first-move edge crawling.
  if (moveNumber <= 8 && (edgeX === 0 || edgeY === 0)) {
    score -= 3.4
  }

  return score
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
  profile: EngineProfile,
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
  const openingBias =
    getOpeningPatternBias(size, x, y, state.moveNumber) * profile.openingBiasWeight
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
    openingBias +
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
  profile: EngineProfile,
): CandidateWithState[] {
  const validMoves = getValidMoves(state, size, player)
  const evaluated = validMoves
    .map((move) =>
      evaluateCandidate(state, size, move.x, move.y, player, profile),
    )
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

function findCapturedPositions(
  before: GameState["board"],
  after: GameState["board"],
  opponentStone: 1 | 2,
) {
  const positions: number[] = []
  for (let i = 0; i < before.length; i++) {
    if (before[i] === opponentStone && after[i] === 0) {
      positions.push(i)
    }
  }
  return positions
}

function isLikelySnapback(
  state: GameState,
  candidate: CandidateWithState,
  size: number,
  player: PlayerColor,
) {
  if (candidate.captureGain <= 0 || candidate.liberties > 1) {
    return false
  }

  const opponent = opponentOf(player)
  const opponentStone: 1 | 2 = opponent === "black" ? 1 : 2
  const capturedPoints = findCapturedPositions(
    state.board,
    candidate.nextState.board,
    opponentStone,
  )

  if (capturedPoints.length === 0) {
    return false
  }

  const beforeScore = evaluateBoardFast(candidate.nextState, player)

  for (const point of capturedPoints) {
    const recaptureX = point % size
    const recaptureY = Math.floor(point / size)
    const recaptureState = applyMove(
      candidate.nextState,
      size,
      recaptureX,
      recaptureY,
      opponent,
    )
    if (!recaptureState) continue

    const replyCaptureGain = getCaptureGain(
      candidate.nextState,
      recaptureState,
      opponent,
    )
    if (replyCaptureGain <= 0) continue

    const afterScore = evaluateBoardFast(recaptureState, player)
    if (afterScore + 6 < beforeScore) {
      return true
    }
  }

  return false
}

function applyTacticalSafetyFilter(
  candidates: CandidateWithState[],
  state: GameState,
  size: number,
  player: PlayerColor,
  profile: EngineProfile,
) {
  if (!profile.applySafetyFilter || candidates.length <= 1) {
    return candidates
  }

  const selfAtariFiltered = candidates.filter(
    (candidate) => !(candidate.liberties <= 1 && candidate.captureGain === 0),
  )
  const base =
    selfAtariFiltered.length > 0
      ? selfAtariFiltered
      : candidates

  if (profile.searchBudget === "fast" || base.length <= 1) {
    return base
  }

  const snapbackFiltered = base.filter(
    (candidate) => !isLikelySnapback(state, candidate, size, player),
  )
  return snapbackFiltered.length > 0 ? snapbackFiltered : base
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
  profile: EngineProfile,
  randomize: boolean,
) {
  if (candidates.length === 0) return null
  const opponent = opponentOf(player)
  const topCandidates = candidates.slice(
    0,
    Math.min(profile.topCandidateLimit, candidates.length),
  )

  let best = topCandidates[0]
  let bestScore = Number.NEGATIVE_INFINITY

  for (const candidate of topCandidates) {
    const opponentMoves = sampleMoves(
      getValidMoves(candidate.nextState, size, opponent),
      profile.opponentReplySample,
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
  profile: EngineProfile,
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
    return pickWeighted(candidates, profile.mediumTemperature) ?? candidates[0]
  }

  return (
    chooseHardCandidate(candidates, size, player, profile, randomize) ??
    candidates[0]
  )
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
      const profile = profileForRequest(difficulty, request.searchBudget)
      await maybeDelay(difficulty, request.withDelay ?? true)

      const candidates = applyTacticalSafetyFilter(
        buildCandidates(request.state, request.size, request.player, profile),
        request.state,
        request.size,
        request.player,
        profile,
      )
      const selected = chooseCandidate(
        candidates,
        request.size,
        request.player,
        difficulty,
        profile,
        true,
      )
      return toMove(selected)
    },

    async analyzePosition(request: EngineRequest): Promise<EngineAnalysis> {
      const difficulty = toDifficulty(request.difficulty)
      const profile = profileForRequest(difficulty, request.searchBudget)
      const candidates = applyTacticalSafetyFilter(
        buildCandidates(request.state, request.size, request.player, profile),
        request.state,
        request.size,
        request.player,
        profile,
      )
      const selected = chooseCandidate(
        candidates,
        request.size,
        request.player,
        difficulty,
        profile,
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
