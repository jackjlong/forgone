import { describe, expect, test } from 'vitest'
import { MONTHS_PER_YEAR } from './constants'
import {
  forgoneReturn,
  futureValue,
  percentToDecimal,
  projection,
  toMonthlyContribution,
  totalContributed,
  validate,
} from './compound'

describe('compound calculations', () => {
  test('1. $100 per month at 12% for 1 year is 1268.25', () => {
    expect(futureValue(100, 0.12, 1)).toBeCloseTo(1268.25, 2)
  })

  test('2. zero rate makes future value equal total contributed', () => {
    expect(futureValue(100, 0, 1)).toBe(totalContributed(100, 1))
  })

  test('3. zero years and zero amount return 0', () => {
    expect(futureValue(100, 0.12, 0)).toBe(0)
    expect(futureValue(0, 0.12, 1)).toBe(0)
  })

  test('4. one month at any rate returns exactly the monthly amount', () => {
    for (const annualRate of [0, 0.07, 0.12]) {
      expect(futureValue(100, annualRate, 1 / MONTHS_PER_YEAR)).toBeCloseTo(100, 2)
    }
  })

  test('5. daily, weekly, and yearly cadences convert to monthly amounts', () => {
    expect(toMonthlyContribution(7, 'daily')).toBeCloseTo(212.92, 2)
    expect(toMonthlyContribution(50, 'weekly')).toBeCloseTo(216.67, 2)
    expect(toMonthlyContribution(600, 'yearly')).toBeCloseTo(50.0, 2)
  })

  test('6. 7 percent converts to 0.07', () => {
    expect(percentToDecimal(7)).toBe(0.07)
  })

  test('7. projection series includes year 0 with all-zero values', () => {
    const inputs = {
      amount: 100,
      cadence: 'monthly' as const,
      annualRatePercent: 12,
      years: 1,
    }

    const result = projection(inputs)

    expect(result.series).toHaveLength(inputs.years + 1)
    expect(result.series[0]).toEqual({ year: 0, spent: 0, invested: 0 })
  })

  test('8. final series values match direct calculations and forgone is their difference', () => {
    const inputs = {
      amount: 100,
      cadence: 'monthly' as const,
      annualRatePercent: 12,
      years: 1,
    }
    const monthly = toMonthlyContribution(inputs.amount, inputs.cadence)
    const annualRate = percentToDecimal(inputs.annualRatePercent)
    const spent = totalContributed(monthly, inputs.years)
    const invested = futureValue(monthly, annualRate, inputs.years)

    const result = projection(inputs)

    expect(result.series.at(-1)).toEqual({ year: inputs.years, spent, invested })
    expect(result.forgone).toBe(forgoneReturn(invested, spent))
  })

  test('9. negative amount, negative years, and rate below -100% throw', () => {
    const validInputs = {
      amount: 100,
      cadence: 'monthly' as const,
      annualRatePercent: 12,
      years: 1,
    }

    expect(() => validate({ ...validInputs, amount: -1 })).toThrow(RangeError)
    expect(() => validate({ ...validInputs, years: -1 })).toThrow(RangeError)
    expect(() => validate({ ...validInputs, annualRatePercent: -101 })).toThrow(
      RangeError,
    )
  })
})
