import React, { useState } from 'react'
import { useSettingsStore, type LLM_PROVIDER } from '../store/settingsStore'
import { Settings as SettingsIcon, X } from 'lucide-react'
import styles from '@/styles/Settings.module.css'
import type { DisplayMode } from '@/constants'

interface SettingsProps {
  className?: string
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

  const toggleSettings = () => {
    setIsOpen(!isOpen)
  }

  const closeSettings = () => {
    setIsOpen(false)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeSettings()
    }
  }

  return (
    <>
      {/* Settings Button */}
      <button
        className={`${styles.settingsButton} ${className || ''}`}
        onClick={toggleSettings}
        aria-label='Open settings'
        title='Settings'
      >
        <SettingsIcon size={20} className={styles.gearIcon || ''} />
      </button>

      {/* Settings Popup */}
      {isOpen && (
        <div className={styles.backdrop} onClick={handleBackdropClick}>
          <div className={styles.popup}>
            <div className={styles.header}>
              <h3 className={styles.title}>Settings</h3>
              <button
                className={styles.closeButton}
                onClick={closeSettings}
                aria-label='Close settings'
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.content}>
              <div className={styles.section}>
                <h4 className={styles.sectionTitle}>Appearance</h4>

                <div className={styles.setting}>
                  <label className={styles.label}>
                    <span className={styles.labelText}>Theme</span>
                    <select
                      className={styles.select}
                      value={theme}
                      onChange={e =>
                        setTheme(e.target.value as 'system' | 'light' | 'dark')
                      }
                    >
                      <option value='system'>System</option>
                      <option value='light'>Light</option>
                      <option value='dark'>Dark</option>
                    </select>
                  </label>
                </div>

                <div className={styles.setting}>
                  <label className={styles.label}>
                    <span className={styles.labelText}>Animations</span>
                    <div className={styles.toggle}>
                      <input
                        type='checkbox'
                        className={styles.toggleInput}
                        checked={animationsEnabled}
                        onChange={e => setAnimationsEnabled(e.target.checked)}
                      />
                      <span className={styles.toggleSlider}></span>
                    </div>
                  </label>
                </div>

                <div className={styles.setting}>
                  <label className={styles.label}>
                    <span className={styles.labelText}>High Contrast</span>
                    <div className={styles.toggle}>
                      <input
                        type='checkbox'
                        className={styles.toggleInput}
                        checked={highContrast}
                        onChange={e => setHighContrast(e.target.checked)}
                      />
                      <span className={styles.toggleSlider}></span>
                    </div>
                  </label>
                </div>
              </div>

              <div className={styles.section}>
                <h4 className={styles.sectionTitle}>Gameplay</h4>

                <div className={styles.setting}>
                  <label className={styles.label}>
                    <span className={styles.labelText}>Sound Effects</span>
                    <div className={styles.toggle}>
                      <input
                        type='checkbox'
                        className={styles.toggleInput}
                        checked={soundEffects}
                        onChange={e => setSoundEffects(e.target.checked)}
                      />
                      <span className={styles.toggleSlider}></span>
                    </div>
                  </label>
                </div>

                <div className={styles.setting}>
                  <label className={styles.label}>
                    <span className={styles.labelText}>Auto-save</span>
                    <div className={styles.toggle}>
                      <input
                        type='checkbox'
                        className={styles.toggleInput}
                        checked={autoSave}
                        onChange={e => setAutoSave(e.target.checked)}
                      />
                      <span className={styles.toggleSlider}></span>
                    </div>
                  </label>
                </div>

                <div className={styles.setting}>
                  <label className={styles.label}>
                    <span className={styles.labelText}>
                      Number Display
                      <small
                        style={{
                          display: 'block',
                          fontWeight: 'normal',
                          fontSize: '12px',
                          color: 'var(--text-muted)',
                          marginTop: '2px',
                        }}
                      >
                        Choose how tile numbers are displayed
                      </small>
                    </span>
                    <select
                      className={styles.select}
                      value={displayMode}
                      onChange={e =>
                        setDisplayMode(e.target.value as DisplayMode)
                      }
                    >
                      <option value='normal'>Normal (2, 4, 8)</option>
                      <option value='powerOf2'>Power of 2 (¹, ², ³)</option>
                      <option value='binary'>Binary (10, 100, 1000)</option>
                    </select>
                  </label>
                </div>
              </div>

              <div className={styles.section}>
                <h4 className={styles.sectionTitle}>AI Assistant</h4>

                <div className={styles.setting}>
                  <label className={styles.label}>
                    <span className={styles.labelText}>
                      LLM Provider
                      <small
                        style={{
                          display: 'block',
                          fontWeight: 'normal',
                          fontSize: '12px',
                          color: 'var(--text-muted)',
                          marginTop: '2px',
                        }}
                      >
                        Choose your AI provider for hints
                      </small>
                    </span>
                    <select
                      className={styles.select}
                      value={llmProvider}
                      onChange={e =>
                        setLlmProvider(e.target.value as LLM_PROVIDER)
                      }
                    >
                      <option value='openai'>OpenAI (GPT)</option>
                      <option value='anthropic'>Anthropic (Claude)</option>
                      <option value='gemini'>Google (Gemini)</option>
                    </select>
                  </label>
                </div>

                <div className={styles.setting}>
                  <label
                    className={styles.label}
                    style={{ flexDirection: 'column', alignItems: 'stretch' }}
                  >
                    <span
                      className={styles.labelText}
                      style={{ marginBottom: 'var(--spacing-sm)' }}
                    >
                      API Key
                      <small
                        style={{
                          display: 'block',
                          fontWeight: 'normal',
                          fontSize: '12px',
                          color: 'var(--text-muted)',
                          marginTop: '2px',
                        }}
                      >
                        Your API key is stored locally and never shared
                      </small>
                    </span>
                    <input
                      type='password'
                      className={styles.input}
                      value={llmApiKey}
                      onChange={e => setLlmApiKey(e.target.value)}
                      placeholder='Enter your API key...'
                    />
                  </label>
                </div>
              </div>

              <div className={styles.section}>
                <h4 className={styles.sectionTitle}>How to play</h4>
                <p className={styles.aboutText}>
                  Use your arrow keys to move the tiles.
                </p>
                <p className={styles.version}>
                  When two tiles with the same number touch, they merge into
                  one!
                </p>
              </div>

              <div className={styles.section}>
                <h4 className={styles.sectionTitle}>About</h4>
                <p className={styles.aboutText}>
                  2048 - Join the tiles to reach 2048!
                </p>
                <p className={styles.version}>Version 1.0.0</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Settings
