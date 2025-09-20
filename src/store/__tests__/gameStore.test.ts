import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useGameStore } from '../gameStore'
import * as utils from '@/utils'
import type { GameState, Direction, Board } from '@/types'

// Mock all utility functions
vi.mock('@/utils', () => ({
  createInitialBoard: vi.fn(),
  makeMove: vi.fn(),
  isValidMove: vi.fn(),
  getBestScore: vi.fn(),
  saveBestScore: vi.fn(),
  loadGameState: vi.fn(),
  saveGameState: vi.fn(),
  clearGameState: vi.fn(),
}))

const mockedUtils = vi.mocked(utils)

describe('gameStore', () => {
  const mockBoard: Board = [
    [2, 4, null, null],
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
  ]

  const mockInitialState: GameState = {
    board: mockBoard,
    score: 0,
    bestScore: 100,
    gameOver: false,
    won: false,
    canUndo: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup default mock implementations
    mockedUtils.createInitialBoard.mockReturnValue(mockBoard)
    mockedUtils.getBestScore.mockReturnValue(100)
    mockedUtils.isValidMove.mockReturnValue(true)
    mockedUtils.makeMove.mockReturnValue({
      board: [
        [4, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ],
      score: 4,
      bestScore: 100,
      gameOver: false,
      won: false,
      canUndo: false,
    })
    mockedUtils.saveBestScore.mockImplementation(() => {})
    mockedUtils.loadGameState.mockReturnValue(null)
    mockedUtils.saveGameState.mockImplementation(() => {})
    mockedUtils.clearGameState.mockImplementation(() => {})
  })

  afterEach(() => {
    // Reset zustand store state
    act(() => {
      useGameStore.setState({
        board: mockBoard,
        score: 0,
        bestScore: 100,
        gameOver: false,
        won: false,
        canUndo: false,
        previousState: null,
      })
    })
  })

  describe('initial state', () => {
    it('should initialize with correct default values', () => {
      // Initialize the store state manually for testing
      act(() => {
        useGameStore.setState({
          board: mockBoard,
          score: 0,
          bestScore: 100,
          gameOver: false,
          won: false,
          canUndo: false,
          previousState: null,
        })
      })

      const { result } = renderHook(() => useGameStore())

      expect(result.current.board).toBeDefined()
      expect(Array.isArray(result.current.board)).toBe(true)
      expect(result.current.score).toBe(0)
      expect(result.current.bestScore).toBe(100)
      expect(result.current.gameOver).toBe(false)
      expect(result.current.won).toBe(false)
      expect(result.current.canUndo).toBe(false)
      expect(result.current.previousState).toBeNull()
    })

    it('should have all required methods', () => {
      const { result } = renderHook(() => useGameStore())

      expect(typeof result.current.move).toBe('function')
      expect(typeof result.current.newGame).toBe('function')
      expect(typeof result.current.undo).toBe('function')
    })
  })

  describe('move action', () => {
    it('should execute valid move successfully', () => {
      const { result } = renderHook(() => useGameStore())

      const newGameState: GameState = {
        board: [
          [4, null, null, null],
          [null, null, null, null],
          [null, null, null, null],
          [null, null, null, null],
        ],
        score: 4,
        bestScore: 100,
        gameOver: false,
        won: false,
        canUndo: false,
      }

      mockedUtils.makeMove.mockReturnValue(newGameState)

      act(() => {
        result.current.move('left')
      })

      expect(mockedUtils.isValidMove).toHaveBeenCalledWith(mockBoard, 'left')
      expect(mockedUtils.makeMove).toHaveBeenCalledWith(
        expect.objectContaining({
          board: mockBoard,
          score: 0,
          bestScore: 100,
        }),
        'left'
      )

      expect(result.current.board).toEqual(newGameState.board)
      expect(result.current.score).toBe(4)
      expect(result.current.canUndo).toBe(true)
      expect(result.current.previousState).toEqual(mockInitialState)
    })

    it('should not execute invalid move', () => {
      const { result } = renderHook(() => useGameStore())

      mockedUtils.isValidMove.mockReturnValue(false)

      const initialBoard = result.current.board
      const initialScore = result.current.score

      act(() => {
        result.current.move('left')
      })

      expect(mockedUtils.isValidMove).toHaveBeenCalledWith(mockBoard, 'left')
      expect(mockedUtils.makeMove).not.toHaveBeenCalled()
      expect(result.current.board).toEqual(initialBoard)
      expect(result.current.score).toBe(initialScore)
      expect(result.current.canUndo).toBe(false)
    })

    it('should not execute move when game is over', () => {
      const { result } = renderHook(() => useGameStore())

      // First set game over state
      act(() => {
        result.current.newGame()
      })

      act(() => {
        // Manually set gameOver to true (simulating game over state)
        useGameStore.setState({ gameOver: true })
      })

      const initialBoard = result.current.board
      const initialScore = result.current.score

      act(() => {
        result.current.move('left')
      })

      expect(mockedUtils.isValidMove).not.toHaveBeenCalled()
      expect(mockedUtils.makeMove).not.toHaveBeenCalled()
      expect(result.current.board).toEqual(initialBoard)
      expect(result.current.score).toBe(initialScore)
    })

    it('should update best score when new score is higher', () => {
      const { result } = renderHook(() => useGameStore())

      const newGameState: GameState = {
        board: mockBoard,
        score: 200, // Higher than current best score of 100
        bestScore: 100,
        gameOver: false,
        won: false,
        canUndo: false,
      }

      mockedUtils.makeMove.mockReturnValue(newGameState)

      act(() => {
        result.current.move('left')
      })

      expect(mockedUtils.saveBestScore).toHaveBeenCalledWith(200)
      expect(result.current.bestScore).toBe(200)
    })

    it('should not update best score when new score is lower', () => {
      const { result } = renderHook(() => useGameStore())

      const newGameState: GameState = {
        board: mockBoard,
        score: 50, // Lower than current best score of 100
        bestScore: 100,
        gameOver: false,
        won: false,
        canUndo: false,
      }

      mockedUtils.makeMove.mockReturnValue(newGameState)

      act(() => {
        result.current.move('left')
      })

      expect(mockedUtils.saveBestScore).not.toHaveBeenCalled()
      expect(result.current.bestScore).toBe(100)
    })

    it('should handle all four directions', () => {
      const { result } = renderHook(() => useGameStore())
      const directions: Direction[] = ['left', 'right', 'up', 'down']

      directions.forEach(direction => {
        vi.clearAllMocks()

        act(() => {
          result.current.move(direction)
        })

        expect(mockedUtils.isValidMove).toHaveBeenCalledWith(
          expect.any(Array),
          direction
        )
      })
    })

    it('should save complete previous state for undo', () => {
      const { result } = renderHook(() => useGameStore())

      // Set up a specific initial state
      act(() => {
        useGameStore.setState({
          board: mockBoard,
          score: 50,
          bestScore: 150,
          gameOver: false,
          won: false,
          canUndo: true, // Already has undo capability
          previousState: null,
        })
      })

      const expectedPreviousState = {
        board: mockBoard,
        score: 50,
        bestScore: 150,
        gameOver: false,
        won: false,
        canUndo: true,
      }

      act(() => {
        result.current.move('left')
      })

      expect(result.current.previousState).toEqual(expectedPreviousState)
    })
  })

  describe('newGame action', () => {
    it('should reset game to initial state', () => {
      const { result } = renderHook(() => useGameStore())

      // First make some moves to change state
      act(() => {
        result.current.move('left')
      })

      // Verify state has changed
      expect(result.current.score).toBeGreaterThan(0)
      expect(result.current.canUndo).toBe(true)
      expect(result.current.previousState).not.toBeNull()

      // Reset mocks and set up new board
      vi.clearAllMocks()
      const newBoard: Board = [
        [2, null, null, 2],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]
      mockedUtils.createInitialBoard.mockReturnValue(newBoard)
      mockedUtils.getBestScore.mockReturnValue(200)

      act(() => {
        result.current.newGame()
      })

      expect(mockedUtils.createInitialBoard).toHaveBeenCalled()
      expect(mockedUtils.getBestScore).toHaveBeenCalled()

      expect(result.current.board).toEqual(newBoard)
      expect(result.current.score).toBe(0)
      expect(result.current.bestScore).toBe(200)
      expect(result.current.gameOver).toBe(false)
      expect(result.current.won).toBe(false)
      expect(result.current.canUndo).toBe(false)
      expect(result.current.previousState).toBeNull()
    })

    it('should create fresh board each time', () => {
      const { result } = renderHook(() => useGameStore())

      const board1: Board = [
        [2, 4, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]

      const board2: Board = [
        [4, null, 2, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]

      mockedUtils.createInitialBoard
        .mockReturnValueOnce(board1)
        .mockReturnValueOnce(board2)

      act(() => {
        result.current.newGame()
      })
      expect(result.current.board).toEqual(board1)

      act(() => {
        result.current.newGame()
      })
      expect(result.current.board).toEqual(board2)

      expect(mockedUtils.createInitialBoard).toHaveBeenCalledTimes(2)
    })
  })

  describe('undo action', () => {
    it('should restore previous state when available', () => {
      const { result } = renderHook(() => useGameStore())

      // First make a move to create previous state
      act(() => {
        result.current.move('left')
      })

      expect(result.current.canUndo).toBe(true)
      expect(result.current.previousState).not.toBeNull()

      const stateBeforeUndo = {
        board: result.current.board,
        score: result.current.score,
      }

      act(() => {
        result.current.undo()
      })

      expect(result.current.board).toEqual(mockBoard)
      expect(result.current.score).toBe(0)
      expect(result.current.canUndo).toBe(false)
      expect(result.current.previousState).toBeNull()

      // Verify the state actually changed back
      expect(result.current.board).not.toEqual(stateBeforeUndo.board)
    })

    it('should do nothing when no previous state available', () => {
      const { result } = renderHook(() => useGameStore())

      expect(result.current.previousState).toBeNull()
      expect(result.current.canUndo).toBe(false)

      const stateBefore = {
        board: result.current.board,
        score: result.current.score,
        bestScore: result.current.bestScore,
        gameOver: result.current.gameOver,
        won: result.current.won,
        canUndo: result.current.canUndo,
      }

      act(() => {
        result.current.undo()
      })

      // State should remain unchanged
      expect(result.current.board).toEqual(stateBefore.board)
      expect(result.current.score).toBe(stateBefore.score)
      expect(result.current.bestScore).toBe(stateBefore.bestScore)
      expect(result.current.gameOver).toBe(stateBefore.gameOver)
      expect(result.current.won).toBe(stateBefore.won)
      expect(result.current.canUndo).toBe(stateBefore.canUndo)
      expect(result.current.previousState).toBeNull()
    })

    it('should preserve complete game state on undo', () => {
      const { result } = renderHook(() => useGameStore())

      // Set up specific initial state
      const specificState = {
        board: mockBoard,
        score: 100,
        bestScore: 500,
        gameOver: false,
        won: true, // Won state
        canUndo: false,
        previousState: null,
      }

      act(() => {
        useGameStore.setState(specificState)
      })

      // Make a move
      act(() => {
        result.current.move('left')
      })

      // Undo should restore all properties
      act(() => {
        result.current.undo()
      })

      expect(result.current.board).toEqual(specificState.board)
      expect(result.current.score).toBe(specificState.score)
      expect(result.current.bestScore).toBe(specificState.bestScore)
      expect(result.current.gameOver).toBe(specificState.gameOver)
      expect(result.current.won).toBe(specificState.won)
      expect(result.current.canUndo).toBe(false)
      expect(result.current.previousState).toBeNull()
    })

    it('should only allow one level of undo', () => {
      const { result } = renderHook(() => useGameStore())

      // Make first move
      act(() => {
        result.current.move('left')
      })

      const afterFirstMove = {
        board: result.current.board,
        score: result.current.score,
      }

      // Make second move
      act(() => {
        result.current.move('right')
      })

      // Undo should only go back to state after first move, not initial
      act(() => {
        result.current.undo()
      })

      expect(result.current.board).toEqual(afterFirstMove.board)
      expect(result.current.score).toBe(afterFirstMove.score)
      expect(result.current.canUndo).toBe(false)

      // Second undo should do nothing
      act(() => {
        result.current.undo()
      })

      expect(result.current.board).toEqual(afterFirstMove.board)
      expect(result.current.score).toBe(afterFirstMove.score)
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle utility function errors gracefully', () => {
      const { result } = renderHook(() => useGameStore())

      mockedUtils.isValidMove.mockImplementation(() => {
        throw new Error('Validation error')
      })

      expect(() => {
        act(() => {
          result.current.move('left')
        })
      }).toThrow('Validation error')
    })

    it('should handle makeMove returning null/undefined gracefully', () => {
      const { result } = renderHook(() => useGameStore())

      mockedUtils.makeMove.mockReturnValue(null as unknown as GameState)

      expect(() => {
        act(() => {
          result.current.move('left')
        })
      }).toThrow()
    })

    it('should handle saveBestScore errors gracefully', () => {
      const { result } = renderHook(() => useGameStore())

      mockedUtils.saveBestScore.mockImplementation(() => {
        throw new Error('Storage error')
      })

      const newGameState: GameState = {
        board: mockBoard,
        score: 200,
        bestScore: 100,
        gameOver: false,
        won: false,
        canUndo: false,
      }

      mockedUtils.makeMove.mockReturnValue(newGameState)

      expect(() => {
        act(() => {
          result.current.move('left')
        })
      }).toThrow('Storage error')
    })
  })

  describe('integration scenarios', () => {
    it('should handle complete game flow', () => {
      const { result } = renderHook(() => useGameStore())

      // Start new game
      act(() => {
        result.current.newGame()
      })
      expect(result.current.score).toBe(0)
      expect(result.current.canUndo).toBe(false)

      // Make several moves
      act(() => {
        result.current.move('left')
      })
      expect(result.current.canUndo).toBe(true)

      act(() => {
        result.current.move('right')
      })
      expect(result.current.canUndo).toBe(true)

      // Undo last move
      act(() => {
        result.current.undo()
      })
      expect(result.current.canUndo).toBe(false)

      // Start new game should reset everything
      act(() => {
        result.current.newGame()
      })
      expect(result.current.score).toBe(0)
      expect(result.current.canUndo).toBe(false)
      expect(result.current.previousState).toBeNull()
    })

    it('should maintain best score across games', () => {
      const { result } = renderHook(() => useGameStore())

      // Set high score in first game
      const highScoreState: GameState = {
        board: mockBoard,
        score: 1000,
        bestScore: 100,
        gameOver: false,
        won: false,
        canUndo: false,
      }

      mockedUtils.makeMove.mockReturnValue(highScoreState)

      act(() => {
        result.current.move('left')
      })

      expect(result.current.bestScore).toBe(1000)
      expect(mockedUtils.saveBestScore).toHaveBeenCalledWith(1000)

      // Start new game
      mockedUtils.getBestScore.mockReturnValue(1000)

      act(() => {
        result.current.newGame()
      })

      expect(result.current.bestScore).toBe(1000)
      expect(result.current.score).toBe(0)
    })
  })
})
