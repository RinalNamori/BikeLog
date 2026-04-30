import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { useAppStore } from '../store'
import { PageHeader, EmptyState } from '../components/Card'
import { Btn } from '../components/Field'
import { fmt, totalCost, ytdTotal, byCategory } from '../utils/cost'
import { partPercent } from '../utils/mileage'
import { TYPE_LABELS } from '../types/models'

export default function Export() {
  const { activeMotorcycleId } = useAppStore()
  const [busy, setBusy] = useState(false)
  const bike = useLiveQuery(() => activeMotorcycleId ? db.motorcycles.get(activeMotorcycleId) : undefined, [activeMotorcycleId])
  const logs = useLiveQuery(() => activeMotorcycleId ? db.logs.where('motorcycleId').equals(activeMotorcycleId).reverse().sortBy('date') : [], [activeMotorcycleId]) ?? []
  const parts = useLiveQuery(() => activeMotorcycleId ? db.parts.where('motorcycleId').equals(activeMotorcycleId).toArray() : [], [activeMotorcycleId]) ?? []
  const tax = useLiveQuery(() => activeMotorcycleId ? db.tax.where('motorcycleId').equals(activeMotorcycleId).reverse().sortBy('year') : [], [activeMotorcycleId]) ?? []

  const exportPdf = async () => {
    if (!bike) return
    setBusy(true)
    try {
      const generated = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      const cat = byCategory(logs)
      const logRows = logs.map(l => `<tr><td>${l.date}</td><td>${TYPE_LABELS[l.type]}</td><td>${l.miles.toLocaleString()} km</td><td>${l.description}</td><td style="text-align:right">${fmt(l.cost)}</td></tr>`).join('')
      const partRows = parts.map(p => { const pct = partPercent(p, bike.currentMiles); const status = pct >= 1 ? 'OVERDUE' : pct >= 0.85 ? 'Due Soon' : 'OK'; const color = pct >= 1 ? '#f44336' : pct >= 0.85 ? '#ff9800' : '#4caf50'; return `<tr><td>${p.name}</td><td>${p.intervalMiles.toLocaleString()} km</td><td>${p.lastChangedMiles.toLocaleString()} km</td><td style="color:${color};font-weight:bold">${status}</td><td style="text-align:right">${fmt(p.estimatedCost)}</td></tr>` }).join('')
      const taxRows = tax.map(t => `<tr><td>${t.year}</td><td>${t.dueDate}</td><td style="text-align:right">${fmt(t.amount)}</td><td style="color:${t.paid ? '#4caf50' : '#ff9800'}">${t.paid ? 'Paid' : 'Unpaid'}</td></tr>`).join('')
      const catRows = Object.entries(cat).map(([k, v]) => `<tr><td>${(TYPE_LABELS as any)[k] ?? k}</td><td style="text-align:right">${fmt(v)}</td></tr>`).join('')
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;font-size:12px;margin:24px;color:#222}h1{color:#e94560;border-bottom:3px solid #e94560;padding-bottom:6px}h2{color:#333;margin-top:24px;padding-left:8px;border-left:4px solid #e94560}.meta{color:#666;font-size:11px;margin-bottom:20px}.stats{display:flex;gap:12px;flex-wrap:wrap;margin:12px 0}.stat{border:1px solid #ddd;padding:10px;border-radius:6px;min-width:110px}.sl{font-size:10px;color:#888;text-transform:uppercase}.sv{font-size:16px;font-weight:bold;color:#e94560}table{width:100%;border-collapse:collapse;margin-top:8px}th{background:#1a1a2e;color:#fff;padding:7px;text-align:left;font-size:11px}td{border-bottom:1px solid #eee;padding:5px 7px}tr:nth-child(even) td{background:#f9f9f9}</style></head><body><h1>BikeLog — Maintenance Report</h1><p class="meta"><strong>${bike.name}</strong> — ${bike.year} ${bike.make} ${bike.model}<br>Odometer: ${bike.currentMiles.toLocaleString()} km &nbsp;|&nbsp; Generated: ${generated}</p><div class="stats"><div class="stat"><div class="sl">Lifetime Cost</div><div class="sv">${fmt(totalCost(logs))}</div></div><div class="stat"><div class="sl">YTD Cost</div><div class="sv">${fmt(ytdTotal(logs))}</div></div><div class="stat"><div class="sl">Total Entries</div><div class="sv">${logs.length}</div></div></div><h2>Cost by Category</h2><table><thead><tr><th>Category</th><th>Total</th></tr></thead><tbody>${catRows || '<tr><td colspan="2">No data</td></tr>'}</tbody></table><h2>Maintenance History</h2><table><thead><tr><th>Date</th><th>Type</th><th>Odometer</th><th>Description</th><th>Cost</th></tr></thead><tbody>${logRows || '<tr><td colspan="5">No entries</td></tr>'}</tbody></table><h2>Parts Tracker</h2><table><thead><tr><th>Part</th><th>Interval</th><th>Last Changed</th><th>Status</th><th>Est. Cost</th></tr></thead><tbody>${partRows || '<tr><td colspan="5">No parts</td></tr>'}</tbody></table><h2>Tax Records</h2><table><thead><tr><th>Year</th><th>Due Date</th><th>Amount</th><th>Status</th></tr></thead><tbody>${taxRows || '<tr><td colspan="4">No records</td></tr>'}</tbody></table></body></html>`
      const win = window.open('', '_blank'); if (win) { win.document.write(html); win.document.close(); win.focus(); setTimeout(() => win.print(), 500) }
    } finally { setBusy(false) }
  }

  if (!activeMotorcycleId) return <EmptyState icon="🏙️" title="No motorcycle selected" sub="Go to Settings to add one" />
  return (
    <div>
      <PageHeader title="Export" />
      <div className="bg-surface border border-border rounded-xl p-6 flex flex-col items-center gap-4 text-center">
        <span className="text-5xl">📄</span>
        <p className="font-semibold text-on">Generate PDF Report</p>
        <p className="text-sm text-muted max-w-xs">Exports all maintenance logs, parts status, cost breakdown, and tax records for <strong className="text-on">{bike?.name}</strong>. Your browser's print dialog will open — choose "Save as PDF".</p>
        <Btn onClick={exportPdf} disabled={busy}>{busy ? 'Generating…' : '📥 Generate & Print PDF'}</Btn>
      </div>
    </div>
  )
}
