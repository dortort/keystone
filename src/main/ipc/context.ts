import type { Context } from './trpc'
import { DatabaseService } from '../services/DatabaseService'
import { ProjectService } from '../services/ProjectService'
import { DocumentService } from '../services/DocumentService'
import { ThreadService } from '../services/ThreadService'

let _context: Context | null = null

export async function createContext(): Promise<Context> {
  if (_context) return _context

  const db = new DatabaseService()
  const database = db.getDb()
  const projectService = new ProjectService(database)
  const documentService = new DocumentService(database)
  const threadService = new ThreadService(database)

  _context = { db, projectService, documentService, threadService }
  return _context
}
