import { describe, it, expect } from 'vitest'
import {
  createEmptyBoard,
  getEmptyCells,
  addRandomTile,
  createInitialBoard,
  boardsEqual,
  transposeBoard,
  reverseBoard,
} from '../boardUtils'
import { BOARD_SIZE, INITIAL_TILES_COUNT } from '@/constants'
import type { Board } from '@/types'

describe('boardUtils', () => {
  describe('createEmptyBoard', () => {
    it('should create a 4x4 board filled with null values', () => {
      const board = createEmptyBoard()

      expect(board).toHaveLength(BOARD_SIZE)
      board.forEach(row => {
        expect(row).toHaveLength(BOARD_SIZE)
        row.forEach(cell => {
          expect(cell).toBeNull()
        })
      })
    })

    it('should create unique row arrays', () => {
      const board = createEmptyBoard()

      // Verify that rows are not the same reference
      expect(board[0]).not.toBe(board[1])
      expect(board[1]).not.toBe(board[2])
      expect(board[2]).not.toBe(board[3])
    })
  })

  describe('getEmptyCells', () => {
    it('should return all cells for an empty board', () => {
      const board = createEmptyBoard()
      const emptyCells = getEmptyCells(board)

      expect(emptyCells).toHaveLength(BOARD_SIZE * BOARD_SIZE)

      // Check that all positions are included
      for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
          expect(emptyCells).toContainEqual({ row, col })
        }
      }
    })

    it('should return empty array for a full board', () => {
      const board = Array(BOARD_SIZE)
        .fill(null)
        .map(() => Array(BOARD_SIZE).fill(2))
      const emptyCells = getEmptyCells(board)

      expect(emptyCells).toHaveLength(0)
    })

    it('should return correct positions for partially filled board', () => {
      const board = createEmptyBoard()
      board[0]![0] = 2
      board[1]![1] = 4
      board[3]![3] = 8

      const emptyCells = getEmptyCells(board)

      expect(emptyCells).toHaveLength(BOARD_SIZE * BOARD_SIZE - 3)
      expect(emptyCells).not.toContainEqual({ row: 0, col: 0 })
      expect(emptyCells).not.toContainEqual({ row: 1, col: 1 })
      expect(emptyCells).not.toContainEqual({ row: 3, col: 3 })
    })

    it('should handle malformed board gracefully', () => {
      const board = [null, [2, 4, null, 8], null, [null, null, null, null]]
      const emptyCells = getEmptyCells(board as Board)

      // Should only process valid rows
      expect(emptyCells).toEqual([
        { row: 1, col: 2 },
        { row: 3, col: 0 },
        { row: 3, col: 1 },
        { row: 3, col: 2 },
        { row: 3, col: 3 },
      ])
    })
  })

  describe('addRandomTile', () => {
    it('should return the same board if no empty cells', () => {
      const board = Array(BOARD_SIZE)
        .fill(null)
        .map(() => Array(BOARD_SIZE).fill(2))
      const result = addRandomTile(board)

      expect(result).toEqual(board)
    })

    it('should add a tile to an empty board', () => {
      const board = createEmptyBoard()
      const result = addRandomTile(board)

      // Should have exactly one non-null tile
      let tileCount = 0
      let addedValue = null

      result.forEach(row => {
        row.forEach(cell => {
          if (cell !== null) {
            tileCount++
            addedValue = cell
          }
        })
      })

      expect(tileCount).toBe(1)
      expect(addedValue).toBeOneOf([2, 4])
    })

    it('should not mutate the original board', () => {
      const board = createEmptyBoard()
      const originalBoard = board.map(row => [...row])

      addRandomTile(board)

      expect(board).toEqual(originalBoard)
    })

    it('should add tile to random empty position', () => {
      const board = createEmptyBoard()
      board[0]![0] = 2
      board[0]![1] = 4

      const result = addRandomTile(board)

      // Original tiles should remain
      expect(result[0]![0]).toBe(2)
      expect(result[0]![1]).toBe(4)

      // Should have one additional tile
      let tileCount = 0
      result.forEach(row => {
        row.forEach(cell => {
          if (cell !== null) tileCount++
        })
      })

      expect(tileCount).toBe(3)
    })

    it('should handle board with one empty cell', () => {
      const board = Array(BOARD_SIZE)
        .fill(null)
        .map(() => Array(BOARD_SIZE).fill(2))
      board[2]![2] = null // Only empty cell

      const result = addRandomTile(board)

      expect(result[2]![2]).toBeOneOf([2, 4])
    })
  })

  describe('createInitialBoard', () => {
    it('should create a board with exactly INITIAL_TILES_COUNT tiles', () => {
      const board = createInitialBoard()

      let tileCount = 0
      board.forEach(row => {
        row.forEach(cell => {
          if (cell !== null) tileCount++
        })
      })

      expect(tileCount).toBe(INITIAL_TILES_COUNT)
    })

    it('should only contain 2 or 4 values', () => {
      const board = createInitialBoard()

      board.forEach(row => {
        row.forEach(cell => {
          if (cell !== null) {
            expect(cell).toBeOneOf([2, 4])
          }
        })
      })
    })

    it('should create different boards on multiple calls', () => {
      const board1 = createInitialBoard()
      const board2 = createInitialBoard()

      // Extremely unlikely to be identical due to randomness
      expect(board1).not.toEqual(board2)
    })
  })

  describe('boardsEqual', () => {
    it('should return true for identical boards', () => {
      const board1: Board = [
        [2, 4, null, 8],
        [null, 2, 4, null],
        [8, null, 2, 4],
        [null, 8, null, 2],
      ]
      const board2: Board = [
        [2, 4, null, 8],
        [null, 2, 4, null],
        [8, null, 2, 4],
        [null, 8, null, 2],
      ]

      expect(boardsEqual(board1, board2)).toBe(true)
    })

    it('should return false for different boards', () => {
      const board1: Board = [
        [2, 4, null, 8],
        [null, 2, 4, null],
        [8, null, 2, 4],
        [null, 8, null, 2],
      ]
      const board2: Board = [
        [2, 4, null, 8],
        [null, 2, 4, null],
        [8, null, 2, 4],
        [null, 8, null, 4], // Different last value
      ]

      expect(boardsEqual(board1, board2)).toBe(false)
    })

    it('should return false for boards of different lengths', () => {
      const board1 = [
        [2, 4],
        [null, 8],
      ]
      const board2 = [
        [2, 4],
        [null, 8],
        [8, 2],
      ]

      expect(boardsEqual(board1 as Board, board2 as Board)).toBe(false)
    })

    it('should handle malformed boards gracefully', () => {
      const board1 = [
        null,
        [2, 4, null, 8],
        [null, 2, 4, null],
        [8, null, 2, 4],
      ]
      const board2 = [
        [2, 4, null, 8],
        [null, 2, 4, null],
        [8, null, 2, 4],
        null,
      ]

      expect(boardsEqual(board1 as Board, board2 as Board)).toBe(false)
    })

    it('should return false for rows of different lengths', () => {
      const board1: Board = [
        [2, 4, null, 8],
        [null, 2, 4], // Short row
        [8, null, 2, 4],
        [null, 8, null, 2],
      ]
      const board2: Board = [
        [2, 4, null, 8],
        [null, 2, 4, null],
        [8, null, 2, 4],
        [null, 8, null, 2],
      ]

      expect(boardsEqual(board1, board2)).toBe(false)
    })
  })

  describe('transposeBoard', () => {
    it('should transpose a board correctly', () => {
      const board = [
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 16],
      ]

      const expected = [
        [1, 5, 9, 13],
        [2, 6, 10, 14],
        [3, 7, 11, 15],
        [4, 8, 12, 16],
      ]

      const result = transposeBoard(board as Board)
      expect(result).toEqual(expected)
    })

    it('should handle board with null values', () => {
      const board: Board = [
        [2, null, 4, null],
        [null, 8, null, 16],
        [32, null, 64, null],
        [null, 128, null, 256],
      ]

      const expected: Board = [
        [2, null, 32, null],
        [null, 8, null, 128],
        [4, null, 64, null],
        [null, 16, null, 256],
      ]

      const result = transposeBoard(board)
      expect(result).toEqual(expected)
    })

    it('should create a new board instance', () => {
      const board = createEmptyBoard()
      const result = transposeBoard(board)

      expect(result).not.toBe(board)
      expect(result[0]).not.toBe(board[0])
    })

    it('should handle malformed boards gracefully', () => {
      const board = [
        [2, 4, null, 8],
        null, // Invalid row
        [8, null, 2, 4],
        [null, 8, null, 2],
      ]

      const result = transposeBoard(board as Board)

      // Should still create a valid 4x4 board structure
      expect(result).toHaveLength(BOARD_SIZE)
      result.forEach(row => {
        expect(row).toHaveLength(BOARD_SIZE)
      })
    })
  })

  describe('reverseBoard', () => {
    it('should reverse each row of the board', () => {
      const board = [
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 16],
      ]

      const expected = [
        [4, 3, 2, 1],
        [8, 7, 6, 5],
        [12, 11, 10, 9],
        [16, 15, 14, 13],
      ]

      const result = reverseBoard(board as Board)
      expect(result).toEqual(expected)
    })

    it('should handle board with null values', () => {
      const board: Board = [
        [2, null, 4, null],
        [null, 8, null, 16],
        [32, null, 64, null],
        [null, 128, null, 256],
      ]

      const expected: Board = [
        [null, 4, null, 2],
        [16, null, 8, null],
        [null, 64, null, 32],
        [256, null, 128, null],
      ]

      const result = reverseBoard(board)
      expect(result).toEqual(expected)
    })

    it('should create a new board instance', () => {
      const board = createEmptyBoard()
      const result = reverseBoard(board)

      expect(result).not.toBe(board)
      expect(result[0]).not.toBe(board[0])
    })

    it('should handle malformed rows gracefully', () => {
      const board = [
        [2, 4, null, 8],
        null, // Invalid row
        [8, null, 2, 4],
        [null, 8, null, 2],
      ]

      const result = reverseBoard(board as Board)

      expect(result[0]).toEqual([8, null, 4, 2])
      expect(result[1]).toEqual(Array(BOARD_SIZE).fill(null))
      expect(result[2]).toEqual([4, 2, null, 8])
      expect(result[3]).toEqual([2, null, 8, null])
    })

    it('should be reversible', () => {
      const board: Board = [
        [2, null, 4, null],
        [null, 8, null, 16],
        [32, null, 64, null],
        [null, 128, null, 256],
      ]

      const reversed = reverseBoard(board)
      const doubleReversed = reverseBoard(reversed)

      expect(doubleReversed).toEqual(board)
    })
  })
})

// Custom matcher to check if value is one of the provided options
expect.extend({
  toBeOneOf(received: unknown, expected: unknown[]) {
    const pass = expected.includes(received)
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be one of ${expected.join(', ')}`,
        pass: true,
      }
    } else {
      return {
        message: () =>
          `expected ${received} to be one of ${expected.join(', ')}`,
        pass: false,
      }
    }
  },
})
