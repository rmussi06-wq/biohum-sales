import React, { useEffect, useMemo, useState } from 'react'
import { listPrescribers, createVisit, listVisits } from '../lib/firestoreApi.js'
import { VISUAL_AID_LINKS } from '../lib/specialties.js'

export default function VisitasPage({ team }) {
  const [prescribers, setPrescribers] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  const [prescriberId, setPrescriberId] = useState("")
  const [visitedAt, setVisitedAt] = useState(() => new Date().toISOString().slice(0,10))
  const [notes, setNotes] = useState("")
  const [requests, setRequests] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let alive = true
    async function load() {
      setLoading(true)
      try {
        const p = await listPrescribers(team)
        const h = await listVisits(team, 50)
        if (!alive) return
        setPrescribers(p)
        setHistory(h)
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => { alive = false }
  }, [team])

  const selected = useMemo(() => prescribers.find(p => p.id === prescriberId) || null, [prescribers, prescriberId])
  const visualAidLink = selected?.specialty ? (VISUAL_AID_LINKS[selected.specialty] || "") : ""

  async function saveVisit() {
    if (!selected) {
      alert("Selecione um prescritor.")
      return
    }
    setSaving(true)
    try {
      await createVisit(team, {
        prescriberId: selected.id,
        prescriberName: selected.name,
        specialty: selected.specialty || "",
        visitedAtISO: new Date(visitedAt + "T12:00:00").toISOString(),
        notes,
        requests
      })
      setNotes("")
      setRequests("")
      const h = await listVisits(team, 50)
      setHistory(h)
    } finally {
      setSaving(false)
    }
  }

  function openVisualAid() {
    if (!selected) return
    if (!visualAidLink) {
      alert("Defina o link do Visual Aid para esta especialidade em src/lib/specialties.js")
      return
    }
    window.open(visualAidLink, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Visitas</h1>
        <p className="muted">Registre a visita e acione o Visual Aid da especialidade.</p>
      </header>

      <div className="two-col">
        <div className="card">
          <div className="title">Registrar visita</div>

          <div className="form-grid">
            <div className="field span-2">
              <div className="label">Prescritor</div>
              <select className="input" value={prescriberId} onChange={(e) => setPrescriberId(e.target.value)}>
                <option value="">Selecione…</option>
                {prescribers.map(p => (
                  <option key={p.id} value={p.id}>{p.name} — {p.specialty || "—"}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <div className="label">Data</div>
              <input className="input" type="date" value={visitedAt} onChange={(e) => setVisitedAt(e.target.value)} />
            </div>

            <div className="field">
              <div className="label">Especialidade</div>
              <input className="input" value={selected?.specialty || ""} disabled />
            </div>

            <div className="field span-2">
              <div className="label">Comentário</div>
              <textarea className="input" rows="3" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ex: respondeu bem ao tema X, pediu amostras de Y…" />
            </div>

            <div className="field span-2">
              <div className="label">Solicitações</div>
              <textarea className="input" rows="3" value={requests} onChange={(e) => setRequests(e.target.value)} placeholder="Ex: enviar material, retorno em 15 dias, etc." />
            </div>
          </div>

          <div className="row space">
            <button className="btn-secondary" onClick={openVisualAid} disabled={!selected}>Abrir Visual Aid</button>
            <button className="btn" onClick={saveVisit} disabled={saving}>{saving ? "Salvando…" : "Salvar visita"}</button>
          </div>

          {selected && (
            <div className="hint">
              Visual Aid ({selected.specialty}): {visualAidLink ? <b>configurado</b> : <b>não configurado</b>}
            </div>
          )}
        </div>

        <div className="card">
          <div className="title">Histórico</div>
          {loading ? (
            <div className="muted">Carregando…</div>
          ) : history.length === 0 ? (
            <div className="muted">Sem visitas registradas.</div>
          ) : (
            <div className="list">
              {history.map(v => (
                <div key={v.id} className="history-item">
                  <div className="row space">
                    <div className="title-sm">{v.prescriberName}</div>
                    <div className="pill">{(v.visitedAtISO || "").slice(0,10)}</div>
                  </div>
                  <div className="muted">{v.specialty || "—"}</div>
                  {v.notes ? <div className="p">{v.notes}</div> : null}
                  {v.requests ? <div className="p"><b>Solic:</b> {v.requests}</div> : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}