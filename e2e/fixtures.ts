import { test as base, expect } from '@playwright/test'

/**
 * Toda página falha o teste se aparecer erro no console ou exceção não tratada.
 * É a rede de segurança para "a tela abriu, mas algo quebrou por baixo".
 */
export const test = base.extend<{ errors: string[] }>({
  errors: [
    async ({ page }, use) => {
      // Fontes externas respondem vazio: o teste não depende de internet
      await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) =>
        r.fulfill({ status: 200, contentType: 'text/css', body: '' }),
      )
      const errors: string[] = []
      page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
      page.on('console', (m) => {
        if (m.type() === 'error') errors.push(`console: ${m.text()}`)
      })
      await use(errors)
      expect(errors, 'erros no console durante o teste').toEqual([])
    },
    { auto: true },
  ],
})

export { expect }
