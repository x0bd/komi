import type { BoardState, ScoringRuleset, Stone } from "./types"
import { getNeighbors } from "./board"

export type ScoreResult = {
  black: {
    territory: number
    captures: number
    stones: number
    total: number
  }
  white: {
    territory: number
    captures: number
    stones: number
    komi: number
    total: number
  }
  winner: "black" | "white" | "draw"
  margin: number
  ruleset: ScoringRuleset
  territoryMap: Stone[] // Map of which player owns which empty intersection
}

type ScoreOptions = {
  ruleset?: ScoringRuleset
  deadStones?: number[]
}

function countPlacedStones(board: BoardState) {
  let black = 0
  let white = 0

  for (const intersection of board) {
    if (intersection === 1) black++
    if (intersection === 2) white++
  }

  return { black, white }
}

export function calculateScore(
  board: BoardState,
  size: number,
  captures: { black: number; white: number },
  komi: number = 6.5,
  options: ScoreOptions = {}
): ScoreResult {
  const ruleset = options.ruleset ?? "japanese"
  const scoringBoard = [...board]
  const scoringCaptures = { ...captures }
  const deadStoneSet = new Set(options.deadStones ?? [])

  for (const index of deadStoneSet) {
    const stone = scoringBoard[index]
    if (stone === 1) {
      scoringBoard[index] = 0
      scoringCaptures.white += 1
    } else if (stone === 2) {
      scoringBoard[index] = 0
      scoringCaptures.black += 1
    }
  }

  const territoryMap = [...scoringBoard]
  const visited = new Set<number>()

  let blackTerritory = 0
  let whiteTerritory = 0

  for (let i = 0; i < scoringBoard.length; i++) {
    if (scoringBoard[i] === 0 && !visited.has(i)) {
      const region = new Set<number>()
      const queue = [i]
      let touchesBlack = false
      let touchesWhite = false

      while (queue.length > 0) {
        const curr = queue.shift()!
        if (visited.has(curr)) continue
        
        visited.add(curr)
        region.add(curr)

        for (const neighbor of getNeighbors(curr, size)) {
          const neighborColor = scoringBoard[neighbor]
          if (neighborColor === 0 && !visited.has(neighbor)) {
            queue.push(neighbor)
          } else if (neighborColor === 1) {
            touchesBlack = true
          } else if (neighborColor === 2) {
            touchesWhite = true
          }
        }
      }

      if (touchesBlack && !touchesWhite) {
        blackTerritory += region.size
        for (const pos of region) territoryMap[pos] = 1
      } else if (touchesWhite && !touchesBlack) {
        whiteTerritory += region.size
        for (const pos of region) territoryMap[pos] = 2
      }
    }
  }

  const stones = countPlacedStones(scoringBoard)
  const blackTotal =
    ruleset === "chinese"
      ? blackTerritory + stones.black
      : blackTerritory + scoringCaptures.black
  const whiteTotal =
    ruleset === "chinese"
      ? whiteTerritory + stones.white + komi
      : whiteTerritory + scoringCaptures.white + komi

  let winner: "black" | "white" | "draw" = "draw"
  let margin = 0

  if (blackTotal > whiteTotal) {
    winner = "black"
    margin = blackTotal - whiteTotal
  } else if (whiteTotal > blackTotal) {
    winner = "white"
    margin = whiteTotal - blackTotal
  }

  return {
    black: {
      territory: blackTerritory,
      captures: scoringCaptures.black,
      stones: stones.black,
      total: blackTotal,
    },
    white: {
      territory: whiteTerritory,
      captures: scoringCaptures.white,
      stones: stones.white,
      komi,
      total: whiteTotal,
    },
    winner,
    margin,
    ruleset,
    territoryMap,
  }
}
