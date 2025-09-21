import {
  BOARD_SIZE,
  INITIAL_TILES_COUNT,
  PROBABILITY_OF_TWO,
} from '@/constants'
import type { Board } from '@/types'

// Board creation and initialization
export function createEmptyBoard(): Board {
  // Array.fill() with objects would create references to same array - map ensures unique arrays
  return Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null))
}

export function getEmptyCells(
  board: Board
): Array<{ row: number; col: number }> {
  const emptyCells: Array<{ row: number; col: number }> = []

  for (let row = 0; row < BOARD_SIZE; row++) {
    const currentRow = board[row]
    // TypeScript can't guarantee board structure at runtime
    if (!currentRow) continue

    for (let col = 0; col < BOARD_SIZE; col++) {
      if (currentRow[col] === null) {
        emptyCells.push({ row, col })
      }
    }
  }

  return emptyCells
}

export function addRandomTile(
  board: Board,
  probabilityOfTwo = PROBABILITY_OF_TWO
): Board {
  const emptyCells = getEmptyCells(board)
  if (emptyCells.length === 0) return board

  const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)]
  if (!randomCell) return board

  const newValue = Math.random() <= probabilityOfTwo ? 2 : 4

  // Deep clone board to maintain immutability for React state management
  const newBoard = board.map(row => [...row])
  const targetRow = newBoard[randomCell.row]
  if (targetRow) {
    targetRow[randomCell.col] = newValue
  }

  return newBoard
}

export function createInitialBoard(): Board {
  let board = createEmptyBoard()

  // Sequential placement prevents race conditions in random cell selection
  for (let i = 0; i < INITIAL_TILES_COUNT; i++) {
    board = addRandomTile(board, 1) // Force '2' for initial tiles for better game start
  }

  return board
}

// Board comparison
export function boardsEqual(board1: Board, board2: Board): boolean {
  if (board1.length !== board2.length) return false

  for (let row = 0; row < BOARD_SIZE; row++) {
    const row1 = board1[row]
    const row2 = board2[row]

    // Handle malformed boards gracefully without throwing error
    if (!row1 || !row2) return false
    if (row1.length !== row2.length) return false

    for (let col = 0; col < BOARD_SIZE; col++) {
      if (row1[col] !== row2[col]) {
        return false
      }
    }
  }
  return true
}

// Board transformation utilities
export function transposeBoard(board: Board): Board {
  // Matrix transpose: converts columns to rows, enabling vertical moves with horizontal logic
  const transposed: Board = Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null))

  for (let row = 0; row < BOARD_SIZE; row++) {
    const currentRow = board[row]
    if (!currentRow) continue

    for (let col = 0; col < BOARD_SIZE; col++) {
      const transposedRow = transposed[col]
      const currentCell = currentRow[col]
      // Only copy non-null values to avoid overwriting with undefined
      if (transposedRow && currentCell) {
        transposedRow[row] = currentCell
      }
    }
  }

  return transposed
}

export function reverseBoard(board: Board): Board {
  // Horizontal flip: converts right moves into left moves
  return board.map(row =>
    row ? [...row].reverse() : Array(BOARD_SIZE).fill(null)
  )
}
