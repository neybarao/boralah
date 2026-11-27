import { RefreshCw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

/** Quanto puxar (em px, já amortecido) para disparar a atualização */
const THRESHOLD = 70
const MAX = 110

/**
 * Puxar para atualizar: com a página no topo, arrastar para baixo recarrega os
 * dados e procura versão nova do app. O app instalado não tem esse gesto
 * nativo, então ele é feito aqui com eventos de toque.
 */
export function PullToRefresh({ onRefresh }: { onRefresh: () => Promise<unknown> }) {
  const [pull, setPull] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const startY = useRef<number | null>(null)
  const pullRef = useRef(0)
  const busy = useRef(false)
  const onRefreshRef = useRef(onRefresh)
  useEffect(() => {
    onRefreshRef.current = onRefresh
  }, [onRefresh])

  useEffect(() => {
    const setBoth = (v: number) => {
      pullRef.current = v
      setPull(v)
    }
    const onStart = (e: TouchEvent) => {
      if (busy.current || window.scrollY > 0 || e.touches.length !== 1) return
      startY.current = e.touches[0].clientY
    }
    const onMove = (e: TouchEvent) => {
      if (startY.current === null) return
      const dy = e.touches[0].clientY - startY.current
      if (dy <= 0 || window.scrollY > 0) {
        if (pullRef.current) setBoth(0)
        return
      }
      // Evita o "quique" do iOS enquanto puxa
      if (e.cancelable) e.preventDefault()
      setBoth(Math.min(MAX, dy * 0.5))
    }
    const onEnd = async () => {
      if (startY.current === null) return
      startY.current = null
      const reached = pullRef.current >= THRESHOLD
      setBoth(0)
      if (!reached) return
      busy.current = true
      setRefreshing(true)
      try {
        // Pelo menos meio segundo de giro, para dar a sensação de que algo aconteceu
        await Promise.all([onRefreshRef.current(), new Promise((r) => setTimeout(r, 500))])
      } finally {
        busy.current = false
        setRefreshing(false)
      }
    }
    document.addEventListener('touchstart', onStart, { passive: true })
    document.addEventListener('touchmove', onMove, { passive: false })
    document.addEventListener('touchend', onEnd)
    document.addEventListener('touchcancel', onEnd)
    return () => {
      document.removeEventListener('touchstart', onStart)
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('touchend', onEnd)
      document.removeEventListener('touchcancel', onEnd)
    }
  }, [])

  if (!pull && !refreshing) return null
  const offset = refreshing ? THRESHOLD * 0.6 : pull * 0.6
  const ready = pull >= THRESHOLD

  return createPortal(
    <div
      role={refreshing ? 'status' : undefined}
      aria-label={refreshing ? 'Atualizando' : undefined}
      className="pointer-events-none fixed inset-x-0 top-0 z-30 flex justify-center pt-[env(safe-area-inset-top)]"
    >
      <div
        className="flex size-10 items-center justify-center rounded-full bg-background text-foreground shadow-[0_6px_20px_-6px_var(--shadow-color)]"
        style={{
          transform: `translateY(${offset}px)`,
          opacity: refreshing ? 1 : Math.min(1, pull / THRESHOLD),
          transition: pull ? 'none' : 'transform 200ms ease',
        }}
      >
        <RefreshCw
          size={18}
          strokeWidth={2.2}
          className={refreshing ? 'animate-spin' : undefined}
          style={refreshing ? undefined : { transform: `rotate(${pull * 3}deg)`, color: ready ? 'var(--color-primary)' : undefined }}
        />
      </div>
    </div>,
    document.body,
  )
}
