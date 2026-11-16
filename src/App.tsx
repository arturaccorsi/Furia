import { ReactNode, useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { TabBar } from './components'
import { useStore } from './store'
import Welcome from './pages/Welcome'
import Home from './pages/Home'
import Match from './pages/Match'
import Fallen from './pages/Fallen'
import { Shop } from './pages/Shop'
import Profile from './pages/Profile'
import Agenda from './pages/Agenda'
import Achievement from './pages/Achievement'

function Page({ children, tabs = true }: { children: ReactNode; tabs?: boolean }) {
  return (
    <>
      <main className={`page${tabs ? ' page--tabs' : ''}`}>{children}</main>
      {tabs && <TabBar />}
    </>
  )
}

function RequireName({ children }: { children: ReactNode }) {
  const { name } = useStore()
  return name ? <>{children}</> : <Navigate to="/bem-vindo" replace />
}

function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

export default function App() {
  const { name } = useStore()
  const guard = (el: ReactNode, tabs = true) => (
    <RequireName>
      <Page tabs={tabs}>{el}</Page>
    </RequireName>
  )
  return (
    <div className="app">
      <ScrollToTop />
      <Routes>
        <Route path="/bem-vindo" element={name ? <Navigate to="/" replace /> : <Page tabs={false}><Welcome /></Page>} />
        <Route path="/" element={guard(<Home />)} />
        <Route path="/agenda" element={guard(<Agenda />)} />
        <Route path="/partida/:id" element={guard(<Match />, false)} />
        <Route path="/fallen" element={guard(<Fallen />, false)} />
        <Route path="/loja" element={guard(<Shop />)} />
        <Route path="/perfil" element={guard(<Profile />)} />
        <Route path="/conquista/:id" element={guard(<Achievement />, false)} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
