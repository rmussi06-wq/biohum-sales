import React, { useEffect, useMemo, useState } from 'react'
import { listPrescribers, getAvailability } from '../lib/firestoreApi.js'
import { dowLabel } from '../lib/dateUtils.js'

export default function AgendaPage({ team }) {
  const [loading, setLoading] = useState(true)
  const [prescribers, setPrescribers] = useState([])
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    let alive = true
    async function load() {
      setLoading(true)
      try {
        const list = await listPrescribers(team)
        if (!alive) return
        setPrescribers(list)
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => { alive = false }
  }, [team])

  return (
    <div className="page">
      <header className="page-header">
        <h1>Agenda</h1>
        <p className="muted">Horários fixos por prescritor (edite no cadastro).</p>
      </header>

      {loading ? (
        <div className="card">Carregando…</div>
      ) : prescribers.length === 0 ? (
        <div className="card">Nenhum prescritor cadastrado.</div>
      ) : (
        <div className="grid">
          {prescribers.map(p => (
            <AgendaCard
              key={p.id}
              prescriber={p}
              isOpen={expanded === p.id}
              onToggle={() => setExpanded(expanded === p.id ? null : p.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function AgendaCard({ prescriber, isOpen, onToggle }) {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let alive = true
    async function loadSlots() {
      if (!isOpen) return
      setLoading(true)
      try {
        const s = await getAvailability(prescriber.id)
        if (!alive) return
        setSlots(s)
      } finally {
        if (alive) setLoading(false)
      }
    }
    loadSlots()
    return () => { alive = false }
  }, [isOpen, prescriber.id])

  return (
    <div className="card clickable" onClick={onToggle}>
      <div className="row space">
        <div>
          <div className="title">{prescriber.name}</div>
          <div className="muted">{prescriber.clinicName || prescriber.address || '—'}</div>
        </div>
        <div className="pill">{prescriber.specialty || '—'}</div>
      </div>

      {isOpen && (
        <div className="section">
          {loading ? (
            <div className="muted">Carregando horários…</div>
          ) : slots.length === 0 ? (
            <div className="muted">Sem horários fixos cadastrados.</div>
          ) : (
            <ul className="slots">
              {slots.map(s => (
                <li key={s.id}>
                  <b>{dowLabel(s.dayOfWeek)}</b> • {String(s.timeHHMM || '')} • {formatWeek(s.weekOfMonth)}
                  {s.label ? <span className="muted"> — {s.label}</span> : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

function formatWeek(weekOfMonth) {
  if (!weekOfMonth || weekOfMonth.length === 0) return "todas as semanas"
  if (weekOfMonth.includes("ALL")) return "todas as semanas"
  return `semana(s) ${weekOfMonth.join(", ")} do mês`
}