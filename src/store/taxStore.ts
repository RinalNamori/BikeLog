import { create } from 'zustand';
import type { TaxRecord } from '../types/models';
import * as taxQueries from '../db/queries/tax';

interface TaxState {
  records: TaxRecord[];
  isLoading: boolean;
  load: (motorcycleId: number) => Promise<void>;
  add: (data: Omit<TaxRecord, 'id' | 'createdAt' | 'updatedAt'>) => Promise<number>;
  update: (id: number, data: Partial<Omit<TaxRecord, 'id' | 'motorcycleId' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  remove: (id: number) => Promise<void>;
  markPaid: (id: number) => Promise<void>;
}

export const useTaxStore = create<TaxState>((set, get) => ({
  records: [],
  isLoading: false,

  load: async (motorcycleId) => {
    set({ isLoading: true });
    const records = await taxQueries.getTaxRecordsForMotorcycle(motorcycleId);
    set({ records, isLoading: false });
  },

  add: async (data) => {
    const id = await taxQueries.insertTaxRecord(data);
    await get().load(data.motorcycleId);
    return id;
  },

  update: async (id, data) => {
    await taxQueries.updateTaxRecord(id, data);
    const rec = get().records.find(r => r.id === id);
    if (rec) await get().load(rec.motorcycleId);
  },

  remove: async (id) => {
    const rec = get().records.find(r => r.id === id);
    await taxQueries.deleteTaxRecord(id);
    if (rec) await get().load(rec.motorcycleId);
  },

  markPaid: async (id) => {
    const today = new Date().toISOString().split('T')[0];
    await taxQueries.updateTaxRecord(id, { paid: true, paidDate: today });
    const rec = get().records.find(r => r.id === id);
    if (rec) await get().load(rec.motorcycleId);
  },
}));
