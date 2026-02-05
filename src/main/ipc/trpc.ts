import { initTRPC } from '@trpc/server'
import type { DatabaseService } from '../services/DatabaseService'
import type { ProjectService } from '../services/ProjectService'
import type { DocumentService } from '../services/DocumentService'
import type { ThreadService } from '../services/ThreadService'
import type { ProviderManager } from '../../agents/providers/ProviderManager'
import type { Orchestrator } from '../../agents/orchestrator/Orchestrator'
import type { SettingsService } from '../services/SettingsService'

export interface Context {
  db: DatabaseService
  projectService: ProjectService
  documentService: DocumentService
  threadService: ThreadService
  providerManager: ProviderManager
  orchestrator: Orchestrator
  settingsService: SettingsService
}

const t = initTRPC.context<Context>().create()

export const router = t.router
export const publicProcedure = t.procedure
