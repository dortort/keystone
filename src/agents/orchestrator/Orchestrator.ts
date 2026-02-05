import type { AgentRequest, AgentResponse } from '@shared/types/agent'
import type { BaseLLMClient } from '../providers/BaseLLMClient'
import { AgentRegistry } from './AgentRegistry'
import { RequirementsAnalyst } from '../specialists/RequirementsAnalyst'
import { TechnicalArchitect } from '../specialists/TechnicalArchitect'
import { DecisionAnalyst } from '../specialists/DecisionAnalyst'
import { Critic } from '../specialists/Critic'
import { UXAdvisor } from '../specialists/UXAdvisor'
import { SecurityAnalyst } from '../specialists/SecurityAnalyst'
import { CoherenceChecker } from '../specialists/CoherenceChecker'
import { SHARED_CONTEXT } from '../prompts/system'
import type { ChatMessage } from '@shared/types/provider'

export class Orchestrator {
  private registry: AgentRegistry

  constructor() {
    this.registry = new AgentRegistry()

    // Register default agents
    this.registry.register(new RequirementsAnalyst())
    this.registry.register(new TechnicalArchitect())
    this.registry.register(new DecisionAnalyst())
    this.registry.register(new Critic())
    this.registry.register(new UXAdvisor())
    this.registry.register(new SecurityAnalyst())
    this.registry.register(new CoherenceChecker())
  }

  async *process(request: AgentRequest, llm: BaseLLMClient): AsyncIterable<AgentResponse> {
    // Find the best specialist agent for this request
    const agent = this.registry.findBestAgent(request)

    if (agent) {
      // Route to specialist
      yield* agent.process(request, llm)
    } else {
      // Fallback: use general-purpose response
      yield* this.generalResponse(request, llm)
    }
  }

  private async *generalResponse(request: AgentRequest, llm: BaseLLMClient): AsyncIterable<AgentResponse> {
    const messages: ChatMessage[] = []

    if (request.context.recentDocuments.length > 0) {
      const docContext = request.context.recentDocuments
        .map((d) => `## ${d.type.toUpperCase()}\n${d.content}`)
        .join('\n\n---\n\n')
      messages.push({ role: 'user', content: `Project documents:\n\n${docContext}` })
      messages.push({ role: 'assistant', content: 'I have reviewed the project documents.' })
    }

    if (request.context.selection) {
      messages.push({
        role: 'user',
        content: `Selected text: "${request.context.selection.content}"`,
      })
      messages.push({ role: 'assistant', content: 'I see the selected text.' })
    }

    messages.push({ role: 'user', content: request.message })

    for await (const chunk of llm.chat(messages, { systemPrompt: SHARED_CONTEXT })) {
      yield {
        agentId: 'orchestrator',
        type: 'text',
        content: chunk,
        confidence: 0.7,
      }
    }
  }

  getAgents(): Array<{ id: string; name: string; specialty: string }> {
    return this.registry.getAll().map((a) => ({
      id: a.id,
      name: a.name,
      specialty: a.specialty,
    }))
  }
}
