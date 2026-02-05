export interface AgentRequest {
  threadId: string
  message: string
  context: {
    documentType?: 'prd' | 'tdd' | 'adr'
    action: 'inquiry' | 'refinement' | 'proactive'
    selection?: { content: string; range: { start: number; end: number } }
    recentDocuments: Array<{ id: string; type: string; content: string }>
  }
}

export interface AgentResponse {
  agentId: string
  type: 'text' | 'document_edit' | 'comment' | 'adr_suggestion'
  content: string
  confidence: number
}

export interface AgentInfo {
  id: string
  name: string
  specialty: string
}
