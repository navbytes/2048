import { BOARD_SIZE } from '@/constants'
import type { Board, Cell, Direction } from '@/types'
import { transposeBoard, reverseBoard } from './boardUtils'

// Row processing (core merge logic)
export function processRow(row: Cell[]): {
  newRow: Cell[]
  scoreGained: number
} {
  if (!row || row.length !== BOARD_SIZE) {
    return { newRow: Array(BOARD_SIZE).fill(null), scoreGained: 0 }
  }

  // Simulate gravity - tiles slide left until they hit something
  const nonNullTiles = row.filter(
    (cell): cell is NonNullable<Cell> => cell !== null
  )

  // Single-pass merge algorithm: each tile can only participate in one merge per move
  const merged: Cell[] = []
  let scoreGained = 0
  let i = 0

  while (i < nonNullTiles.length) {
    const currentTile = nonNullTiles[i]
    const nextTile = nonNullTiles[i + 1]

    if (
      currentTile !== undefined &&
      nextTile !== undefined &&
      currentTile === nextTile
    ) {
      // Consume both tiles in the merge, preventing chain reactions
      const mergedValue = (currentTile as number) * 2
      merged.push(mergedValue as Cell)
      scoreGained += mergedValue
      i += 2
    } else if (currentTile !== undefined) {
      // Tile can't merge, just moves to new position
      merged.push(currentTile)
      i += 1
    } else {
      break
    }
  }

  // Right-pad with nulls to maintain consistent row length
  while (merged.length < BOARD_SIZE) {
    merged.push(null)
  }

  return { newRow: merged, scoreGained }
}

// Movement functions
export function mergeLeft(board: Board): {
  newBoard: Board
  scoreGained: number
} {
  let totalScore = 0
  const newBoard: Board = []

  for (let row = 0; row < BOARD_SIZE; row++) {
    const currentRow = board[row]
    if (currentRow) {
      const { newRow, scoreGained } = processRow(currentRow)
      newBoard.push(newRow)
      totalScore += scoreGained
    } else {
      newBoard.push(Array(BOARD_SIZE).fill(null))
    }
  }

  return { newBoard, scoreGained: totalScore }
}

export function mergeRight(board: Board): {
  newBoard: Board
  scoreGained: number
} {
  // Transform-process-restore pattern: reuse left logic for right moves
  const reversedBoard = reverseBoard(board)
  const { newBoard: mergedBoard, scoreGained } = mergeLeft(reversedBoard)
  const finalBoard = reverseBoard(mergedBoard)

  return { newBoard: finalBoard, scoreGained }
}

export function mergeUp(board: Board): {
  newBoard: Board
  scoreGained: number
} {
  // Transpose converts vertical movement to horizontal, enabling code reuse
  const transposedBoard = transposeBoard(board)
  const { newBoard: mergedBoard, scoreGained } = mergeLeft(transposedBoard)
  const finalBoard = transposeBoard(mergedBoard)

  return { newBoard: finalBoard, scoreGained }
}

export function mergeDown(board: Board): {
  newBoard: Board
  scoreGained: number
} {
  // Combine transpose and reverse: down becomes right on rotated board
  const transposedBoard = transposeBoard(board)
  const { newBoard: mergedBoard, scoreGained } = mergeRight(transposedBoard)
  const finalBoard = transposeBoard(mergedBoard)

  return { newBoard: finalBoard, scoreGained }
}

// Main merge function
export function applyMerge(
  board: Board,
  direction: Direction
): { newBoard: Board; scoreGained: number } {
  switch (direction) {
    case 'left':
      return mergeLeft(board)
    case 'right':
      return mergeRight(board)
    case 'up':
      return mergeUp(board)
    case 'down':
      return mergeDown(board)
    default: {
      // Exhaustive checking ensures compile-time safety for enum-like types
      const _exhaustiveCheck: never = direction
      throw new Error(`Invalid direction: ${_exhaustiveCheck}`)
    }
  }
}
