import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { useAppStore } from '../store'
import { StatCard, EmptyState, Card } from '../components/Card'
import { Btn } from '../components/Field'
import { fmt, ytdTotal, totalCost } from '../utils/cost'
import { partPercent, partColor, taxDaysLeft } from '../utils/mileage'
import { TYPE_LABELS, TYPE_EMOJI } from '../types/models'

export default function Dashboard() {
  const nav = useNavigate()
  const { activeMotorcycleId, setActive } = useAppStore()

  const bikes = useLiveQuery(() => db.motorcycles.toArray(), []) ?? []
  const bike = useLiveQuery(
    () => activeMotorcycleId ? db.motorcycles.get(activeMotorcycleId) : undefined,
    [activeMotorcycleId]
  )
  const logs = useLiveQuery(
    () => activeMotorcycleId ? db.logs.where('motorcycleId').equals(activeMotorcycleId).reverse().sortBy('date') : [],
    [activeMotorcycleId]
  ) ?? []
  const parts = useLiveQuery(
    () => activeMotorcycleId ? db.parts.where('motorcycleId').equals(activeMotorcycleId).toArray() : [],
    [activeMotorcycleId]
  ) ?? []
  const taxRecords = useLiveQuery(
    () => activeMotorcycleId ? db.tax.where('motorcycleId').equals(activeMotorcycleId).toArray() : [],
    [activeMotorcycleId]
  ) ?? []

  const ytd = useMemo(() => ytdTotal(logs), [logs])
  const total = useMemo(() => totalCost(logs), [logs])
  const lastLog = logs[0]

  const urgentParts = useMemo(() =>
    parts.filter(p => partPercent(p, bike?.currentMiles ?? 0) >= 0.85),
    [parts, bike]
  )
  const upcomingTax = useMemo(() =>
    taxRecords.filter(t => !t.paid && taxDaysLeft(t.dueDate) <= 60),
    [taxRecords]
  )

  if (bikes.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <EmptyState icon="🏙️" title="Welcome to BikeLog" sub="Add your first motorcycle to get started" />
      <Btn onClick={() => nav('/settings')}>Go to Settings</Btn>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-on">{bike?.name ?? 'BikeLog'}</h1>
          {bike && <p className="text-sm text-muted">{bike.year} {bike.make} {bike.model} · {bike.currentMiles.toLocaleString()} km</p>}
        </div>
        {bikes.length > 1 && (
          <select
            value={activeMotorcycleId ?? ''}
            onChange={e => setActive(Number(e.target.value))}
            className="bg-surfaceV border border-border rounded-lg px-3 py-1.5 text-sm text-on"
          >
            {bikes.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="YTD Cost" value={fmt(ytd)} sub={new Date().getFullYear().toString()} />
        <StatCard label="Lifetime" value={fmt(total)} sub={`${logs.length} entries`} />
        <StatCard label="Alerts" value={(urgentParts.length + upcomingTax.length).toString()} sub="parts + tax" />
        <StatCard label="Last Service" value={lastLog ? lastLog.date.slice(5) : '—'} sub={lastLog ? TYPE_LABELS[lastLog.type] : ''} />
      </div>

      {urgentParts.length > 0 && (
        <Card onClick={() => nav('/parts')}>
          <p className="text-sm font-semibold text-on mb-3">⚠️ Parts Due Soon</p>
          <div className="space-y-2">
            {urgentParts.slice(0, 3).map(p => {
              const pct = partPercent(p, bike?.currentMiles ?? 0)
              return (
                <div key={p.id} className="flex items-center justify-between">
                  <span className="text-sm text-on">{p.name}</span>
                  <span className={`text-xs font-bold ${partColor(pct)}`}>
                    {pct >= 1 ? 'OVERDUE' : `${Math.round(pct * 100)}%`}
                  </span>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {upcomingTax.length > 0 && (
        <Card onClick={() => nav('/tax')}>
          <p className="text-sm font-semibold text-on mb-3">💴 Tax Due Soon</p>
          <div className="space-y-2">
            {upcomingTax.slice(0, 2).map(t => (
              <div key={t.id} className="flex items-center justify-between">
                <span className="text-sm text-on">Vehicle Tax {t.year}</span>
                <span className="text-sm font-bold text-warn">{fmt(t.amount)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {logs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-on">Recent Maintenance</p>
            <button onClick={() => nav('/logs')} className="text-xs text-accent hover:underline">View all</button>
          </div>
          <div className="space-y-2">
            {logs.slice(0, 4).map(l => (
              <div key={l.id} className="flex items-center justify-between bg-surface border border-border rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <span>{TYPE_EMOJI[l.type]}</span>
                  <div>
                    <p className="text-sm text-on">{TYPE_LABELS[l.type]}</p>
                    <p className="text-xs text-muted">{l.date}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-accent">{fmt(l.cost)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {logs.length === 0 && (
        <EmptyState icon="📝" title="No logs yet" sub="Go to History to add your first maintenance record" />
      )}

      <button
        onClick={() => nav('/logs')}
        className="fixed bottom-20 md:bottom-6 right-6 w-14 h-14 bg-accent text-white rounded-full text-2xl shadow-lg hover:bg-accent/90 transition-colors flex items-center justify-center"
      >
        +
      </button>
    </div>
  )
}
