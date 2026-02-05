import { BaseAgent } from './BaseAgent'
import type { AgentRequest } from '@shared/types/agent'
import { REQUIREMENTS_PROMPT } from '../prompts/system'

export class RequirementsAnalyst extends BaseAgent {
  readonly id = 'requirements-analyst'
  readonly name = 'Requirements Analyst'
  readonly specialty = 'PRD drafting, requirements elicitation, gap detection'
  readonly priority = 50
  protected readonly systemPrompt = REQUIREMENTS_PROMPT

  canHandle(request: AgentRequest): boolean {
    return (
      request.context.documentType === 'prd' ||
      request.context.action === 'inquiry' ||
      /\b(requirement|feature|user stor|acceptance|criteria|prd)\b/i.test(request.message)
    )
  }
}
