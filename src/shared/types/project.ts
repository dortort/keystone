export interface Project {
  id: string
  name: string
  path: string
  documents: DocumentRef[]
  threads: ThreadRef[]
  createdAt: string
  updatedAt: string
}

export interface DocumentRef {
  id: string
  type: DocumentType
  title: string
  filename: string
}

export interface ThreadRef {
  id: string
  title: string
  status: 'active' | 'archived'
}

export type DocumentType = 'prd' | 'tdd' | 'adr'
