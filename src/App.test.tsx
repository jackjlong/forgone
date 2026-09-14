import { renderToStaticMarkup } from 'react-dom/server'
import { expect, test } from 'vitest'
import App from './App'

test('renders the Forgone page', () => {
  expect(renderToStaticMarkup(<App />)).toContain('Forgone')
})

test('renders the opening projection headline', () => {
  expect(renderToStaticMarkup(<App />)).toContain(
    'Your coffee could be worth $222,645.',
  )
})

test('renders polite live regions for field errors', () => {
  const markup = renderToStaticMarkup(<App />)

  expect(markup).toContain('id="amount-error" aria-live="polite"')
  expect(markup).toContain('id="annual-return-error" aria-live="polite"')
  expect(markup).toContain('id="years-error" aria-live="polite"')
})
