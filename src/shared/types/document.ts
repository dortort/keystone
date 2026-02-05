import type { DocumentType } from './project'

export interface Document {
  id: string
  type: DocumentType
  title: string
  content: string
  comments: Comment[]
  version: number
  linkedThreads: string[]
  linkedADRs: string[]
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: string
  agentId: string
  range: { start: number; end: number }
  content: string
  status: 'open' | 'resolved' | 'dismissed'
  threadId?: string
}

export interface DocumentVersion {
  version: number
  content: string
  updatedAt: string
}
