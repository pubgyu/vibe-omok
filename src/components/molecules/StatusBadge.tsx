import type { ReactNode } from 'react'
import { StoneIcon } from '../atoms/StoneIcon'
import type { Player } from '../../types/game'

type StatusBadgeProps = {
  player?: Player
  label: string
  value?: ReactNode
  active?: boolean
  muted?: boolean
}

export const StatusBadge = ({
  player,
  label,
  value,
  active = false,
  muted = false,
}: StatusBadgeProps) => (
  <div className={`badge ${active ? 'active' : ''} ${muted ? 'muted' : ''}`.trim()}>
    {player ? <StoneIcon player={player} /> : null}
    <span className="label">{label}</span>
    {value ? <strong>{value}</strong> : null}
  </div>
)
