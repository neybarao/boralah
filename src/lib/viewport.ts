/**
 * No iPhone, com o app instalado, a página tem a altura da tela menos a status
 * bar (uns 62 pt). Onde fica essa faixa depende do modo:
 * - standalone (o modo atual, igual ao Dia): a página começa abaixo da status
 *   bar. A faixa fica em cima e o conteúdo só passa por trás dela rolando.
 *   Guardamos a altura em --top-gap; a tela do lugar usa para a foto começar
 *   por trás da status bar (veja src/pages/place.tsx).
 * - fullscreen: a página começa no topo e a faixa fica embaixo; marca o <html>
 *   com ios-bottom-gap (regra em src/index.css).
 */
let topGap = 0
export const getTopGap = () => topGap

export function watchBottomGap() {
  const update = () => {
    const nav = navigator as Navigator & { standalone?: boolean }
    const fullscreen = matchMedia('(display-mode: fullscreen)').matches
    const standalone = !fullscreen && (nav.standalone === true || matchMedia('(display-mode: standalone)').matches)
    const portrait = window.innerHeight > window.innerWidth
    const full = portrait ? Math.max(screen.width, screen.height) : Math.min(screen.width, screen.height)
    const gap = full - window.innerHeight
    // Só a faixa da status bar (uns 20 a 80 pt); nada de teclado aberto etc.
    const isBar = portrait && gap >= 20 && gap <= 80
    const root = document.documentElement
    root.classList.toggle('ios-bottom-gap', fullscreen && isBar)
    topGap = standalone && isBar ? gap : 0
    root.style.setProperty('--top-gap', `${topGap}px`)
  }
  update()
  window.addEventListener('resize', update)
  window.addEventListener('orientationchange', update)
}
