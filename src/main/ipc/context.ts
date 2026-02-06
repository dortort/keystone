import type { Context } from './trpc'
import type { ProviderType } from '@shared/types/provider'
import { DatabaseService } from '../services/DatabaseService'
import { ProjectService } from '../services/ProjectService'
import { DocumentService } from '../services/DocumentService'
import { ThreadService } from '../services/ThreadService'
import { ProviderManager } from '../../agents/providers/ProviderManager'
import { Orchestrator } from '../../agents/orchestrator/Orchestrator'
import { SettingsService } from '../services/SettingsService'
import { OAuthService } from '../services/OAuthService'

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
  const oauthService = new OAuthService()

  // Wire OAuth token refresh callback
  oauthService.onTokenRefresh((provider, tokens) => {
    settingsService.setOAuthTokens(provider, tokens)
    providerManager.updateOAuthToken(provider, tokens.accessToken, tokens.accountId)
  })

  // Restore API-key-based providers from persisted settings
  for (const provider of settingsService.getConfiguredProviders()) {
    const authMethod = settingsService.getAuthMethod(provider)
    if (authMethod === 'apiKey') {
      const apiKey = settingsService.getApiKey(provider)
      if (apiKey) {
        try {
          providerManager.configure({ type: provider as ProviderType, authMethod: 'apiKey', apiKey })
        } catch {
          // Skip invalid providers silently
        }
      }
    }
  }

  // Restore OAuth-based providers from persisted settings
  for (const provider of settingsService.getOAuthConfiguredProviders()) {
    const tokens = settingsService.getOAuthTokens(provider)
    const authMethod = settingsService.getAuthMethod(provider)
    if (tokens && authMethod === 'oauth') {
      try {
        // Check if token is expired — attempt immediate refresh if so
        if (tokens.expiresAt < Date.now() && tokens.refreshToken) {
          const refreshed = await oauthService.refreshToken(provider as ProviderType, tokens)
          if (refreshed) {
            settingsService.setOAuthTokens(provider, refreshed)
            providerManager.configure({
              type: provider as ProviderType,
              authMethod: 'oauth',
              oauthToken: refreshed.accessToken,
              accountId: refreshed.accountId,
            })
            oauthService.scheduleRefresh(provider as ProviderType, refreshed)
          }
          // If refresh fails, skip — user will need to re-authenticate
        } else {
          providerManager.configure({
            type: provider as ProviderType,
            authMethod: 'oauth',
            oauthToken: tokens.accessToken,
            accountId: tokens.accountId,
          })
          oauthService.scheduleRefresh(provider as ProviderType, tokens)
        }
      } catch {
        // Skip invalid providers silently
      }
    }
  }

  // Restore the active provider selection
  const activeProvider = settingsService.getActiveProvider()
  if (activeProvider && providerManager.isConfigured()) {
    try {
      providerManager.setActive(activeProvider as ProviderType)
    } catch {
      // Active provider may no longer be configured
    }
  }

  _context = { db, projectService, documentService, threadService, settingsService, providerManager, orchestrator, oauthService }
  return _context
}
