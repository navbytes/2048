/**
 * more tiles can be added as needed
 * in future -ve numbers can be added for special effects
 * special function tiles can be (e.g. bomb tile, rainbow tile etc
 */
export type NumberTile =
  | 2
  | 4
  | 8
  | 16
  | 32
  | 64
  | 128
  | 256
  | 512
  | 1024
  | 2048

export type Cell = NumberTile | null
export type Board = Cell[][]
export type Direction = 'left' | 'right' | 'up' | 'down'

export interface GameState {
  board: Board
  score: number
  bestScore: number
  gameOver: boolean
  won: boolean
  canUndo: boolean
}

export interface GameStore extends GameState {
  // Actions
  move: (direction: Direction) => void
  newGame: () => void
  undo: () => void

  // Internal state for undo functionality
  previousState: GameState | null
}
