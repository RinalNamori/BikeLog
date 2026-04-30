import Dexie, { type Table } from 'dexie'
import type { Motorcycle, MaintenanceLog, Part, TaxRecord } from '../types/models'

class BikeLogDB extends Dexie {
  motorcycles!: Table<Motorcycle, number>
  logs!: Table<MaintenanceLog, number>
  parts!: Table<Part, number>
  tax!: Table<TaxRecord, number>

  constructor() {
    super('bikelog')
    this.version(1).stores({
      motorcycles: '++id, createdAt',
      logs: '++id, motorcycleId, date, type',
      parts: '++id, motorcycleId, name',
      tax: '++id, motorcycleId, year',
    })
  }
}

export const db = new BikeLogDB()

export const getAllMotorcycles = () => db.motorcycles.orderBy('createdAt').reverse().toArray()
export const addMotorcycle = (m: Omit<Motorcycle, 'id'>) => db.motorcycles.add(m)
export const updateMotorcycle = (id: number, m: Partial<Motorcycle>) => db.motorcycles.update(id, m)
export const deleteMotorcycle = async (id: number) => {
  await db.transaction('rw', db.motorcycles, db.logs, db.parts, db.tax, async () => {
    await db.logs.where('motorcycleId').equals(id).delete()
    await db.parts.where('motorcycleId').equals(id).delete()
    await db.tax.where('motorcycleId').equals(id).delete()
    await db.motorcycles.delete(id)
  })
}

export const getLogsForBike = (motorcycleId: number) =>
  db.logs.where('motorcycleId').equals(motorcycleId).reverse().sortBy('date')
export const addLog = (l: Omit<MaintenanceLog, 'id'>) => db.logs.add(l)
export const updateLog = (id: number, l: Partial<MaintenanceLog>) => db.logs.update(id, l)
export const deleteLog = (id: number) => db.logs.delete(id)

export const getPartsForBike = (motorcycleId: number) =>
  db.parts.where('motorcycleId').equals(motorcycleId).sortBy('name')
export const addPart = (p: Omit<Part, 'id'>) => db.parts.add(p)
export const updatePart = (id: number, p: Partial<Part>) => db.parts.update(id, p)
export const deletePart = (id: number) => db.parts.delete(id)

export const getTaxForBike = (motorcycleId: number) =>
  db.tax.where('motorcycleId').equals(motorcycleId).reverse().sortBy('year')
export const addTax = (t: Omit<TaxRecord, 'id'>) => db.tax.add(t)
export const updateTax = (id: number, t: Partial<TaxRecord>) => db.tax.update(id, t)
export const deleteTax = (id: number) => db.tax.delete(id)
