import React, { useState } from 'react'
import { useSettingsStore, type DisplayMode } from '../store/settingsStore'
import { GearIcon } from './icons'
import styles from '@/styles/Settings.module.css'

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
    setTheme,
    setAnimationsEnabled,
    setHighContrast,
    setSoundEffects,
    setAutoSave,
    setDisplayMode,
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
        <GearIcon size={20} className={styles.gearIcon || ''} />
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
                <svg
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <line x1='18' y1='6' x2='6' y2='18' />
                  <line x1='6' y1='6' x2='18' y2='18' />
                </svg>
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
