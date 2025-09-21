import { useState, useCallback } from 'react'
import {
  llmService,
  type LLMHintRequest,
  type LLMHintResponse,
} from '../services/llmService'
import { useSettingsStore } from '../store/settingsStore'

interface UseAIHintsReturn {
  getHint: (request: LLMHintRequest) => Promise<LLMHintResponse>
  isLoading: boolean
  error: string | null
  lastHint: LLMHintResponse | null
  clearError: () => void
  isConfigured: boolean
}

export function useAIHints(): UseAIHintsReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastHint, setLastHint] = useState<LLMHintResponse | null>(null)

  const { llmApiKey, llmProvider } = useSettingsStore()

  const isConfigured = !!(llmApiKey && llmProvider)

  const getHint = useCallback(
    async (request: LLMHintRequest): Promise<LLMHintResponse> => {
      if (!isConfigured) {
        const error =
          'AI hints not configured. Please set your API key in settings.'
        setError(error)
        throw new Error(error)
      }

      setIsLoading(true)
      setError(null)

      try {
        // Configure the service with current settings
        llmService.configure({
          provider: llmProvider,
          apiKey: llmApiKey,
        })

        const hint = await llmService.getHint(request)
        setLastHint(hint)
        return hint
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to get AI hint'
        setError(errorMessage)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [llmApiKey, llmProvider, isConfigured]
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    getHint,
    isLoading,
    error,
    lastHint,
    clearError,
    isConfigured,
  }
}
