import { defineConfig, devices } from '@playwright/test'

/**
 * Testes de ponta a ponta do SPA. Rodam no modo demonstração (sem Supabase),
 * com os dados fictícios de src/lib/mock.ts, então não tocam no banco real.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  // update.spec altera o sw.js publicado; os outros arquivos bloqueiam service worker e não são afetados

  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4173/boralah/',
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
    locale: 'pt-BR',
  },
  projects: [
    {
      name: 'celular',
      // Usa o Chrome já instalado (máquina local e runners do GitHub), sem baixar navegador
      use: { ...devices['Pixel 7'], channel: 'chrome' },
    },
  ],
  webServer: {
    // O modo "e2e" não carrega o .env.production, então o app sobe em modo demonstração
    command: 'npx vite build --mode e2e --outDir dist-e2e && npx vite preview --mode e2e --outDir dist-e2e --port 4173 --strictPort',
    url: 'http://localhost:4173/boralah/',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
