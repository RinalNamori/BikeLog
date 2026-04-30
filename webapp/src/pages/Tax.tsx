import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, addTax, updateTax, deleteTax } from '../db/db'
import { useAppStore } from '../store'
import { PageHeader, EmptyState, Card } from '../components/Card'
import { Field, Btn } from '../components/Field'
import Modal from '../components/Modal'
import { fmt } from '../utils/cost'
import { taxDaysLeft } from '../utils/mileage'
import type { TaxRecord } from '../types/models'

const EMPTY = { year: new Date().getFullYear().toString(), amount: '', dueDate: '' }

export default function Tax() {
  const { activeMotorcycleId } = useAppStore()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<TaxRecord | null>(null)
  const [form, setForm] = useState(EMPTY)

  const records = useLiveQuery(
    () => activeMotorcycleId ? db.tax.where('motorcycleId').equals(activeMotorcycleId).reverse().sortBy('year') : [],
    [activeMotorcycleId]
  ) ?? []

  const unpaidTotal = records.filter(r => !r.paid).reduce((s, r) => s + r.amount, 0)

  const openAdd = () => { setEditing(null); setForm(EMPTY); setOpen(true) }
  const openEdit = (r: TaxRecord) => { setEditing(r); setForm({ year: r.year.toString(), amount: r.amount.toString(), dueDate: r.dueDate }); setOpen(true) }

  const save = async () => {
    if (!activeMotorcycleId || !form.dueDate) return
    const data = { motorcycleId: activeMotorcycleId, year: Number(form.year), amount: Number(form.amount) || 0, dueDate: form.dueDate, paid: editing?.paid ?? false, paidDate: editing?.paidDate }
    if (editing?.id) { await updateTax(editing.id, data) } else { await addTax({ ...data, createdAt: new Date().toISOString() }) }
    setOpen(false)
  }

  const togglePaid = async (r: TaxRecord) => { await updateTax(r.id!, { paid: !r.paid, paidDate: !r.paid ? new Date().toISOString().slice(0, 10) : undefined }) }
  const del = async (r: TaxRecord) => { if (confirm(`Delete ${r.year} tax record?`)) await deleteTax(r.id!) }
  const f = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(prev => ({ ...prev, [k]: e.target.value }))

  if (!activeMotorcycleId) return <EmptyState icon="🏙️" title="No motorcycle selected" sub="Go to Settings to add one" />

  return (
    <div>
      <PageHeader title="Vehicle Tax" action={<Btn onClick={openAdd}>+ Add Record</Btn>} />
      {unpaidTotal > 0 && (
        <div className="bg-warn/10 border border-warn/30 rounded-xl px-4 py-3 mb-4 flex justify-between items-center">
          <span className="text-sm text-warn font-medium">Unpaid tax total</span>
          <span className="font-bold text-warn">{fmt(unpaidTotal)}</span>
        </div>
      )}
      {records.length === 0 ? (
        <EmptyState icon="💴" title="No tax records" sub="Add annual vehicle tax records here" />
      ) : (
        <div className="space-y-3">
          {records.map(r => {
            const days = taxDaysLeft(r.dueDate)
            const urgent = !r.paid && days <= 60
            return (
              <Card key={r.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-on">{r.year} Tax</span>
                      {r.paid ? <span className="text-xs bg-ok/20 text-ok px-2 py-0.5 rounded-full">Paid</span>
                        : urgent ? <span className="text-xs bg-warn/20 text-warn px-2 py-0.5 rounded-full">{days}d left</span>
                        : <span className="text-xs bg-surfaceV text-muted px-2 py-0.5 rounded-full">Unpaid</span>}
                    </div>
                    <p className="text-sm text-muted">Due: {r.dueDate}</p>
                    {r.paid && r.paidDate && <p className="text-xs text-muted">Paid: {r.paidDate}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="font-bold text-accent">{fmt(r.amount)}</span>
                    <div className="flex gap-2">
                      <button onClick={() => togglePaid(r)} className="text-xs text-info hover:underline">{r.paid ? 'Unmark' : 'Mark Paid'}</button>
                      <button onClick={() => openEdit(r)} className="text-xs text-muted hover:text-on">Edit</button>
                      <button onClick={() => del(r)} className="text-xs text-danger hover:underline">Delete</button>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Tax Record' : 'Add Tax Record'}>
        <Field label="Year" type="number" value={form.year} onChange={f('year')} />
        <Field label="Amount (¥)" type="number" value={form.amount} onChange={f('amount')} placeholder="0" />
        <Field label="Due Date" type="date" value={form.dueDate} onChange={f('dueDate')} />
        <div className="flex gap-2 pt-2">
          <Btn className="flex-1" onClick={save}>{editing ? 'Update' : 'Add'}</Btn>
          <Btn variant="ghost" onClick={() => setOpen(false)}>Cancel</Btn>
        </div>
      </Modal>
    </div>
  )
}
