import { memo, useMemo } from 'react'
import clsx from 'clsx'
import { useGameStore } from '@/store'
import styles from '@/styles/GameControls.module.css'

const GameControls: React.FC = memo(() => {
  const { score, bestScore, canUndo, newGame, undo } = useGameStore()

  // Memoize button className to prevent recalculation
  const primaryButtonClass = useMemo(
    () => clsx(styles.button, styles.primaryButton),
    []
  )

  // Memoize undo button className based on disabled state
  const undoButtonClass = useMemo(
    () => clsx(styles.button, !canUndo && styles.disabled),
    [canUndo]
  )

  return (
    <div className={styles.gameControls}>
      <div className={styles.scoresContainer}>
        <div className={styles.scoreBox}>
          <div className={styles.scoreLabel}>Score</div>
          <div className={styles.scoreValue}>{score}</div>
        </div>
        <div className={styles.scoreBox}>
          <div className={styles.scoreLabel}>Best</div>
          <div className={styles.scoreValue}>{bestScore}</div>
        </div>
      </div>

      <div className={styles.buttonsContainer}>
        <button onClick={newGame} className={primaryButtonClass} type='button'>
          New Game
        </button>
        <button
          onClick={undo}
          disabled={!canUndo}
          className={undoButtonClass}
          type='button'
        >
          Undo
        </button>
      </div>
    </div>
  )
})

// Add display name for debugging
GameControls.displayName = 'GameControls'

export default GameControls
