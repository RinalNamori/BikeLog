import { create } from 'zustand';
import type { Motorcycle } from '../types/models';
import * as motoQueries from '../db/queries/motorcycles';

interface MotorcycleState {
  motorcycles: Motorcycle[];
  activeMotorcycleId: number | null;
  isLoading: boolean;
  load: () => Promise<void>;
  add: (data: Omit<Motorcycle, 'id' | 'createdAt' | 'updatedAt'>) => Promise<number>;
  update: (id: number, data: Partial<Omit<Motorcycle, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  remove: (id: number) => Promise<void>;
  setActive: (id: number) => void;
  updateMiles: (id: number, miles: number) => Promise<void>;
  getActive: () => Motorcycle | null;
}

export const useMotorcycleStore = create<MotorcycleState>((set, get) => ({
  motorcycles: [],
  activeMotorcycleId: null,
  isLoading: false,

  load: async () => {
    set({ isLoading: true });
    const motorcycles = await motoQueries.getAllMotorcycles();
    set({ motorcycles, isLoading: false });
    if (motorcycles.length > 0 && !get().activeMotorcycleId) {
      set({ activeMotorcycleId: motorcycles[0].id });
    }
  },

  add: async (data) => {
    const id = await motoQueries.insertMotorcycle(data);
    await get().load();
    set({ activeMotorcycleId: id });
    return id;
  },

  update: async (id, data) => {
    await motoQueries.updateMotorcycle(id, data);
    await get().load();
  },

  remove: async (id) => {
    await motoQueries.deleteMotorcycle(id);
    const remaining = get().motorcycles.filter(m => m.id !== id);
    set({
      motorcycles: remaining,
      activeMotorcycleId: remaining.length > 0 ? remaining[0].id : null,
    });
  },

  setActive: (id) => set({ activeMotorcycleId: id }),

  updateMiles: async (id, miles) => {
    const current = get().motorcycles.find(m => m.id === id);
    if (current && miles > current.currentMiles) {
      await motoQueries.updateMotorcycle(id, { currentMiles: miles });
      await get().load();
    }
  },

  getActive: () => {
    const { motorcycles, activeMotorcycleId } = get();
    return motorcycles.find(m => m.id === activeMotorcycleId) ?? null;
  },
}));
