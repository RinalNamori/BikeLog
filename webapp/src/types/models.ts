export type MaintenanceType =
  | 'oil' | 'tire' | 'chain' | 'brake'
  | 'filter' | 'battery' | 'repair' | 'inspection' | 'other'

export const TYPE_LABELS: Record<MaintenanceType, string> = {
  oil: 'Oil Change', tire: 'Tire', chain: 'Chain', brake: 'Brake',
  filter: 'Filter', battery: 'Battery', repair: 'Repair',
  inspection: 'Inspection', other: 'Other',
}

export const TYPE_EMOJI: Record<MaintenanceType, string> = {
  oil: '🗳️', tire: '⭕', chain: '⛓️', brake: '🔴',
  filter: '🌀', battery: '🔋', repair: '🔧',
  inspection: '📋', other: '🔩',
}

export interface Motorcycle {
  id?: number
  name: string
  make: string
  model: string
  year: number
  currentMiles: number
  purchaseDate?: string
  createdAt: string
}

export interface MaintenanceLog {
  id?: number
  motorcycleId: number
  type: MaintenanceType
  date: string
  miles: number
  description: string
  cost: number
  createdAt: string
}

export interface Part {
  id?: number
  motorcycleId: number
  name: string
  intervalMiles: number
  lastChangedMiles: number
  lastChangedDate?: string
  estimatedCost: number
  createdAt: string
}

export interface TaxRecord {
  id?: number
  motorcycleId: number
  year: number
  amount: number
  dueDate: string
  paid: boolean
  paidDate?: string
  createdAt: string
}
