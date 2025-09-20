// API Response types
export interface ApiResponse<T> {
  data: T
  message: string
  status: 'success' | 'error'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Common utility types
export type NonEmptyArray<T> = [T, ...T[]]

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>
  }[Keys]

// Event handler types
export type EventHandler<T = HTMLElement> = (
  event: React.SyntheticEvent<T>
) => void

// Form types
export interface FormFieldError {
  message: string
  type: string
}

export type FormErrors<T> = Partial<Record<keyof T, FormFieldError>>
