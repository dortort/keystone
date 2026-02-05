import { create } from 'zustand'
import type { Thread, Message } from '@shared/types'

interface ThreadState {
  threads: Thread[]
  activeThreadId: string | null
  streamingMessageId: string | null
  setThreads: (threads: Thread[]) => void
  setActiveThread: (id: string | null) => void
  addThread: (thread: Thread) => void
  addMessage: (threadId: string, message: Message) => void
  addStreamingMessage: (threadId: string, messageId: string) => void
  appendToMessage: (threadId: string, messageId: string, chunk: string) => void
  setStreamingMessageId: (id: string | null) => void
  getActiveThread: () => Thread | undefined
}

export const useThreadStore = create<ThreadState>((set, get) => ({
  threads: [],
  activeThreadId: null,
  streamingMessageId: null,
  setThreads: (threads) => set({ threads }),
  setActiveThread: (id) => set({ activeThreadId: id }),
  addThread: (thread) =>
    set((state) => ({ threads: [thread, ...state.threads], activeThreadId: thread.id })),
  addMessage: (threadId, message) =>
    set((state) => ({
      threads: state.threads.map((t) =>
        t.id === threadId ? { ...t, messages: [...t.messages, message] } : t,
      ),
    })),
  addStreamingMessage: (threadId, messageId) => {
    const placeholderMessage: Message = {
      id: messageId,
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
    }
    set((state) => ({
      threads: state.threads.map((t) =>
        t.id === threadId ? { ...t, messages: [...t.messages, placeholderMessage] } : t,
      ),
      streamingMessageId: messageId,
    }))
  },
  appendToMessage: (threadId, messageId, chunk) =>
    set((state) => ({
      threads: state.threads.map((t) =>
        t.id === threadId
          ? {
              ...t,
              messages: t.messages.map((m) =>
                m.id === messageId ? { ...m, content: m.content + chunk } : m,
              ),
            }
          : t,
      ),
    })),
  setStreamingMessageId: (id) => set({ streamingMessageId: id }),
  getActiveThread: () => {
    const state = get()
    return state.threads.find((t) => t.id === state.activeThreadId)
  },
}))
