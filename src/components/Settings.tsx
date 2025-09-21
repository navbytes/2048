import React, { useState, useCallback } from 'react'
import { useSettingsStore, type LLM_PROVIDER } from '../store/settingsStore'
import { Settings as SettingsIcon } from 'lucide-react'
import Modal from './Modal'
import styles from '@/styles/Settings.module.css'
import type { DisplayMode } from '@/constants'

interface SettingsProps {
  className?: string
}

interface ToggleProps {
  id: string
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  'aria-describedby'?: string
}

interface SelectProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  description?: string
  'aria-describedby'?: string
}

interface InputProps {
  id: string
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  description?: string
  'aria-describedby'?: string
}

// Reusable Toggle Component
const Toggle: React.FC<ToggleProps> = ({
  id,
  label,
  checked,
  onChange,
  'aria-describedby': ariaDescribedBy,
}) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.checked)
    },
    [onChange]
  )

  return (
    <div className={styles.setting}>
      <label className={styles.label} htmlFor={id}>
        <span className={styles.labelText}>{label}</span>
        <div className={styles.toggle}>
          <input
            id={id}
            type='checkbox'
            className={styles.toggleInput}
            checked={checked}
            onChange={handleChange}
            aria-describedby={ariaDescribedBy}
          />
          <span className={styles.toggleSlider} aria-hidden='true'></span>
        </div>
      </label>
    </div>
  )
}

// Reusable Select Component
const Select: React.FC<SelectProps> = ({
  id,
  label,
  value,
  onChange,
  options,
  description,
  'aria-describedby': ariaDescribedBy,
}) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange(e.target.value)
    },
    [onChange]
  )

  const descriptionId = description ? `${id}-description` : undefined
  const combinedAriaDescribedBy =
    [ariaDescribedBy, descriptionId].filter(Boolean).join(' ') || undefined

  return (
    <div className={styles.setting}>
      <label className={styles.label} htmlFor={id}>
        <span className={styles.labelText}>
          {label}
          {description && (
            <small id={descriptionId} className={styles.smallText}>
              {description}
            </small>
          )}
        </span>
        <select
          id={id}
          className={styles.select}
          value={value}
          onChange={handleChange}
          aria-describedby={combinedAriaDescribedBy}
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}

// Reusable Input Component
const Input: React.FC<InputProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  description,
  'aria-describedby': ariaDescribedBy,
}) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value)
    },
    [onChange]
  )

  const descriptionId = description ? `${id}-description` : undefined
  const combinedAriaDescribedBy =
    [ariaDescribedBy, descriptionId].filter(Boolean).join(' ') || undefined

  return (
    <div className={styles.setting}>
      <label className={styles.labelVertical} htmlFor={id}>
        <span className={styles.labelTextVertical}>
          {label}
          {description && (
            <small id={descriptionId} className={styles.smallText}>
              {description}
            </small>
          )}
        </span>
        <input
          id={id}
          type={type}
          className={styles.input}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          aria-describedby={combinedAriaDescribedBy}
        />
      </label>
    </div>
  )
}

const Settings: React.FC<SettingsProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false)

  const {
    theme,
    animationsEnabled,
    highContrast,
    soundEffects,
    autoSave,
    displayMode,
    llmApiKey,
    llmProvider,
    setTheme,
    setAnimationsEnabled,
    setHighContrast,
    setSoundEffects,
    setAutoSave,
    setDisplayMode,
    setLlmApiKey,
    setLlmProvider,
  } = useSettingsStore()

  const toggleSettings = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  const closeSettings = useCallback(() => {
    setIsOpen(false)
  }, [])

  // Theme options
  const themeOptions = [
    { value: 'system', label: 'System' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
  ]

  // Display mode options
  const displayModeOptions = [
    { value: 'normal', label: 'Normal (2, 4, 8)' },
    { value: 'powerOf2', label: 'Power of 2 (¹, ², ³)' },
    { value: 'binary', label: 'Binary (10, 100, 1000)' },
  ]

  // LLM Provider options
  const llmProviderOptions = [
    { value: 'openai', label: 'OpenAI (GPT)' },
    { value: 'anthropic', label: 'Anthropic (Claude)' },
    { value: 'gemini', label: 'Google (Gemini)' },
  ]

  // Type-safe handlers
  const handleThemeChange = useCallback(
    (value: string) => {
      setTheme(value as 'system' | 'light' | 'dark')
    },
    [setTheme]
  )

  const handleDisplayModeChange = useCallback(
    (value: string) => {
      setDisplayMode(value as DisplayMode)
    },
    [setDisplayMode]
  )

  const handleLlmProviderChange = useCallback(
    (value: string) => {
      setLlmProvider(value as LLM_PROVIDER)
    },
    [setLlmProvider]
  )

  return (
    <>
      {/* Settings Button */}
      <button
        className={`${styles.settingsButton} ${className || ''}`}
        onClick={toggleSettings}
        aria-label={isOpen ? 'Close settings' : 'Open settings'}
        aria-expanded={isOpen}
        title='Settings'
      >
        <SettingsIcon size={20} className={styles.gearIcon} />
      </button>

      {/* Settings Modal */}
      <Modal isOpen={isOpen} onClose={closeSettings} title='Settings'>
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Appearance</h4>

          <Select
            id='theme-select'
            label='Theme'
            value={theme}
            onChange={handleThemeChange}
            options={themeOptions}
          />

          <Toggle
            id='animations-toggle'
            label='Animations'
            checked={animationsEnabled}
            onChange={setAnimationsEnabled}
          />

          <Toggle
            id='high-contrast-toggle'
            label='High Contrast'
            checked={highContrast}
            onChange={setHighContrast}
          />
        </div>

        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Gameplay</h4>

          <Toggle
            id='sound-effects-toggle'
            label='Sound Effects'
            checked={soundEffects}
            onChange={setSoundEffects}
          />

          <Toggle
            id='auto-save-toggle'
            label='Auto-save'
            checked={autoSave}
            onChange={setAutoSave}
          />

          <Select
            id='display-mode-select'
            label='Number Display'
            value={displayMode}
            onChange={handleDisplayModeChange}
            options={displayModeOptions}
            description='Choose how tile numbers are displayed'
          />
        </div>

        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>AI Assistant</h4>

          <Select
            id='llm-provider-select'
            label='LLM Provider'
            value={llmProvider}
            onChange={handleLlmProviderChange}
            options={llmProviderOptions}
            description='Choose your AI provider for hints'
          />

          <Input
            id='api-key-input'
            label='API Key'
            type='password'
            value={llmApiKey}
            onChange={setLlmApiKey}
            placeholder='Enter your API key...'
            description='Your API key is stored locally and never shared'
          />
        </div>

        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>How to play</h4>
          <p className={styles.aboutText}>
            Use your arrow keys to move the tiles.
          </p>
          <p className={styles.version}>
            When two tiles with the same number touch, they merge into one!
          </p>
        </div>

        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>About</h4>
          <p className={styles.aboutText}>
            2048 - Join the tiles to reach 2048!
          </p>
          <p className={styles.version}>Version 1.0.0</p>
        </div>
      </Modal>
    </>
  )
}

export default Settings
