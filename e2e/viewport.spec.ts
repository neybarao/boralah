import { expect, test } from './fixtures'
test('faixa do iOS: rodapé sem safe area dupla', async ({ page }) => {
  await page.goto('./')
  const nav = page.getByRole('navigation', { name: 'Navegação principal' })
  const before = await nav.evaluate((el) => getComputedStyle(el).paddingBottom)
  await page.evaluate(() => document.documentElement.classList.add('ios-bottom-gap'))
  const after = await nav.evaluate((el) => getComputedStyle(el).paddingBottom)
  expect(before).toBe('12px')
  expect(after).toBe('4px')
})
