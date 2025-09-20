import debug from 'debug'
import type { Board } from '@/types'

const log = debug('2048:debug')

// Debug utility to print board state
export function printBoard(board: Board): void {
  // Fixed-width formatting creates aligned grid output for debugging
  log('Current board state:')
  board.forEach((row, index) => {
    if (row) {
      log(
        `Row ${index}: ${row.map(cell => (cell === null ? '    ' : cell.toString().padStart(4))).join('|')}`
      )
    } else {
      log(`Row ${index}: undefined`)
    }
  })
}
