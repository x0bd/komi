import { expect, test, describe } from 'vitest'
import { createInitialState, getValidMoves } from '../game'
import { isValidMove, applyMove } from '../rules'
import { calculateScore } from '../scoring'
import { findGroup, countLiberties } from '../groups'
import { gameToSGF, sgfToGame } from '../sgf'

describe('Game Engine Core Rules', () => {
  test('Starting board is empty and allows opening moves', () => {
    const state = createInitialState(9)
    expect(state.board.every(s => s === 0)).toBe(true)
    expect(isValidMove(state, 9, 4, 4, 'black')).toBe(true)
    expect(getValidMoves(state, 9, 'black')).toHaveLength(81)
  })

  test('Group analysis collects stones and liberties correctly', () => {
    let state = createInitialState(9)
    state = applyMove(state, 9, 0, 0, 'black')!
    state = applyMove(state, 9, 1, 0, 'black')!
    state = applyMove(state, 9, 0, 1, 'black')!

    const group = findGroup(state.board, 9, 0)
    expect(group).not.toBeNull()
    expect(group?.stones.size).toBe(3)
    expect(countLiberties(state.board, 9, group!)).toBe(3)
  })

  test('Capturing a single stone', () => {
    let state = createInitialState(9)
    // Black at 1,0 and 0,1
    state = applyMove(state, 9, 1, 0, 'black')!
    state = applyMove(state, 9, 0, 0, 'white')! // White plays in the corner
    state = applyMove(state, 9, 0, 1, 'black')! // Black plays surrounding white
    
    // Expect 1 capture for black
    expect(state.captured.black).toBe(1)
    expect(state.board[0]).toBe(0) // 0,0 is now empty
  })

  test('Basic Ko Rule prevents immediate recapture', () => {
    let state = createInitialState(9)
    // Create a Ko shape
    // Black
    state = applyMove(state, 9, 1, 0, 'black')!
    state = applyMove(state, 9, 0, 1, 'black')!
    state = applyMove(state, 9, 2, 1, 'black')!
    state = applyMove(state, 9, 1, 2, 'black')!
    // White
    state = applyMove(state, 9, 2, 0, 'white')!
    state = applyMove(state, 9, 3, 1, 'white')!
    state = applyMove(state, 9, 2, 2, 'white')!
    
    // White captures at 1,1
    state = applyMove(state, 9, 1, 1, 'white')!
    expect(state.captured.white).toBe(1)
    
    // Black tries to recapture immediately at 2,1 (should be false due to superko/ko)
    expect(isValidMove(state, 9, 2, 1, 'black')).toBe(false)
  })

  test('Suicide is illegal', () => {
    let state = createInitialState(9)
    // White surrounds 0,0
    state = applyMove(state, 9, 1, 0, 'white')!
    state = applyMove(state, 9, 0, 1, 'white')!
    
    // Black trying to play 0,0 is suicide
    expect(isValidMove(state, 9, 0, 0, 'black')).toBe(false)
  })

  test('Scoring accurately counts basic territory', () => {
    let state = createInitialState(9)
    // Black builds a 3x3 box in upper left corner
    state = applyMove(state, 9, 0, 3, 'black')!
    state = applyMove(state, 9, 1, 3, 'black')!
    state = applyMove(state, 9, 2, 3, 'black')!
    state = applyMove(state, 9, 3, 3, 'black')!
    state = applyMove(state, 9, 3, 2, 'black')!
    state = applyMove(state, 9, 3, 1, 'black')!
    state = applyMove(state, 9, 3, 0, 'black')!

    // White builds similarly in bottom right
    state = applyMove(state, 9, 8, 5, 'white')!
    state = applyMove(state, 9, 7, 5, 'white')!
    state = applyMove(state, 9, 6, 5, 'white')!
    state = applyMove(state, 9, 5, 5, 'white')!
    state = applyMove(state, 9, 5, 6, 'white')!
    state = applyMove(state, 9, 5, 7, 'white')!
    state = applyMove(state, 9, 5, 8, 'white')!

    const score = calculateScore(state.board, 9, state.captured, 6.5)
    // Black enclosed 3x3 = 9 territory points
    expect(score.black.territory).toBe(9)
    // White enclosed 3x3 = 9 territory points
    expect(score.white.territory).toBe(9)
    expect(score.ruleset).toBe('japanese')
  })

  test('Chinese area scoring counts placed stones instead of captures', () => {
    let state = createInitialState(9)
    state = applyMove(state, 9, 0, 3, 'black')!
    state = applyMove(state, 9, 1, 3, 'black')!
    state = applyMove(state, 9, 2, 3, 'black')!
    state = applyMove(state, 9, 3, 3, 'black')!
    state = applyMove(state, 9, 3, 2, 'black')!
    state = applyMove(state, 9, 3, 1, 'black')!
    state = applyMove(state, 9, 3, 0, 'black')!

    state = applyMove(state, 9, 8, 5, 'white')!
    state = applyMove(state, 9, 7, 5, 'white')!
    state = applyMove(state, 9, 6, 5, 'white')!
    state = applyMove(state, 9, 5, 5, 'white')!
    state = applyMove(state, 9, 5, 6, 'white')!
    state = applyMove(state, 9, 5, 7, 'white')!
    state = applyMove(state, 9, 5, 8, 'white')!

    const score = calculateScore(state.board, 9, state.captured, 6.5, {
      ruleset: 'chinese',
    })

    expect(score.black.territory).toBe(9)
    expect(score.black.stones).toBe(7)
    expect(score.black.total).toBe(16)
    expect(score.white.territory).toBe(9)
    expect(score.white.stones).toBe(7)
    expect(score.white.total).toBe(22.5)
    expect(score.ruleset).toBe('chinese')
  })

  test('SGF round trip preserves moves and metadata', () => {
    const moves = [
      { x: 3, y: 3, player: 'black' as const, isPass: false },
      { x: 4, y: 4, player: 'white' as const, isPass: false },
      { x: -1, y: -1, player: 'black' as const, isPass: true },
      { x: 2, y: 2, player: 'white' as const, isPass: false },
    ]

    const sgf = gameToSGF(moves, {
      blackName: 'Player 1',
      whiteName: 'Sensei',
      size: 9,
      komi: 6.5,
      result: 'W+6.5',
      date: '2026-03-16',
    })

    const parsed = sgfToGame(sgf)

    expect(parsed.metadata).toMatchObject({
      blackName: 'Player 1',
      whiteName: 'Sensei',
      size: 9,
      komi: 6.5,
      result: 'W+6.5',
      date: '2026-03-16',
    })
    expect(parsed.moves).toEqual(moves)
    expect(parsed.state.moveNumber).toBe(moves.length)
  })
})
