import { BaseLLMClient } from './BaseLLMClient'
import type { ChatMessage, ChatOptions } from '@shared/types/provider'

export class OpenAIAdapter extends BaseLLMClient {
  private apiKey: string
  private baseUrl = 'https://api.openai.com/v1'

  constructor(apiKey: string) {
    super()
    this.apiKey = apiKey
  }

  async *chat(messages: ChatMessage[], options?: ChatOptions): AsyncIterable<string> {
    const allMessages = [...messages]
    if (options?.systemPrompt) {
      allMessages.unshift({ role: 'system', content: options.systemPrompt })
    }

    const body: Record<string, unknown> = {
      model: options?.model || 'gpt-4o',
      messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
      stream: true,
    }

    if (options?.temperature !== undefined) {
      body.temperature = options.temperature
    }
    if (options?.maxTokens) {
      body.max_tokens = options.maxTokens
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`OpenAI API error: ${response.status} ${error}`)
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
            const content = parsed.choices?.[0]?.delta?.content
            if (content) yield content
          } catch (e) {
            console.warn('Failed to parse SSE chunk:', e)
          }
        }
      }
    }
  }
}
