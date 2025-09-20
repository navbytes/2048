import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import {
  createInitialBoard,
  makeMove,
  isValidMove,
  getBestScore,
  saveBestScore,
} from '@/utils'
import type { Direction, GameState, GameStore } from '@/types'

const initialGameState: GameState = {
  board: createInitialBoard(),
  score: 0,
  bestScore: getBestScore(),
  gameOver: false,
  won: false,
  canUndo: false,
}

export const useGameStore = create<GameStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialGameState,
    previousState: null,

    move: (direction: Direction) => {
      const currentState = get()

      // Don't allow moves if game is over
      if (currentState.gameOver) return

      // Check if move is valid
      if (!isValidMove(currentState.board, direction)) return

      // Save current state for undo
      const previousState = {
        board: currentState.board,
        score: currentState.score,
        bestScore: currentState.bestScore,
        gameOver: currentState.gameOver,
        won: currentState.won,
        canUndo: currentState.canUndo,
      }

      // Execute move
      const newGameState = makeMove(currentState, direction)

      // Update best score if needed
      const newBestScore = Math.max(newGameState.score, currentState.bestScore)
      if (newBestScore > currentState.bestScore) {
        saveBestScore(newBestScore)
      }

      set({
        ...newGameState,
        bestScore: newBestScore,
        previousState,
        canUndo: true,
      })
    },

    newGame: () => {
      set({
        ...initialGameState,
        board: createInitialBoard(),
        bestScore: getBestScore(),
        previousState: null,
      })
    },

    undo: () => {
      const { previousState } = get()
      if (!previousState) return

      set({
        ...previousState,
        previousState: null,
        canUndo: false,
      })
    },
  }))
)
