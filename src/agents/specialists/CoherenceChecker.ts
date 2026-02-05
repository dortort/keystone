import { BaseAgent } from './BaseAgent'
import type { AgentRequest } from '@shared/types/agent'
import { COHERENCE_PROMPT } from '../prompts/system'

export class CoherenceChecker extends BaseAgent {
  readonly id = 'coherence-checker'
  readonly name = 'Coherence Checker'
  readonly specialty = 'Cross-document alignment'
  readonly priority = 75
  protected readonly systemPrompt = COHERENCE_PROMPT

  canHandle(request: AgentRequest): boolean {
    return (
      request.context.action === 'proactive' ||
      /\b(consistency|coherence|alignment|contradiction|conflict|mismatch|sync|cross-document)\b/i.test(
        request.message
      )
    )
  }
}
