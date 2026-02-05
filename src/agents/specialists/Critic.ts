import { BaseAgent } from './BaseAgent'
import type { AgentRequest } from '@shared/types/agent'
import { CRITIC_PROMPT } from '../prompts/system'

export class Critic extends BaseAgent {
  readonly id = 'critic'
  readonly name = 'Critic / Reviewer'
  readonly specialty = 'Document review, inconsistency detection'
  readonly priority = 80
  protected readonly systemPrompt = CRITIC_PROMPT

  canHandle(request: AgentRequest): boolean {
    return /\b(review|critic|check|inconsisten|gap|missing|edge case|problem)\b/i.test(request.message)
  }
}
