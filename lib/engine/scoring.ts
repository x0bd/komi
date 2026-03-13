import type { BoardState, Stone } from "./types"
import { getNeighbors } from "./board"

export type ScoreResult = {
  black: {
    territory: number
    captures: number
    total: number
  }
  white: {
    territory: number
    captures: number
    komi: number
    total: number
  }
  winner: "black" | "white" | "draw"
  margin: number
  territoryMap: Stone[] // Map of which player owns which empty intersection
}

export function calculateScore(
  board: BoardState,
  size: number,
  captures: { black: number; white: number },
  komi: number = 6.5
): ScoreResult {
  const territoryMap = [...board]
  const visited = new Set<number>()
  
  let blackTerritory = 0
  let whiteTerritory = 0

  for (let i = 0; i < board.length; i++) {
    if (board[i] === 0 && !visited.has(i)) {
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
          const neighborColor = board[neighbor]
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

  const blackTotal = blackTerritory + captures.black
  const whiteTotal = whiteTerritory + captures.white + komi

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
    black: { territory: blackTerritory, captures: captures.black, total: blackTotal },
    white: { territory: whiteTerritory, captures: captures.white, komi, total: whiteTotal },
    winner,
    margin,
    territoryMap,
  }
}
