import { describe, it, expect, beforeEach, vi } from 'vitest'
import { BEST_SCORE_KEY } from '@/constants'
import { getBestScore, saveBestScore } from '../storage'

// Create mock functions
const mockGetItem = vi.fn()
const mockSetItem = vi.fn()

// Mock localStorage globally
Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: mockGetItem,
    setItem: mockSetItem,
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
})

// Mock window object
Object.defineProperty(globalThis, 'window', {
  value: {
    localStorage: {
      getItem: mockGetItem,
      setItem: mockSetItem,
      removeItem: vi.fn(),
      clear: vi.fn(),
    },
  },
  writable: true,
})

describe('storage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getBestScore', () => {
    it('should return 0 when window is undefined (SSR)', () => {
      // Temporarily remove window
      const originalWindow = globalThis.window
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      delete globalThis.window

      const result = getBestScore()

      expect(result).toBe(0)
      expect(mockGetItem).not.toHaveBeenCalled()

      // Restore window
      globalThis.window = originalWindow
    })

    it('should return stored score when valid', () => {
      mockGetItem.mockReturnValue('1500')

      const result = getBestScore()

      expect(mockGetItem).toHaveBeenCalledWith(BEST_SCORE_KEY)
      expect(result).toBe(1500)
    })

    it('should return 0 when no score is stored', () => {
      mockGetItem.mockReturnValue(null)

      const result = getBestScore()

      expect(mockGetItem).toHaveBeenCalledWith(BEST_SCORE_KEY)
      expect(result).toBe(0)
    })

    it('should return 0 when stored value is empty string', () => {
      mockGetItem.mockReturnValue('')

      const result = getBestScore()
      expect(result).toBe(0)
    })

    it('should return 0 when stored value is invalid number', () => {
      mockGetItem.mockReturnValue('not-a-number')

      const result = getBestScore()
      expect(result).toBe(0)
    })

    it('should handle decimal values by truncating', () => {
      mockGetItem.mockReturnValue('1500.75')

      const result = getBestScore()
      expect(result).toBe(1500) // parseInt truncates
    })

    it('should handle localStorage throwing error', () => {
      mockGetItem.mockImplementation(() => {
        throw new Error('Storage disabled')
      })

      const result = getBestScore()
      expect(result).toBe(0)
    })
  })

  describe('saveBestScore', () => {
    it('should not save when window is undefined (SSR)', () => {
      // Temporarily remove window
      const originalWindow = globalThis.window
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      delete globalThis.window

      saveBestScore(1500)

      expect(mockSetItem).not.toHaveBeenCalled()

      // Restore window
      globalThis.window = originalWindow
    })

    it('should save score to localStorage', () => {
      saveBestScore(2048)

      expect(mockSetItem).toHaveBeenCalledWith(BEST_SCORE_KEY, '2048')
    })

    it('should save zero score', () => {
      saveBestScore(0)

      expect(mockSetItem).toHaveBeenCalledWith(BEST_SCORE_KEY, '0')
    })

    it('should handle localStorage throwing error silently', () => {
      mockSetItem.mockImplementation(() => {
        throw new Error('Storage disabled')
      })

      // Should not throw
      expect(() => {
        saveBestScore(1500)
      }).not.toThrow()

      expect(mockSetItem).toHaveBeenCalledWith(BEST_SCORE_KEY, '1500')
    })
  })

  describe('integration', () => {
    it('should roundtrip save and get correctly', () => {
      // Simulate real localStorage behavior
      let storedValue: string | null = null
      mockSetItem.mockImplementation((key, value) => {
        if (key === BEST_SCORE_KEY) {
          storedValue = value
        }
      })
      mockGetItem.mockImplementation(key => {
        if (key === BEST_SCORE_KEY) {
          return storedValue
        }
        return null
      })

      const testScore = 4096

      // Save score
      saveBestScore(testScore)

      // Get score
      const retrievedScore = getBestScore()

      expect(retrievedScore).toBe(testScore)
    })
  })
})
