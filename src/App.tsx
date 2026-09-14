import { useState, type FormEvent } from 'react'
import ProjectionChart from './components/ProjectionChart'
import {
  projection,
  type ProjectionInputs,
  type ProjectionResult,
} from './lib/compound'
import { DEFAULT_ANNUAL_RATE_PERCENT, type Cadence } from './lib/constants'
import { formatUSD } from './lib/format'

interface FormValues {
  label: string
  amount: string
  cadence: Cadence
  annualRatePercent: string
  years: string
}

interface FieldErrors {
  amount?: string
  annualRatePercent?: string
  years?: string
}

interface FormValidation {
  errors: FieldErrors
  inputs?: ProjectionInputs
}

interface AppState {
  form: FormValues
  errors: FieldErrors
  result: ProjectionResult
}

const INITIAL_FORM: FormValues = {
  label: 'coffee',
  amount: '6',
  cadence: 'daily',
  annualRatePercent: String(DEFAULT_ANNUAL_RATE_PERCENT),
  years: '30',
}

const INITIAL_INPUTS: ProjectionInputs = {
  amount: 6,
  cadence: 'daily',
  annualRatePercent: DEFAULT_ANNUAL_RATE_PERCENT,
  years: 30,
}

const INITIAL_STATE: AppState = {
  form: INITIAL_FORM,
  errors: {},
  result: projection(INITIAL_INPUTS),
}

function validateForm(form: FormValues): FormValidation {
  const errors: FieldErrors = {}
  const amount = Number(form.amount)
  const annualRatePercent = Number(form.annualRatePercent)
  const years = Number(form.years)

  if (
    form.amount.trim() === '' ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    errors.amount = 'Enter more than zero.'
  }

  if (
    form.annualRatePercent.trim() === '' ||
    !Number.isFinite(annualRatePercent) ||
    annualRatePercent < 0 ||
    annualRatePercent > 20
  ) {
    errors.annualRatePercent = 'Enter 0% to 20%.'
  }

  if (
    form.years.trim() === '' ||
    !Number.isFinite(years) ||
    !Number.isInteger(years) ||
    years < 1 ||
    years > 50
  ) {
    errors.years = 'Enter 1–50 whole years.'
  }

  if (Object.keys(errors).length > 0) {
    return { errors }
  }

  return {
    errors,
    inputs: {
      amount,
      cadence: form.cadence,
      annualRatePercent,
      years,
    },
  }
}

function updateProjectionState(
  current: AppState,
  form: FormValues,
): AppState {
  const validation = validateForm(form)

  return {
    form,
    errors: validation.errors,
    result: validation.inputs ? projection(validation.inputs) : current.result,
  }
}

export default function App() {
  const [state, setState] = useState<AppState>(INITIAL_STATE)
  const expenseLabel = state.form.label.trim()
  const headline = expenseLabel
    ? `Your ${expenseLabel} could be worth ${formatUSD(state.result.invested)}.`
    : `This expense could be worth ${formatUSD(state.result.invested)}.`

  function updateProjectionForm(form: FormValues) {
    setState((current) => updateProjectionState(current, form))
  }

  function updateLabel(label: string) {
    setState((current) => ({
      ...current,
      form: { ...current.form, label },
    }))
  }

  function preventSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
  }

  return (
    <div className="site-frame">
      <main className="ledger">
        <header className="masthead reveal reveal-one">
          <div className="brand">
            <span className="brand-glyph" aria-hidden="true">
              F
            </span>
            <span>Forgone</span>
          </div>
          <span className="masthead-rule" aria-hidden="true" />
        </header>

        <section className="hero reveal reveal-two" aria-labelledby="headline">
          <h1 id="headline">{headline}</h1>
        </section>

        <form
          className="input-grid reveal reveal-three"
          aria-label="Projection inputs"
          onSubmit={preventSubmit}
          noValidate
        >
          <div className="field field-label">
            <label htmlFor="expense-label">Expense label</label>
            <input
              id="expense-label"
              name="expense-label"
              type="text"
              value={state.form.label}
              onChange={(event) => updateLabel(event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="amount">Amount</label>
            <div className="affixed-control">
              <span aria-hidden="true">$</span>
              <input
                id="amount"
                name="amount"
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={state.form.amount}
                aria-invalid={Boolean(state.errors.amount)}
                aria-describedby={state.errors.amount ? 'amount-error' : undefined}
                onChange={(event) =>
                  updateProjectionForm({
                    ...state.form,
                    amount: event.target.value,
                  })
                }
              />
            </div>
            <p className="field-error" id="amount-error" aria-live="polite">
              {state.errors.amount ?? ''}
            </p>
          </div>

          <div className="field">
            <label htmlFor="cadence">Cadence</label>
            <select
              id="cadence"
              name="cadence"
              value={state.form.cadence}
              onChange={(event) =>
                updateProjectionForm({
                  ...state.form,
                  cadence: event.target.value as Cadence,
                })
              }
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="annual-return">Annual return (%)</label>
            <div className="affixed-control suffix-control">
              <input
                id="annual-return"
                name="annual-return"
                type="number"
                min="0"
                max="20"
                step="any"
                inputMode="decimal"
                value={state.form.annualRatePercent}
                aria-invalid={Boolean(state.errors.annualRatePercent)}
                aria-describedby={
                  state.errors.annualRatePercent ? 'annual-return-error' : undefined
                }
                onChange={(event) =>
                  updateProjectionForm({
                    ...state.form,
                    annualRatePercent: event.target.value,
                  })
                }
              />
              <span aria-hidden="true">%</span>
            </div>
            <p
              className="field-error"
              id="annual-return-error"
              aria-live="polite"
            >
              {state.errors.annualRatePercent ?? ''}
            </p>
          </div>

          <div className="field">
            <label htmlFor="years">Years</label>
            <input
              id="years"
              name="years"
              type="number"
              min="1"
              max="50"
              step="1"
              inputMode="numeric"
              value={state.form.years}
              aria-invalid={Boolean(state.errors.years)}
              aria-describedby={state.errors.years ? 'years-error' : undefined}
              onChange={(event) =>
                updateProjectionForm({
                  ...state.form,
                  years: event.target.value,
                })
              }
            />
            <p className="field-error" id="years-error" aria-live="polite">
              {state.errors.years ?? ''}
            </p>
          </div>
        </form>

        <section
          className="metric-strip reveal reveal-four"
          aria-label="Projection summary"
        >
          <article className="metric">
            <p>Spent</p>
            <strong>{formatUSD(state.result.spent)}</strong>
          </article>
          <article className="metric metric-invested">
            <p>If invested</p>
            <strong>{formatUSD(state.result.invested)}</strong>
          </article>
          <article className="metric">
            <p>Forgone return</p>
            <strong>{formatUSD(state.result.forgone)}</strong>
          </article>
        </section>

        <section className="chart-section reveal reveal-five" aria-labelledby="chart-title">
          <div className="section-heading">
            <h2 id="chart-title">Spent vs. invested</h2>
            <div className="chart-key" aria-hidden="true">
              <span>
                <i className="key-line key-spent" />Spent
              </span>
              <span>
                <i className="key-line key-invested" />If invested
              </span>
            </div>
          </div>
          <ProjectionChart series={state.result.series} />
        </section>

        <details className="calculation reveal reveal-six">
          <summary>How this is calculated</summary>
          <div className="calculation-grid">
            <section>
              <h3>Formula</h3>
              <p className="formula">
                Future value = monthly × ((1 + r)^n − 1) / r, where r is the
                annual rate divided by 12 and n is years × 12. If r is 0, future
                value is monthly × n.
              </p>
            </section>
            <section>
              <h3>Monthly conversion</h3>
              <p>
                At the selected cadence, the entered expense becomes{' '}
                <strong>{formatUSD(state.result.monthly)}</strong> per month before
                growth.
              </p>
            </section>
            <section>
              <h3>Rate assumption</h3>
              <p>
                The default 7% is an approximate long-run US equity return after
                inflation. It is an assumption, not a prediction, and you can
                change it.
              </p>
            </section>
          </div>
        </details>

        <footer className="disclaimer reveal reveal-seven">
          This estimate is for learning, not financial advice. It assumes a
          constant return and ignores taxes, fees, and inflation.
        </footer>
      </main>
    </div>
  )
}
