import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, addMotorcycle, updateMotorcycle, deleteMotorcycle } from '../db/db'
import { useAppStore } from '../store'
import { PageHeader, Card } from '../components/Card'
import { Field, Btn } from '../components/Field'
import Modal from '../components/Modal'
import type { Motorcycle } from '../types/models'

const EMPTY = { name: '', make: '', model: '', year: new Date().getFullYear(), currentMiles: 0 }

export default function Settings() {
  const bikes = useLiveQuery(() => db.motorcycles.toArray(), []) ?? []
  const { activeMotorcycleId, setActive } = useAppStore()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Motorcycle | null>(null)
  const [form, setForm] = useState(EMPTY)

  const openAdd = () => { setEditing(null); setForm(EMPTY); setOpen(true) }
  const openEdit = (b: Motorcycle) => { setEditing(b); setForm({ name: b.name, make: b.make, model: b.model, year: b.year, currentMiles: b.currentMiles }); setOpen(true) }

  const save = async () => {
    if (!form.name.trim()) return
    const data = { ...form, year: +form.year, currentMiles: +form.currentMiles }
    if (editing?.id) { await updateMotorcycle(editing.id, data) }
    else { const id = await addMotorcycle({ ...data, createdAt: new Date().toISOString() }); setActive(id as number) }
    setOpen(false)
  }

  const del = async (b: Motorcycle) => {
    if (!confirm(`Delete "${b.name}" and all its data?`)) return
    await deleteMotorcycle(b.id!)
    if (activeMotorcycleId === b.id) setActive(bikes.find(x => x.id !== b.id)?.id ?? null)
  }

  const f = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(prev => ({ ...prev, [k]: e.target.value }))

  return (
    <div>
      <PageHeader title="Settings" action={<Btn onClick={openAdd}>+ Add Motorcycle</Btn>} />
      <div className="space-y-3">
        {bikes.map(b => (
          <Card key={b.id}>
            <div className="flex items-center gap-3">
              <button onClick={() => setActive(b.id!)} className={`w-5 h-5 rounded-full border-2 shrink-0 transition-colors ${activeMotorcycleId === b.id ? 'bg-accent border-accent' : 'border-border'}`} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-on">{b.name}</p>
                <p className="text-sm text-muted">{b.year} {b.make} {b.model} · {b.currentMiles.toLocaleString()} km</p>
              </div>
              <div className="flex gap-2">
                <Btn variant="ghost" onClick={() => openEdit(b)}>Edit</Btn>
                <Btn variant="danger" onClick={() => del(b)}>Delete</Btn>
              </div>
            </div>
          </Card>
        ))}
        {bikes.length === 0 && <p className="text-muted text-sm text-center py-8">No motorcycles yet. Add one to get started.</p>}
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Motorcycle' : 'Add Motorcycle'}>
        <Field label="Name (e.g. My CBR)" value={form.name} onChange={f('name')} placeholder="My Bike" />
        <Field label="Make" value={form.make} onChange={f('make')} placeholder="Honda" />
        <Field label="Model" value={form.model} onChange={f('model')} placeholder="CBR600RR" />
        <Field label="Year" type="number" value={form.year} onChange={f('year')} />
        <Field label="Current Odometer (km)" type="number" value={form.currentMiles} onChange={f('currentMiles')} />
        <div className="flex gap-2 pt-2">
          <Btn className="flex-1" onClick={save}>{editing ? 'Update' : 'Add'}</Btn>
          <Btn variant="ghost" onClick={() => setOpen(false)}>Cancel</Btn>
        </div>
      </Modal>
    </div>
  )
}
