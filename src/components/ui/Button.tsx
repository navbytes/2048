import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { styled } from '@linaria/react'
import { css } from '@linaria/core'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

// Base button styles
const baseButtonStyles = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-weight: 500;
  transition:
    background-color 0.2s,
    color 0.2s,
    border-color 0.2s;
  border: 1px solid transparent;
  cursor: pointer;
  font-family: inherit;

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
  }

  &:disabled {
    pointer-events: none;
    opacity: 0.5;
  }
`

// Variant styles
const primaryStyles = css`
  background-color: #1f2937;
  color: #ffffff;

  &:hover:not(:disabled) {
    background-color: #374151;
  }
`

const secondaryStyles = css`
  background-color: #f3f4f6;
  color: #1f2937;

  &:hover:not(:disabled) {
    background-color: #e5e7eb;
  }
`

const outlineStyles = css`
  background-color: transparent;
  border-color: #d1d5db;
  color: #1f2937;

  &:hover:not(:disabled) {
    background-color: #f9fafb;
    color: #111827;
  }
`

const ghostStyles = css`
  background-color: transparent;
  color: #1f2937;

  &:hover:not(:disabled) {
    background-color: #f9fafb;
    color: #111827;
  }
`

// Size styles
const smallStyles = css`
  height: 32px;
  padding: 0 12px;
  font-size: 14px;
`

const mediumStyles = css`
  height: 40px;
  padding: 0 16px;
  font-size: 16px;
`

const largeStyles = css`
  height: 48px;
  padding: 0 24px;
  font-size: 18px;
`

// Loading spinner styles
const spinnerStyles = css`
  margin-right: 8px;
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`

const StyledButton = styled.button``

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    // Build className string based on variant and size
    const variantClass =
      variant === 'primary'
        ? primaryStyles
        : variant === 'secondary'
          ? secondaryStyles
          : variant === 'outline'
            ? outlineStyles
            : ghostStyles

    const sizeClass =
      size === 'sm' ? smallStyles : size === 'lg' ? largeStyles : mediumStyles

    const combinedClassName = `${baseButtonStyles} ${variantClass} ${sizeClass} ${className || ''}`

    return (
      <StyledButton
        className={combinedClassName}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <span className={spinnerStyles} />
            Loading...
          </>
        ) : (
          children
        )}
      </StyledButton>
    )
  }
)

Button.displayName = 'Button'
// Test comment
// Updated comment
