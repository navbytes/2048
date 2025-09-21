import React, { useEffect, useRef, useCallback } from 'react'
import { X } from 'lucide-react'
import styles from '@/styles/Modal.module.css'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  className?: string
  showCloseButton?: boolean
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (closeOnBackdrop && e.target === e.currentTarget) {
        onClose()
      }
    },
    [closeOnBackdrop, onClose]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') {
        onClose()
      }
    },
    [closeOnEscape, onClose]
  )

  // Handle focus management
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement
      // Focus the modal after it's rendered
      const timer = setTimeout(() => {
        modalRef.current?.focus()
      }, 100)
      return () => clearTimeout(timer)
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus()
      previousFocusRef.current = null
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      role='dialog'
      aria-modal='true'
      aria-labelledby='modal-title'
    >
      <div
        ref={modalRef}
        className={`${styles.modal} ${className}`}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
        role='document'
      >
        <div className={styles.header}>
          <h3 id='modal-title' className={styles.title}>
            {title}
          </h3>
          {showCloseButton && (
            <button
              className={styles.closeButton}
              onClick={onClose}
              aria-label='Close modal'
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div className={styles.content}>{children}</div>
      </div>
    </div>
  )
}

export default Modal
