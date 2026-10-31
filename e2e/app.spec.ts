import { expect, test } from './fixtures'

test.describe('Início', () => {
  test('abre com a lista do modo demonstração', async ({ page }) => {
    await page.goto('./')
    await expect(page.getByRole('heading', { name: 'Onde comer hoje?' })).toBeVisible()
    await expect(page.getByText('Modo demonstração')).toBeVisible()
    await expect(page.getByRole('link', { name: /Sobá do Jardim/ }).first()).toBeVisible()
  })

  test('busca e filtro de espaço kids', async ({ page }) => {
    await page.goto('./')
    const list = page.getByRole('heading', { name: 'Todos os lugares' }).locator('..')
    // Hashi não tem espaço kids: escondido com o filtro padrão
    await page.getByRole('searchbox').fill('hashi')
    await expect(list.getByText('0 lugares')).toBeVisible()
    await page.getByRole('button', { name: 'Espaço kids' }).click()
    await expect(list.getByText('1 lugar')).toBeVisible()
    await expect(page.getByRole('link', { name: /Hashi Bistrô/ }).first()).toBeVisible()
  })
})

test.describe('Navegação', () => {
  test('abas de baixo levam a cada tela', async ({ page }) => {
    await page.goto('./')
    const nav = page.getByRole('navigation', { name: 'Navegação principal' })
    await nav.getByRole('link', { name: 'Sortear' }).click()
    await expect(page).toHaveURL(/#\/sortear$/)
    await nav.getByRole('link', { name: 'Visitas' }).click()
    await expect(page).toHaveURL(/#\/visitas$/)
    await nav.getByRole('link', { name: 'Início' }).click()
    await expect(page.getByRole('heading', { name: 'Onde comer hoje?' })).toBeVisible()
  })

  test('detalhe do lugar e voltar', async ({ page }) => {
    await page.goto('./')
    await page.getByRole('link', { name: /Sobá do Jardim/ }).first().click()
    await expect(page.getByRole('heading', { name: 'Sobá do Jardim', level: 1 })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Nossas visitas' })).toBeVisible()
    await page.getByRole('link', { name: 'Voltar' }).click()
    await expect(page.getByRole('heading', { name: 'Onde comer hoje?' })).toBeVisible()
  })

  test('rota inexistente mostra a tela de erro', async ({ page }) => {
    await page.goto('./#/nao-existe')
    await expect(page.getByRole('heading', { name: 'Ops' })).toBeVisible()
  })
})

test('sorteio mostra um lugar e sorteia de novo', async ({ page }) => {
  await page.goto('./#/sortear')
  const again = page.getByRole('button', { name: 'Sortear outro' })
  await expect(again).toBeEnabled({ timeout: 10_000 })
  await again.click()
  await expect(again).toBeEnabled({ timeout: 10_000 })
})

test('registrar visita', async ({ page }) => {
  await page.goto('./#/lugar/demo-nonna')
  await page.getByRole('link', { name: 'Registrar visita' }).click()
  await expect(page.getByRole('heading', { name: 'Registrar visita' })).toBeVisible()
  await page.getByRole('button', { name: '4 estrelas' }).click()
  await page.getByPlaceholder('O que pedimos').fill('Teste automático')
  await page.getByRole('button', { name: 'Salvar visita' }).click()
  await expect(page.getByRole('status')).toHaveText('Visita salva')
  await expect(page.getByText('Teste automático')).toBeVisible()
})

test('cadastrar lugar novo', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('link', { name: 'Cadastrar novo lugar' }).click()
  await page.getByPlaceholder('Ex.: Cantina da esquina').fill('Lugar de Teste')
  await page.getByRole('button', { name: 'Salvar lugar' }).click()
  await expect(page.getByRole('status')).toHaveText('Lugar cadastrado')
  await expect(page.getByRole('heading', { name: 'Lugar de Teste', level: 1 })).toBeVisible()
})
