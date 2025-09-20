import { memo, useEffect, useCallback, useMemo } from 'react'
import { useGameStore } from '@/store'
import Cell from './Cell'
import type { Direction } from '@/types/game'
import styles from '@/styles/GameBoard.module.css'

// Move key mapping outside component to prevent recreation
const KEY_MAP: Record<string, Direction> = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'up',
  ArrowDown: 'down',
  a: 'left',
  d: 'right',
  w: 'up',
  s: 'down',
  A: 'left',
  D: 'right',
  W: 'up',
  S: 'down',
} as const

const GameBoard: React.FC = memo(() => {
  const { board, move } = useGameStore()

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      const direction = KEY_MAP[event.key]
      if (direction) {
        event.preventDefault()
        move(direction)
      }
    },
    [move]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])

  // Memoize board rendering to prevent unnecessary re-renders
  // Only re-render when board reference changes
  const boardContent = useMemo(
    () =>
      board.map((row, rowIndex) => (
        <div key={rowIndex} className={styles.boardRow}>
          {row.map((cell, colIndex) => (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              value={cell}
              position={{ row: rowIndex, col: colIndex }}
            />
          ))}
        </div>
      )),
    [board]
  )

  return (
    <div className={styles.gameBoard} tabIndex={0}>
      {boardContent}
    </div>
  )
})

// Add display name for debugging
GameBoard.displayName = 'GameBoard'

export default GameBoard
