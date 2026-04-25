export const CREATE_SCHEMA_VERSION = `
  CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER PRIMARY KEY,
    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`;

export const CREATE_MOTORCYCLES = `
  CREATE TABLE IF NOT EXISTS motorcycles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    make TEXT NOT NULL DEFAULT '',
    model TEXT NOT NULL DEFAULT '',
    year INTEGER NOT NULL DEFAULT 0,
    current_miles INTEGER NOT NULL DEFAULT 0,
    purchase_date TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`;

export const CREATE_MAINTENANCE_LOGS = `
  CREATE TABLE IF NOT EXISTS maintenance_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    motorcycle_id INTEGER NOT NULL REFERENCES motorcycles(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'other',
    date TEXT NOT NULL,
    miles INTEGER NOT NULL DEFAULT 0,
    description TEXT NOT NULL DEFAULT '',
    cost REAL NOT NULL DEFAULT 0,
    voice_note TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`;

export const CREATE_LOG_PARTS = `
  CREATE TABLE IF NOT EXISTS log_parts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    log_id INTEGER NOT NULL REFERENCES maintenance_logs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    cost REAL NOT NULL DEFAULT 0,
    quantity INTEGER NOT NULL DEFAULT 1
  );
`;

export const CREATE_PARTS = `
  CREATE TABLE IF NOT EXISTS parts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    motorcycle_id INTEGER NOT NULL REFERENCES motorcycles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    change_interval_miles INTEGER NOT NULL DEFAULT 3000,
    last_changed_miles INTEGER NOT NULL DEFAULT 0,
    last_changed_date TEXT,
    estimated_cost REAL NOT NULL DEFAULT 0,
    notification_enabled INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`;

export const CREATE_TAX_RECORDS = `
  CREATE TABLE IF NOT EXISTS tax_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    motorcycle_id INTEGER NOT NULL REFERENCES motorcycles(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    amount REAL NOT NULL DEFAULT 0,
    due_date TEXT NOT NULL,
    paid INTEGER NOT NULL DEFAULT 0,
    paid_date TEXT,
    notification_id TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(motorcycle_id, year)
  );
`;

export const CREATE_INDEXES = [
  `CREATE INDEX IF NOT EXISTS idx_logs_motorcycle ON maintenance_logs(motorcycle_id);`,
  `CREATE INDEX IF NOT EXISTS idx_logs_date ON maintenance_logs(date);`,
  `CREATE INDEX IF NOT EXISTS idx_logs_type ON maintenance_logs(type);`,
  `CREATE INDEX IF NOT EXISTS idx_parts_motorcycle ON parts(motorcycle_id);`,
  `CREATE INDEX IF NOT EXISTS idx_tax_motorcycle ON tax_records(motorcycle_id);`,
];
