import { useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import GalaxyBackground from './components/GalaxyBackground.jsx'
import NavBar from './components/NavBar.jsx'
import SearchPalette from './components/SearchPalette.jsx'
import Home from './pages/Home.jsx'
import CharacterPage from './pages/CharacterPage.jsx'
import RelationPage from './pages/RelationPage.jsx'
import FactionPage from './pages/FactionPage.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  const [paletteOpen, setPaletteOpen] = useState(false)
  const location = useLocation()

  // Ctrl+K / Cmd+K 唤起搜索
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // 路由切换时回到顶部
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' })
  }, [location.pathname])

  return (
    <div className="relative min-h-screen">
      <GalaxyBackground />
      <NavBar onOpenSearch={() => setPaletteOpen(true)} />
      <main className="relative z-10">
        <Routes>
          <Route path="/" element={<Home onOpenSearch={() => setPaletteOpen(true)} />} />
          <Route path="/character/:id" element={<CharacterPage />} />
          <Route path="/relations" element={<RelationPage />} />
          <Route path="/faction/:id" element={<FactionPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <SearchPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  )
}
