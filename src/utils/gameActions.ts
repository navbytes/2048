import type { Direction, GameState } from '@/types'
import { addRandomTile, boardsEqual } from './boardUtils'
import { applyMerge } from './mergeLogic'
import { hasWon, isGameOver } from './gameValidation'

// Main game move function
export function makeMove(
  gameState: GameState,
  direction: Direction
): GameState {
  const { newBoard, scoreGained } = applyMerge(gameState.board, direction)

  // Invalid moves don't consume a turn or spawn new tiles
  if (boardsEqual(gameState.board, newBoard)) {
    return gameState
  }

  // New tiles only appear after successful moves, following 2048 rules
  const boardWithNewTile = addRandomTile(newBoard)

  const newScore = gameState.score + scoreGained
  const won = gameState.won || hasWon(boardWithNewTile)
  const gameOver = isGameOver(boardWithNewTile)

  return {
    board: boardWithNewTile,
    score: newScore,
    bestScore: gameState.bestScore,
    won,
    gameOver,
    canUndo: gameState.canUndo,
  }
}
