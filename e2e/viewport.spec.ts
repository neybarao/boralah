import { expect, test } from './fixtures'

test('menu do rodapé fica 24px acima do fim da tela', async ({ page }) => {
  await page.goto('./')
  const pill = page.getByRole('navigation', { name: 'Navegação principal' }).locator('div').first()
  const box = await pill.boundingBox()
  const vh = page.viewportSize()!.height
  expect(Math.round(vh - (box!.y + box!.height))).toBe(24)
})

test('faixa do iOS em tela cheia: botão do rodapé sem safe area dupla', async ({ page }) => {
  await page.goto('./#/lugar/demo-nonna')
  const bar = page.getByRole('link', { name: 'Registrar visita' }).locator('..')
  const before = await bar.evaluate((el) => getComputedStyle(el).paddingBottom)
  await page.evaluate(() => document.documentElement.classList.add('ios-bottom-gap'))
  const after = await bar.evaluate((el) => getComputedStyle(el).paddingBottom)
  expect(before).toBe('12px')
  expect(after).toBe('4px')
})

test('app instalado (standalone): foto da capa começa por trás da status bar', async ({ page }) => {
  // Simula a faixa de 62px que o iOS desconta em cima
  await page.addInitScript(() => {
    Object.defineProperty(window.screen, 'height', { get: () => window.innerHeight + 62 })
    const mm = window.matchMedia.bind(window)
    window.matchMedia = (q: string) =>
      q.includes('display-mode: standalone') ? ({ ...mm(q), matches: true } as MediaQueryList) : mm(q)
  })
  await page.goto('./#/lugar/demo-soba')
  await expect(page.getByRole('heading', { name: 'Sobá do Jardim', level: 1 })).toBeVisible()
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollTop)).toBe(62)
  const hero = page.locator('.animate-hero').first()
  // a foto sobe 62px acima da tela: é a parte que fica por trás da status bar
  await expect.poll(async () => Math.round((await hero.boundingBox())!.y)).toBe(-62)
})
