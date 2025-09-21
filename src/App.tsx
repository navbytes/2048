import clsx from 'clsx'
import GameBoard from './components/GameBoard'
import GameControls from './components/GameControls'
import Settings from './components/Settings'
import HintButton from './components/HintButton'
import { useGameStore } from './store'
import styles from '@/styles/App.module.css'

function App() {
  const { won, gameOver } = useGameStore()

  return (
    <div className={styles.app}>
      <div className={styles.topBar}>
        <Settings />
        <HintButton />
      </div>

      <h1 className={styles.title}>2048</h1>
      <p className={styles.subtitle}>
        Join the tiles, get to <strong>2048!</strong>
      </p>

      <GameControls />

      {won && !gameOver && (
        <div className={clsx(styles.gameStatus, styles.winStatus)}>
          🎉 You Win! 🎉
        </div>
      )}

      {gameOver && (
        <div className={clsx(styles.gameStatus, styles.gameOverStatus)}>
          Game Over!
        </div>
      )}

      <GameBoard />
    </div>
  )
}

export default App
