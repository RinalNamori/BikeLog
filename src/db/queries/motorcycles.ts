import { getDatabase } from '../database';
import type { Motorcycle } from '../../types/models';

function rowToMotorcycle(row: any): Motorcycle {
  return {
    id: row.id,
    name: row.name,
    make: row.make,
    model: row.model,
    year: row.year,
    currentMiles: row.current_miles,
    purchaseDate: row.purchase_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAllMotorcycles(): Promise<Motorcycle[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<any>('SELECT * FROM motorcycles ORDER BY created_at DESC');
  return rows.map(rowToMotorcycle);
}

export async function getMotorcycle(id: number): Promise<Motorcycle | null> {
  const db = getDatabase();
  const row = await db.getFirstAsync<any>('SELECT * FROM motorcycles WHERE id = ?', id);
  return row ? rowToMotorcycle(row) : null;
}

export async function insertMotorcycle(data: Omit<Motorcycle, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
  const db = getDatabase();
  const result = await db.runAsync(
    `INSERT INTO motorcycles (name, make, model, year, current_miles, purchase_date) VALUES (?, ?, ?, ?, ?, ?)`,
    data.name, data.make, data.model, data.year, data.currentMiles, data.purchaseDate
  );
  return result.lastInsertRowId;
}

export async function updateMotorcycle(id: number, data: Partial<Omit<Motorcycle, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
  const db = getDatabase();
  const fields: string[] = [];
  const values: any[] = [];

  if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
  if (data.make !== undefined) { fields.push('make = ?'); values.push(data.make); }
  if (data.model !== undefined) { fields.push('model = ?'); values.push(data.model); }
  if (data.year !== undefined) { fields.push('year = ?'); values.push(data.year); }
  if (data.currentMiles !== undefined) { fields.push('current_miles = ?'); values.push(data.currentMiles); }
  if (data.purchaseDate !== undefined) { fields.push('purchase_date = ?'); values.push(data.purchaseDate); }

  if (fields.length === 0) return;

  fields.push("updated_at = datetime('now')");
  values.push(id);

  await db.runAsync(
    `UPDATE motorcycles SET ${fields.join(', ')} WHERE id = ?`,
    ...values
  );
}

export async function deleteMotorcycle(id: number): Promise<void> {
  const db = getDatabase();
  await db.runAsync('DELETE FROM motorcycles WHERE id = ?', id);
}
