import type { MaintenanceLog } from '../types/models'

export const fmt = (n: number) => `¥${Math.round(n).toLocaleString()}`

export const ytdTotal = (logs: MaintenanceLog[]) => {
  const year = new Date().getFullYear().toString()
  return logs.filter(l => l.date.startsWith(year)).reduce((s, l) => s + l.cost, 0)
}

export const totalCost = (logs: MaintenanceLog[]) => logs.reduce((s, l) => s + l.cost, 0)

export const byCategory = (logs: MaintenanceLog[]) => {
  const map: Record<string, number> = {}
  for (const l of logs) map[l.type] = (map[l.type] ?? 0) + l.cost
  return map
}

export const byMonth = (logs: MaintenanceLog[]) => {
  const map: Record<string, number> = {}
  for (const l of logs) {
    const m = l.date.slice(0, 7)
    map[m] = (map[m] ?? 0) + l.cost
  }
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({ month: month.slice(5), total }))
}
