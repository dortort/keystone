import { BaseAgent } from './BaseAgent'
import type { AgentRequest } from '@shared/types/agent'
import { DECISION_PROMPT } from '../prompts/system'

export class DecisionAnalyst extends BaseAgent {
  readonly id = 'decision-analyst'
  readonly name = 'Decision Analyst'
  readonly specialty = 'Decision tracking, ADR generation'
  readonly priority = 90
  protected readonly systemPrompt = DECISION_PROMPT

  canHandle(request: AgentRequest): boolean {
    return (
      request.context.documentType === 'adr' ||
      /\b(decision|adr|instead|pivot|switch|change|alternative|option)\b/i.test(request.message)
    )
  }
}
