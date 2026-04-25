import { getDatabase } from '../database';
import type { Part } from '../../types/models';

function rowToPart(row: any): Part {
  return {
    id: row.id,
    motorcycleId: row.motorcycle_id,
    name: row.name,
    changeIntervalMiles: row.change_interval_miles,
    lastChangedMiles: row.last_changed_miles,
    lastChangedDate: row.last_changed_date,
    estimatedCost: row.estimated_cost,
    notificationEnabled: row.notification_enabled === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getPartsForMotorcycle(motorcycleId: number): Promise<Part[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM parts WHERE motorcycle_id = ? ORDER BY name ASC',
    motorcycleId
  );
  return rows.map(rowToPart);
}

export async function getPart(id: number): Promise<Part | null> {
  const db = getDatabase();
  const row = await db.getFirstAsync<any>('SELECT * FROM parts WHERE id = ?', id);
  return row ? rowToPart(row) : null;
}

export async function insertPart(data: Omit<Part, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
  const db = getDatabase();
  const result = await db.runAsync(
    `INSERT INTO parts (motorcycle_id, name, change_interval_miles, last_changed_miles, last_changed_date, estimated_cost, notification_enabled) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    data.motorcycleId, data.name, data.changeIntervalMiles, data.lastChangedMiles,
    data.lastChangedDate, data.estimatedCost, data.notificationEnabled ? 1 : 0
  );
  return result.lastInsertRowId;
}

export async function updatePart(id: number, data: Partial<Omit<Part, 'id' | 'motorcycleId' | 'createdAt' | 'updatedAt'>>): Promise<void> {
  const db = getDatabase();
  const fields: string[] = [];
  const values: any[] = [];

  if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
  if (data.changeIntervalMiles !== undefined) { fields.push('change_interval_miles = ?'); values.push(data.changeIntervalMiles); }
  if (data.lastChangedMiles !== undefined) { fields.push('last_changed_miles = ?'); values.push(data.lastChangedMiles); }
  if (data.lastChangedDate !== undefined) { fields.push('last_changed_date = ?'); values.push(data.lastChangedDate); }
  if (data.estimatedCost !== undefined) { fields.push('estimated_cost = ?'); values.push(data.estimatedCost); }
  if (data.notificationEnabled !== undefined) { fields.push('notification_enabled = ?'); values.push(data.notificationEnabled ? 1 : 0); }

  if (fields.length === 0) return;
  fields.push("updated_at = datetime('now')");
  values.push(id);

  await db.runAsync(`UPDATE parts SET ${fields.join(', ')} WHERE id = ?`, ...values);
}

export async function deletePart(id: number): Promise<void> {
  const db = getDatabase();
  await db.runAsync('DELETE FROM parts WHERE id = ?', id);
}
