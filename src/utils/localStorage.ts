import { GAME_STATE_KEY } from '@/constants'
import type { GameState } from '@/types'

export const saveGameState = (gameState: GameState): void => {
  try {
    const stateToSave = {
      board: gameState.board,
      score: gameState.score,
      gameOver: gameState.gameOver,
      won: gameState.won,
      canUndo: gameState.canUndo,
    }
    localStorage.setItem(GAME_STATE_KEY, JSON.stringify(stateToSave))
  } catch (error) {
    console.warn('Failed to save game state to localStorage:', error)
  }
}

export const loadGameState = (): Partial<GameState> | null => {
  try {
    const savedState = localStorage.getItem(GAME_STATE_KEY)
    if (!savedState) return null

    const parsedState = JSON.parse(savedState)

    // Validate the saved state structure
    if (!parsedState.board || !Array.isArray(parsedState.board)) {
      return null
    }

    return parsedState as Partial<GameState>
  } catch (error) {
    console.warn('Failed to load game state from localStorage:', error)
    return null
  }
}

export const clearGameState = (): void => {
  try {
    localStorage.removeItem(GAME_STATE_KEY)
  } catch (error) {
    console.warn('Failed to clear game state from localStorage:', error)
  }
}
