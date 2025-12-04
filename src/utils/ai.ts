import type { Cell, Player } from '../types/game'
import { findWinningLine } from './game'

export const pickAiMove = (board: Cell[], boardSize: number): number | null => {
  if (!board.length) return null

  const center = Math.floor((boardSize * boardSize) / 2)
  if (!board[center] && center < board.length) {
    return center
  }

  const available: number[] = []
  for (let i = 0; i < board.length; i += 1) {
    if (!board[i]) available.push(i)
  }

  if (!available.length) return null

  const middle = Math.floor(available.length / 2)
  // Bias slightly toward middle moves for a more natural feel.
  const biasIndex = Math.max(
    0,
    Math.min(available.length - 1, middle + (Math.random() > 0.5 ? 1 : -1)),
  )
  return available[biasIndex] ?? available[0]
}

// 즉시 승리 혹은 상대 4목 차단을 우선으로 하는 간단한 탐색
export const findCriticalMove = (
  board: Cell[],
  boardSize: number,
  currentPlayer: Player,
): number | null => {
  const opponent: Player = currentPlayer === 'B' ? 'W' : 'B'

  // 1) 내가 바로 이길 수 있는 수
  for (let i = 0; i < board.length; i += 1) {
    if (board[i]) continue
    const next = [...board]
    next[i] = currentPlayer
    if (findWinningLine(next, i, currentPlayer, boardSize)) {
      return i
    }
  }

  // 2) 상대가 바로 이길 수 있는 수 차단
  for (let i = 0; i < board.length; i += 1) {
    if (board[i]) continue
    const next = [...board]
    next[i] = opponent
    if (findWinningLine(next, i, opponent, boardSize)) {
      return i
    }
  }

  // 3) 상대가 4목을 만들 수 있는 위협 차단
  for (let i = 0; i < board.length; i += 1) {
    if (board[i]) continue
    const next = [...board]
    next[i] = opponent
    const len = maxLineLength(next, boardSize, i, opponent)
    if (len >= 4) {
      return i
    }
    if (len === 3) {
      return i
    }
  }

  return null
}

const directions: Array<[number, number]> = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
]

const longestForPlayer = (board: Cell[], boardSize: number, player: Player): number => {
  let best = 0
  for (let i = 0; i < board.length; i += 1) {
    if (board[i] !== player) continue
    const row = Math.floor(i / boardSize)
    const col = i % boardSize
    for (const [dr, dc] of directions) {
      let count = 1
      let r = row + dr
      let c = col + dc
      while (
        r >= 0 &&
        r < boardSize &&
        c >= 0 &&
        c < boardSize &&
        board[r * boardSize + c] === player
      ) {
        count += 1
        r += dr
        c += dc
      }

      r = row - dr
      c = col - dc
      while (
        r >= 0 &&
        r < boardSize &&
        c >= 0 &&
        c < boardSize &&
        board[r * boardSize + c] === player
      ) {
        count += 1
        r -= dr
        c -= dc
      }

      if (count > best) best = count
    }
  }

  return best
}

const maxLineLength = (
  board: Cell[],
  boardSize: number,
  index: number,
  player: Player,
): number => {
  const row = Math.floor(index / boardSize)
  const col = index % boardSize
  let best = 1

  for (const [dr, dc] of directions) {
    let count = 1
    let r = row + dr
    let c = col + dc
    while (
      r >= 0 &&
      r < boardSize &&
      c >= 0 &&
      c < boardSize &&
      board[r * boardSize + c] === player
    ) {
      count += 1
      r += dr
      c += dc
    }

    r = row - dr
    c = col - dc
    while (
      r >= 0 &&
      r < boardSize &&
      c >= 0 &&
      c < boardSize &&
      board[r * boardSize + c] === player
    ) {
      count += 1
      r -= dr
      c -= dc
    }

    if (count > best) best = count
  }

  return best
}

const evaluateMove = (
  board: Cell[],
  boardSize: number,
  index: number,
  player: Player,
): number => {
  const opponent: Player = player === 'B' ? 'W' : 'B'
  const next = [...board]
  next[index] = player

  // Immediate win
  if (findWinningLine(next, index, player, boardSize)) {
    return 1_000_000
  }

  const myMax = maxLineLength(next, boardSize, index, player)

  let opponentImmediateWin = false
  let opponentMax = 0
  for (let i = 0; i < next.length; i += 1) {
    if (next[i]) continue
    const oppBoard = [...next]
    oppBoard[i] = opponent
    if (findWinningLine(oppBoard, i, opponent, boardSize)) {
      opponentImmediateWin = true
      break
    }
    const oppLen = maxLineLength(oppBoard, boardSize, i, opponent)
    if (oppLen > opponentMax) opponentMax = oppLen
  }

  // Center bias
  const center = (boardSize - 1) / 2
  const row = Math.floor(index / boardSize)
  const col = index % boardSize
  const dist = Math.abs(row - center) + Math.abs(col - center)
  const centerScore = (boardSize - dist) * 5

  let score = myMax * 1500 + centerScore
  if (myMax >= 4) score += 25000
  if (myMax === 3) score += 8000
  if (opponentMax >= 4) score -= 40000
  if (opponentMax === 3) score -= 15000
  if (opponentImmediateWin) score -= 300000

  return score
}

const evaluateBoardStrength = (board: Cell[], boardSize: number, player: Player): number => {
  const opponent: Player = player === 'B' ? 'W' : 'B'
  const myLongest = longestForPlayer(board, boardSize, player)
  const oppLongest = longestForPlayer(board, boardSize, opponent)

  let myCount = 0
  let oppCount = 0
  let centerBias = 0
  const center = (boardSize - 1) / 2

  for (let i = 0; i < board.length; i += 1) {
    const cell = board[i]
    if (!cell) continue
    const row = Math.floor(i / boardSize)
    const col = i % boardSize
    const dist = Math.abs(row - center) + Math.abs(col - center)
    const bias = boardSize - dist
    if (cell === player) {
      myCount += 1
      centerBias += bias
    } else {
      oppCount += 1
      centerBias -= bias * 0.8
    }
  }

  return (
    myLongest * 12000 -
    oppLongest * 13000 +
    (myCount - oppCount) * 80 +
    centerBias * 12
  )
}

const getCandidateMoves = (
  board: Cell[],
  boardSize: number,
  player: Player,
  limit = 10,
): number[] => {
  const scored: Array<{ i: number; score: number }> = []
  for (let i = 0; i < board.length; i += 1) {
    if (board[i]) continue
    const score = evaluateMove(board, boardSize, i, player)
    scored.push({ i, score })
  }
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, limit).map((s) => s.i)
}

export const chooseHeuristicMove = (
  board: Cell[],
  boardSize: number,
  player: Player,
): number | null => {
  let bestIndex: number | null = null
  let bestScore = -Infinity

  for (let i = 0; i < board.length; i += 1) {
    if (board[i]) continue
    const score = evaluateMove(board, boardSize, i, player)
    if (score > bestScore) {
      bestScore = score
      bestIndex = i
    }
  }

  return bestIndex
}

export const minimaxMove = (
  board: Cell[],
  boardSize: number,
  player: Player,
): number | null => {
  const opponent: Player = player === 'B' ? 'W' : 'B'
  const aiCandidates = getCandidateMoves(board, boardSize, player, 10)

  let bestIndex: number | null = null
  let bestScore = -Infinity

  for (const move of aiCandidates) {
    const nextBoard = [...board]
    nextBoard[move] = player

    if (findWinningLine(nextBoard, move, player, boardSize)) {
      return move
    }

    const oppCandidates = getCandidateMoves(nextBoard, boardSize, opponent, 8)
    let worstCase = Infinity

    if (!oppCandidates.length) {
      worstCase = -evaluateBoardStrength(nextBoard, boardSize, player)
    } else {
      for (const oppMove of oppCandidates) {
        const oppBoard = [...nextBoard]
        oppBoard[oppMove] = opponent

        if (findWinningLine(oppBoard, oppMove, opponent, boardSize)) {
          worstCase = Math.min(worstCase, -1_000_000)
          continue
        }

        const score = evaluateBoardStrength(oppBoard, boardSize, player)
        worstCase = Math.min(worstCase, score)
      }
    }

    const baseScore = evaluateBoardStrength(nextBoard, boardSize, player)
    const total = baseScore + worstCase * 0.7

    if (total > bestScore) {
      bestScore = total
      bestIndex = move
    }
  }

  return bestIndex
}

export const requestAiMove = async (
  board: Cell[],
  boardSize: number,
  currentPlayer: Player,
): Promise<number | null> => {
  const response = await fetch('/api/omok-ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ board, boardSize, currentPlayer }),
  })

  if (!response.ok) {
    throw new Error('AI 요청 실패')
  }

  const data = (await response.json()) as { index?: number; moves?: Array<{ index: number }> }

  const pickValid = (idx: number | undefined): number | null => {
    if (typeof idx === 'number' && idx >= 0 && idx < board.length && !board[idx]) {
      return idx
    }
    return null
  }

  if (Array.isArray(data.moves)) {
    for (const m of data.moves) {
      const valid = pickValid(m.index)
      if (valid !== null) return valid
    }
  }

  return pickValid(data.index)
}
