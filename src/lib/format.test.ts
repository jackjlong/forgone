import { describe, expect, test } from 'vitest'
import { formatUSD } from './format'

describe('currency formatting', () => {
  test('10. money is formatted as whole US dollars', () => {
    expect(formatUSD(1268.25)).toBe('$1,268')
    expect(formatUSD(0)).toBe('$0')
  })
})
