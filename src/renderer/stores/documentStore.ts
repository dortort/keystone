import { create } from 'zustand'
import type { Document } from '@shared/types'

interface DocumentState {
  documents: Document[]
  activeDocumentId: string | null
  setDocuments: (documents: Document[]) => void
  setActiveDocument: (id: string | null) => void
  addDocument: (doc: Document) => void
  updateDocumentContent: (id: string, content: string) => void
  getActiveDocument: () => Document | undefined
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  activeDocumentId: null,
  setDocuments: (documents) => set({ documents }),
  setActiveDocument: (id) => set({ activeDocumentId: id }),
  addDocument: (doc) =>
    set((state) => ({ documents: [...state.documents, doc], activeDocumentId: doc.id })),
  updateDocumentContent: (id, content) =>
    set((state) => ({
      documents: state.documents.map((d) => (d.id === id ? { ...d, content } : d)),
    })),
  getActiveDocument: () => {
    const state = get()
    return state.documents.find((d) => d.id === state.activeDocumentId)
  },
}))
