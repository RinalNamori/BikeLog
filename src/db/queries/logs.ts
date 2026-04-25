import { getDatabase } from '../database';
import type { MaintenanceLog, LogPart, MaintenanceType } from '../../types/models';

function rowToLog(row: any, parts: LogPart[] = []): MaintenanceLog {
  return {
    id: row.id,
    motorcycleId: row.motorcycle_id,
    type: row.type as MaintenanceType,
    date: row.date,
    miles: row.miles,
    description: row.description,
    cost: row.cost,
    voiceNote: row.voice_note,
    parts,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getLogParts(logId: number): Promise<LogPart[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<any>('SELECT * FROM log_parts WHERE log_id = ?', logId);
  return rows.map(r => ({ id: r.id, logId: r.log_id, name: r.name, cost: r.cost, quantity: r.quantity }));
}

export async function getLogsForMotorcycle(motorcycleId: number): Promise<MaintenanceLog[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM maintenance_logs WHERE motorcycle_id = ? ORDER BY date DESC, id DESC',
    motorcycleId
  );
  const logs: MaintenanceLog[] = [];
  for (const row of rows) {
    const parts = await getLogParts(row.id);
    logs.push(rowToLog(row, parts));
  }
  return logs;
}

export async function getLog(id: number): Promise<MaintenanceLog | null> {
  const db = getDatabase();
  const row = await db.getFirstAsync<any>('SELECT * FROM maintenance_logs WHERE id = ?', id);
  if (!row) return null;
  const parts = await getLogParts(id);
  return rowToLog(row, parts);
}

export interface InsertLogData {
  motorcycleId: number;
  type: MaintenanceType;
  date: string;
  miles: number;
  description: string;
  cost: number;
  voiceNote?: string | null;
  parts?: Array<{ name: string; cost: number; quantity: number }>;
}

export async function insertLog(data: InsertLogData): Promise<number> {
  const db = getDatabase();
  let logId: number = 0;

  await db.withTransactionAsync(async () => {
    const result = await db.runAsync(
      `INSERT INTO maintenance_logs (motorcycle_id, type, date, miles, description, cost, voice_note) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      data.motorcycleId, data.type, data.date, data.miles, data.description, data.cost, data.voiceNote ?? null
    );
    logId = result.lastInsertRowId;

    for (const part of data.parts ?? []) {
      await db.runAsync(
        'INSERT INTO log_parts (log_id, name, cost, quantity) VALUES (?, ?, ?, ?)',
        logId, part.name, part.cost, part.quantity
      );
    }
  });

  return logId;
}

export async function updateLog(id: number, data: Partial<InsertLogData>): Promise<void> {
  const db = getDatabase();

  await db.withTransactionAsync(async () => {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.type !== undefined) { fields.push('type = ?'); values.push(data.type); }
    if (data.date !== undefined) { fields.push('date = ?'); values.push(data.date); }
    if (data.miles !== undefined) { fields.push('miles = ?'); values.push(data.miles); }
    if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description); }
    if (data.cost !== undefined) { fields.push('cost = ?'); values.push(data.cost); }
    if (data.voiceNote !== undefined) { fields.push('voice_note = ?'); values.push(data.voiceNote); }

    if (fields.length > 0) {
      fields.push("updated_at = datetime('now')");
      values.push(id);
      await db.runAsync(`UPDATE maintenance_logs SET ${fields.join(', ')} WHERE id = ?`, ...values);
    }

    if (data.parts !== undefined) {
      await db.runAsync('DELETE FROM log_parts WHERE log_id = ?', id);
      for (const part of data.parts) {
        await db.runAsync(
          'INSERT INTO log_parts (log_id, name, cost, quantity) VALUES (?, ?, ?, ?)',
          id, part.name, part.cost, part.quantity
        );
      }
    }
  });
}

export async function deleteLog(id: number): Promise<void> {
  const db = getDatabase();
  await db.runAsync('DELETE FROM maintenance_logs WHERE id = ?', id);
}

export async function getLogsSummary(motorcycleId: number): Promise<{ totalCost: number; count: number }> {
  const db = getDatabase();
  const row = await db.getFirstAsync<any>(
    'SELECT COALESCE(SUM(cost), 0) as total, COUNT(*) as cnt FROM maintenance_logs WHERE motorcycle_id = ?',
    motorcycleId
  );
  return { totalCost: row?.total ?? 0, count: row?.cnt ?? 0 };
}

export async function getCostByType(motorcycleId: number): Promise<Record<string, number>> {
  const db = getDatabase();
  const rows = await db.getAllAsync<any>(
    'SELECT type, COALESCE(SUM(cost), 0) as total FROM maintenance_logs WHERE motorcycle_id = ? GROUP BY type',
    motorcycleId
  );
  const result: Record<string, number> = {};
  for (const row of rows) result[row.type] = row.total;
  return result;
}

export async function getMonthlyCosts(motorcycleId: number, months: number): Promise<Array<{ month: string; total: number }>> {
  const db = getDatabase();
  const rows = await db.getAllAsync<any>(
    `SELECT strftime('%Y-%m', date) as month, COALESCE(SUM(cost), 0) as total
     FROM maintenance_logs WHERE motorcycle_id = ? AND date >= date('now', '-${months} months')
     GROUP BY month ORDER BY month ASC`,
    motorcycleId
  );
  return rows.map(r => ({ month: r.month, total: r.total }));
}
