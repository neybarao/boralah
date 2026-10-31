import type { Page } from '@playwright/test'
import { expect, test } from './fixtures'

const theme = (page: Page) => page.locator('html').getAttribute('data-theme')
const stored = (page: Page) => page.evaluate(() => localStorage.getItem('boralah-theme'))
const themeColor = (page: Page) => page.locator('meta[name="theme-color"]').getAttribute('content')

test('segue o sistema: claro', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('./')
  expect(await theme(page)).toBe('light')
  await expect(page.getByRole('button', { name: 'Usar tema escuro' })).toBeVisible()
})

test('segue o sistema: escuro, já na primeira pintura', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('./')
  expect(await theme(page)).toBe('dark')
  expect((await themeColor(page))?.toUpperCase()).toBe('#16120F')
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
  expect(bg).toBe('rgb(22, 18, 15)')
})

test('troca manual fica salva e volta ao automático', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('./')

  await page.getByRole('button', { name: 'Usar tema escuro' }).click()
  expect(await theme(page)).toBe('dark')
  expect(await stored(page)).toBe('dark')

  await page.reload()
  expect(await theme(page)).toBe('dark')

  // Voltar para o mesmo tema do sistema limpa a escolha manual
  await page.getByRole('button', { name: 'Usar tema claro' }).click()
  expect(await theme(page)).toBe('light')
  expect(await stored(page)).toBeNull()
})

test('acompanha a troca do sistema quando está no automático', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('./')
  await page.emulateMedia({ colorScheme: 'dark' })
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
})
