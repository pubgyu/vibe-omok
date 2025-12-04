import { Legend } from '../molecules/Legend'
import { MoveList } from '../molecules/MoveList'
import type { Move } from '../../types/game'

type SidebarPanelProps = {
  recentMoves: Move[]
  historyLength: number
  boardSize: number
}

export const SidebarPanel = ({
  recentMoves,
  historyLength,
  boardSize,
}: SidebarPanelProps) => (
  <aside className="panel">
    <div className="panel-header">
      <h2>진행 상황</h2>
      <span className="pill">{historyLength} 수</span>
    </div>
    <MoveList
      recentMoves={recentMoves}
      totalMoves={historyLength}
      boardSize={boardSize}
    />
    <Legend />
  </aside>
)
