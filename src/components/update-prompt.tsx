import { RefreshCw, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { Button } from '@/components/ui/button'
import { checkForUpdate, setRegistration } from '@/lib/sw-update'

/** De quanto em quanto tempo procurar versão nova com o app aberto */
const CHECK_EVERY_MS = 5 * 60 * 1000
/** Ao trocar de tela, no máximo uma checagem a cada 30 segundos */
const NAV_GAP_MS = 30 * 1000

/** Telas com formulário: atualizar aqui faria perder o que foi digitado */
const isFormScreen = (path: string) => path === '/novo' || path === '/entrar' || /\/(editar|visita)$/.test(path)

/**
 * Atualização do app. Procura versão nova ao abrir, ao voltar para o app, ao
 * trocar de tela, ao voltar a internet, a cada 5 minutos e ao puxar a tela.
 *
 * Quando acha: se a pessoa não está num formulário, aplica na hora (recarrega
 * sozinho). Num formulário, mostra o aviso; se ela tocar em "Agora não", a
 * versão nova entra assim que ela sair do formulário.
 */
export function UpdatePrompt() {
  const { pathname } = useLocation()
  const [hidden, setHidden] = useState(false)
  const [applying, setApplying] = useState(false)
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (!registration) return
      setRegistration(registration)
      const check = () => void checkForUpdate()
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') check()
      })
      window.addEventListener('online', check)
      setInterval(check, CHECK_EVERY_MS)
    },
  })

  // Trocar de tela também procura versão nova
  useEffect(() => {
    void checkForUpdate({ minGap: NAV_GAP_MS })
  }, [pathname])

  const safe = !isFormScreen(pathname)
  useEffect(() => {
    if (!needRefresh || !safe || applying) return
    setApplying(true)
    void updateServiceWorker(true)
  }, [needRefresh, safe, applying, updateServiceWorker])

  // Rede de segurança: se a troca de versão não recarregar sozinha, recarrega
  useEffect(() => {
    if (!applying) return
    const t = setTimeout(() => window.location.reload(), 8000)
    return () => clearTimeout(t)
  }, [applying])

  if (!needRefresh) return null

  if (applying)
    return createPortal(
      <div
        role="status"
        className="animate-page-fade fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      >
        <span className="flex items-center gap-2 text-sm font-bold">
          <RefreshCw size={18} aria-hidden="true" className="animate-spin" /> Atualizando o app…
        </span>
      </div>,
      document.body,
    )

  if (hidden) return null

  return createPortal(
    <div
      role="alert"
      className="animate-rise fixed inset-x-0 top-0 z-40 mx-auto w-full max-w-md px-4 pt-[max(env(safe-area-inset-top),12px)]"
    >
      <div className="flex items-center gap-3 rounded-xl bg-foreground py-2.5 pr-2 pl-4 text-background shadow-[0_12px_32px_-12px_var(--shadow-color)]">
        <RefreshCw size={18} aria-hidden="true" className="shrink-0" />
        <span className="flex-1 text-sm leading-snug font-bold">Nova versão disponível</span>
        <Button
          size="sm"
          onClick={() => {
            setApplying(true)
            void updateServiceWorker(true)
          }}
        >
          Atualizar
        </Button>
        <button
          type="button"
          aria-label="Agora não"
          onClick={() => setHidden(true)}
          className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X size={18} />
        </button>
      </div>
    </div>,
    document.body,
  )
}
