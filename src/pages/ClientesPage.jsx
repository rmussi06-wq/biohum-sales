import React, { useEffect, useMemo, useState } from 'react'
import { SPECIALTIES } from '../lib/specialties.js'
import { addAvailability, createPrescriber, deletePrescriber, getAvailability, listPrescribers, removeAvailability, updatePrescriber } from '../lib/firestoreApi.js'
import { parseWeekOfMonth, dowLabel } from '../lib/dateUtils.js'

export default function ClientesPage({ team }) {
  const [loading, setLoading] = useState(true)
  const [list, setList] = useState([])
  const [selectedId, setSelectedId] = useState(null)

  async function refresh() {
    setLoading(true)
    try {
      const data = await listPrescribers(team)
      setList(data)
      if (selectedId && !data.find(p => p.id === selectedId)) setSelectedId(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [team])

  const selected = useMemo(() => list.find(p => p.id === selectedId) || null, [list, selectedId])

  return (
    <div className="page">
      <header className="page-header">
        <h1>Clientes</h1>
        <p className="muted">Cadastro de prescritores e horários fixos.</p>
      </header>

      <div className="two-col">
        <div className="card">
          <div className="row space">
            <div className="title">Prescritores</div>
            <button className="btn" onClick={() => setSelectedId("NEW")}>+ Novo</button>
          </div>

          {loading ? (
            <div className="muted">Carregando…</div>
          ) : list.length === 0 ? (
            <div className="muted">Nenhum cadastrado.</div>
          ) : (
            <div className="list">
              {list.map(p => (
                <button
                  key={p.id}
                  className={"list-item" + (p.id === selectedId ? " active" : "")}
                  onClick={() => setSelectedId(p.id)}
                >
                  <div className="row space">
                    <div>
                      <div className="title-sm">{p.name}</div>
                      <div className="muted">{p.specialty || "—"} • {p.crm || "—"}</div>
                    </div>
                    <div className="chev">›</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <EditorCard
          team={team}
          prescriber={selected}
          isNew={selectedId === "NEW"}
          onSaved={() => { setSelectedId(null); refresh() }}
          onDeleted={() => { setSelectedId(null); refresh() }}
        />
      </div>
    </div>
  )
}

function EditorCard({ team, prescriber, isNew, onSaved, onDeleted }) {
  const empty = {
    name: "", crm: "", specialty: "ORTOPEDIA", phone: "", address: "",
    clinicName: "", secretaryName: "", notes: ""
  }
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [slots, setSlots] = useState([])
  const [slotForm, setSlotForm] = useState({ dayOfWeek: 1, weekOfMonthText: "ALL", timeHHMM: "14:00", label: "" })

  useEffect(() => {
    if (isNew) {
      setForm(empty)
      setSlots([])
      return
    }
    if (prescriber) setForm({
      name: prescriber.name || "",
      crm: prescriber.crm || "",
      specialty: prescriber.specialty || "ORTOPEDIA",
      phone: prescriber.phone || "",
      address: prescriber.address || "",
      clinicName: prescriber.clinicName || "",
      secretaryName: prescriber.secretaryName || "",
      notes: prescriber.notes || ""
    })
  }, [prescriber?.id, isNew])

  useEffect(() => {
    let alive = true
    async function loadSlots() {
      if (!prescriber || isNew) return
      const s = await getAvailability(prescriber.id)
      if (!alive) return
      setSlots(s)
    }
    loadSlots()
    return () => { alive = false }
  }, [prescriber?.id, isNew])

  const canEdit = isNew || !!prescriber

  const onChange = (k) => (e) => setForm(v => ({ ...v, [k]: e.target.value }))

  async function save() {
    setSaving(true)
    try {
      if (isNew) {
        await createPrescriber(team, form)
      } else if (prescriber) {
        await updatePrescriber(prescriber.id, form)
      }
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    if (!prescriber) return
    const ok = confirm("Excluir prescritor? (as visitas ficam no histórico)")
    if (!ok) return
    await deletePrescriber(prescriber.id)
    onDeleted()
  }

  async function addSlot() {
    if (!prescriber) {
      alert("Salve o prescritor primeiro para adicionar horários.")
      return
    }
    const week = parseWeekOfMonth(slotForm.weekOfMonthText)
    const slot = {
      dayOfWeek: Number(slotForm.dayOfWeek),
      weekOfMonth: week,
      timeHHMM: slotForm.timeHHMM,
      label: slotForm.label || ""
    }
    await addAvailability(prescriber.id, slot)
    const s = await getAvailability(prescriber.id)
    setSlots(s)
  }

  async function deleteSlot(slotId) {
    if (!prescriber) return
    await removeAvailability(prescriber.id, slotId)
    const s = await getAvailability(prescriber.id)
    setSlots(s)
  }

  return (
    <div className="card">
      <div className="row space">
        <div className="title">{isNew ? "Novo prescritor" : (prescriber ? "Editar prescritor" : "Selecione um prescritor")}</div>
        {!isNew && prescriber ? <button className="btn-danger" onClick={remove}>Excluir</button> : null}
      </div>

      {!canEdit ? (
        <div className="muted">Clique em um prescritor da lista ou crie um novo.</div>
      ) : (
        <>
          <div className="form-grid">
            <Field label="Nome" value={form.name} onChange={onChange("name")} />
            <Field label="CRM" value={form.crm} onChange={onChange("crm")} />
            <div className="field">
              <div className="label">Especialidade</div>
              <select className="input" value={form.specialty} onChange={onChange("specialty")}>
                {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <Field label="Telefone" value={form.phone} onChange={onChange("phone")} />
            <Field label="Endereço" value={form.address} onChange={onChange("address")} />
            <Field label="Clínica" value={form.clinicName} onChange={onChange("clinicName")} />
            <Field label="Secretária" value={form.secretaryName} onChange={onChange("secretaryName")} />
            <div className="field span-2">
              <div className="label">Observações</div>
              <textarea className="input" rows="3" value={form.notes} onChange={onChange("notes")} />
            </div>
          </div>

          <div className="row right">
            <button className="btn" disabled={saving} onClick={save}>{saving ? "Salvando…" : "Salvar"}</button>
          </div>

          <hr className="sep" />

          <div className="title-sm">Reservar horário fixo na agenda</div>
          <div className="slot-form">
            <div className="field">
              <div className="label">Dia da semana</div>
              <select className="input" value={slotForm.dayOfWeek} onChange={(e) => setSlotForm(v => ({...v, dayOfWeek: e.target.value}))}>
                {[1,2,3,4,5,6,0].map(d => (
                  <option key={d} value={d}>{dowLabel(d)}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <div className="label">Semana do mês</div>
              <input className="input" value={slotForm.weekOfMonthText} onChange={(e) => setSlotForm(v => ({...v, weekOfMonthText: e.target.value}))} placeholder="ALL ou 1,3" />
              <div className="hint">Use <b>ALL</b> (todas) ou <b>1,3</b> (1ª e 3ª).</div>
            </div>

            <div className="field">
              <div className="label">Horário</div>
              <input className="input" type="time" value={slotForm.timeHHMM} onChange={(e) => setSlotForm(v => ({...v, timeHHMM: e.target.value}))} />
            </div>

            <div className="field">
              <div className="label">Rótulo</div>
              <input className="input" value={slotForm.label} onChange={(e) => setSlotForm(v => ({...v, label: e.target.value}))} placeholder="Ex: atende pós-almoço" />
            </div>

            <button className="btn" onClick={addSlot}>Adicionar</button>
          </div>

          <div className="slots-box">
            {(!prescriber || isNew) ? (
              <div className="muted">Salve o prescritor para gerenciar horários.</div>
            ) : slots.length === 0 ? (
              <div className="muted">Nenhum horário cadastrado.</div>
            ) : (
              <ul className="slots">
                {slots.map(s => (
                  <li key={s.id} className="row space">
                    <span><b>{dowLabel(s.dayOfWeek)}</b> • {s.timeHHMM} • {Array.isArray(s.weekOfMonth) && s.weekOfMonth.includes("ALL") ? "todas" : `semana(s) ${(s.weekOfMonth||[]).join(", ")}`}</span>
                    <button className="btn-mini" onClick={() => deleteSlot(s.id)}>remover</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function Field({ label, value, onChange }) {
  return (
    <div className="field">
      <div className="label">{label}</div>
      <input className="input" value={value} onChange={onChange} />
    </div>
  )
}