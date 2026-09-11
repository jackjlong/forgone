import { renderToStaticMarkup } from 'react-dom/server'
import { expect, test } from 'vitest'
import App from './App'

test('renders the placeholder', () => {
  expect(renderToStaticMarkup(<App />)).toBe('<main>Forgone</main>')
})
