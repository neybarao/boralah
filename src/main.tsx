import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { watchBottomGap } from './lib/viewport'

watchBottomGap()

// O Safari do iOS ignora user-scalable=no; isto bloqueia o gesto de pinça.
document.addEventListener('gesturestart', (e) => e.preventDefault())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
