// Source: README Architecture defines the number of each payment cadence in one year.
export const CADENCE_PER_YEAR = {
  daily: 365,
  weekly: 52,
  monthly: 12,
  yearly: 1,
} as const

// Source: README compounds annually stated returns across twelve monthly periods.
export const MONTHS_PER_YEAR = 12

// Reasoning: README uses 7% as its adjustable long-run US equity return assumption.
export const DEFAULT_ANNUAL_RATE_PERCENT = 7

export type Cadence = keyof typeof CADENCE_PER_YEAR
