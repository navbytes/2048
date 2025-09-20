import { describe, it, expect, vi } from 'vitest'
import type { Board } from '@/types'

// Mock debug at the module level
vi.mock('debug', () => ({
  default: vi.fn(() => vi.fn()),
}))

describe('debugUtils', () => {
  describe('printBoard', () => {
    it('should not throw errors when called', async () => {
      // Import after mocking
      const { printBoard } = await import('../debugUtils')

      const board: Board = [
        [2, 4, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]

      // Should not throw
      expect(() => {
        printBoard(board)
      }).not.toThrow()
    })

    it('should handle empty board without errors', async () => {
      const { printBoard } = await import('../debugUtils')

      const board: Board = [
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]

      expect(() => {
        printBoard(board)
      }).not.toThrow()
    })

    it('should handle full board without errors', async () => {
      const { printBoard } = await import('../debugUtils')

      const board: Board = [
        [2, 4, 8, 16],
        [32, 64, 128, 256],
        [512, 1024, 2048, 4],
        [8, 16, 32, 64],
      ]

      expect(() => {
        printBoard(board)
      }).not.toThrow()
    })

    it('should handle malformed board without errors', async () => {
      const { printBoard } = await import('../debugUtils')

      const board = [
        [2, 4, 8, 16],
        null,
        [32, 64, 128, 256],
        [512, 1024, 2048, 4],
      ]

      expect(() => {
        printBoard(board as Board)
      }).not.toThrow()
    })

    it('should handle boards with large numbers', async () => {
      const { printBoard } = await import('../debugUtils')

      const board: Board = [
        [2048, 1024, 512, 256],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]

      expect(() => {
        printBoard(board)
      }).not.toThrow()
    })
  })
})
