/**
 * Guarda o registro do service worker para que qualquer parte do app possa
 * pedir uma checagem de versão nova (ex.: puxar para atualizar).
 * Se houver versão nova, o UpdatePrompt mostra o aviso "Nova versão disponível".
 */
let registration: ServiceWorkerRegistration | undefined

export function setRegistration(r: ServiceWorkerRegistration) {
  registration = r
}

export async function checkForUpdate() {
  if (!registration || !navigator.onLine) return
  try {
    await registration.update()
  } catch {
    /* sem rede ou servidor fora: tenta de novo na próxima */
  }
}
