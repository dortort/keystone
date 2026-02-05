import type Database from 'better-sqlite3'
import { getDatabase, closeDatabase } from '../database/connection'
import { runMigrations } from '../database/migrations'

export class DatabaseService {
  private db: Database.Database

  constructor() {
    this.db = getDatabase()
    runMigrations(this.db)
  }

  getDb(): Database.Database {
    return this.db
  }

  close(): void {
    closeDatabase()
  }
}
