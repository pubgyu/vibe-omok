import { formatPosition } from '../../utils/game'
import type { Move } from '../../types/game'

type MoveListProps = {
  recentMoves: Move[]
  totalMoves: number
  boardSize: number
}

export const MoveList = ({ recentMoves, totalMoves, boardSize }: MoveListProps) => (
  <ul className="move-list">
    {recentMoves.length === 0 ? (
      <li className="muted">첫 돌을 놓아보세요.</li>
    ) : (
      recentMoves.map((move, idx) => {
        const { row, col } = formatPosition(move.index, boardSize)

        return (
          <li key={`${move.index}-${move.player}`}>
            <span className={`dot ${move.player === 'B' ? 'black' : 'white'}`} />
            <span>
              수 {totalMoves - idx} · {move.player === 'B' ? '흑' : '백'} → {row}행{' '}
              {col}열
            </span>
          </li>
        )
      })
    )}
  </ul>
)
