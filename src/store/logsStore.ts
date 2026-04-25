import { create } from 'zustand';
import type { MaintenanceLog, MaintenanceType } from '../types/models';
import * as logQueries from '../db/queries/logs';
import type { InsertLogData } from '../db/queries/logs';

interface LogsState {
  logs: MaintenanceLog[];
  isLoading: boolean;
  filterType: MaintenanceType | null;
  load: (motorcycleId: number) => Promise<void>;
  add: (data: InsertLogData) => Promise<number>;
  update: (id: number, data: Partial<InsertLogData>) => Promise<void>;
  remove: (id: number) => Promise<void>;
  setFilterType: (type: MaintenanceType | null) => void;
  getCostSummary: () => { total: number; byCategory: Record<string, number> };
}

export const useLogsStore = create<LogsState>((set, get) => ({
  logs: [],
  isLoading: false,
  filterType: null,

  load: async (motorcycleId) => {
    set({ isLoading: true });
    const logs = await logQueries.getLogsForMotorcycle(motorcycleId);
    set({ logs, isLoading: false });
  },

  add: async (data) => {
    const id = await logQueries.insertLog(data);
    await get().load(data.motorcycleId);
    return id;
  },

  update: async (id, data) => {
    await logQueries.updateLog(id, data);
    const log = get().logs.find(l => l.id === id);
    if (log) await get().load(log.motorcycleId);
  },

  remove: async (id) => {
    const log = get().logs.find(l => l.id === id);
    await logQueries.deleteLog(id);
    if (log) await get().load(log.motorcycleId);
  },

  setFilterType: (type) => set({ filterType: type }),

  getCostSummary: () => {
    const { logs } = get();
    const total = logs.reduce((sum, l) => sum + l.cost, 0);
    const byCategory: Record<string, number> = {};
    for (const log of logs) {
      byCategory[log.type] = (byCategory[log.type] ?? 0) + log.cost;
    }
    return { total, byCategory };
  },
}));
