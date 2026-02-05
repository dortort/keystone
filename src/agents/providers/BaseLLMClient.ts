import type { ChatMessage, ChatOptions } from '@shared/types/provider'

export abstract class BaseLLMClient {
  abstract chat(messages: ChatMessage[], options?: ChatOptions): AsyncIterable<string>

  async chatComplete(messages: ChatMessage[], options?: ChatOptions): Promise<string> {
    const chunks: string[] = []
    for await (const chunk of this.chat(messages, options)) {
      chunks.push(chunk)
    }
    return chunks.join('')
  }
}
