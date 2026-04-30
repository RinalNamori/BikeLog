import type { Part } from '../types/models'

export const partPercent = (part: Part, currentMiles: number) =>
  Math.min((currentMiles - part.lastChangedMiles) / part.intervalMiles, 1)

export const partColor = (pct: number) =>
  pct >= 1 ? 'text-danger' : pct >= 0.85 ? 'text-warn' : 'text-ok'

export const partBg = (pct: number) =>
  pct >= 1 ? 'bg-danger' : pct >= 0.85 ? 'bg-warn' : 'bg-ok'

export const taxDaysLeft = (dueDate: string) =>
  Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000)
