import { BaseAgent } from './BaseAgent'
import type { AgentRequest } from '@shared/types/agent'
import { ARCHITECT_PROMPT } from '../prompts/system'

export class TechnicalArchitect extends BaseAgent {
  readonly id = 'technical-architect'
  readonly name = 'Technical Architect'
  readonly specialty = 'System design, architecture, trade-off analysis'
  protected readonly systemPrompt = ARCHITECT_PROMPT

  canHandle(request: AgentRequest): boolean {
    return (
      request.context.documentType === 'tdd' ||
      /\b(architect|design|system|component|api|database|schema|infrastructure|tdd)\b/i.test(request.message)
    )
  }
}
