import type { Player } from '../../types/game'

type StoneProps = {
  player: Player
  isWinning?: boolean
  isLast?: boolean
}

export const Stone = ({ player, isWinning = false, isLast = false }: StoneProps) => (
  <span
    className={`stone ${player === 'B' ? 'black' : 'white'} ${
      isWinning ? 'glow' : ''
    } ${isLast ? 'last' : ''}`.trim()}
  />
)
