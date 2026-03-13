import type { Stone, BoardState } from "./types"

export function createEmptyBoard(size: number): BoardState {
  return new Array(size * size).fill(0)
}

export function getNeighbors(index: number, size: number): number[] {
  const neighbors: number[] = []
  const x = index % size
  const y = Math.floor(index / size)

  if (x > 0) neighbors.push(index - 1)
  if (x < size - 1) neighbors.push(index + 1)
  if (y > 0) neighbors.push(index - size)
  if (y < size - 1) neighbors.push(index + size)

  return neighbors
}

export function boardToString(board: BoardState): string {
  return board.join("")
}

export function stringToBoard(str: string): BoardState {
  return str.split("").map((s) => parseInt(s, 10)) as BoardState
}

export function getCoordinates(index: number, size: number): { x: number; y: number } {
  return { x: index % size, y: Math.floor(index / size) }
}

export function getIndex(x: number, y: number, size: number): number {
  return y * size + x
}
