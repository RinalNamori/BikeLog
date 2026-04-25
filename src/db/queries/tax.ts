import { getDatabase } from '../database';
import type { TaxRecord } from '../../types/models';

function rowToTax(row: any): TaxRecord {
  return {
    id: row.id,
    motorcycleId: row.motorcycle_id,
    year: row.year,
    amount: row.amount,
    dueDate: row.due_date,
    paid: row.paid === 1,
    paidDate: row.paid_date,
    notificationId: row.notification_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getTaxRecordsForMotorcycle(motorcycleId: number): Promise<TaxRecord[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM tax_records WHERE motorcycle_id = ? ORDER BY year DESC',
    motorcycleId
  );
  return rows.map(rowToTax);
}

export async function getTaxRecord(id: number): Promise<TaxRecord | null> {
  const db = getDatabase();
  const row = await db.getFirstAsync<any>('SELECT * FROM tax_records WHERE id = ?', id);
  return row ? rowToTax(row) : null;
}

export async function insertTaxRecord(data: Omit<TaxRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
  const db = getDatabase();
  const result = await db.runAsync(
    `INSERT INTO tax_records (motorcycle_id, year, amount, due_date, paid, paid_date, notification_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    data.motorcycleId, data.year, data.amount, data.dueDate,
    data.paid ? 1 : 0, data.paidDate, data.notificationId
  );
  return result.lastInsertRowId;
}

export async function updateTaxRecord(id: number, data: Partial<Omit<TaxRecord, 'id' | 'motorcycleId' | 'createdAt' | 'updatedAt'>>): Promise<void> {
  const db = getDatabase();
  const fields: string[] = [];
  const values: any[] = [];

  if (data.year !== undefined) { fields.push('year = ?'); values.push(data.year); }
  if (data.amount !== undefined) { fields.push('amount = ?'); values.push(data.amount); }
  if (data.dueDate !== undefined) { fields.push('due_date = ?'); values.push(data.dueDate); }
  if (data.paid !== undefined) { fields.push('paid = ?'); values.push(data.paid ? 1 : 0); }
  if (data.paidDate !== undefined) { fields.push('paid_date = ?'); values.push(data.paidDate); }
  if (data.notificationId !== undefined) { fields.push('notification_id = ?'); values.push(data.notificationId); }

  if (fields.length === 0) return;
  fields.push("updated_at = datetime('now')");
  values.push(id);

  await db.runAsync(`UPDATE tax_records SET ${fields.join(', ')} WHERE id = ?`, ...values);
}

export async function deleteTaxRecord(id: number): Promise<void> {
  const db = getDatabase();
  await db.runAsync('DELETE FROM tax_records WHERE id = ?', id);
}
