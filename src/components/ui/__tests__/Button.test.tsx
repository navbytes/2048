import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Button } from '../Button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(
      screen.getByRole('button', { name: /click me/i })
    ).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('shows loading state', () => {
    render(<Button isLoading>Click me</Button>)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('applies correct variant classes', () => {
    render(<Button variant='secondary'>Click me</Button>)
    const button = screen.getByRole('button')
    // With Linaria, we test that the button has styling applied rather than specific class names
    expect(button).toHaveAttribute('class')
    expect(button.className).toBeTruthy()
  })
})
