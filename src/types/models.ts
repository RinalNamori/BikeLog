export type MaintenanceType =
  | 'oil'
  | 'tire'
  | 'chain'
  | 'brake'
  | 'filter'
  | 'battery'
  | 'repair'
  | 'inspection'
  | 'other';

export const MAINTENANCE_TYPE_LABELS: Record<MaintenanceType, string> = {
  oil: 'Oil Change',
  tire: 'Tire',
  chain: 'Chain',
  brake: 'Brake',
  filter: 'Filter',
  battery: 'Battery',
  repair: 'Repair',
  inspection: 'Inspection',
  other: 'Other',
};

export const MAINTENANCE_TYPE_ICONS: Record<MaintenanceType, string> = {
  oil: 'oil',
  tire: 'circle-outline',
  chain: 'link-variant',
  brake: 'car-brake-alert',
  filter: 'air-filter',
  battery: 'battery',
  repair: 'wrench',
  inspection: 'clipboard-check',
  other: 'tools',
};

export interface Motorcycle {
  id: number;
  name: string;
  make: string;
  model: string;
  year: number;
  currentMiles: number;
  purchaseDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LogPart {
  id: number;
  logId: number;
  name: string;
  cost: number;
  quantity: number;
}

export interface MaintenanceLog {
  id: number;
  motorcycleId: number;
  type: MaintenanceType;
  date: string;
  miles: number;
  description: string;
  cost: number;
  voiceNote: string | null;
  parts: LogPart[];
  createdAt: string;
  updatedAt: string;
}

export interface Part {
  id: number;
  motorcycleId: number;
  name: string;
  changeIntervalMiles: number;
  lastChangedMiles: number;
  lastChangedDate: string | null;
  estimatedCost: number;
  notificationEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaxRecord {
  id: number;
  motorcycleId: number;
  year: number;
  amount: number;
  dueDate: string;
  paid: boolean;
  paidDate: string | null;
  notificationId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CostSummary {
  total: number;
  byCategory: Record<MaintenanceType, number>;
  byMonth: Array<{ month: string; total: number }>;
}
