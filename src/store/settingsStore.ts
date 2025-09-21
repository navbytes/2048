import type { Theme, DisplayMode } from '@/constants'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type LLM_PROVIDER = 'openai' | 'anthropic' | 'gemini'
interface SettingsState {
  // Appearance settings
  theme: Theme
  animationsEnabled: boolean
  highContrast: boolean

  // Gameplay settings
  soundEffects: boolean
  autoSave: boolean
  displayMode: DisplayMode

  // AI/LLM settings
  llmApiKey: string
  llmProvider: LLM_PROVIDER

  // Actions
  setTheme: (theme: Theme) => void
  setAnimationsEnabled: (enabled: boolean) => void
  setHighContrast: (enabled: boolean) => void
  setSoundEffects: (enabled: boolean) => void
  setAutoSave: (enabled: boolean) => void
  setDisplayMode: (mode: DisplayMode) => void
  setLlmApiKey: (apiKey: string) => void
  setLlmProvider: (provider: LLM_PROVIDER) => void
  resetSettings: () => void
}

const defaultSettings = {
  theme: 'system' as Theme,
  animationsEnabled: true,
  highContrast: false,
  soundEffects: true,
  autoSave: true,
  displayMode: 'normal' as DisplayMode,
  llmApiKey: '',
  llmProvider: 'gemini' as const,
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    set => ({
      ...defaultSettings,

      setTheme: theme => {
        set({ theme })
        applyTheme(theme)
      },

      setAnimationsEnabled: animationsEnabled => {
        set({ animationsEnabled })
        applyAnimationPreference(animationsEnabled)
      },

      setHighContrast: highContrast => {
        set({ highContrast })
        applyHighContrast(highContrast)
      },

      setSoundEffects: soundEffects => set({ soundEffects }),

      setAutoSave: autoSave => set({ autoSave }),

      setDisplayMode: displayMode => set({ displayMode }),

      setLlmApiKey: llmApiKey => set({ llmApiKey }),

      setLlmProvider: llmProvider => set({ llmProvider }),

      resetSettings: () => {
        set(defaultSettings)
        applyTheme(defaultSettings.theme)
        applyAnimationPreference(defaultSettings.animationsEnabled)
        applyHighContrast(defaultSettings.highContrast)
      },
    }),
    {
      name: '2048-settings',
    }
  )
)

// Theme application functions
function applyTheme(theme: Theme) {
  const root = document.documentElement

  if (theme === 'system') {
    root.removeAttribute('data-theme')
    root.style.colorScheme = 'light dark'
  } else {
    root.setAttribute('data-theme', theme)
    root.style.colorScheme = theme
  }
}

function applyAnimationPreference(enabled: boolean) {
  const root = document.documentElement

  if (!enabled) {
    root.setAttribute('data-reduce-motion', 'true')
    root.style.setProperty('--transition-fast', 'none')
    root.style.setProperty('--transition-normal', 'none')
    root.style.setProperty('--transition-slow', 'none')
  } else {
    root.removeAttribute('data-reduce-motion')
    root.style.removeProperty('--transition-fast')
    root.style.removeProperty('--transition-normal')
    root.style.removeProperty('--transition-slow')
  }
}

function applyHighContrast(enabled: boolean) {
  const root = document.documentElement

  if (enabled) {
    root.setAttribute('data-high-contrast', 'true')
  } else {
    root.removeAttribute('data-high-contrast')
  }
}

// Initialize settings on module load
const initializeSettings = () => {
  // Use a timeout to ensure the store is fully initialized and rehydrated
  setTimeout(() => {
    const settings = useSettingsStore.getState()
    applyTheme(settings.theme)
    applyAnimationPreference(settings.animationsEnabled)
    applyHighContrast(settings.highContrast)
  }, 100) // Slightly longer delay to ensure rehydration is complete
}

// Auto-initialize when the module loads
if (typeof window !== 'undefined') {
  initializeSettings()

  // Also subscribe to changes to ensure settings are applied when store is updated
  useSettingsStore.subscribe((state, prevState) => {
    if (state.theme !== prevState.theme) {
      applyTheme(state.theme)
    }
    if (state.animationsEnabled !== prevState.animationsEnabled) {
      applyAnimationPreference(state.animationsEnabled)
    }
    if (state.highContrast !== prevState.highContrast) {
      applyHighContrast(state.highContrast)
    }
  })
}
