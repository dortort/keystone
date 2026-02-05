import { BaseAgent } from './BaseAgent'
import type { AgentRequest } from '@shared/types/agent'
import { SECURITY_PROMPT } from '../prompts/system'

export class SecurityAnalyst extends BaseAgent {
  readonly id = 'security-analyst'
  readonly name = 'Security Analyst'
  readonly specialty = 'Security and compliance'
  readonly priority = 85
  protected readonly systemPrompt = SECURITY_PROMPT

  canHandle(request: AgentRequest): boolean {
    return /\b(security|auth|authentication|encryption|vulnerability|threat|compliance|owasp|permissions?|credentials?)\b/i.test(
      request.message
    )
  }
}
