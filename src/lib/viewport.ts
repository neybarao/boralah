/**
 * Detecta a faixa que o iOS deixa embaixo no app instalado em tela cheia
 * (altura da página = tela − status bar) e marca o <html> com a classe
 * ios-bottom-gap. Veja a regra em src/index.css.
 */
export function watchBottomGap() {
  const installed = () =>
    (navigator as Navigator & { standalone?: boolean }).standalone === true ||
    matchMedia('(display-mode: standalone)').matches ||
    matchMedia('(display-mode: fullscreen)').matches

  const update = () => {
    const portrait = window.innerHeight > window.innerWidth
    const full = portrait
      ? Math.max(screen.width, screen.height)
      : Math.min(screen.width, screen.height)
    const gap = full - window.innerHeight
    // Só a faixa da status bar (uns 20 a 70 pt); nada de teclado aberto etc.
    document.documentElement.classList.toggle('ios-bottom-gap', installed() && gap >= 20 && gap <= 80)
  }
  update()
  window.addEventListener('resize', update)
  window.addEventListener('orientationchange', update)
}
