import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, addPart, updatePart, deletePart } from '../db/db'
import { useAppStore } from '../store'
import { PageHeader, EmptyState, Card } from '../components/Card'
import { Field, Btn } from '../components/Field'
import Modal from '../components/Modal'
import { fmt } from '../utils/cost'
import { partPercent, partColor, partBg } from '../utils/mileage'
import type { Part } from '../types/models'

const EMPTY = { name: '', intervalMiles: '', lastChangedMiles: '', lastChangedDate: '', estimatedCost: '' }

export default function Parts() {
  const { activeMotorcycleId } = useAppStore()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Part | null>(null)
  const [form, setForm] = useState(EMPTY)

  const bike = useLiveQuery(
    () => activeMotorcycleId ? db.motorcycles.get(activeMotorcycleId) : undefined,
    [activeMotorcycleId]
  )
  const parts = useLiveQuery(
    () => activeMotorcycleId ? db.parts.where('motorcycleId').equals(activeMotorcycleId).sortBy('name') : [],
    [activeMotorcycleId]
  ) ?? []

  const openAdd = () => { setEditing(null); setForm(EMPTY); setOpen(true) }
  const openEdit = (p: Part) => {
    setEditing(p)
    setForm({ name: p.name, intervalMiles: p.intervalMiles.toString(), lastChangedMiles: p.lastChangedMiles.toString(), lastChangedDate: p.lastChangedDate ?? '', estimatedCost: p.estimatedCost.toString() })
    setOpen(true)
  }

  const save = async () => {
    if (!activeMotorcycleId || !form.name.trim()) return
    const data = { motorcycleId: activeMotorcycleId, name: form.name.trim(), intervalMiles: Number(form.intervalMiles) || 3000, lastChangedMiles: Number(form.lastChangedMiles) || 0, lastChangedDate: form.lastChangedDate || undefined, estimatedCost: Number(form.estimatedCost) || 0 }
    if (editing?.id) { await updatePart(editing.id, data) } else { await addPart({ ...data, createdAt: new Date().toISOString() }) }
    setOpen(false)
  }

  const del = async (p: Part) => { if (confirm(`Delete "${p.name}"?`)) await deletePart(p.id!) }
  const f = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(prev => ({ ...prev, [k]: e.target.value }))
  const currentMiles = bike?.currentMiles ?? 0

  if (!activeMotorcycleId) return <EmptyState icon="🏙️" title="No motorcycle selected" sub="Go to Settings to add one" />

  return (
    <div>
      <PageHeader title="Parts Tracker" action={<Btn onClick={openAdd}>+ Add Part</Btn>} />
      {parts.length === 0 ? (
        <EmptyState icon="⚙️" title="No parts tracked" sub="Add parts to monitor their change cycles" />
      ) : (
        <div className="space-y-3">
          {parts.map(p => {
            const pct = partPercent(p, currentMiles)
            const milesLeft = Math.max(p.intervalMiles - (currentMiles - p.lastChangedMiles), 0)
            return (
              <Card key={p.id} onClick={() => openEdit(p)}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-on">{p.name}</p>
                    <p className="text-xs text-muted">Every {p.intervalMiles.toLocaleString()} km · Est. {fmt(p.estimatedCost)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${partColor(pct)}`}>{pct >= 1 ? 'OVERDUE' : `${milesLeft.toLocaleString()} km left`}</span>
                    <button onClick={e => { e.stopPropagation(); del(p) }} className="text-xs text-danger hover:underline">✕</button>
                  </div>
                </div>
                <div className="h-2 bg-surfaceV rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${partBg(pct)}`} style={{ width: `${Math.round(pct * 100)}%` }} />
                </div>
                <p className="text-xs text-muted mt-1">{Math.round(pct * 100)}% of interval used</p>
              </Card>
            )
          })}
        </div>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Part' : 'Add Part'}>
        <Field label="Part Name" value={form.name} onChange={f('name')} placeholder="Engine Oil" />
        <Field label="Change Interval (km)" type="number" value={form.intervalMiles} onChange={f('intervalMiles')} placeholder="3000" />
        <Field label="Last Changed At (km)" type="number" value={form.lastChangedMiles} onChange={f('lastChangedMiles')} placeholder="0" />
        <Field label="Last Changed Date" type="date" value={form.lastChangedDate} onChange={f('lastChangedDate')} />
        <Field label="Estimated Cost (¥)" type="number" value={form.estimatedCost} onChange={f('estimatedCost')} placeholder="0" />
        <div className="flex gap-2 pt-2">
          <Btn className="flex-1" onClick={save}>{editing ? 'Update' : 'Add'}</Btn>
          <Btn variant="ghost" onClick={() => setOpen(false)}>Cancel</Btn>
        </div>
      </Modal>
    </div>
  )
}
