import { describe, it, expect } from 'vitest'
import {
  processRow,
  mergeLeft,
  mergeRight,
  mergeUp,
  mergeDown,
  applyMerge,
} from '../mergeLogic'
import { BOARD_SIZE } from '@/constants'
import type { Board, Cell, Direction } from '@/types'

describe('mergeLogic', () => {
  describe('processRow', () => {
    it('should merge identical adjacent tiles', () => {
      const row: Cell[] = [2, 2, null, null]
      const result = processRow(row)

      expect(result.newRow).toEqual([4, null, null, null])
      expect(result.scoreGained).toBe(4)
    })

    it('should merge multiple pairs in a row', () => {
      const row: Cell[] = [2, 2, 4, 4]
      const result = processRow(row)

      expect(result.newRow).toEqual([4, 8, null, null])
      expect(result.scoreGained).toBe(12)
    })

    it('should slide tiles left without merging when values differ', () => {
      const row: Cell[] = [null, 2, null, 4]
      const result = processRow(row)

      expect(result.newRow).toEqual([2, 4, null, null])
      expect(result.scoreGained).toBe(0)
    })

    it('should not merge already merged tiles', () => {
      const row: Cell[] = [4, 2, 2, null]
      const result = processRow(row)

      expect(result.newRow).toEqual([4, 4, null, null])
      expect(result.scoreGained).toBe(4)
    })

    it('should handle row with all same values', () => {
      const row: Cell[] = [2, 2, 2, 2]
      const result = processRow(row)

      // Should merge left-to-right: first pair becomes 4, second pair becomes 4
      expect(result.newRow).toEqual([4, 4, null, null])
      expect(result.scoreGained).toBe(8)
    })

    it('should handle empty row', () => {
      const row: Cell[] = [null, null, null, null]
      const result = processRow(row)

      expect(result.newRow).toEqual([null, null, null, null])
      expect(result.scoreGained).toBe(0)
    })

    it('should handle row with single tile', () => {
      const row: Cell[] = [null, 8, null, null]
      const result = processRow(row)

      expect(result.newRow).toEqual([8, null, null, null])
      expect(result.scoreGained).toBe(0)
    })

    it('should handle invalid row gracefully', () => {
      const row = null
      const result = processRow(row as unknown as Cell[])

      expect(result.newRow).toEqual([null, null, null, null])
      expect(result.scoreGained).toBe(0)
    })

    it('should handle row with wrong length', () => {
      const row: Cell[] = [2, 4]
      const result = processRow(row)

      expect(result.newRow).toEqual([null, null, null, null])
      expect(result.scoreGained).toBe(0)
    })

    it('should not create chain reactions', () => {
      const row: Cell[] = [2, 2, 4, null]
      const result = processRow(row)

      // Should merge 2+2=4, but not merge the resulting 4 with existing 4
      expect(result.newRow).toEqual([4, 4, null, null])
      expect(result.scoreGained).toBe(4)
    })

    it('should handle large tile values', () => {
      const row: Cell[] = [1024, 1024, null, null]
      const result = processRow(row)

      expect(result.newRow).toEqual([2048, null, null, null])
      expect(result.scoreGained).toBe(2048)
    })
  })

  describe('mergeLeft', () => {
    it('should process all rows correctly', () => {
      const board: Board = [
        [2, 2, null, null],
        [null, 4, 4, null],
        [8, null, 8, null],
        [null, null, null, null],
      ]

      const result = mergeLeft(board)

      expect(result.newBoard).toEqual([
        [4, null, null, null],
        [8, null, null, null],
        [16, null, null, null],
        [null, null, null, null],
      ])
      expect(result.scoreGained).toBe(4 + 8 + 16)
    })

    it('should handle empty board', () => {
      const board: Board = Array(BOARD_SIZE)
        .fill(null)
        .map(() => Array(BOARD_SIZE).fill(null))
      const result = mergeLeft(board)

      expect(result.newBoard).toEqual(board)
      expect(result.scoreGained).toBe(0)
    })

    it('should handle board with malformed rows', () => {
      const board = [
        [2, 2, null, null],
        null, // Invalid row
        [8, null, 8, null],
        [null, null, null, null],
      ]

      const result = mergeLeft(board as Board)

      expect(result.newBoard[0]).toEqual([4, null, null, null])
      expect(result.newBoard[1]).toEqual([null, null, null, null])
      expect(result.newBoard[2]).toEqual([16, null, null, null])
      expect(result.newBoard[3]).toEqual([null, null, null, null])
    })
  })

  describe('mergeRight', () => {
    it('should merge tiles towards the right', () => {
      const board: Board = [
        [null, null, 2, 2],
        [null, 4, 4, null],
        [null, 8, null, 8],
        [null, null, null, null],
      ]

      const result = mergeRight(board)

      expect(result.newBoard).toEqual([
        [null, null, null, 4],
        [null, null, null, 8],
        [null, null, null, 16],
        [null, null, null, null],
      ])
      expect(result.scoreGained).toBe(4 + 8 + 16)
    })

    it('should be consistent with mergeLeft for symmetric cases', () => {
      const board: Board = [
        [2, 2, 4, 4],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]

      const leftResult = mergeLeft(board)
      const rightResult = mergeRight(board)

      expect(leftResult.scoreGained).toBe(rightResult.scoreGained)
    })
  })

  describe('mergeUp', () => {
    it('should merge tiles towards the top', () => {
      const board: Board = [
        [2, null, 8, null],
        [2, 4, null, null],
        [null, 4, 8, null],
        [null, null, null, null],
      ]

      const result = mergeUp(board)

      expect(result.newBoard).toEqual([
        [4, 8, 16, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ])
      expect(result.scoreGained).toBe(4 + 8 + 16)
    })
  })

  describe('mergeDown', () => {
    it('should merge tiles towards the bottom', () => {
      const board: Board = [
        [null, null, null, null],
        [2, null, 8, null],
        [2, 4, null, null],
        [null, 4, 8, null],
      ]

      const result = mergeDown(board)

      expect(result.newBoard).toEqual([
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [4, 8, 16, null],
      ])
      expect(result.scoreGained).toBe(4 + 8 + 16)
    })
  })

  describe('applyMerge', () => {
    const testBoard: Board = [
      [2, 2, null, null],
      [null, 4, 4, null],
      [8, null, 8, null],
      [null, null, null, null],
    ]

    it('should apply left merge correctly', () => {
      const result = applyMerge(testBoard, 'left')

      expect(result.newBoard).toEqual([
        [4, null, null, null],
        [8, null, null, null],
        [16, null, null, null],
        [null, null, null, null],
      ])
      expect(result.scoreGained).toBe(28)
    })

    it('should apply right merge correctly', () => {
      const result = applyMerge(testBoard, 'right')

      expect(result.newBoard).toEqual([
        [null, null, null, 4],
        [null, null, null, 8],
        [null, null, null, 16],
        [null, null, null, null],
      ])
      expect(result.scoreGained).toBe(28)
    })

    it('should apply up merge correctly', () => {
      const verticalTestBoard: Board = [
        [2, null, 8, null],
        [2, 4, null, null],
        [null, 4, 8, null],
        [null, null, null, null],
      ]

      const result = applyMerge(verticalTestBoard, 'up')

      expect(result.newBoard).toEqual([
        [4, 8, 16, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ])
      expect(result.scoreGained).toBe(28)
    })

    it('should apply down merge correctly', () => {
      const verticalTestBoard: Board = [
        [null, null, null, null],
        [2, null, 8, null],
        [2, 4, null, null],
        [null, 4, 8, null],
      ]

      const result = applyMerge(verticalTestBoard, 'down')

      expect(result.newBoard).toEqual([
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [4, 8, 16, null],
      ])
      expect(result.scoreGained).toBe(28)
    })

    it('should throw error for invalid direction', () => {
      expect(() => {
        applyMerge(testBoard, 'invalid' as Direction)
      }).toThrow('Invalid direction: invalid')
    })

    it('should handle all possible directions', () => {
      const directions: Direction[] = ['left', 'right', 'up', 'down']

      directions.forEach(direction => {
        expect(() => {
          applyMerge(testBoard, direction)
        }).not.toThrow()
      })
    })
  })

  describe('edge cases and complex scenarios', () => {
    it('should handle board with maximum tile values', () => {
      const board: Board = [
        [1024, 1024, 2048, 2048],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]

      const result = mergeLeft(board)

      expect(result.newBoard[0]).toEqual([2048, 4096, null, null])
      expect(result.scoreGained).toBe(2048 + 4096)
    })

    it('should handle complex merge patterns', () => {
      const board: Board = [
        [2, 4, 2, 4],
        [4, 2, 4, 2],
        [2, 4, 2, 4],
        [4, 2, 4, 2],
      ]

      const result = mergeLeft(board)

      // No merges should occur as no adjacent tiles are the same
      expect(result.newBoard).toEqual(board)
      expect(result.scoreGained).toBe(0)
    })

    it('should preserve board structure after transformation', () => {
      const board: Board = [
        [2, 2, 4, 4],
        [8, 8, 16, 16],
        [32, 32, 64, 64],
        [128, 128, 256, 256],
      ]

      const directions: Direction[] = ['left', 'right', 'up', 'down']

      directions.forEach(direction => {
        const result = applyMerge(board, direction)

        expect(result.newBoard).toHaveLength(BOARD_SIZE)
        result.newBoard.forEach(row => {
          expect(row).toHaveLength(BOARD_SIZE)
        })
      })
    })

    it('should handle sparse boards correctly', () => {
      const board: Board = [
        [null, null, null, 2],
        [null, null, null, null],
        [null, null, null, null],
        [2, null, null, null],
      ]

      const leftResult = mergeLeft(board)
      const rightResult = mergeRight(board)
      const upResult = mergeUp(board)
      const downResult = mergeDown(board)

      expect(leftResult.newBoard[0]).toEqual([2, null, null, null])
      expect(rightResult.newBoard[0]).toEqual([null, null, null, 2])
      expect(upResult.newBoard[0]).toEqual([2, null, null, 2])
      expect(downResult.newBoard[3]).toEqual([2, null, null, 2])
    })
  })
})
