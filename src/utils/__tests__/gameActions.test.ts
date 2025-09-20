import { describe, it, expect, vi, beforeEach } from 'vitest'
import { makeMove } from '../gameActions'
import * as boardUtils from '../boardUtils'
import * as mergeLogic from '../mergeLogic'
import * as gameValidation from '../gameValidation'
import type { GameState, Direction, Board } from '@/types'

// Mock the imported modules
vi.mock('../boardUtils')
vi.mock('../mergeLogic')
vi.mock('../gameValidation')

const mockedBoardUtils = vi.mocked(boardUtils)
const mockedMergeLogic = vi.mocked(mergeLogic)
const mockedGameValidation = vi.mocked(gameValidation)

describe('gameActions', () => {
  describe('makeMove', () => {
    const initialGameState: GameState = {
      board: [
        [2, 2, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ],
      score: 100,
      bestScore: 500,
      won: false,
      gameOver: false,
      canUndo: false,
    }

    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('should return same state for invalid moves', () => {
      const mergedBoard: Board = [
        [2, 2, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]

      // Mock that merge doesn't change the board (invalid move)
      mockedMergeLogic.applyMerge.mockReturnValue({
        newBoard: mergedBoard,
        scoreGained: 0,
      })

      // Mock that boards are equal (no change)
      mockedBoardUtils.boardsEqual.mockReturnValue(true)

      const result = makeMove(initialGameState, 'left')

      expect(result).toBe(initialGameState) // Should return exact same object
      expect(mockedBoardUtils.addRandomTile).not.toHaveBeenCalled()
      expect(mockedGameValidation.hasWon).not.toHaveBeenCalled()
      expect(mockedGameValidation.isGameOver).not.toHaveBeenCalled()
    })

    it('should process valid moves correctly', () => {
      const mergedBoard: Board = [
        [4, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]

      const boardWithNewTile: Board = [
        [4, 2, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]

      // Mock merge result
      mockedMergeLogic.applyMerge.mockReturnValue({
        newBoard: mergedBoard,
        scoreGained: 4,
      })

      // Mock that boards are different (valid move)
      mockedBoardUtils.boardsEqual.mockReturnValue(false)

      // Mock adding random tile
      mockedBoardUtils.addRandomTile.mockReturnValue(boardWithNewTile)

      // Mock game state checks
      mockedGameValidation.hasWon.mockReturnValue(false)
      mockedGameValidation.isGameOver.mockReturnValue(false)

      const result = makeMove(initialGameState, 'left')

      expect(mockedMergeLogic.applyMerge).toHaveBeenCalledWith(
        initialGameState.board,
        'left'
      )
      expect(mockedBoardUtils.boardsEqual).toHaveBeenCalledWith(
        initialGameState.board,
        mergedBoard
      )
      expect(mockedBoardUtils.addRandomTile).toHaveBeenCalledWith(mergedBoard)
      expect(mockedGameValidation.hasWon).toHaveBeenCalledWith(boardWithNewTile)
      expect(mockedGameValidation.isGameOver).toHaveBeenCalledWith(
        boardWithNewTile
      )

      expect(result).toEqual({
        board: boardWithNewTile,
        score: 104, // 100 + 4
        bestScore: 500,
        won: false,
        gameOver: false,
        canUndo: false,
      })
    })

    it('should update score correctly', () => {
      const mergedBoard: Board = [
        [4, 8, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]

      const boardWithNewTile: Board = [
        [4, 8, 2, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]

      mockedMergeLogic.applyMerge.mockReturnValue({
        newBoard: mergedBoard,
        scoreGained: 12, // 4 + 8
      })

      mockedBoardUtils.boardsEqual.mockReturnValue(false)
      mockedBoardUtils.addRandomTile.mockReturnValue(boardWithNewTile)
      mockedGameValidation.hasWon.mockReturnValue(false)
      mockedGameValidation.isGameOver.mockReturnValue(false)

      const result = makeMove(initialGameState, 'right')

      expect(result.score).toBe(112) // 100 + 12
    })

    it('should detect win condition', () => {
      const mergedBoard: Board = [
        [1024, 1024, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]

      const boardWithNewTile: Board = [
        [2048, 2, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]

      mockedMergeLogic.applyMerge.mockReturnValue({
        newBoard: mergedBoard,
        scoreGained: 2048,
      })

      mockedBoardUtils.boardsEqual.mockReturnValue(false)
      mockedBoardUtils.addRandomTile.mockReturnValue(boardWithNewTile)
      mockedGameValidation.hasWon.mockReturnValue(true) // Win detected
      mockedGameValidation.isGameOver.mockReturnValue(false)

      const result = makeMove(initialGameState, 'left')

      expect(result.won).toBe(true)
      expect(result.score).toBe(2148) // 100 + 2048
    })

    it('should preserve win state once achieved', () => {
      const alreadyWonState: GameState = {
        ...initialGameState,
        won: true,
      }

      const mergedBoard: Board = [
        [4, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]

      const boardWithNewTile: Board = [
        [4, 2, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]

      mockedMergeLogic.applyMerge.mockReturnValue({
        newBoard: mergedBoard,
        scoreGained: 4,
      })

      mockedBoardUtils.boardsEqual.mockReturnValue(false)
      mockedBoardUtils.addRandomTile.mockReturnValue(boardWithNewTile)
      mockedGameValidation.hasWon.mockReturnValue(false) // Current move doesn't win
      mockedGameValidation.isGameOver.mockReturnValue(false)

      const result = makeMove(alreadyWonState, 'left')

      expect(result.won).toBe(true) // Should remain true
    })

    it('should detect game over condition', () => {
      const mergedBoard: Board = [
        [2, 4, 8, 16],
        [32, 64, 128, 256],
        [512, 1024, 2, 4],
        [8, 16, 32, 64],
      ]

      const boardWithNewTile: Board = [
        [2, 4, 8, 16],
        [32, 64, 128, 256],
        [512, 1024, 2, 4],
        [8, 16, 32, 64],
      ]

      mockedMergeLogic.applyMerge.mockReturnValue({
        newBoard: mergedBoard,
        scoreGained: 0,
      })

      mockedBoardUtils.boardsEqual.mockReturnValue(false)
      mockedBoardUtils.addRandomTile.mockReturnValue(boardWithNewTile)
      mockedGameValidation.hasWon.mockReturnValue(false)
      mockedGameValidation.isGameOver.mockReturnValue(true) // Game over

      const result = makeMove(initialGameState, 'up')

      expect(result.gameOver).toBe(true)
    })

    it('should preserve bestScore and canUndo from initial state', () => {
      const stateWithUndo: GameState = {
        ...initialGameState,
        bestScore: 1000,
        canUndo: true,
      }

      const mergedBoard: Board = [
        [4, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]

      const boardWithNewTile: Board = [
        [4, 2, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]

      mockedMergeLogic.applyMerge.mockReturnValue({
        newBoard: mergedBoard,
        scoreGained: 4,
      })

      mockedBoardUtils.boardsEqual.mockReturnValue(false)
      mockedBoardUtils.addRandomTile.mockReturnValue(boardWithNewTile)
      mockedGameValidation.hasWon.mockReturnValue(false)
      mockedGameValidation.isGameOver.mockReturnValue(false)

      const result = makeMove(stateWithUndo, 'down')

      expect(result.bestScore).toBe(1000)
      expect(result.canUndo).toBe(true)
    })

    it('should handle all four directions', () => {
      const directions: Direction[] = ['left', 'right', 'up', 'down']

      directions.forEach(direction => {
        vi.clearAllMocks()

        const mergedBoard: Board = [
          [4, null, null, null],
          [null, null, null, null],
          [null, null, null, null],
          [null, null, null, null],
        ]

        const boardWithNewTile: Board = [
          [4, 2, null, null],
          [null, null, null, null],
          [null, null, null, null],
          [null, null, null, null],
        ]

        mockedMergeLogic.applyMerge.mockReturnValue({
          newBoard: mergedBoard,
          scoreGained: 4,
        })

        mockedBoardUtils.boardsEqual.mockReturnValue(false)
        mockedBoardUtils.addRandomTile.mockReturnValue(boardWithNewTile)
        mockedGameValidation.hasWon.mockReturnValue(false)
        mockedGameValidation.isGameOver.mockReturnValue(false)

        const result = makeMove(initialGameState, direction)

        expect(mockedMergeLogic.applyMerge).toHaveBeenCalledWith(
          initialGameState.board,
          direction
        )
        expect(result).toEqual({
          board: boardWithNewTile,
          score: 104,
          bestScore: 500,
          won: false,
          gameOver: false,
          canUndo: false,
        })
      })
    })

    it('should handle edge case where hasWon check affects final state', () => {
      const mergedBoard: Board = [
        [2048, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]

      const boardWithNewTile: Board = [
        [2048, 2, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]

      mockedMergeLogic.applyMerge.mockReturnValue({
        newBoard: mergedBoard,
        scoreGained: 2048,
      })

      mockedBoardUtils.boardsEqual.mockReturnValue(false)
      mockedBoardUtils.addRandomTile.mockReturnValue(boardWithNewTile)

      // The board with new tile has the winning tile
      mockedGameValidation.hasWon.mockReturnValue(true)
      mockedGameValidation.isGameOver.mockReturnValue(false)

      const result = makeMove(initialGameState, 'left')

      // Should check win condition on board WITH new tile
      expect(mockedGameValidation.hasWon).toHaveBeenCalledWith(boardWithNewTile)
      expect(result.won).toBe(true)
    })

    it('should handle simultaneous win and game over conditions', () => {
      const mergedBoard: Board = [
        [2048, 4, 8, 16],
        [32, 64, 128, 256],
        [512, 1024, 2, 4],
        [8, 16, 32, 64],
      ]

      const boardWithNewTile: Board = [
        [2048, 4, 8, 16],
        [32, 64, 128, 256],
        [512, 1024, 2, 4],
        [8, 16, 32, 64],
      ]

      mockedMergeLogic.applyMerge.mockReturnValue({
        newBoard: mergedBoard,
        scoreGained: 2048,
      })

      mockedBoardUtils.boardsEqual.mockReturnValue(false)
      mockedBoardUtils.addRandomTile.mockReturnValue(boardWithNewTile)
      mockedGameValidation.hasWon.mockReturnValue(true)
      mockedGameValidation.isGameOver.mockReturnValue(true)

      const result = makeMove(initialGameState, 'left')

      expect(result.won).toBe(true)
      expect(result.gameOver).toBe(true)
    })
  })
})
