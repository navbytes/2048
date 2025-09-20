import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import {
  createInitialBoard,
  makeMove,
  isValidMove,
  getBestScore,
  saveBestScore,
  loadGameState,
  saveGameState,
  clearGameState,
} from '@/utils'
import type { Direction, GameState, GameStore } from '@/types'

const createInitialGameState = (): GameState => {
  const savedState = loadGameState()

  if (savedState?.board) {
    return {
      board: savedState.board,
      score: savedState.score ?? 0,
      bestScore: getBestScore(),
      gameOver: savedState.gameOver ?? false,
      won: savedState.won ?? false,
      canUndo: savedState.canUndo ?? false,
    }
  }

  return {
    board: createInitialBoard(),
    score: 0,
    bestScore: getBestScore(),
    gameOver: false,
    won: false,
    canUndo: false,
  }
}

const initialGameState = createInitialGameState()

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

      const updatedState = {
        ...newGameState,
        bestScore: newBestScore,
        previousState,
        canUndo: true,
      }

      set(updatedState)

      // Save to localStorage (excluding previousState)
      saveGameState({
        board: updatedState.board,
        score: updatedState.score,
        bestScore: updatedState.bestScore,
        gameOver: updatedState.gameOver,
        won: updatedState.won,
        canUndo: updatedState.canUndo,
      })
    },

    newGame: () => {
      const newGameState = {
        board: createInitialBoard(),
        score: 0,
        bestScore: getBestScore(),
        gameOver: false,
        won: false,
        canUndo: false,
        previousState: null,
      }

      set(newGameState)

      // Clear localStorage and save new game state
      clearGameState()
      saveGameState({
        board: newGameState.board,
        score: newGameState.score,
        bestScore: newGameState.bestScore,
        gameOver: newGameState.gameOver,
        won: newGameState.won,
        canUndo: newGameState.canUndo,
      })
    },

    undo: () => {
      const { previousState } = get()
      if (!previousState) return

      const undoState = {
        ...previousState,
        previousState: null,
        canUndo: false,
      }

      set(undoState)

      // Save undone state to localStorage
      saveGameState({
        board: undoState.board,
        score: undoState.score,
        bestScore: undoState.bestScore,
        gameOver: undoState.gameOver,
        won: undoState.won,
        canUndo: undoState.canUndo,
      })
    },
  }))
)
