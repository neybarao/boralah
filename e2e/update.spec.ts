import { appendFileSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { Page } from '@playwright/test'
import { expect, test } from './fixtures'

// Este teste precisa do service worker de verdade
test.use({ serviceWorkers: 'allow' })
// Os dois testes mexem no mesmo sw.js, então rodam um depois do outro
test.describe.configure({ mode: 'serial' })

/** Abre o app já controlado pelo service worker, como no celular depois da 1ª visita */
async function openControlled(page: Page) {
  await page.goto('./')
  await page.evaluate(() => navigator.serviceWorker.ready)
  await page.reload()
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true)
}

const SW = fileURLToPath(new URL('../dist-e2e/sw.js', import.meta.url))

test('avisa quando há versão nova e "Agora não" esconde o aviso', async ({ page }) => {
  await openControlled(page)
  await expect(page.getByText('Nova versão disponível')).toHaveCount(0)

  const original = readFileSync(SW, 'utf8')
  try {
    // Simula um deploy: o service worker publicado muda
    appendFileSync(SW, `\n// versão de teste ${Date.now()}\n`)

    // Voltar para o app dispara a checagem
    await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')))
    const alert = page.getByRole('alert').filter({ hasText: 'Nova versão disponível' })
    await expect(alert).toBeVisible({ timeout: 15_000 })

    // "Agora não" esconde o aviso sem recarregar
    await alert.getByRole('button', { name: 'Agora não' }).click()
    await expect(alert).toHaveCount(0)
    await expect(page.getByRole('heading', { name: 'Onde comer hoje?' })).toBeVisible()
  } finally {
    writeFileSync(SW, original)
  }
})

test('tocar em Atualizar recarrega com a versão nova', async ({ page }) => {
  await openControlled(page)

  const original = readFileSync(SW, 'utf8')
  try {
    appendFileSync(SW, `\n// versão de teste ${Date.now()}\n`)
    await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')))
    const alert = page.getByRole('alert').filter({ hasText: 'Nova versão disponível' })
    await expect(alert).toBeVisible({ timeout: 15_000 })

    const reloaded = page.waitForEvent('load')
    await alert.getByRole('button', { name: 'Atualizar' }).click()
    await reloaded
    await expect(page.getByRole('heading', { name: 'Onde comer hoje?' })).toBeVisible()
    await expect(alert).toHaveCount(0)
    // O service worker novo assumiu o controle
    expect(await page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true)
  } finally {
    writeFileSync(SW, original)
  }
})
