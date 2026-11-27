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

test('fora de formulário, versão nova entra sozinha', async ({ page }) => {
  await openControlled(page)
  await expect(page.getByText(/^Versão de /)).toBeVisible()

  const original = readFileSync(SW, 'utf8')
  try {
    // Simula um deploy: o service worker publicado muda
    appendFileSync(SW, `\n// versão de teste ${Date.now()}\n`)
    const reloaded = page.waitForEvent('load', { timeout: 20_000 })
    // Voltar para o app dispara a checagem
    await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')))
    await reloaded
    await expect(page.getByRole('heading', { name: 'Onde comer hoje?' })).toBeVisible()
    await expect(page.getByText('Nova versão disponível')).toHaveCount(0)
    expect(await page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true)
  } finally {
    writeFileSync(SW, original)
  }
})

test('num formulário, avisa; "Agora não" adia até sair do formulário', async ({ page }) => {
  await openControlled(page)
  await page.goto('./#/lugar/demo-nonna/visita')
  await expect(page.getByRole('heading', { name: 'Registrar visita' })).toBeVisible()

  const original = readFileSync(SW, 'utf8')
  try {
    appendFileSync(SW, `\n// versão de teste ${Date.now()}\n`)
    await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')))
    const alert = page.getByRole('alert').filter({ hasText: 'Nova versão disponível' })
    await expect(alert).toBeVisible({ timeout: 15_000 })

    // "Agora não" esconde o aviso e não recarrega: o formulário continua
    await page.getByPlaceholder('O que pedimos').fill('não pode sumir')
    await alert.getByRole('button', { name: 'Agora não' }).click()
    await expect(alert).toHaveCount(0)
    await expect(page.getByPlaceholder('O que pedimos')).toHaveValue('não pode sumir')

    // Ao sair do formulário, a versão nova entra
    const reloaded = page.waitForEvent('load', { timeout: 20_000 })
    await page.getByRole('button', { name: 'Fechar' }).click()
    await reloaded
    expect(await page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true)
  } finally {
    writeFileSync(SW, original)
  }
})

test('no formulário, tocar em Atualizar recarrega com a versão nova', async ({ page }) => {
  await openControlled(page)
  await page.goto('./#/novo')

  const original = readFileSync(SW, 'utf8')
  try {
    appendFileSync(SW, `\n// versão de teste ${Date.now()}\n`)
    await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')))
    const alert = page.getByRole('alert').filter({ hasText: 'Nova versão disponível' })
    await expect(alert).toBeVisible({ timeout: 15_000 })

    const reloaded = page.waitForEvent('load')
    await alert.getByRole('button', { name: 'Atualizar' }).click()
    await reloaded
    expect(await page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true)
  } finally {
    writeFileSync(SW, original)
  }
})
