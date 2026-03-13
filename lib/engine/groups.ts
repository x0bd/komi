import type { BoardState, Stone, Group } from "./types"
import { getNeighbors } from "./board"

export function findGroup(board: BoardState, size: number, startIndex: number): Group | null {
  const color = board[startIndex]
  if (color === 0) return null

  const stones = new Set<number>()
  const liberties = new Set<number>()
  const visited = new Set<number>()
  const queue = [startIndex]

  while (queue.length > 0) {
    const current = queue.shift()!
    if (visited.has(current)) continue
    
    visited.add(current)
    stones.add(current)

    const neighbors = getNeighbors(current, size)
    for (const neighbor of neighbors) {
      const neighborColor = board[neighbor]
      if (neighborColor === 0) {
        liberties.add(neighbor)
      } else if (neighborColor === color && !visited.has(neighbor)) {
        queue.push(neighbor)
      }
    }
  }

  return { stones, liberties, color }
}

export function countLiberties(board: BoardState, size: number, group: Group): number {
  return group.liberties.size
}

export function getCapturedGroups(board: BoardState, size: number, colorToFind: Stone): Group[] {
  const capturedGroups: Group[] = []
  const visited = new Set<number>()

  for (let i = 0; i < board.length; i++) {
    if (board[i] === colorToFind && !visited.has(i)) {
      const group = findGroup(board, size, i)
      if (group) {
        if (group.liberties.size === 0) {
          capturedGroups.push(group)
        }
        for (const stone of group.stones) {
          visited.add(stone)
        }
      }
    }
  }

  return capturedGroups
}
