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
    // Find agents that can handle this request and sort by priority (higher = more specific)
    const candidates = Array.from(this.agents.values()).filter((agent) => agent.canHandle(request))

    if (candidates.length === 0) return null

    // Sort by priority descending and return the highest priority agent
    candidates.sort((a, b) => b.priority - a.priority)
    return candidates[0]
  }
}
