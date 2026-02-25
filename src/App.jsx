import React, { useEffect, useMemo, useState } from 'react'
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import Splash from './components/Splash.jsx'
import AgendaPage from './pages/AgendaPage.jsx'
import ClientesPage from './pages/ClientesPage.jsx'
import VisitasPage from './pages/VisitasPage.jsx'
import { initFirebase } from './lib/firebase.js'
import { getTeam, setTeam, TEAMS } from './lib/team.js'

export default function App() {
  const [ready, setReady] = useState(false)
  const [team, setTeamState] = useState(getTeam())
  const navigate = useNavigate()

  useEffect(() => {
    initFirebase()
    const t = setTimeout(() => setReady(true), 700) // splash mínimo
    return () => clearTimeout(t)
  }, [])

  const onChangeTeam = (e) => {
    const value = e.target.value
    setTeam(value)
    setTeamState(value)
    // Mantém rota atual
  }

  if (!ready) return <Splash />

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-title">BIOHUM</div>
          <div className="brand-sub">SALES</div>
        </div>

        <nav className="nav">
          <NavLink to="/agenda" className={({isActive}) => "nav-item" + (isActive ? " active" : "")}>
            <span className="nav-icon">📅</span>
            <span>Agenda</span>
          </NavLink>
          <NavLink to="/clientes" className={({isActive}) => "nav-item" + (isActive ? " active" : "")}>
            <span className="nav-icon">👤</span>
            <span>Clientes</span>
          </NavLink>
          <NavLink to="/visitas" className={({isActive}) => "nav-item" + (isActive ? " active" : "")}>
            <span className="nav-icon">📝</span>
            <span>Visitas</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <label className="team-label">
            Equipe
            <select value={team} onChange={onChangeTeam} className="team-select">
              {TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <button className="btn-ghost" onClick={() => navigate('/clientes')}>+ Novo prescritor</button>
        </div>
      </aside>

      <main className="main">
        <Routes>
          <Route path="/" element={<AgendaPage team={team} />} />
          <Route path="/agenda" element={<AgendaPage team={team} />} />
          <Route path="/clientes" element={<ClientesPage team={team} />} />
          <Route path="/visitas" element={<VisitasPage team={team} />} />
        </Routes>
      </main>
    </div>
  )
}