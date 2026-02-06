import * as http from 'http'
import * as crypto from 'crypto'
import { BrowserWindow, shell } from 'electron'
import { OAUTH_CAPABILITIES } from '@shared/constants'
import type { ProviderType, OAuthTokens, OAuthFlowStatus } from '@shared/types/provider'
import { OAuthError } from '@shared/errors'

type StatusCallback = (status: OAuthFlowStatus) => void

export class OAuthService {
  private refreshTimers: Map<string, NodeJS.Timeout> = new Map()
  private activeServer: http.Server | null = null
  private statusCallback: StatusCallback | null = null
  private tokenRefreshCallback: ((provider: ProviderType, tokens: OAuthTokens) => void) | null = null

  onStatus(callback: StatusCallback): void {
    this.statusCallback = callback
  }

  onTokenRefresh(callback: (provider: ProviderType, tokens: OAuthTokens) => void): void {
    this.tokenRefreshCallback = callback
  }

  private emitStatus(status: OAuthFlowStatus): void {
    this.statusCallback?.(status)
    const win = BrowserWindow.getAllWindows()[0]
    if (win && !win.isDestroyed()) {
      win.webContents.send('oauth:status', status)
    }
  }

  async startFlow(provider: ProviderType): Promise<OAuthTokens> {
    const capabilities = OAUTH_CAPABILITIES[provider]
    if (!capabilities?.supported) {
      throw new OAuthError(provider, 'OAuth not supported for this provider')
    }

    // Cancel any existing flow
    this.cancelFlow()

    this.emitStatus({ state: 'pending', provider })

    // Generate PKCE pair
    const codeVerifier = crypto.randomBytes(32).toString('base64url')
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url')

    const state = crypto.randomBytes(16).toString('hex')

    return new Promise<OAuthTokens>((resolve, reject) => {
      let redirectUri = ''
      let settled = false

      const settle = (fn: () => void) => {
        if (!settled) {
          settled = true
          fn()
        }
      }

      const server = http.createServer(async (req, res) => {
        const url = new URL(req.url || '/', `http://127.0.0.1`)

        if (url.pathname !== '/callback') {
          res.writeHead(404)
          res.end('Not found')
          return
        }

        const code = url.searchParams.get('code')
        const returnedState = url.searchParams.get('state')
        const error = url.searchParams.get('error')

        if (error) {
          res.writeHead(200, { 'Content-Type': 'text/html' })
          res.end(this.buildCallbackHtml(false, `Authorization denied: ${error}`))
          this.emitStatus({ state: 'error', provider, error: `Authorization denied: ${error}` })
          this.shutdownServer()
          settle(() => reject(new OAuthError(provider, `Authorization denied: ${error}`)))
          return
        }

        if (!code || returnedState !== state) {
          res.writeHead(200, { 'Content-Type': 'text/html' })
          res.end(this.buildCallbackHtml(false, 'Invalid callback parameters'))
          this.emitStatus({ state: 'error', provider, error: 'Invalid callback parameters' })
          this.shutdownServer()
          settle(() => reject(new OAuthError(provider, 'Invalid callback parameters')))
          return
        }

        try {
          const tokens = await this.exchangeCode(provider, code, codeVerifier, redirectUri)
          res.writeHead(200, { 'Content-Type': 'text/html' })
          res.end(this.buildCallbackHtml(true, 'You can close this tab and return to Keystone.'))
          this.emitStatus({ state: 'success', provider, email: tokens.email })
          this.shutdownServer()
          settle(() => resolve(tokens))
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Token exchange failed'
          res.writeHead(200, { 'Content-Type': 'text/html' })
          res.end(this.buildCallbackHtml(false, msg))
          this.emitStatus({ state: 'error', provider, error: msg })
          this.shutdownServer()
          settle(() => reject(new OAuthError(provider, msg)))
        }
      })

      // Listen on random port on loopback
      server.listen(0, '127.0.0.1', () => {
        const addr = server.address()
        if (!addr || typeof addr === 'string') {
          settle(() => reject(new OAuthError(provider, 'Failed to start loopback server')))
          return
        }

        this.activeServer = server
        redirectUri = `http://127.0.0.1:${addr.port}/callback`

        // Build authorization URL
        const params = new URLSearchParams({
          client_id: capabilities.clientId,
          redirect_uri: redirectUri,
          response_type: 'code',
          scope: capabilities.scopes.join(' '),
          state,
          code_challenge: codeChallenge,
          code_challenge_method: 'S256',
          ...capabilities.extraAuthParams,
        })

        const authUrl = `${capabilities.authorizationUrl}?${params.toString()}`
        shell.openExternal(authUrl)
      })

      // Timeout after 5 minutes
      setTimeout(() => {
        if (this.activeServer === server) {
          this.emitStatus({ state: 'error', provider, error: 'Authorization timed out' })
          this.shutdownServer()
          settle(() => reject(new OAuthError(provider, 'Authorization timed out')))
        }
      }, 5 * 60 * 1000)
    })
  }

  private async exchangeCode(
    provider: ProviderType,
    code: string,
    codeVerifier: string,
    redirectUri: string,
  ): Promise<OAuthTokens> {
    const capabilities = OAUTH_CAPABILITIES[provider]
    if (!capabilities) throw new OAuthError(provider, 'Unknown provider')

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: capabilities.clientId,
      code_verifier: codeVerifier,
    })

    const response = await fetch(capabilities.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new OAuthError(provider, `Token exchange failed: ${response.status} ${text}`)
    }

    const data = await response.json()

    const tokens: OAuthTokens = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
    }

    // Store and parse ID token if present
    if (data.id_token) {
      tokens.idToken = data.id_token
      try {
        const payload = JSON.parse(
          Buffer.from(data.id_token.split('.')[1], 'base64url').toString(),
        )
        if (payload.email) tokens.email = payload.email
      } catch {
        // ID token parsing is best-effort
      }
    }

    // OpenAI-specific: extract account ID
    if (provider === 'openai' && data.account_id) {
      tokens.accountId = data.account_id
    }

    // OpenAI token exchange: convert ID token to API key
    if (provider === 'openai' && capabilities.supportsTokenExchange && data.id_token) {
      const apiKey = await this.exchangeForApiKey(capabilities, data.id_token)
      if (apiKey) {
        tokens.accessToken = apiKey
      } else {
        throw new OAuthError(provider, 'Failed to exchange token for API key. Please try again.')
      }
    }

    return tokens
  }

  private async exchangeForApiKey(
    capabilities: { tokenUrl: string; clientId: string },
    idToken: string,
  ): Promise<string | null> {
    try {
      const body = new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
        client_id: capabilities.clientId,
        requested_token: 'openai-api-key',
        subject_token: idToken,
        subject_token_type: 'urn:ietf:params:oauth:token-type:id_token',
      })

      const response = await fetch(capabilities.tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      })

      if (!response.ok) {
        console.error('Token exchange for API key failed:', response.status)
        return null
      }

      const data = await response.json()
      return data.access_token || null
    } catch (error) {
      console.error('Token exchange error:', error)
      return null
    }
  }

  async refreshToken(provider: ProviderType, currentTokens: OAuthTokens): Promise<OAuthTokens | null> {
    if (!currentTokens.refreshToken) return null

    const capabilities = OAUTH_CAPABILITIES[provider]
    if (!capabilities?.supported) return null

    try {
      const body = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: currentTokens.refreshToken,
        client_id: capabilities.clientId,
      })

      const response = await fetch(capabilities.tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      })

      if (!response.ok) {
        console.error(`Token refresh failed for ${provider}: ${response.status}`)
        return null
      }

      const data = await response.json()

      const newTokens: OAuthTokens = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || currentTokens.refreshToken,
        idToken: data.id_token || currentTokens.idToken,
        expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
        accountId: currentTokens.accountId,
        email: currentTokens.email,
      }

      // OpenAI: re-exchange the new ID token for an API key
      if (provider === 'openai' && capabilities.supportsTokenExchange && newTokens.idToken) {
        const apiKey = await this.exchangeForApiKey(capabilities, newTokens.idToken)
        if (apiKey) {
          newTokens.accessToken = apiKey
        }
      }

      return newTokens
    } catch (error) {
      console.error(`Token refresh error for ${provider}:`, error)
      return null
    }
  }

  scheduleRefresh(provider: ProviderType, tokens: OAuthTokens): void {
    this.clearRefreshTimer(provider)

    if (!tokens.refreshToken) return

    const refreshAt = tokens.expiresAt - 5 * 60 * 1000
    const delay = Math.max(refreshAt - Date.now(), 10_000)

    const timer = setTimeout(async () => {
      const newTokens = await this.refreshToken(provider, tokens)
      if (newTokens) {
        this.tokenRefreshCallback?.(provider, newTokens)
        this.scheduleRefresh(provider, newTokens)
      } else {
        this.emitStatus({ state: 'error', provider, error: 'Token refresh failed. Please sign in again.' })
      }
    }, delay)

    this.refreshTimers.set(provider, timer)
  }

  clearRefreshTimer(provider: string): void {
    const timer = this.refreshTimers.get(provider)
    if (timer) {
      clearTimeout(timer)
      this.refreshTimers.delete(provider)
    }
  }

  cancelFlow(): void {
    this.shutdownServer()
  }

  private shutdownServer(): void {
    if (this.activeServer) {
      this.activeServer.close()
      this.activeServer = null
    }
  }

  getCapabilities(provider: ProviderType): { supported: boolean; experimental?: boolean } {
    const cap = OAUTH_CAPABILITIES[provider]
    return {
      supported: cap?.supported ?? false,
      experimental: cap?.experimental,
    }
  }

  destroy(): void {
    this.shutdownServer()
    for (const timer of this.refreshTimers.values()) {
      clearTimeout(timer)
    }
    this.refreshTimers.clear()
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  private buildCallbackHtml(success: boolean, message: string): string {
    return `<!DOCTYPE html>
<html>
<head>
  <title>Keystone - OAuth</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #1a1a2e; color: #e0e0e0; }
    .card { text-align: center; padding: 2rem; border-radius: 12px; background: #16213e; max-width: 400px; }
    .icon { font-size: 3rem; margin-bottom: 1rem; }
    h1 { font-size: 1.25rem; margin: 0.5rem 0; }
    p { color: #a0a0b0; font-size: 0.9rem; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${success ? '&#10003;' : '&#10007;'}</div>
    <h1>${success ? 'Connected!' : 'Connection Failed'}</h1>
    <p>${this.escapeHtml(message)}</p>
  </div>
</body>
</html>`
  }
}
