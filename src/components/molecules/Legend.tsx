import { StoneIcon } from '../atoms/StoneIcon'

export const Legend = () => (
  <div className="legend">
    <span className="legend-item">
      <StoneIcon player="B" />
      흑돌
    </span>
    <span className="legend-item">
      <StoneIcon player="W" />
      백돌
    </span>
    <span className="legend-item">
      <span className="win-marker" />
      5목
    </span>
  </div>
)
