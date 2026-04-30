import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, addLog, deleteLog } from '../db/db'
import { useAppStore } from '../store'
import { PageHeader, EmptyState, Card } from '../components/Card'
import { Field, Select, Btn } from '../components/Field'
import Modal from '../components/Modal'
import { fmt } from '../utils/cost'
import { TYPE_LABELS, TYPE_EMOJI, type MaintenanceType } from '../types/models'

const TYPES = Object.keys(TYPE_LABELS) as MaintenanceType[]
const EMPTY = { type: 'oil' as MaintenanceType, date: new Date().toISOString().slice(0, 10), miles: '', description: '', cost: '' }

export default function Logs() {
  const { activeMotorcycleId } = useAppStore()
  const [filter, setFilter] = useState<MaintenanceType | 'all'>('all')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)

  const logs = useLiveQuery(
    () => activeMotorcycleId ? db.logs.where('motorcycleId').equals(activeMotorcycleId).reverse().sortBy('date') : [],
    [activeMotorcycleId]
  ) ?? []

  const visible = filter === 'all' ? logs : logs.filter(l => l.type === filter)

  const save = async () => {
    if (!activeMotorcycleId || !form.date) return
    await addLog({
      motorcycleId: activeMotorcycleId,
      type: form.type,
      date: form.date,
      miles: Number(form.miles) || 0,
      description: form.description,
      cost: Number(form.cost) || 0,
      createdAt: new Date().toISOString(),
    })
    setOpen(false)
    setForm(EMPTY)
  }

  const del = async (id: number) => {
    if (confirm('Delete this log entry?')) await deleteLog(id)
  }

  const f = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  if (!activeMotorcycleId) return (
    <EmptyState icon="🏙️" title="No motorcycle selected" sub="Go to Settings to add one" />
  )

  return (
    <div>
      <PageHeader title="Maintenance History" action={<Btn onClick={() => setOpen(true)}>+ New Log</Btn>} />

      <div className="flex gap-2 flex-wrap mb-4">
        {(['all', ...TYPES] as const).map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === t ? 'bg-accent text-white' : 'bg-surfaceV text-muted hover:text-on'
            }`}
          >
            {t === 'all' ? 'All' : TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState icon="📝" title="No logs yet" sub="Tap + New Log to record your first maintenance" />
      ) : (
        <div className="space-y-3">
          {visible.map(log => (
            <Card key={log.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span>{TYPE_EMOJI[log.type]}</span>
                    <span className="text-xs bg-surfaceV text-muted px-2 py-0.5 rounded-full">
                      {TYPE_LABELS[log.type]}
                    </span>
                  </div>
                  <p className="text-sm text-on truncate">{log.description || '—'}</p>
                  <p className="text-xs text-muted mt-1">{log.date} · {log.miles.toLocaleString()} km</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-accent font-bold">{fmt(log.cost)}</span>
                  <button onClick={() => del(log.id!)} className="text-xs text-danger hover:underline">Delete</button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New Maintenance Log">
        <Select label="Type" value={form.type} onChange={f('type') as any}>
          {TYPES.map(t => <option key={t} value={t}>{TYPE_EMOJI[t]} {TYPE_LABELS[t]}</option>)}
        </Select>
        <Field label="Date" type="date" value={form.date} onChange={f('date')} />
        <Field label="Odometer (km)" type="number" value={form.miles} onChange={f('miles')} placeholder="0" />
        <Field label="Description" value={form.description} onChange={f('description')} placeholder="e.g. Castrol 10W-40" />
        <Field label="Cost (¥)" type="number" value={form.cost} onChange={f('cost')} placeholder="0" />
        <div className="flex gap-2 pt-2">
          <Btn className="flex-1" onClick={save}>Save</Btn>
          <Btn variant="ghost" onClick={() => setOpen(false)}>Cancel</Btn>
        </div>
      </Modal>
    </div>
  )
}
