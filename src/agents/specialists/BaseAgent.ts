import type { AgentRequest, AgentResponse } from '@shared/types/agent'
import type { BaseLLMClient } from '../providers/BaseLLMClient'
import type { ChatMessage } from '@shared/types/provider'

export abstract class BaseAgent {
  abstract readonly id: string
  abstract readonly name: string
  abstract readonly specialty: string
  protected abstract readonly systemPrompt: string

  abstract canHandle(request: AgentRequest): boolean

  async *process(request: AgentRequest, llm: BaseLLMClient): AsyncIterable<AgentResponse> {
    const messages: ChatMessage[] = []

    // Add document context if available
    if (request.context.recentDocuments.length > 0) {
      const docContext = request.context.recentDocuments
        .map((d) => `## ${d.type.toUpperCase()}\n${d.content}`)
        .join('\n\n---\n\n')
      messages.push({ role: 'user', content: `Here are the current project documents:\n\n${docContext}` })
      messages.push({ role: 'assistant', content: 'I have reviewed the project documents. How can I help?' })
    }

    // Add selection context if available
    if (request.context.selection) {
      messages.push({
        role: 'user',
        content: `I've selected this text from the document: "${request.context.selection.content}"`,
      })
      messages.push({ role: 'assistant', content: 'I see the selected text. What would you like to do with it?' })
    }

    // Add the actual user message
    messages.push({ role: 'user', content: request.message })

    for await (const chunk of llm.chat(messages, { systemPrompt: this.systemPrompt })) {
      yield {
        agentId: this.id,
        type: 'text',
        content: chunk,
        confidence: 0.8,
      }
    }
  }
}
