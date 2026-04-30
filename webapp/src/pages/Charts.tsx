import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts'
import { db } from '../db/db'
import { useAppStore } from '../store'
import { PageHeader, EmptyState, Card } from '../components/Card'
import { fmt, byMonth, byCategory, totalCost } from '../utils/cost'
import { TYPE_LABELS } from '../types/models'

const PIE_COLORS = ['#e94560','#2196f3','#4caf50','#ff9800','#9c27b0','#00bcd4','#f44336','#795548','#607d8b']

export default function Charts() {
  const { activeMotorcycleId } = useAppStore()
  const logs = useLiveQuery(
    () => activeMotorcycleId ? db.logs.where('motorcycleId').equals(activeMotorcycleId).toArray() : [],
    [activeMotorcycleId]
  ) ?? []

  const monthData = useMemo(() => byMonth(logs).slice(-12), [logs])
  const catData = useMemo(() =>
    Object.entries(byCategory(logs)).filter(([, v]) => v > 0).sort(([, a], [, b]) => b - a)
      .map(([k, v]) => ({ name: (TYPE_LABELS as any)[k] ?? k, value: v })),
    [logs]
  )
  const total = useMemo(() => totalCost(logs), [logs])

  if (!activeMotorcycleId) return <EmptyState icon="🏙️" title="No motorcycle selected" sub="Go to Settings to add one" />
  if (logs.length === 0) return <EmptyState icon="📈" title="No data yet" sub="Add maintenance logs to see charts" />

  return (
    <div className="space-y-6">
      <PageHeader title="Charts" />
      <Card>
        <p className="text-sm font-semibold text-on mb-4">Monthly Costs (last 12 months)</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <XAxis dataKey="month" tick={{ fill: '#8899aa', fontSize: 11 }} />
            <YAxis tick={{ fill: '#8899aa', fontSize: 11 }} tickFormatter={v => `¥${Math.round(v / 1000)}k`} />
            <Tooltip contentStyle={{ background: '#16213e', border: '1px solid #2a3a55', borderRadius: 8 }} labelStyle={{ color: '#e8e8e8' }} formatter={(v: number) => [fmt(v), 'Cost']} />
            <Bar dataKey="total" radius={[4, 4, 0, 0]}>
              {monthData.map((_, i) => <Cell key={i} fill="#e94560" />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <Card>
        <p className="text-sm font-semibold text-on mb-4">Cost by Category</p>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={catData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }: any) => `${name} ${Math.round(percent * 100)}%`} labelLine={false} fontSize={11}>
              {catData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ background: '#16213e', border: '1px solid #2a3a55', borderRadius: 8 }} formatter={(v: number) => [fmt(v), 'Cost']} />
          </PieChart>
        </ResponsiveContainer>
      </Card>
      <Card>
        <p className="text-sm font-semibold text-on mb-4">Summary</p>
        <div className="grid grid-cols-3 gap-3">
          {[{ label: 'Lifetime', value: fmt(total) }, { label: 'Entries', value: logs.length.toString() }, { label: 'Avg/Entry', value: fmt(logs.length > 0 ? total / logs.length : 0) }].map(s => (
            <div key={s.label} className="bg-surfaceV rounded-lg p-3 text-center">
              <p className="text-xs text-muted">{s.label}</p>
              <p className="text-base font-bold text-accent mt-1">{s.value}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
