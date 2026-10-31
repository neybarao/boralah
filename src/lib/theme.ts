import { useCallback, useEffect, useSyncExternalStore } from 'react'

/**
 * Tema: segue o sistema por padrão. O botão inverte o tema visível e guarda a
 * escolha. Se a escolha coincidir com o sistema, nada é guardado e o app
 * volta a seguir o sistema automaticamente.
 */

export type Theme = 'light' | 'dark'

const KEY = 'boralah-theme'
const META_COLOR: Record<Theme, string> = { light: '#C8361F', dark: '#16120F' }
const media = () => window.matchMedia('(prefers-color-scheme: dark)')

function readStored(): Theme | null {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : null
  } catch {
    return null
  }
}

function writeStored(v: Theme | null) {
  try {
    if (v) localStorage.setItem(KEY, v)
    else localStorage.removeItem(KEY)
  } catch {
    /* modo privado ou armazenamento bloqueado: o tema só não fica salvo */
  }
}

const systemTheme = (): Theme => (media().matches ? 'dark' : 'light')
const resolve = (): Theme => readStored() ?? systemTheme()

function apply(theme: Theme) {
  const root = document.documentElement
  root.dataset.theme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', META_COLOR[theme])
}

const listeners = new Set<() => void>()
const notify = () => listeners.forEach((l) => l())

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, resolve, () => 'light' as Theme)

  // Acompanha a troca de tema do sistema enquanto não houver escolha manual
  useEffect(() => {
    const mq = media()
    const onChange = () => {
      if (readStored() === systemTheme()) writeStored(null)
      apply(resolve())
      notify()
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const toggle = useCallback(() => {
    const next: Theme = resolve() === 'dark' ? 'light' : 'dark'
    writeStored(next === systemTheme() ? null : next)
    apply(next)
    notify()
  }, [])

  return { theme, toggle }
}
