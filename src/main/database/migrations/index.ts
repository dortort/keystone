import type Database from 'better-sqlite3'
import { up as initial } from './001_initial'

interface Migration {
  version: number
  name: string
  up: (db: Database.Database) => void
}

const migrations: Migration[] = [
  { version: 1, name: '001_initial', up: initial },
]

export function runMigrations(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT DEFAULT (datetime('now'))
    )
  `)

  const currentVersion = db.prepare('SELECT MAX(version) as version FROM _migrations').get() as { version: number | null }
  const appliedVersion = currentVersion?.version ?? 0

  for (const migration of migrations) {
    if (migration.version > appliedVersion) {
      const transaction = db.transaction(() => {
        migration.up(db)
        db.prepare('INSERT INTO _migrations (version, name) VALUES (?, ?)').run(migration.version, migration.name)
      })
      transaction()
    }
  }
}
