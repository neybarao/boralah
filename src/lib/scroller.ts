/**
 * Quem rola o app: a própria página, como no Dia (home-org).
 * scroller() dá o elemento (para ler e mudar scrollTop) e scrollEvents()
 * onde escutar o evento de rolagem.
 */
export const scroller = () => (document.scrollingElement ?? document.documentElement) as HTMLElement
export const scrollEvents = (): Window => window
