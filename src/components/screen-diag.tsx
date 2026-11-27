import { useEffect, useState } from 'react'

/**
 * Diagnóstico da tela, no rodapé do Início. Mostra se o app está em tela
 * cheia e quanto espaço a status bar ocupa, para conferir no próprio iPhone
 * se a foto consegue ir por trás dela.
 */
export function ScreenDiag() {
  const [info, setInfo] = useState('')
  useEffect(() => {
    const probe = document.createElement('div')
    probe.style.cssText = 'position:fixed;top:0;height:env(safe-area-inset-top);visibility:hidden'
    document.body.appendChild(probe)
    const top = Math.round(probe.getBoundingClientRect().height)
    probe.remove()
    const mode = ['fullscreen', 'standalone', 'minimal-ui', 'browser'].find(
      (m) => window.matchMedia(`(display-mode: ${m})`).matches,
    )
    setInfo(`modo ${mode ?? '?'} · topo ${top}px · altura ${window.innerHeight}/${window.screen.height}`)
  }, [])
  return <>{info}</>
}
