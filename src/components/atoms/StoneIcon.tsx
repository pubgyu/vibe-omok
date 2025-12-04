import type { Player } from '../../types/game'

type StoneIconProps = {
  player: Player
  className?: string
}

export const StoneIcon = ({ player, className = '' }: StoneIconProps) => (
  <span
    className={`stone-icon ${player === 'B' ? 'black' : 'white'} ${className}`.trim()}
  />
)
