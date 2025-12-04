"use client"

import { useEffect, useState } from 'react'
import confetti from 'canvas-confetti'
import { signOut } from 'next-auth/react'
import { BOARD_SIZE } from '@/constants/game'
import { Button } from '@/components/atoms/Button'
import { GameBoard } from '@/components/organisms/GameBoard'
import { GameStatusCard } from '@/components/organisms/GameStatusCard'
import { ThemeToggle } from '@/components/molecules/ThemeToggle'
import { SidebarPanel } from '@/components/organisms/SidebarPanel'
import { useOmokGame } from '@/hooks/useOmokGame'
import type { Player } from '@/types/game'
import {
  pickAiMove,
  requestAiMove,
  findCriticalMove,
  chooseHeuristicMove,
  minimaxMove,
} from './utils/ai'
import { ApiStatusIndicator } from './components/molecules/ApiStatusIndicator'

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [gameStarted, setGameStarted] = useState(false)
  const [playerStone, setPlayerStone] = useState<Player>('B')
  const [opponentType, setOpponentType] = useState<'human' | 'ai'>('human')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [apiStatus, setApiStatus] = useState<'checking' | 'ok' | 'error'>('checking')
  const [aiLoading, setAiLoading] = useState(false)
  const [showWinMessage, setShowWinMessage] = useState(false)
  const {
    board,
    boardSize,
    currentPlayer,
    winner,
    winningLine,
    history,
    lastMove,
    movesLeft,
    recentMoves,
    playMove,
    resetGame,
  } = useOmokGame(BOARD_SIZE)

  const aiShouldMove =
    gameStarted && opponentType === 'ai' && !winner && currentPlayer !== playerStone
  const aiTurnKey = `${currentPlayer}-${history.length}`

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    let cancelled = false
    const check = async () => {
      setApiStatus('checking')
      try {
        const res = await fetch('/api/omok-ai/health')
        if (!res.ok) throw new Error('health fail')
        if (!cancelled) setApiStatus('ok')
      } catch {
        if (!cancelled) setApiStatus('error')
      }
    }
    check()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (winner && winner !== 'Draw') {
      setShowWinMessage(true)
      const timer = setTimeout(() => setShowWinMessage(false), 2000)

      confetti({
        particleCount: 140,
        spread: 70,
        origin: { y: 0.3 },
        colors: ['#f59e0b', '#f97316', '#fef3c7', '#38bdf8', '#a78bfa'],
      })

      return () => clearTimeout(timer)
    }

    setShowWinMessage(false)
  }, [winner])

  useEffect(() => {
    if (!aiShouldMove) return

    let cancelled = false
    setAiLoading(true)

    ;(async () => {
      try {
        let moveIndex: number | null = null

        if (difficulty === 'easy') {
          moveIndex = pickAiMove(board, boardSize)
        } else {
          const critical = findCriticalMove(board, boardSize, currentPlayer)
          const apiMove = await requestAiMove(board, boardSize, currentPlayer)
          const strategic =
            difficulty === 'hard'
              ? minimaxMove(board, boardSize, currentPlayer)
              : chooseHeuristicMove(board, boardSize, currentPlayer)
          moveIndex =
            critical ??
            apiMove ??
            strategic ??
            pickAiMove(board, boardSize)
        }

        if (moveIndex === null || cancelled) return
        playMove(moveIndex)
      } catch (_err) {
        const fallback = pickAiMove(board, boardSize)
        if (fallback !== null && !cancelled) {
          playMove(fallback)
        }
      } finally {
        if (!cancelled) setAiLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [
    aiShouldMove,
    aiTurnKey,
    board,
    boardSize,
    currentPlayer,
    playMove,
    winner,
    difficulty,
    gameStarted,
    opponentType,
    playerStone,
  ])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  const handleStartGame = () => {
    resetGame()
    setShowWinMessage(false)
    setGameStarted(true)
  }

  const handleReset = () => {
    resetGame()
    setShowWinMessage(false)
    setGameStarted(false)
    setAiLoading(false)
  }

  const statusText =
    winner === 'Draw'
      ? '무승부'
      : winner
        ? `${winner === 'B' ? '흑' : '백'} 승리!`
        : `${currentPlayer === 'B' ? '흑' : '백'} 차례`

  const subText = winner
    ? '새 판을 시작해보세요.'
    : opponentType === 'ai' && aiLoading
      ? 'AI가 다음 수를 고르는 중...'
      : `남은 칸 ${movesLeft}개`

  return (
    <main className="page">
      {!gameStarted && (
        <div className="setup-overlay">
          <div className="setup-card">
            <p className="eyebrow">시작 설정</p>
            <h2>진영과 상대를 선택하세요</h2>
            <div className="setup-grid">
              <div className="setup-group">
                <h3>내 돌 선택</h3>
                <label className={`chip ${playerStone === 'B' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="player"
                    value="B"
                    checked={playerStone === 'B'}
                    onChange={() => setPlayerStone('B')}
                  />
                  흑으로 시작
                </label>
                <label className={`chip ${playerStone === 'W' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="player"
                    value="W"
                    checked={playerStone === 'W'}
                    onChange={() => setPlayerStone('W')}
                  />
                  백으로 시작
                </label>
              </div>
              <div className="setup-group">
                <h3>상대 선택</h3>
                <label className={`chip ${opponentType === 'human' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="opponent"
                    value="human"
                    checked={opponentType === 'human'}
                    onChange={() => setOpponentType('human')}
                  />
                  같은 화면에서 두 명이 번갈아 두기
                </label>
                <label className={`chip ${opponentType === 'ai' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="opponent"
                    value="ai"
                    checked={opponentType === 'ai'}
                    onChange={() => setOpponentType('ai')}
                  />
                  AI 상대(GPT)
                </label>
              </div>
              {opponentType === 'ai' && (
                <div className="setup-group">
                  <h3>난이도</h3>
                  <label className={`chip ${difficulty === 'easy' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="difficulty"
                      value="easy"
                      checked={difficulty === 'easy'}
                      onChange={() => setDifficulty('easy')}
                    />
                    하 (랜덤/간단)
                  </label>
                  <label className={`chip ${difficulty === 'medium' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="difficulty"
                      value="medium"
                      checked={difficulty === 'medium'}
                      onChange={() => setDifficulty('medium')}
                    />
                    중 (GPT 기반)
                  </label>
                  <label className={`chip ${difficulty === 'hard' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="difficulty"
                      value="hard"
                      checked={difficulty === 'hard'}
                      onChange={() => setDifficulty('hard')}
                    />
                    상 (막기/승리 우선 + GPT)
                  </label>
                </div>
              )}
            </div>
            <div className="setup-actions">
              <Button type="button" variant="primary" onClick={handleStartGame}>
                게임 시작
              </Button>
            </div>
          </div>
        </div>
      )}
      {showWinMessage && winner && winner !== 'Draw' && (
        <div className="win-overlay" aria-live="assertive">
          <div className="win-overlay__content">
            <p>축하합니다!</p>
            <strong>{winner === 'B' ? '흑' : '백'} 승리</strong>
          </div>
        </div>
      )}
      <header className="hero">
        <div className="top-bar">
          <p className="eyebrow">LOCAL ONLY · 15x15 OMOK</p>
          <div className="top-right">
            <ApiStatusIndicator status={apiStatus} />
            {opponentType === 'ai' && gameStarted && !winner && aiLoading && (
              <div className="ai-loader" aria-live="polite">
                <span className="spinner" aria-hidden />
                <span className="ai-loader__label">AI 두는 중...</span>
              </div>
            )}
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <Button
              type="button"
              variant="primary"
              className="logout-btn"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              <span className="logout-icon" aria-hidden />
              로그아웃
            </Button>
          </div>
        </div>
        <div className="hero-main">
          <div className="intro">
            <h1>오목 한 판 즐겨보세요</h1>
            <p className="lede">흑백 돌을 번갈아 놓으며 다섯 알을 먼저 잇는 사람이 승리합니다.</p>
            {winner && winner !== 'Draw' && (
              <div className="win-banner" role="status">
                <strong>축하합니다!</strong>
                <span>{winner === 'B' ? '흑' : '백'}이 승리했습니다.</span>
              </div>
            )}
            <div className="control-row">
              <Button type="button" variant="primary" onClick={handleReset}>
                새 판 시작
              </Button>
            </div>
          </div>

          <GameStatusCard
            statusText={statusText}
            subText={subText}
            currentPlayer={currentPlayer}
            winner={winner}
            totalMoves={history.length}
            movesLeft={movesLeft}
          />
        </div>
      </header>

      <div className="layout">
        <div className="board-area">
          <GameBoard
            board={board}
            boardSize={boardSize}
            currentPlayer={currentPlayer}
            winner={winner}
            winningLine={winningLine}
            lastMove={lastMove}
            onCellClick={(index) => {
              if (!gameStarted) return
              if (opponentType === 'ai' && (currentPlayer !== playerStone || aiLoading))
                return
              playMove(index)
            }}
          />
          {opponentType === 'ai' && gameStarted && !winner && aiLoading && (
            <div className="board-overlay" aria-live="polite">
              <div className="overlay-card">
                <span className="spinner" aria-hidden />
                <span>AI가 두는 중입니다...</span>
              </div>
            </div>
          )}
        </div>
        <SidebarPanel
          recentMoves={recentMoves}
          historyLength={history.length}
          boardSize={boardSize}
        />
      </div>
    </main>
  )
}

export default App
