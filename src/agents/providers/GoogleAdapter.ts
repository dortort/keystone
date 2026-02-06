import { BaseLLMClient } from './BaseLLMClient'
import type { ChatMessage, ChatOptions } from '@shared/types/provider'

interface GoogleAuthApiKey {
  apiKey: string
}

interface GoogleAuthOAuth {
  oauthToken: string
}

type GoogleAuth = GoogleAuthApiKey | GoogleAuthOAuth

export class GoogleAdapter extends BaseLLMClient {
  private auth: GoogleAuth
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta'

  constructor(auth: string | GoogleAuth) {
    super()
    this.auth = typeof auth === 'string' ? { apiKey: auth } : auth
  }

  updateOAuthToken(token: string): void {
    this.auth = { oauthToken: token }
  }

  private getAuthHeaders(): Record<string, string> {
    if ('oauthToken' in this.auth) {
      return { Authorization: `Bearer ${this.auth.oauthToken}` }
    }
    return { 'x-goog-api-key': this.auth.apiKey }
  }

  private getUrl(model: string): string {
    const base = `${this.baseUrl}/models/${model}:streamGenerateContent?alt=sse`
    // When using API key (not OAuth), append key as query param is not needed
    // since we send it via header. Just return base URL.
    return base
  }

  async *chat(messages: ChatMessage[], options?: ChatOptions): AsyncIterable<string> {
    const model = options?.model || 'gemini-2.0-flash'

    const systemMessage = messages.find((m) => m.role === 'system')
    const chatMessages = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }))

    const body: Record<string, unknown> = {
      contents: chatMessages,
      generationConfig: {
        temperature: options?.temperature ?? 0.7,
        maxOutputTokens: options?.maxTokens || 4096,
      },
    }

    if (systemMessage || options?.systemPrompt) {
      body.systemInstruction = {
        parts: [{ text: options?.systemPrompt || systemMessage?.content || '' }],
      }
    }

    const url = this.getUrl(model)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Google API error: ${response.status} ${error}`)
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          try {
            const parsed = JSON.parse(data)
            const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text
            if (text) yield text
          } catch (e) {
            console.warn('Failed to parse SSE chunk:', e)
          }
        }
      }
    }
  }
}
