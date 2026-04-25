import type { Motorcycle, MaintenanceLog, Part, TaxRecord } from '../types/models';
import { MAINTENANCE_TYPE_LABELS } from '../types/models';
import { formatCurrency } from './costCalculations';

export function buildPdfHtml(params: {
  motorcycle: Motorcycle;
  logs: MaintenanceLog[];
  parts: Part[];
  taxRecords: TaxRecord[];
}): string {
  const { motorcycle, logs, parts, taxRecords } = params;
  const generatedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const totalCost = logs.reduce((s, l) => s + l.cost, 0);
  const ytdCost = logs
    .filter(l => l.date.startsWith(new Date().getFullYear().toString()))
    .reduce((s, l) => s + l.cost, 0);

  const logRows = logs.map(l => `
    <tr>
      <td>${l.date}</td>
      <td>${MAINTENANCE_TYPE_LABELS[l.type]}</td>
      <td>${l.miles.toLocaleString()} km</td>
      <td>${l.description}</td>
      <td class="cost">${formatCurrency(l.cost)}</td>
    </tr>
  `).join('');

  const partRows = parts.map(p => {
    const pct = Math.min((p.lastChangedMiles / p.changeIntervalMiles) * 100, 100);
    const status = pct >= 100 ? 'overdue' : pct >= 85 ? 'warning' : 'ok';
    return `<tr>
      <td>${p.name}</td>
      <td>${p.changeIntervalMiles.toLocaleString()} km</td>
      <td>${p.lastChangedMiles.toLocaleString()} km</td>
      <td class="${status}">${status === 'overdue' ? 'OVERDUE' : status === 'warning' ? 'Due Soon' : 'OK'}</td>
      <td class="cost">${formatCurrency(p.estimatedCost)}</td>
    </tr>`;
  }).join('');

  const taxRows = taxRecords.map(t => `
    <tr>
      <td>${t.year}</td>
      <td>${t.dueDate}</td>
      <td class="cost">${formatCurrency(t.amount)}</td>
      <td class="${t.paid ? 'ok' : 'warning'}">${t.paid ? 'Paid' : 'Unpaid'}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: Arial, sans-serif; font-size: 12px; margin: 20px; color: #222; background: #fff; }
  h1 { color: #e94560; border-bottom: 3px solid #e94560; padding-bottom: 6px; }
  h2 { color: #333; margin-top: 24px; border-left: 4px solid #e94560; padding-left: 8px; }
  .meta { color: #666; font-size: 11px; margin-bottom: 20px; }
  .summary { display: flex; gap: 16px; margin: 12px 0; flex-wrap: wrap; }
  .stat { border: 1px solid #ddd; padding: 12px; border-radius: 6px; min-width: 120px; }
  .stat-label { font-size: 10px; color: #888; text-transform: uppercase; }
  .stat-value { font-size: 18px; font-weight: bold; color: #e94560; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th { background: #1a1a2e; color: white; padding: 8px; text-align: left; font-size: 11px; }
  td { border-bottom: 1px solid #eee; padding: 6px 8px; }
  tr:nth-child(even) td { background: #f9f9f9; }
  .cost { text-align: right; font-weight: bold; }
  .overdue { color: #d32f2f; font-weight: bold; }
  .warning { color: #e65100; font-weight: bold; }
  .ok { color: #2e7d32; }
  footer { margin-top: 40px; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 8px; }
</style>
</head>
<body>
<h1>BikeLog — Maintenance Report</h1>
<p class="meta">
  <strong>${motorcycle.name}</strong> — ${motorcycle.year} ${motorcycle.make} ${motorcycle.model}<br>
  Current odometer: ${motorcycle.currentMiles.toLocaleString()} km &nbsp;|&nbsp; Generated: ${generatedDate}
</p>

<div class="summary">
  <div class="stat"><div class="stat-label">Lifetime Cost</div><div class="stat-value">${formatCurrency(totalCost)}</div></div>
  <div class="stat"><div class="stat-label">YTD Cost</div><div class="stat-value">${formatCurrency(ytdCost)}</div></div>
  <div class="stat"><div class="stat-label">Total Entries</div><div class="stat-value">${logs.length}</div></div>
</div>

<h2>Maintenance History</h2>
<table>
  <thead><tr><th>Date</th><th>Type</th><th>Miles</th><th>Description</th><th>Cost</th></tr></thead>
  <tbody>${logRows || '<tr><td colspan="5">No entries</td></tr>'}</tbody>
</table>

<h2>Parts Tracker</h2>
<table>
  <thead><tr><th>Part</th><th>Interval</th><th>Last Changed</th><th>Status</th><th>Est. Cost</th></tr></thead>
  <tbody>${partRows || '<tr><td colspan="5">No parts tracked</td></tr>'}</tbody>
</table>

<h2>Tax Records</h2>
<table>
  <thead><tr><th>Year</th><th>Due Date</th><th>Amount</th><th>Status</th></tr></thead>
  <tbody>${taxRows || '<tr><td colspan="4">No tax records</td></tr>'}</tbody>
</table>

<footer>BikeLog — Motorcycle Maintenance Tracker &nbsp;|&nbsp; ${generatedDate}</footer>
</body>
</html>`;
}
