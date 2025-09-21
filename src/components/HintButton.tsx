import React, { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { useAIHints } from '../hooks/useAIHints'
import { HelpCircle, WandSparkles, X } from 'lucide-react'
import styles from '@/styles/HintButton.module.css'

interface HintButtonProps {
  className?: string
}

const HintButton: React.FC<HintButtonProps> = ({ className }) => {
  const [showHint, setShowHint] = useState(false)
  const { board, score, bestScore, gameOver, won } = useGameStore()
  const { getHint, isLoading, error, lastHint, clearError, isConfigured } =
    useAIHints()

  const handleGetHint = async () => {
    if (gameOver) return

    clearError()

    try {
      await getHint({
        board,
        score,
        bestScore,
        gameOver,
        won,
      })
      setShowHint(true)
    } catch (err) {
      // Error is handled by the hook
      console.error('Failed to get hint:', err)
    }
  }

  const closeHint = () => {
    setShowHint(false)
    clearError()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeHint()
    }
  }

  if (!isConfigured) {
    return (
      <button
        className={`${styles.hintButton} ${styles.disabled} ${className || ''}`}
        disabled
        title='Configure AI in settings to use hints'
      >
        <HelpCircle size={18} className={styles.icon} />
        AI Hint
      </button>
    )
  }

  const renderHintContent = () => {
    if (error) {
      return (
        <div className={styles.error}>
          <p>{error}</p>
        </div>
      )
    }
    if (!lastHint) return null

    return (
      <>
        <div className={styles.recommendation}>
          <div className={styles.move}>
            <span className={styles.label}>Recommended Move:</span>
            <span
              className={`${styles.direction} ${styles[lastHint.recommendedMove || '']}`}
            >
              {lastHint.recommendedMove?.toUpperCase()}
            </span>
          </div>
          <div className={styles.confidence}>
            <span className={styles.label}>Confidence:</span>
            <div className={styles.confidenceBar}>
              <div
                className={styles.confidenceFill}
                style={{
                  width: `${(lastHint.confidence || 0) * 100}%`,
                }}
              />
            </div>
            <span className={styles.confidenceText}>
              {Math.round((lastHint.confidence || 0) * 100)}%
            </span>
          </div>
        </div>

        <div className={styles.reasoning}>
          <h4 className={styles.reasoningTitle}>Reasoning:</h4>
          <p className={styles.reasoningText}>{lastHint.reasoning}</p>
        </div>

        {lastHint.alternatives && lastHint.alternatives.length > 0 && (
          <div className={styles.alternatives}>
            <h4 className={styles.alternativesTitle}>Alternatives:</h4>
            {lastHint.alternatives.map((alt, index) => (
              <div key={index} className={styles.alternative}>
                <div className={styles.altMove}>
                  <span className={`${styles.direction} ${styles[alt.move]}`}>
                    {alt.move.toUpperCase()}
                  </span>
                  <span className={styles.altConfidence}>
                    {Math.round(alt.confidence * 100)}%
                  </span>
                </div>
                <p className={styles.altReasoning}>{alt.reasoning}</p>
              </div>
            ))}
          </div>
        )}
      </>
    )
  }

  return (
    <>
      <button
        className={`${styles.hintButton} ${className || ''}`}
        onClick={handleGetHint}
        disabled={isLoading || gameOver}
        title={gameOver ? 'Game over' : 'Get AI hint for next move'}
      >
        {isLoading ? (
          <div className={styles.spinner} />
        ) : (
          <WandSparkles size={18} className={styles.icon || ''} />
        )}
      </button>

      {/* Hint Modal */}
      {showHint && (lastHint || error) && (
        <div className={styles.backdrop} onClick={handleBackdropClick}>
          <div className={styles.modal}>
            <div className={styles.header}>
              <h3 className={styles.title}>
                {error ? 'Error' : 'AI Suggestion'}
              </h3>
              <button
                className={styles.closeButton}
                onClick={closeHint}
                aria-label='Close hint'
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.content}>{renderHintContent()}</div>
          </div>
        </div>
      )}
    </>
  )
}

export default HintButton
