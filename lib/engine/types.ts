export type Stone = 0 | 1 | 2 // 0 = empty, 1 = black, 2 = white

export type PlayerColor = "black" | "white"

export type BoardState = Stone[]

export type GameState = {
  board: BoardState
  turn: PlayerColor
  moveNumber: number
  captured: {
    black: number
    white: number
  }
  ko: number | null
  history: string[] // Positional superko tracking
}

export type Move = {
  x: number
  y: number
  player: PlayerColor
  isPass: boolean
}

export type Group = {
  stones: Set<number>
  liberties: Set<number>
  color: Stone
}
