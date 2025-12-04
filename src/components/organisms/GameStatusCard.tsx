import type { Player, Winner } from '../../types/game'
import { StatusBadge } from '../molecules/StatusBadge'

type GameStatusCardProps = {
  statusText: string
  subText: string
  currentPlayer: Player
  winner: Winner
  totalMoves: number
  movesLeft: number
}

export const GameStatusCard = ({
  statusText,
  subText,
  currentPlayer,
  winner,
  totalMoves,
  movesLeft,
}: GameStatusCardProps) => (
  <div className="status-card">
    <div className="status-top">
      <span className="status-title">{statusText}</span>
      <span className="status-sub">{subText}</span>
    </div>
    <div className="status-grid">
      <StatusBadge
        player="B"
        label="흑"
        active={!winner && currentPlayer === 'B'}
      />
      <StatusBadge
        player="W"
        label="백"
        active={!winner && currentPlayer === 'W'}
      />
      <StatusBadge label="총 수" value={totalMoves} muted />
      <StatusBadge label="남은 칸" value={movesLeft} muted />
    </div>
  </div>
)
