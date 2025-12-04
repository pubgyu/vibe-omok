import { BOARD_SIZE } from '../constants/game'
import type { Cell, Player } from '../types/game'

export const buildBoard = (totalCells: number): Cell[] =>
  Array<Cell>(totalCells).fill(null)

export function findWinningLine(
  board: Cell[],
  index: number,
  player: Player,
  boardSize = BOARD_SIZE,
): number[] | null {
  const row = Math.floor(index / boardSize)
  const col = index % boardSize
  const directions: Array<[number, number]> = [
    [0, 1], // horizontal
    [1, 0], // vertical
    [1, 1], // diag ↘
    [1, -1], // diag ↙
  ]

  for (const [dr, dc] of directions) {
    const line = [index]

    let r = row + dr
    let c = col + dc
    while (
      r >= 0 &&
      r < boardSize &&
      c >= 0 &&
      c < boardSize &&
      board[r * boardSize + c] === player
    ) {
      line.push(r * boardSize + c)
      r += dr
      c += dc
    }

    r = row - dr
    c = col - dc
    while (
      r >= 0 &&
      r < boardSize &&
      c >= 0 &&
      c < boardSize &&
      board[r * boardSize + c] === player
    ) {
      line.unshift(r * boardSize + c)
      r -= dr
      c -= dc
    }

    if (line.length >= 5) {
      return line
    }
  }

  return null
}

export const formatPosition = (index: number, boardSize: number) => ({
  row: Math.floor(index / boardSize) + 1,
  col: (index % boardSize) + 1,
})
