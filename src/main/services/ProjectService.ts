import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs'
import { join } from 'path'
import type Database from 'better-sqlite3'
import type { Project, DocumentRef, ThreadRef } from '@shared/types'
import { generateId } from '@shared/utils/id'
import { now } from '@shared/utils/date'

interface ProjectManifest {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export class ProjectService {
  constructor(private db: Database.Database) {}

  create(name: string, path: string): Project {
    const id = generateId()
    const timestamp = now()

    // Create project directory structure
    const projectPath = join(path, name)
    mkdirSync(projectPath, { recursive: true })
    mkdirSync(join(projectPath, 'documents', 'adrs'), { recursive: true })
    mkdirSync(join(projectPath, 'threads'), { recursive: true })
    mkdirSync(join(projectPath, '.keystone', 'cache'), { recursive: true })
    mkdirSync(join(projectPath, '.keystone', 'history'), { recursive: true })

    // Write manifest
    const manifest: ProjectManifest = { id, name, createdAt: timestamp, updatedAt: timestamp }
    writeFileSync(join(projectPath, 'keystone.json'), JSON.stringify(manifest, null, 2))

    // Insert into database
    this.db
      .prepare('INSERT INTO projects (id, name, path, created_at, updated_at) VALUES (?, ?, ?, ?, ?)')
      .run(id, name, projectPath, timestamp, timestamp)

    return {
      id,
      name,
      path: projectPath,
      documents: [],
      threads: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    }
  }

  open(projectPath: string): Project {
    const manifestPath = join(projectPath, 'keystone.json')
    if (!existsSync(manifestPath)) {
      throw new Error(`No keystone.json found at ${projectPath}`)
    }

    const manifest: ProjectManifest = JSON.parse(readFileSync(manifestPath, 'utf-8'))

    // Ensure project is in the database
    const existing = this.db.prepare('SELECT * FROM projects WHERE path = ?').get(projectPath)
    if (!existing) {
      this.db
        .prepare('INSERT INTO projects (id, name, path, created_at, updated_at) VALUES (?, ?, ?, ?, ?)')
        .run(manifest.id, manifest.name, projectPath, manifest.createdAt, manifest.updatedAt)
    }

    // Load document refs
    const docRows = this.db
      .prepare('SELECT id, type, title, filename FROM documents WHERE project_id = ?')
      .all(manifest.id) as Array<{ id: string; type: string; title: string; filename: string }>

    const documents: DocumentRef[] = docRows.map((row) => ({
      id: row.id,
      type: row.type as DocumentRef['type'],
      title: row.title,
      filename: row.filename,
    }))

    // Load thread refs
    const threadRows = this.db
      .prepare('SELECT id, title, status FROM threads WHERE project_id = ?')
      .all(manifest.id) as Array<{ id: string; title: string; status: string }>

    const threads: ThreadRef[] = threadRows.map((row) => ({
      id: row.id,
      title: row.title,
      status: row.status as ThreadRef['status'],
    }))

    return {
      id: manifest.id,
      name: manifest.name,
      path: projectPath,
      documents,
      threads,
      createdAt: manifest.createdAt,
      updatedAt: manifest.updatedAt,
    }
  }

  list(): Array<{ id: string; name: string; path: string; updatedAt: string }> {
    return this.db
      .prepare('SELECT id, name, path, updated_at as updatedAt FROM projects ORDER BY updated_at DESC')
      .all() as Array<{ id: string; name: string; path: string; updatedAt: string }>
  }

  delete(id: string): void {
    this.db.prepare('DELETE FROM projects WHERE id = ?').run(id)
  }
}
