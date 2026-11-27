/**
 * O app rola dentro do #root (fixo, ocupando a tela toda), não na página.
 * É o mesmo esquema do Raul's World: assim o iPhone deixa o conteúdo
 * desenhar por trás da status bar no app instalado.
 */
export const scroller = () => document.getElementById('root') as HTMLElement
