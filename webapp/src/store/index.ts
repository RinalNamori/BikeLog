import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
  activeMotorcycleId: number | null
  setActive: (id: number | null) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeMotorcycleId: null,
      setActive: (id) => set({ activeMotorcycleId: id }),
    }),
    { name: 'bikelog-app' }
  )
)
