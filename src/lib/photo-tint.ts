/**
 * Cor média da faixa de cima de uma foto. Usada para tingir a área da status
 * bar com a cor da foto de capa (o iOS desenha ali um vidro fosco com a cor
 * de fundo da página; com a cor da foto, a foto parece continuar por trás).
 * Devolve null se não der para ler a imagem (ex.: servidor sem CORS).
 */
export function topColor(src: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.decoding = 'async'
    img.onload = () => {
      try {
        const c = document.createElement('canvas')
        c.width = 8
        c.height = 1
        const ctx = c.getContext('2d', { willReadFrequently: true })
        if (!ctx) return resolve(null)
        // 6% de cima da foto, espremidos numa linha de 8 px
        ctx.drawImage(img, 0, 0, img.naturalWidth, Math.max(1, img.naturalHeight * 0.06), 0, 0, 8, 1)
        const d = ctx.getImageData(0, 0, 8, 1).data
        let r = 0
        let g = 0
        let b = 0
        for (let i = 0; i < d.length; i += 4) {
          r += d[i]
          g += d[i + 1]
          b += d[i + 2]
        }
        const n = d.length / 4
        resolve(`rgb(${Math.round(r / n)}, ${Math.round(g / n)}, ${Math.round(b / n)})`)
      } catch {
        resolve(null)
      }
    }
    img.onerror = () => resolve(null)
    // Endereço próprio para não reaproveitar a cópia sem CORS guardada pelo service worker
    img.src = src + (src.includes('?') ? '&' : '?') + 'tint=1'
  })
}

/** Pinta o fundo da página e a theme-color; devolve uma função que desfaz */
export function applyTopTint(color: string) {
  const html = document.documentElement
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  const prevBg = html.style.backgroundColor
  const prevMeta = meta?.content
  html.style.backgroundColor = color
  meta?.setAttribute('content', color)
  return () => {
    html.style.backgroundColor = prevBg
    if (meta && prevMeta) meta.setAttribute('content', prevMeta)
  }
}
