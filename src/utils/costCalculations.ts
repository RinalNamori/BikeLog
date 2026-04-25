import type { MaintenanceLog, MaintenanceType, CostSummary } from '../types/models';

export function computeCostSummary(logs: MaintenanceLog[]): CostSummary {
  const total = logs.reduce((sum, l) => sum + l.cost, 0);

  const byCategory = {} as Record<MaintenanceType, number>;
  for (const log of logs) {
    byCategory[log.type] = (byCategory[log.type] ?? 0) + log.cost;
  }

  const monthMap: Record<string, number> = {};
  for (const log of logs) {
    const month = log.date.slice(0, 7);
    monthMap[month] = (monthMap[month] ?? 0) + log.cost;
  }
  const byMonth = Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({ month, total }));

  return { total, byCategory, byMonth };
}

export function computeCostPerMile(logs: MaintenanceLog[], totalMiles: number): number {
  if (totalMiles <= 0) return 0;
  const total = logs.reduce((sum, l) => sum + l.cost, 0);
  return total / totalMiles;
}

export function computeYtdTotal(logs: MaintenanceLog[]): number {
  const year = new Date().getFullYear().toString();
  return logs
    .filter(l => l.date.startsWith(year))
    .reduce((sum, l) => sum + l.cost, 0);
}

export function formatCurrency(amount: number): string {
  return `¥${Math.round(amount).toLocaleString()}`;
}
