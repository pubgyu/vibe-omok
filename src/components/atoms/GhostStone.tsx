import type { Player } from '../../types/game'

type GhostStoneProps = {
  player: Player
}

export const GhostStone = ({ player }: GhostStoneProps) => (
  <span className={`ghost ${player === 'B' ? 'ghost-black' : 'ghost-white'}`} />
)
