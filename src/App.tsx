import { HashRouter, Route, Routes } from 'react-router'
import { StoreProvider } from '@/lib/store'
import Draw from '@/pages/draw'
import Home from '@/pages/home'
import Login from '@/pages/login'
import NotFound from '@/pages/not-found'
import PlacePage from '@/pages/place'
import PlaceForm from '@/pages/place-form'
import VisitForm from '@/pages/visit-form'
import Visits from '@/pages/visits'

// HashRouter: as URLs ficam com "#/" porque o GitHub Pages não sabe
// redirecionar rotas de SPA para o index.html.
export default function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sortear" element={<Draw />} />
          <Route path="/visitas" element={<Visits />} />
          <Route path="/entrar" element={<Login />} />
          <Route path="/novo" element={<PlaceForm />} />
          <Route path="/lugar/:id" element={<PlacePage />} />
          <Route path="/lugar/:id/editar" element={<PlaceForm />} />
          <Route path="/lugar/:id/visita" element={<VisitForm />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </StoreProvider>
  )
}
