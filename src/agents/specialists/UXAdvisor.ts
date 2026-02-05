import { BaseAgent } from './BaseAgent'
import type { AgentRequest } from '@shared/types/agent'
import { UX_ADVISOR_PROMPT } from '../prompts/system'

export class UXAdvisor extends BaseAgent {
  readonly id = 'ux-advisor'
  readonly name = 'UX Advisor'
  readonly specialty = 'User experience and flows'
  readonly priority = 60
  protected readonly systemPrompt = UX_ADVISOR_PROMPT

  canHandle(request: AgentRequest): boolean {
    return /\b(user flow|ux|usability|user experience|interface|navigation|onboarding|accessibility)\b/i.test(
      request.message
    )
  }
}
