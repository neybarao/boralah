import { RefreshCw, X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { Button } from '@/components/ui/button'

/** De quanto em quanto tempo procurar versão nova com o app aberto */
const CHECK_EVERY_MS = 60 * 60 * 1000

/**
 * Aviso de nova versão. O app procura atualização ao abrir, ao voltar para a
 * tela e a cada hora. Quando acha, mostra o aviso e só recarrega se a pessoa
 * tocar em "Atualizar", para não perder um formulário pela metade.
 */
export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (!registration) return
      const check = () => {
        if (navigator.onLine) void registration.update().catch(() => {})
      }
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') check()
      })
      setInterval(check, CHECK_EVERY_MS)
    },
  })

  if (!needRefresh) return null

  return createPortal(
    <div
      role="alert"
      className="animate-rise fixed inset-x-0 top-0 z-40 mx-auto w-full max-w-md px-4 pt-[max(env(safe-area-inset-top),12px)]"
    >
      <div className="flex items-center gap-3 rounded-xl bg-foreground py-2.5 pr-2 pl-4 text-background shadow-[0_12px_32px_-12px_var(--shadow-color)]">
        <RefreshCw size={18} aria-hidden="true" className="shrink-0" />
        <span className="flex-1 text-sm leading-snug font-bold">Nova versão disponível</span>
        <Button size="sm" onClick={() => void updateServiceWorker()}>
          Atualizar
        </Button>
        <button
          type="button"
          aria-label="Agora não"
          onClick={() => setNeedRefresh(false)}
          className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X size={18} />
        </button>
      </div>
    </div>,
    document.body,
  )
}
