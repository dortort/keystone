export const APP_NAME = 'Keystone'
export const APP_VERSION = '0.1.0'

export const DOCUMENT_TYPES = ['prd', 'tdd', 'adr'] as const

export const MAX_MESSAGES_IN_CONTEXT = 50
export const MAX_DOCUMENT_SIZE_BYTES = 1024 * 1024 // 1MB

export const DEFAULT_PROVIDER = 'anthropic' as const

export const OAUTH_CAPABILITIES: Record<string, {
  supported: boolean
  clientId: string
  authorizationUrl: string
  tokenUrl: string
  scopes: string[]
  extraAuthParams?: Record<string, string>
  experimental?: boolean
  redirectPort?: number // Fixed port for OAuth callback (required by some providers)
  callbackPath?: string // Callback path (default: /callback)
}> = {
  openai: {
    supported: true,
    clientId: 'app_EMoamEEZ73f0CkXaXp7hrann',
    authorizationUrl: 'https://auth.openai.com/oauth/authorize',
    tokenUrl: 'https://auth.openai.com/oauth/token',
    scopes: ['openid', 'profile', 'email', 'offline_access'],
    extraAuthParams: {
      id_token_add_organizations: 'true',
      codex_cli_simplified_flow: 'true',
    },
    redirectPort: 1455,
    callbackPath: '/auth/callback',
  },
  anthropic: {
    supported: false,
    clientId: '',
    authorizationUrl: '',
    tokenUrl: '',
    scopes: [],
  },
  google: {
    supported: true,
    clientId: '539167010789-g3ltv0osl0j74oab94klpj41sv7l4mqb.apps.googleusercontent.com',
    authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: ['openid', 'email', 'https://www.googleapis.com/auth/generative-language'],
    experimental: true,
  },
}

export const ADR_TEMPLATE = `# ADR-{number}: {title}

## Status
Proposed

## Context
{context}

## Decision
{decision}

## Consequences
{consequences}

## Related
- Thread: {threadLink}
`
