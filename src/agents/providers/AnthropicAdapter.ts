import { BaseLLMClient } from './BaseLLMClient'
import type { ChatMessage, ChatOptions } from '@shared/types/provider'

export class AnthropicAdapter extends BaseLLMClient {
  private apiKey: string
  private baseUrl = 'https://api.anthropic.com/v1'

  constructor(apiKey: string) {
    super()
    this.apiKey = apiKey
  }

  async *chat(messages: ChatMessage[], options?: ChatOptions): AsyncIterable<string> {
    const systemMessage = messages.find((m) => m.role === 'system')
    const chatMessages = messages.filter((m) => m.role !== 'system')

    const body: Record<string, unknown> = {
      model: options?.model || 'claude-sonnet-4-5-20250929',
      max_tokens: options?.maxTokens || 4096,
      messages: chatMessages.map((m) => ({ role: m.role, content: m.content })),
      stream: true,
    }

    if (options?.temperature !== undefined) {
      body.temperature = options.temperature
    }

    if (systemMessage || options?.systemPrompt) {
      body.system = options?.systemPrompt || systemMessage?.content || ''
    }

    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Anthropic API error: ${response.status} ${error}`)
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
          if (data === '[DONE]') return
          try {
            const parsed = JSON.parse(data)
            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
              yield parsed.delta.text
            }
          } catch (e) {
            console.warn('Failed to parse SSE chunk:', e)
          }
        }
      }
    }
  }
}
