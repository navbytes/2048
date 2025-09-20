import { BEST_SCORE_KEY } from '@/constants'

// Local storage utilities for best score
export function getBestScore(): number {
  // Server-side rendering compatibility
  if (typeof window === 'undefined') return 0

  try {
    const stored = localStorage.getItem(BEST_SCORE_KEY)
    // parseInt can return NaN, fallback chain handles edge cases
    return stored ? parseInt(stored, 10) || 0 : 0
  } catch {
    // Storage might be disabled in private browsing or quota exceeded
    return 0
  }
}

export function saveBestScore(score: number): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(BEST_SCORE_KEY, score.toString())
  } catch {
    // Fail silently - persistence is enhancement, not requirement
  }
}
