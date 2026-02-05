import type { BaseAgent } from '../specialists/BaseAgent'

export class AgentRegistry {
  private agents: Map<string, BaseAgent> = new Map()

  register(agent: BaseAgent): void {
    this.agents.set(agent.id, agent)
  }

  get(id: string): BaseAgent | undefined {
    return this.agents.get(id)
  }

  getAll(): BaseAgent[] {
    return Array.from(this.agents.values())
  }

  findBestAgent(request: import('@shared/types/agent').AgentRequest): BaseAgent | null {
    // Find agents that can handle this request, return the first match
    for (const agent of this.agents.values()) {
      if (agent.canHandle(request)) {
        return agent
      }
    }
    return null
  }
}
