import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'fs'
import { join, dirname } from 'path'
import type Database from 'better-sqlite3'
import type { Document, DocumentVersion } from '@shared/types'
import { generateDocumentId } from '@shared/utils/id'
import { now } from '@shared/utils/date'
import { DocumentNotFoundError } from '@shared/errors'

export class DocumentService {
  constructor(private db: Database.Database) {}

  create(projectId: string, projectPath: string, type: 'prd' | 'tdd' | 'adr', title: string): Document {
    const id = generateDocumentId()
    const timestamp = now()

    let filename: string
    if (type === 'adr') {
      const count = this.db
        .prepare("SELECT COUNT(*) as count FROM documents WHERE project_id = ? AND type = 'adr'")
        .get(projectId) as { count: number }
      const num = String(count.count + 1).padStart(3, '0')
      filename = `adrs/ADR-${num}.md`
    } else {
      filename = `${type.toUpperCase()}.md`
    }

    const filePath = join(projectPath, 'documents', filename)
    const dir = dirname(filePath)
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }

    const initialContent = `# ${title}\n\n`
    writeFileSync(filePath, initialContent, 'utf-8')

    this.db
      .prepare(
        'INSERT INTO documents (id, project_id, type, title, filename, version, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 1, ?, ?)',
      )
      .run(id, projectId, type, title, filename, timestamp, timestamp)

    return {
      id,
      type,
      title,
      content: initialContent,
      comments: [],
      version: 1,
      linkedThreads: [],
      linkedADRs: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    }
  }

  get(id: string, projectPath: string): Document {
    const row = this.db
      .prepare('SELECT * FROM documents WHERE id = ?')
      .get(id) as {
      id: string
      project_id: string
      type: string
      title: string
      filename: string
      version: number
      created_at: string
      updated_at: string
    } | undefined

    if (!row) {
      throw new DocumentNotFoundError(id)
    }

    const filePath = join(projectPath, 'documents', row.filename)
    const content = existsSync(filePath) ? readFileSync(filePath, 'utf-8') : ''

    return {
      id: row.id,
      type: row.type as Document['type'],
      title: row.title,
      content,
      comments: [],
      version: row.version,
      linkedThreads: [],
      linkedADRs: [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }

  update(id: string, projectPath: string, content: string): Document {
    const row = this.db.prepare('SELECT * FROM documents WHERE id = ?').get(id) as {
      id: string
      filename: string
      version: number
    } | undefined

    if (!row) {
      throw new DocumentNotFoundError(id)
    }

    const filePath = join(projectPath, 'documents', row.filename)
    const newVersion = row.version + 1
    const timestamp = now()

    // Save previous version to history
    if (existsSync(filePath)) {
      const historyDir = join(projectPath, '.keystone', 'history')
      if (!existsSync(historyDir)) {
        mkdirSync(historyDir, { recursive: true })
      }
      copyFileSync(filePath, join(historyDir, `${id}_v${row.version}.md`))
    }

    // Write new content
    writeFileSync(filePath, content, 'utf-8')

    // Update database
    this.db
      .prepare('UPDATE documents SET version = ?, updated_at = ? WHERE id = ?')
      .run(newVersion, timestamp, id)

    return this.get(id, projectPath)
  }

  getHistory(id: string, projectPath: string): DocumentVersion[] {
    const row = this.db.prepare('SELECT version, filename FROM documents WHERE id = ?').get(id) as {
      version: number
      filename: string
    } | undefined

    if (!row) return []

    const versions: DocumentVersion[] = []
    const historyDir = join(projectPath, '.keystone', 'history')

    for (let v = 1; v < row.version; v++) {
      const historyFile = join(historyDir, `${id}_v${v}.md`)
      if (existsSync(historyFile)) {
        versions.push({
          version: v,
          content: readFileSync(historyFile, 'utf-8'),
          updatedAt: '',
        })
      }
    }

    // Current version
    const currentPath = join(projectPath, 'documents', row.filename)
    if (existsSync(currentPath)) {
      versions.push({
        version: row.version,
        content: readFileSync(currentPath, 'utf-8'),
        updatedAt: '',
      })
    }

    return versions
  }

  rollback(id: string, projectPath: string, version: number): Document {
    const row = this.db.prepare('SELECT * FROM documents WHERE id = ?').get(id) as {
      id: string
      project_id: string
      type: string
      title: string
      filename: string
      version: number
      created_at: string
      updated_at: string
    } | undefined

    if (!row) {
      throw new DocumentNotFoundError(id)
    }

    if (version >= row.version) {
      throw new Error(`Cannot rollback to version ${version}: current version is ${row.version}`)
    }

    // Read the historical version file
    const historyFile = join(projectPath, '.keystone', 'history', `${id}_v${version}.md`)
    if (!existsSync(historyFile)) {
      throw new Error(`Version ${version} not found in history for document ${id}`)
    }

    const historicalContent = readFileSync(historyFile, 'utf-8')

    // Save current version to history before overwriting
    const currentFilePath = join(projectPath, 'documents', row.filename)
    if (existsSync(currentFilePath)) {
      const historyDir = join(projectPath, '.keystone', 'history')
      if (!existsSync(historyDir)) {
        mkdirSync(historyDir, { recursive: true })
      }
      copyFileSync(currentFilePath, join(historyDir, `${id}_v${row.version}.md`))
    }

    // Write the historical content as the current file
    writeFileSync(currentFilePath, historicalContent, 'utf-8')

    // Bump version number in the database
    const newVersion = row.version + 1
    const timestamp = now()
    this.db
      .prepare('UPDATE documents SET version = ?, updated_at = ? WHERE id = ?')
      .run(newVersion, timestamp, id)

    return this.get(id, projectPath)
  }

  listByProject(projectId: string): Array<{ id: string; type: string; title: string; filename: string }> {
    return this.db
      .prepare('SELECT id, type, title, filename FROM documents WHERE project_id = ? ORDER BY type, title')
      .all(projectId) as Array<{ id: string; type: string; title: string; filename: string }>
  }
}
