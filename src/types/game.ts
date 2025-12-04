export type Player = 'B' | 'W'
export type Cell = Player | null
export type Move = { index: number; player: Player }
export type Winner = Player | 'Draw' | null
