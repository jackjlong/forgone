import { CADENCE_PER_YEAR, MONTHS_PER_YEAR, type Cadence } from './constants'

export interface ProjectionInputs {
  amount: number
  cadence: Cadence
  annualRatePercent: number
  years: number
}

export interface ProjectionPoint {
  year: number
  spent: number
  invested: number
}

export interface ProjectionResult {
  monthly: number
  spent: number
  invested: number
  forgone: number
  series: ProjectionPoint[]
}

export function percentToDecimal(percent: number): number {
  return percent / 100
}

export function toMonthlyContribution(amount: number, cadence: Cadence): number {
  return (amount * CADENCE_PER_YEAR[cadence]) / MONTHS_PER_YEAR
}

export function futureValue(
  monthly: number,
  annualRate: number,
  years: number,
): number {
  const months = years * MONTHS_PER_YEAR
  const monthlyRate = annualRate / MONTHS_PER_YEAR

  if (monthlyRate === 0) {
    return monthly * months
  }

  return (monthly * ((1 + monthlyRate) ** months - 1)) / monthlyRate
}

export function totalContributed(monthly: number, years: number): number {
  return monthly * years * MONTHS_PER_YEAR
}

export function forgoneReturn(
  futureValueAmount: number,
  totalContributedAmount: number,
): number {
  return futureValueAmount - totalContributedAmount
}

export function validate(inputs: ProjectionInputs): void {
  if (inputs.amount < 0) {
    throw new RangeError('Amount cannot be negative.')
  }

  if (inputs.years < 0) {
    throw new RangeError('Years cannot be negative.')
  }

  if (inputs.annualRatePercent < -100) {
    throw new RangeError('Annual rate cannot be below -100%.')
  }
}

export function projection(inputs: ProjectionInputs): ProjectionResult {
  validate(inputs)

  const monthly = toMonthlyContribution(inputs.amount, inputs.cadence)
  const annualRate = percentToDecimal(inputs.annualRatePercent)
  const spent = totalContributed(monthly, inputs.years)
  const invested = futureValue(monthly, annualRate, inputs.years)
  const forgone = forgoneReturn(invested, spent)
  const series = Array.from({ length: inputs.years + 1 }, (_, year) => ({
    year,
    spent: totalContributed(monthly, year),
    invested: futureValue(monthly, annualRate, year),
  }))

  return { monthly, spent, invested, forgone, series }
}
