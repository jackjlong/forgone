# Forgone

An opportunity cost visualizer. Enter a recurring expense and see its forgone
return: what that money would be worth if it were invested instead. Forgone
return is the finance term for opportunity cost.

Live URL and screenshot: coming with the first release.

## What it does

You enter an expense label, an amount, how often you pay it (daily, weekly,
monthly, or yearly), an expected annual return, and a number of years. The
page shows three figures: what you will have spent, what that money would be
worth invested, and the difference between them, the forgone return. A chart
plots spent against invested year by year. A collapsible panel explains the
calculation in plain English.

## How the math works

Every cadence is converted to a monthly amount: amount x (payments per year / 12).
A $6 daily expense is $182.50 per month.

Compounding is monthly. With r = annual rate / 12 and n = years x 12:

    future value = monthly x ((1 + r)^n - 1) / r

If the rate is zero the formula divides by zero, so that case returns
monthly x n, which is just the total contributed.

Forgone return = future value - total contributed.

## Assumptions and limits

- The return is constant every month. Real returns are not.
- Daily and weekly expenses are approximated as monthly contributions. The
  error versus true daily compounding is under 1% at typical rates.
- The default 7% is an approximate long-run US equity return after inflation.
  It is an assumption you can change, not a prediction.
- Taxes, fees, and inflation are ignored.
- This is an estimate for learning. It is not financial advice.

## Design rule: no language model does arithmetic

There is no LLM call anywhere in this app. Every number on the page comes
from a pure function in `src/lib/` with a unit test. React components display
values and never compute them. No arithmetic operator appears in any `.tsx`
file. A language model predicts text; it cannot be trusted with numbers and
its output cannot be unit tested because it is not deterministic.

## Architecture

`src/lib/constants.ts`
- `CADENCE_PER_YEAR`: daily 365, weekly 52, monthly 12, yearly 1.
- `MONTHS_PER_YEAR`: 12.
- `DEFAULT_ANNUAL_RATE_PERCENT`: 7.

`src/lib/compound.ts`
- `percentToDecimal(percent)`: 7 becomes 0.07.
- `toMonthlyContribution(amount, cadence)`: any cadence to a monthly amount.
- `futureValue(monthly, annualRate, years)`: growth of a monthly stream, with
  the zero-rate case handled explicitly.
- `totalContributed(monthly, years)`: monthly x years x 12.
- `forgoneReturn(futureValue, totalContributed)`: the difference.
- `validate(inputs)`: rejects negative amount, negative years, rate below -100%.
- `projection(inputs)`: validates, converts the rate, and returns
  `{ monthly, spent, invested, forgone, series }` where `series` is one
  `{ year, spent, invested }` point per year from 0. The only function the
  UI calls for numbers.

`src/lib/format.ts`
- `formatUSD(n)`: whole dollars with sign and commas. Display only.

## Tests

`src/lib/compound.test.ts`
1. $100/month at 12% for 1 year is 1268.25.
2. Zero rate: future value equals total contributed.
3. Zero years returns 0. Zero amount returns 0.
4. One month at any rate returns exactly the monthly amount.
5. Cadence conversions: $7/day is 212.92/mo, $50/week is 216.67/mo,
   $600/year is 50.00/mo.
6. `percentToDecimal(7)` is 0.07.
7. `projection` series has years + 1 entries and entry 0 is all zeros.
8. Final series entry equals the direct function calls; forgone is their
   difference.
9. Negative amount, negative years, rate below -100% throw.

`src/lib/format.test.ts`
10. `formatUSD(1268.25)` is "$1,268". `formatUSD(0)` is "$0".

Tests run in CI on every pull request.

## Run locally

    pnpm install
    pnpm dev
    pnpm test

## Stack

Vite, React, TypeScript, Vitest, Recharts, pnpm. Deployed on Vercel.

## Out of scope

Accounts, persistence, comparing multiple inputs, file or document parsing,
any LLM call, taxes, inflation toggle, fees, cadence-specific compounding.
