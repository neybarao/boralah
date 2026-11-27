/**
 * Guarda o registro do service worker para que qualquer parte do app possa
 * pedir uma checagem de versão nova (abrir o app, trocar de tela, puxar para
 * atualizar). Se houver versão nova, o UpdatePrompt aplica ou avisa.
 */
let registration: ServiceWorkerRegistration | undefined
let lastCheck = 0

export function setRegistration(r: ServiceWorkerRegistration) {
  registration = r
}

/** Espera a versão nova terminar de baixar (até `timeout` ms) */
function waitInstalled(sw: ServiceWorker, timeout: number) {
  return new Promise<void>((resolve) => {
    const done = () => {
      clearTimeout(t)
      sw.removeEventListener('statechange', onChange)
      resolve()
    }
    const onChange = () => {
      if (sw.state !== 'installing') done()
    }
    const t = setTimeout(done, timeout)
    sw.addEventListener('statechange', onChange)
  })
}

/**
 * Procura versão nova. Com `minGap`, ignora se já checou há pouco tempo
 * (evita checar a cada toque ao trocar de tela). Com `wait`, só termina
 * depois que a versão nova baixou, para o "puxar para atualizar" girar até o fim.
 */
export async function checkForUpdate({ minGap = 0, wait = false } = {}) {
  if (!registration || !navigator.onLine) return
  if (Date.now() - lastCheck < minGap) return
  lastCheck = Date.now()
  try {
    await registration.update()
    if (wait && registration.installing) await waitInstalled(registration.installing, 15_000)
  } catch {
    /* sem rede ou servidor fora: tenta de novo na próxima */
  }
}

/** Data e hora em que esta versão foi publicada, definida no build */
export const BUILD_TIME = new Date(__BUILD_TIME__)
