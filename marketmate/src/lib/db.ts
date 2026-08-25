import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "marketmate.db");

// Reuse a single connection across hot reloads in dev.
declare global {
  var __marketmateDb: Database.Database | undefined;
}

const db = global.__marketmateDb ?? new Database(dbPath);
if (process.env.NODE_ENV !== "production") {
  global.__marketmateDb = db;
}

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS generations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_type TEXT NOT NULL,
    target_audience TEXT NOT NULL,
    goal TEXT NOT NULL,
    content_json TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS health_checks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    input_text TEXT NOT NULL,
    suggestions_json TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_generations_user ON generations(user_id);
  CREATE INDEX IF NOT EXISTS idx_health_checks_user ON health_checks(user_id);
`);

export default db;

export interface UserRow {
  id: number;
  email: string;
  password_hash: string;
  created_at: string;
}

export interface GenerationRow {
  id: number;
  user_id: number;
  business_type: string;
  target_audience: string;
  goal: string;
  content_json: string;
  created_at: string;
}

export interface HealthCheckRow {
  id: number;
  user_id: number;
  input_text: string;
  suggestions_json: string;
  created_at: string;
}
