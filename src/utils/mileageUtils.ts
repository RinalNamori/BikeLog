import type { MaintenanceLog, Part } from '../types/models';

export function computeAvgDailyMiles(logs: MaintenanceLog[]): number {
  const withMiles = logs.filter(l => l.miles > 0).sort((a, b) => a.date.localeCompare(b.date));
  if (withMiles.length < 2) return 30;

  const first = withMiles[0];
  const last = withMiles[withMiles.length - 1];
  const days = Math.max(
    (new Date(last.date).getTime() - new Date(first.date).getTime()) / (1000 * 60 * 60 * 24),
    1
  );
  return Math.max((last.miles - first.miles) / days, 1);
}

export function estimateDaysUntilDue(part: Part, currentMiles: number, avgDailyMiles: number): number {
  const dueAtMiles = part.lastChangedMiles + part.changeIntervalMiles;
  const milesLeft = dueAtMiles - currentMiles;
  if (milesLeft <= 0) return 0;
  return Math.ceil(milesLeft / avgDailyMiles);
}

export function getPartStatusColor(percent: number): string {
  if (percent >= 1.0) return '#f44336';
  if (percent >= 0.85) return '#ff9800';
  return '#4caf50';
}
