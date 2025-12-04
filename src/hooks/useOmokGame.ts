import { useCallback, useMemo, useState } from 'react'
import { BOARD_SIZE } from '../constants/game'
import { buildBoard, findWinningLine } from '../utils/game'
import type { Cell, Move, Player, Winner } from '../types/game'

type UseOmokGameResult = {
  board: Cell[]
  boardSize: number
  currentPlayer: Player
  winner: Winner
  winningLine: number[]
  history: Move[]
  lastMove: Move | null
  movesLeft: number
  recentMoves: Move[]
  totalCells: number
  playMove: (index: number) => void
  resetGame: () => void
}

export const useOmokGame = (boardSize: number = BOARD_SIZE): UseOmokGameResult => {
  const totalCells = boardSize * boardSize
  const [board, setBoard] = useState<Cell[]>(() => buildBoard(totalCells))
  const [currentPlayer, setCurrentPlayer] = useState<Player>('B')
  const [winner, setWinner] = useState<Winner>(null)
  const [winningLine, setWinningLine] = useState<number[]>([])
  const [history, setHistory] = useState<Move[]>([])

  const lastMove = history.at(-1) ?? null
  const movesLeft = totalCells - history.length

  const playMove = useCallback(
    (index: number) => {
      if (winner || board[index]) return

      const nextBoard = [...board]
      nextBoard[index] = currentPlayer

      const nextHistory = [...history, { index, player: currentPlayer }]
      const line = findWinningLine(nextBoard, index, currentPlayer, boardSize)

      setBoard(nextBoard)
      setHistory(nextHistory)

      if (line) {
        setWinner(currentPlayer)
        setWinningLine(line)
        return
      }

      if (nextHistory.length === totalCells) {
        setWinner('Draw')
        return
      }

      setCurrentPlayer(currentPlayer === 'B' ? 'W' : 'B')
    },
    [board, boardSize, currentPlayer, history, totalCells, winner],
  )

  const resetGame = useCallback(() => {
    setBoard(buildBoard(totalCells))
    setCurrentPlayer('B')
    setWinner(null)
    setWinningLine([])
    setHistory([])
  }, [totalCells])

  const recentMoves = useMemo(() => history.slice(-8).reverse(), [history])

  return {
    board,
    boardSize,
    currentPlayer,
    winner,
    winningLine,
    history,
    lastMove,
    movesLeft,
    recentMoves,
    totalCells,
    playMove,
    resetGame,
  }
}
