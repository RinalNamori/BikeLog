import { create } from 'zustand';
import type { Part } from '../types/models';
import * as partQueries from '../db/queries/parts';

interface PartsState {
  parts: Part[];
  isLoading: boolean;
  load: (motorcycleId: number) => Promise<void>;
  add: (data: Omit<Part, 'id' | 'createdAt' | 'updatedAt'>) => Promise<number>;
  update: (id: number, data: Partial<Omit<Part, 'id' | 'motorcycleId' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  remove: (id: number) => Promise<void>;
  getPartStatus: (part: Part, currentMiles: number) => { percent: number; milesUntilDue: number; isDue: boolean };
}

export const usePartsStore = create<PartsState>((set, get) => ({
  parts: [],
  isLoading: false,

  load: async (motorcycleId) => {
    set({ isLoading: true });
    const parts = await partQueries.getPartsForMotorcycle(motorcycleId);
    set({ parts, isLoading: false });
  },

  add: async (data) => {
    const id = await partQueries.insertPart(data);
    await get().load(data.motorcycleId);
    return id;
  },

  update: async (id, data) => {
    await partQueries.updatePart(id, data);
    const part = get().parts.find(p => p.id === id);
    if (part) await get().load(part.motorcycleId);
  },

  remove: async (id) => {
    const part = get().parts.find(p => p.id === id);
    await partQueries.deletePart(id);
    if (part) await get().load(part.motorcycleId);
  },

  getPartStatus: (part, currentMiles) => {
    const milesSinceChange = currentMiles - part.lastChangedMiles;
    const percent = Math.min(milesSinceChange / part.changeIntervalMiles, 1);
    const milesUntilDue = Math.max(part.changeIntervalMiles - milesSinceChange, 0);
    const isDue = milesSinceChange >= part.changeIntervalMiles;
    return { percent, milesUntilDue, isDue };
  },
}));
