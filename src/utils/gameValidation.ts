import { BOARD_SIZE, WIN_TILE } from '@/constants'
import type { Board, Direction } from '@/types'
import { getEmptyCells, boardsEqual } from './boardUtils'
import { applyMerge } from './mergeLogic'

// Game state validation
export function isValidMove(board: Board, direction: Direction): boolean {
  // Move validity determined by board state change, not just tile movement
  const { newBoard } = applyMerge(board, direction)
  return !boardsEqual(board, newBoard)
}

export function hasEmptyCells(board: Board): boolean {
  return getEmptyCells(board).length > 0
}

export function hasWon(board: Board): boolean {
  // Linear search acceptable for 4x4 grid; early termination on first 2048 found
  for (let row = 0; row < BOARD_SIZE; row++) {
    const currentRow = board[row]
    if (!currentRow) continue

    for (let col = 0; col < BOARD_SIZE; col++) {
      if (currentRow[col] === WIN_TILE) {
        return true
      }
    }
  }
  return false
}

export function canMakeMove(board: Board): boolean {
  if (hasEmptyCells(board)) return true

  // Only check right and down neighbors to avoid duplicate comparisons
  // (if A equals B, then B equals A, so checking both directions is redundant)
  for (let row = 0; row < BOARD_SIZE; row++) {
    const currentRow = board[row]
    if (!currentRow) continue

    for (let col = 0; col < BOARD_SIZE; col++) {
      const current = currentRow[col]

      // Check right neighbor
      if (col < BOARD_SIZE - 1) {
        const rightNeighbor = currentRow[col + 1]
        if (current !== null && current === rightNeighbor) {
          return true
        }
      }

      // Check bottom neighbor
      if (row < BOARD_SIZE - 1) {
        const bottomRow = board[row + 1]
        if (bottomRow) {
          const bottomNeighbor = bottomRow[col]
          if (current !== null && current === bottomNeighbor) {
            return true
          }
        }
      }
    }
  }

  return false
}

export function isGameOver(board: Board): boolean {
  return !canMakeMove(board)
}

// Utility function to check if any move is possible
export function hasAvailableMoves(board: Board): boolean {
  // Brute force check across all directions - acceptable for 4x4 grid
  const directions: Direction[] = ['left', 'right', 'up', 'down']
  return directions.some(direction => isValidMove(board, direction))
}
