import { memo, useMemo, useEffect, useState, useRef } from 'react'
import clsx from 'clsx'
import { type Cell as CellType } from '@/types'
import { useSettingsStore } from '../store/settingsStore'
import styles from '@/styles/Cell.module.css'
import type { DisplayMode } from '@/constants'

interface CellProps {
  value: CellType
  position: { row: number; col: number }
}

// Move static functions outside component to prevent recreation
const formatDisplayValue = (
  value: number,
  mode: DisplayMode
): string | React.ReactNode => {
  if (mode === 'normal') {
    return value.toString()
  }

  if (mode === 'binary') {
    const binary = value.toString(2)
    // For better readability, split longer binary numbers into groups of 4
    if (binary.length > 4) {
      // Split into groups of 4 from right to left
      const groups = []
      for (let i = binary.length; i > 0; i -= 4) {
        const start = Math.max(0, i - 4)
        groups.unshift(binary.slice(start, i))
      }
      return groups.join('\n')
    }
    return binary
  }

  if (mode === 'powerOf2') {
    if (value <= 0 || (value & (value - 1)) !== 0) {
      // Not a power of 2, return as is
      return value.toString()
    }

    // Calculate the exponent (log base 2)
    return Math.log2(value).toString()
  }

  return value.toString()
}

const getTileClass = (value: CellType): string => {
  if (!value) return styles.empty || ''

  switch (value) {
    case 2:
      return styles.tile2 || ''
    case 4:
      return styles.tile4 || ''
    case 8:
      return styles.tile8 || ''
    case 16:
      return styles.tile16 || ''
    case 32:
      return styles.tile32 || ''
    case 64:
      return styles.tile64 || ''
    case 128:
      return styles.tile128 || ''
    case 256:
      return styles.tile256 || ''
    case 512:
      return styles.tile512 || ''
    case 1024:
      return styles.tile1024 || ''
    case 2048:
      return styles.tile2048 || ''
    default:
      return styles.tileHigh || ''
  }
}

const getSpecialClass = (value: CellType): string => {
  if (value === 1024) return styles.pulse || ''
  if (value === 2048) return styles.winner || ''
  return ''
}

const Cell: React.FC<CellProps> = memo(({ value }) => {
  const [isNew, setIsNew] = useState(false)
  const prevValueRef = useRef<CellType>(value)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  )
  const { displayMode } = useSettingsStore()

  // Optimized animation tracking with useRef to avoid extra re-renders
  useEffect(() => {
    const prevValue = prevValueRef.current

    if (value && value !== prevValue && prevValue === null) {
      setIsNew(true)

      // Clear existing timeout to prevent memory leaks
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        setIsNew(false)
      }, 200)
    }

    prevValueRef.current = value

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [value])

  // Memoize className computation
  const className = useMemo(
    () =>
      clsx(
        styles.cell,
        getTileClass(value),
        isNew && styles.newTile,
        getSpecialClass(value),
        displayMode === 'binary' && styles.binaryMode
      ),
    [value, isNew, displayMode]
  )

  // Memoize display value based on settings
  const displayValue = useMemo(() => {
    if (!value) return ''
    return formatDisplayValue(value, displayMode)
  }, [value, displayMode])

  // Handle multiline text for binary mode
  const renderDisplayValue = () => {
    if (typeof displayValue === 'string' && displayValue.includes('\n')) {
      return displayValue.split('\n').map((line, index) => (
        <div key={index} style={{ lineHeight: '1.1' }}>
          {line}
        </div>
      ))
    }
    return displayValue
  }

  return <div className={className}>{renderDisplayValue()}</div>
})

// Add display name for debugging
Cell.displayName = 'Cell'

export default Cell
