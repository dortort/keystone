import type { Context } from './trpc'
import { DatabaseService } from '../services/DatabaseService'
import { ProjectService } from '../services/ProjectService'
import { DocumentService } from '../services/DocumentService'
import { ThreadService } from '../services/ThreadService'
import { ProviderManager } from '../../agents/providers/ProviderManager'
import { Orchestrator } from '../../agents/orchestrator/Orchestrator'
import { SettingsService } from '../services/SettingsService'

let _context: Context | null = null

export async function createContext(): Promise<Context> {
  if (_context) return _context

  const db = new DatabaseService()
  const database = db.getDb()
  const projectService = new ProjectService(database)
  const documentService = new DocumentService(database)
  const threadService = new ThreadService(database)
  const settingsService = new SettingsService()
  const providerManager = new ProviderManager()
  const orchestrator = new Orchestrator()

  // Restore any previously configured providers from persisted settings
  for (const provider of settingsService.getConfiguredProviders()) {
    const apiKey = settingsService.getApiKey(provider)
    if (apiKey) {
      try {
        providerManager.configure({ type: provider as 'openai' | 'anthropic' | 'google', apiKey })
      } catch {
        // Skip invalid providers silently
      }
    }
  }

  // Restore the active provider selection
  const activeProvider = settingsService.getActiveProvider()
  if (activeProvider && providerManager.isConfigured()) {
    try {
      providerManager.setActive(activeProvider as 'openai' | 'anthropic' | 'google')
    } catch {
      // Active provider may no longer be configured
    }
  }

  _context = { db, projectService, documentService, threadService, settingsService, providerManager, orchestrator }
  return _context
}
