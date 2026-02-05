import { initTRPC } from '@trpc/server'
import type { DatabaseService } from '../services/DatabaseService'
import type { ProjectService } from '../services/ProjectService'
import type { DocumentService } from '../services/DocumentService'
import type { ThreadService } from '../services/ThreadService'

export interface Context {
  db: DatabaseService
  projectService: ProjectService
  documentService: DocumentService
  threadService: ThreadService
}

const t = initTRPC.context<Context>().create()

export const router = t.router
export const publicProcedure = t.procedure
