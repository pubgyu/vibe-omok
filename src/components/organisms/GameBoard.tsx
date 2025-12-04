import type { CSSProperties } from 'react'
import { GhostStone } from '../atoms/GhostStone'
import { Stone } from '../atoms/Stone'
import { formatPosition } from '../../utils/game'
import type { Cell, Move, Player, Winner } from '../../types/game'

type GameBoardProps = {
  board: Cell[]
  boardSize: number
  currentPlayer: Player
  winner: Winner
  winningLine: number[]
  lastMove: Move | null
  onCellClick: (index: number) => void
}

export const GameBoard = ({
  board,
  boardSize,
  currentPlayer,
  winner,
  winningLine,
  lastMove,
  onCellClick,
}: GameBoardProps) => (
  <div className="board-shell">
    {/*
      CSS variable --board-size keeps the grid spacing aligned with the dynamic board size.
    */}
    {(() => {
      const style: CSSProperties & { '--board-size': number } = {
        gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
        '--board-size': boardSize,
      }

      return (
        <div className="board" style={style}>
          {board.map((cell, index) => {
            const isWinning = winningLine.includes(index)
            const isLast = lastMove?.index === index
            const { row, col } = formatPosition(index, boardSize)

            return (
              <button
                key={index}
                type="button"
                className={`cell ${isWinning ? 'winning' : ''} ${
                  !cell && !winner ? 'available' : ''
                }`}
                onClick={() => onCellClick(index)}
                aria-label={`행 ${row}, 열 ${col}`}
              >
                {cell ? (
                  <Stone player={cell} isWinning={isWinning} isLast={isLast} />
                ) : (
                  !winner && <GhostStone player={currentPlayer} />
                )}
              </button>
            )
          })}
        </div>
      )
    })()}
  </div>
)
