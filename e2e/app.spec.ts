import { expect, test } from './fixtures'

test.describe('Início', () => {
  test('abre com a lista do modo demonstração', async ({ page }) => {
    await page.goto('./')
    await expect(page.getByRole('heading', { name: 'Onde comer hoje?' })).toBeVisible()
    await expect(page.getByText('Modo demonstração')).toBeVisible()
    await expect(page.getByRole('link', { name: /Sobá do Jardim/ }).first()).toBeVisible()
  })

  test('busca e filtro de aberto agora', async ({ page }) => {
    await page.goto('./')
    const list = page.getByRole('heading', { name: 'Todos os lugares' }).locator('..')
    // Não existe mais filtro de espaço kids: o app só tem lugares com espaço kids
    await expect(page.getByRole('button', { name: 'Espaço kids' })).toHaveCount(0)
    await page.getByRole('searchbox').fill('hashi')
    await expect(list.getByText('1 lugar')).toBeVisible()
    // Hashi não tem horário informado, então some com "Aberto agora"
    await page.getByRole('button', { name: 'Aberto agora' }).click()
    await expect(list.getByText('0 lugares')).toBeVisible()
    // Sobá está aberto o dia todo nos dados de teste
    await page.getByRole('searchbox').fill('sobá')
    await expect(list.getByText('1 lugar')).toBeVisible()
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
  // Bairro e Instagram saíram do cadastro
  await expect(page.getByText('Bairro', { exact: true })).toHaveCount(0)
  await expect(page.getByPlaceholder('@perfil')).toHaveCount(0)
  await page.getByPlaceholder('Ex.: Cantina da esquina').fill('Lugar de Teste')
  // Sem os dados do espaço kids não salva
  await page.getByRole('button', { name: 'Salvar lugar' }).click()
  await expect(page.getByRole('alert')).toContainText('Falta preencher o tipo de espaço kids, a idade e o tamanho do espaço')
  await page.getByRole('button', { name: 'Brinquedoteca' }).click()
  await page.getByRole('button', { name: 'Grande' }).click()
  await page.getByPlaceholder('Ex.: 1 a 5 anos').fill('2 a 8 anos')
  await page.getByLabel('Monitora').selectOption('sim')
  await page.getByRole('switch', { name: 'Seg aberto' }).click()
  await page.getByRole('button', { name: 'Salvar lugar' }).click()
  await expect(page.getByRole('status')).toHaveText('Lugar cadastrado')
  await expect(page.getByRole('heading', { name: 'Lugar de Teste', level: 1 })).toBeVisible()
  await expect(page.getByText('Tem monitora')).toBeVisible()
  await expect(page.getByText('2 a 8 anos')).toBeVisible()
  await expect(page.getByRole('listitem').filter({ hasText: 'Seg' })).toContainText('Fechado')
})

test('puxar a tela para baixo atualiza', async ({ page }) => {
  await page.goto('./')
  await expect(page.getByRole('heading', { name: 'Onde comer hoje?' })).toBeVisible()
  // Simula o dedo arrastando 200px para baixo com a página no topo
  await page.evaluate(async () => {
    const touch = (y: number) => [new Touch({ identifier: 1, target: document.body, clientX: 200, clientY: y })]
    const fire = (type: string, y: number) =>
      document.dispatchEvent(
        new TouchEvent(type, {
          touches: type === 'touchend' ? [] : touch(y),
          changedTouches: touch(y),
          bubbles: true,
          cancelable: true,
        }),
      )
    fire('touchstart', 100)
    for (let y = 120; y <= 300; y += 20) {
      fire('touchmove', y)
      await new Promise((r) => requestAnimationFrame(r))
    }
    fire('touchend', 300)
  })
  await expect(page.getByRole('status', { name: 'Atualizando' })).toBeVisible()
  await expect(page.getByRole('status', { name: 'Atualizando' })).toHaveCount(0, { timeout: 5_000 })
  await expect(page.getByRole('link', { name: /Sobá do Jardim/ }).first()).toBeVisible()
})

test('foto do lugar vai até o topo da tela', async ({ page }) => {
  await page.goto('./#/lugar/demo-nonna')
  const hero = page.locator('.animate-hero').first()
  await expect(hero).toBeVisible()
  // Depois da animação de entrada, a foto começa no topo (sem faixa acima dela)
  await expect.poll(async () => Math.round((await hero.boundingBox())?.y ?? -1)).toBe(0)
})
