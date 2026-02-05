export interface Thread {
  id: string
  projectId: string
  parentThreadId?: string
  documentId?: string
  selectionRange?: { start: number; end: number }
  title: string
  messages: Message[]
  status: 'active' | 'archived'
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  agentId?: string
  createdAt: string
}

export interface MessageChunk {
  threadId: string
  messageId: string
  content: string
  done: boolean
}

export interface ThreadContext {
  documentId?: string
  selectionRange?: { start: number; end: number }
  initialContext?: string
  mode?: 'inquiry' | 'refinement'
}
