import { describe, it, expect } from 'vitest'
import {
  isValidMove,
  hasEmptyCells,
  hasWon,
  canMakeMove,
  isGameOver,
  hasAvailableMoves,
} from '../gameValidation'
import { WIN_TILE } from '@/constants'
import type { Board, Direction } from '@/types'

describe('gameValidation', () => {
  describe('isValidMove', () => {
    it('should return true if move changes the board', () => {
      const board: Board = [
        [2, 2, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]

      expect(isValidMove(board, 'left')).toBe(true)
      expect(isValidMove(board, 'right')).toBe(true)
    })

    it('should return false if move does not change the board', () => {
      const board: Board = [
        [2, 4, 8, 16],
        [32, 64, 128, 256],
        [512, 1024, 2, 4],
        [8, 16, 32, 64],
      ]

      // No merges possible and no empty spaces
      expect(isValidMove(board, 'left')).toBe(false)
      expect(isValidMove(board, 'right')).toBe(false)
      expect(isValidMove(board, 'up')).toBe(false)
      expect(isValidMove(board, 'down')).toBe(false)
    })

    it('should return true if tiles can merge', () => {
      const board: Board = [
        [2, 2, 4, 8],
        [16, 32, 64, 128],
        [256, 512, 1024, 2],
        [4, 8, 16, 32],
      ]

      expect(isValidMove(board, 'left')).toBe(true) // First row can merge 2+2
    })

    it('should return true if tiles can slide', () => {
      const board: Board = [
        [null, null, null, 2], // Can slide left
        [32, 64, 128, 256],
        [512, 1024, 2, 4],
        [8, 16, 32, 64],
      ]

      expect(isValidMove(board, 'left')).toBe(true) // Can slide left
      expect(isValidMove(board, 'right')).toBe(false) // Already right-aligned, no change
    })

    it('should return false when no movement possible', () => {
      const board: Board = [
        [2, 4, 8, 16], // No gaps, no adjacent same values
        [32, 64, 128, 256],
        [512, 1024, 2, 4],
        [8, 16, 32, 64],
      ]

      expect(isValidMove(board, 'left')).toBe(false) // No change possible
      expect(isValidMove(board, 'right')).toBe(false) // No change possible
      expect(isValidMove(board, 'up')).toBe(false) // No change possible
      expect(isValidMove(board, 'down')).toBe(false) // No change possible
    })

    it('should handle all directions correctly', () => {
      const board: Board = [
        [null, 2, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]

      expect(isValidMove(board, 'left')).toBe(true)
      expect(isValidMove(board, 'right')).toBe(true)
      expect(isValidMove(board, 'up')).toBe(false) // Already at top
      expect(isValidMove(board, 'down')).toBe(true)
    })
  })

  describe('hasEmptyCells', () => {
    it('should return true for board with empty cells', () => {
      const board: Board = [
        [2, 4, null, 8],
        [null, 16, 32, null],
        [64, null, 128, 256],
        [null, 512, null, 1024],
      ]

      expect(hasEmptyCells(board)).toBe(true)
    })

    it('should return false for full board', () => {
      const board: Board = [
        [2, 4, 8, 16],
        [32, 64, 128, 256],
        [512, 1024, 2, 4],
        [8, 16, 32, 64],
      ]

      expect(hasEmptyCells(board)).toBe(false)
    })

    it('should return true for empty board', () => {
      const board: Board = [
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]

      expect(hasEmptyCells(board)).toBe(true)
    })

    it('should return true for board with single tile', () => {
      const board: Board = [
        [2, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]

      expect(hasEmptyCells(board)).toBe(true)
    })
  })

  describe('hasWon', () => {
    it('should return true when WIN_TILE is present', () => {
      const board: Board = [
        [2, 4, 8, 16],
        [32, 64, 128, 256],
        [512, 1024, WIN_TILE, 4],
        [8, 16, 32, 64],
      ]

      expect(hasWon(board)).toBe(true)
    })

    it('should return false when WIN_TILE is not present', () => {
      const board: Board = [
        [2, 4, 8, 16],
        [32, 64, 128, 256],
        [512, 1024, 4, 8],
        [16, 32, 64, 128],
      ]

      expect(hasWon(board)).toBe(false)
    })

    it('should return true for multiple WIN_TILE occurrences', () => {
      const board: Board = [
        [WIN_TILE, 4, 8, 16],
        [32, 64, 128, 256],
        [512, 1024, WIN_TILE, 4],
        [8, 16, 32, 64],
      ]

      expect(hasWon(board)).toBe(true)
    })

    it('should return false for empty board', () => {
      const board: Board = [
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]

      expect(hasWon(board)).toBe(false)
    })

    it('should handle malformed board gracefully', () => {
      const board = [
        [WIN_TILE, 4, 8, 16],
        null, // Invalid row
        [512, 1024, 4, 8],
        [8, 16, 32, 64],
      ]

      expect(hasWon(board as Board)).toBe(true)
    })

    it('should return true when WIN_TILE is in different positions', () => {
      const positions = [
        [0, 0],
        [0, 3],
        [1, 1],
        [2, 2],
        [3, 0],
        [3, 3],
      ]

      positions.forEach(([row, col]) => {
        const board: Board = [
          [null, null, null, null],
          [null, null, null, null],
          [null, null, null, null],
          [null, null, null, null],
        ]
        if (row !== undefined && col !== undefined) {
          board[row]![col] = WIN_TILE
        }

        expect(hasWon(board)).toBe(true)
      })
    })
  })

  describe('canMakeMove', () => {
    it('should return true if board has empty cells', () => {
      const board: Board = [
        [2, 4, 8, 16],
        [32, 64, 128, 256],
        [512, 1024, null, 4],
        [8, 16, 32, 64],
      ]

      expect(canMakeMove(board)).toBe(true)
    })

    it('should return true if adjacent tiles can merge horizontally', () => {
      const board: Board = [
        [2, 4, 8, 16],
        [32, 64, 128, 256],
        [512, 1024, 2, 2], // Adjacent 2s can merge
        [8, 16, 32, 64],
      ]

      expect(canMakeMove(board)).toBe(true)
    })

    it('should return true if adjacent tiles can merge vertically', () => {
      const board: Board = [
        [2, 4, 8, 16],
        [32, 64, 128, 256],
        [512, 1024, 2, 4],
        [8, 16, 2, 64], // Vertical 2s can merge
      ]

      expect(canMakeMove(board)).toBe(true)
    })

    it('should return false if no moves are possible', () => {
      const board: Board = [
        [2, 4, 8, 16],
        [32, 64, 128, 256],
        [512, 1024, 2, 4],
        [8, 16, 32, 64],
      ]

      expect(canMakeMove(board)).toBe(false)
    })

    it('should handle board with only one tile', () => {
      const board: Board = [
        [2, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]

      expect(canMakeMove(board)).toBe(true) // Has empty cells
    })

    it('should handle malformed board gracefully', () => {
      const board = [
        [2, 4, 8, 16],
        null, // Invalid row
        [512, 1024, 2, 4],
        [8, 16, 32, 64],
      ]

      expect(canMakeMove(board as Board)).toBe(false)
    })

    it('should detect merges at board edges', () => {
      // Test right edge
      const rightEdgeBoard: Board = [
        [2, 4, 8, 16],
        [32, 64, 128, 256],
        [512, 1024, 4, 4], // Right edge merge
        [8, 16, 32, 64],
      ]
      expect(canMakeMove(rightEdgeBoard)).toBe(true)

      // Test bottom edge
      const bottomEdgeBoard: Board = [
        [2, 4, 8, 16],
        [32, 64, 128, 256],
        [512, 1024, 2, 4],
        [8, 16, 2, 64], // Bottom edge merge
      ]
      expect(canMakeMove(bottomEdgeBoard)).toBe(true)
    })

    it('should efficiently check only right and down neighbors', () => {
      // This test verifies the optimization of checking only right and down
      const board: Board = [
        [2, 4, 8, 16],
        [4, 64, 128, 256], // 4 matches left neighbor, but algorithm should still work
        [512, 1024, 2, 4],
        [8, 16, 32, 64],
      ]

      expect(canMakeMove(board)).toBe(false)
    })
  })

  describe('isGameOver', () => {
    it('should return false if moves are available', () => {
      const board: Board = [
        [2, 4, 8, 16],
        [32, 64, 128, 256],
        [512, 1024, 2, 2], // Can merge
        [8, 16, 32, 64],
      ]

      expect(isGameOver(board)).toBe(false)
    })

    it('should return true if no moves are available', () => {
      const board: Board = [
        [2, 4, 8, 16],
        [32, 64, 128, 256],
        [512, 1024, 2, 4],
        [8, 16, 32, 64],
      ]

      expect(isGameOver(board)).toBe(true)
    })

    it('should return false for empty board', () => {
      const board: Board = [
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]

      expect(isGameOver(board)).toBe(false)
    })

    it('should return false if board has empty cells', () => {
      const board: Board = [
        [2, 4, 8, 16],
        [32, 64, 128, 256],
        [512, 1024, null, 4],
        [8, 16, 32, 64],
      ]

      expect(isGameOver(board)).toBe(false)
    })
  })

  describe('hasAvailableMoves', () => {
    it('should return true if any direction has valid moves', () => {
      const board: Board = [
        [2, 2, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]

      expect(hasAvailableMoves(board)).toBe(true)
    })

    it('should return false if no direction has valid moves', () => {
      const board: Board = [
        [2, 4, 8, 16],
        [32, 64, 128, 256],
        [512, 1024, 2, 4],
        [8, 16, 32, 64],
      ]

      expect(hasAvailableMoves(board)).toBe(false)
    })

    it('should check all four directions', () => {
      // Board where only up move is valid
      const board: Board = [
        [null, null, null, null],
        [2, 4, 8, 16],
        [2, 32, 64, 128], // Can merge 2s vertically
        [4, 256, 512, 1024],
      ]

      expect(hasAvailableMoves(board)).toBe(true)
    })

    it('should handle edge case with single possible move', () => {
      const board: Board = [
        [2, 4, 8, 16],
        [32, 64, 128, 256],
        [512, 1024, 4, 2],
        [8, 16, 32, 2], // Only this 2 can merge with above 2
      ]

      expect(hasAvailableMoves(board)).toBe(true)
    })

    it('should be consistent with canMakeMove for empty cells', () => {
      const boardWithEmptyCell: Board = [
        [2, 4, 8, 16],
        [32, 64, 128, 256],
        [512, 1024, null, 4],
        [8, 16, 32, 64],
      ]

      expect(hasAvailableMoves(boardWithEmptyCell)).toBe(true)
      expect(canMakeMove(boardWithEmptyCell)).toBe(true)
    })

    it('should be consistent with canMakeMove for no moves', () => {
      const noMovesBoard: Board = [
        [2, 4, 8, 16],
        [32, 64, 128, 256],
        [512, 1024, 2, 4],
        [8, 16, 32, 64],
      ]

      expect(hasAvailableMoves(noMovesBoard)).toBe(false)
      expect(canMakeMove(noMovesBoard)).toBe(false)
    })
  })

  describe('integration tests', () => {
    it('should handle typical game progression scenarios', () => {
      // Early game - lots of empty space
      const earlyGame: Board = [
        [2, null, null, null],
        [null, 2, null, null],
        [null, null, 4, null],
        [null, null, null, null],
      ]

      expect(hasEmptyCells(earlyGame)).toBe(true)
      expect(canMakeMove(earlyGame)).toBe(true)
      expect(isGameOver(earlyGame)).toBe(false)
      expect(hasWon(earlyGame)).toBe(false)

      // Mid game - some merges available
      const midGame: Board = [
        [2, 4, 8, 16],
        [4, 8, 16, 32],
        [8, 16, 32, 64],
        [16, 32, 64, 2],
      ]

      expect(hasEmptyCells(midGame)).toBe(false)
      expect(canMakeMove(midGame)).toBe(false) // No adjacent same values
      expect(isGameOver(midGame)).toBe(true)
      expect(hasWon(midGame)).toBe(false)

      // Winning game
      const winningGame: Board = [
        [2, 4, 8, 16],
        [4, 8, 16, 32],
        [8, 16, WIN_TILE, 64],
        [16, 32, 64, 128],
      ]

      expect(hasWon(winningGame)).toBe(true)
    })

    it('should handle corner cases consistently', () => {
      const testCases = [
        // All same values
        Array(4)
          .fill(null)
          .map(() => Array(4).fill(2)),
        // Checkerboard pattern
        [
          [2, 4, 2, 4],
          [4, 2, 4, 2],
          [2, 4, 2, 4],
          [4, 2, 4, 2],
        ],
        // Single row filled
        [
          [2, 4, 8, 16],
          [null, null, null, null],
          [null, null, null, null],
          [null, null, null, null],
        ],
      ]

      testCases.forEach((board, index) => {
        // All validation functions should complete without error
        expect(() => {
          hasEmptyCells(board)
          canMakeMove(board)
          isGameOver(board)
          hasWon(board)
          hasAvailableMoves(board)

          const directions: Direction[] = ['left', 'right', 'up', 'down']
          directions.forEach(direction => {
            isValidMove(board, direction)
          })
        }).not.toThrow(`Test case ${index} should not throw`)
      })
    })
  })
})
