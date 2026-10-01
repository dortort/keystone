import { useState } from 'react'
import { ThreadList } from './ThreadList'
import { ChatView } from './ChatView'
import { useThreadStore } from '../../stores/threadStore'

interface ConversationPanelProps {
  onSendMessage: (content: string) => void
  onNewThread: () => void
  onBranch?: (messageId: string) => void
}

export function ConversationPanel({ onSendMessage, onNewThread, onBranch }: ConversationPanelProps) {
  const threads = useThreadStore((s) => s.threads)
  const activeThreadId = useThreadStore((s) => s.activeThreadId)
  const streamingMessageId = useThreadStore((s) => s.streamingMessageId)
  const setActiveThread = useThreadStore((s) => s.setActiveThread)
  const [threadListCollapsed, setThreadListCollapsed] = useState(false)

  const activeThread = threads.find((t) => t.id === activeThreadId)
  const threadInfos = threads.map((t) => ({
    id: t.id,
    title: t.title,
    status: t.status,
    updatedAt: t.updatedAt,
  }))

  return (
    <div className="flex h-full">
      {!threadListCollapsed && (
        <div className="w-48 flex-shrink-0 border-r border-gray-200 transition-all dark:border-gray-700">
          <ThreadList
            threads={threadInfos}
            activeThreadId={activeThreadId}
            onSelectThread={setActiveThread}
            onNewThread={onNewThread}
          />
        </div>
      )}
      <div className="flex flex-1 flex-col">
        {/* Thread list collapse toggle */}
        <div className="flex items-center border-b border-gray-200 px-2 py-1 dark:border-gray-700">
          <button
            onClick={() => setThreadListCollapsed(!threadListCollapsed)}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
            aria-label={threadListCollapsed ? 'Show thread list' : 'Hide thread list'}
            aria-expanded={!threadListCollapsed}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              {threadListCollapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7M18 19l-7-7 7-7" />
              )}
            </svg>
          </button>
          {activeThread && (
            <span className="ml-2 truncate text-xs font-medium text-gray-600 dark:text-gray-400">
              {activeThread.title}
            </span>
          )}
        </div>
        <div className="flex-1">
          {activeThread ? (
            <ChatView
              messages={activeThread.messages}
              streamingMessageId={streamingMessageId}
              isStreaming={!!streamingMessageId}
              onSendMessage={onSendMessage}
              onBranch={onBranch}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400 dark:text-gray-500">
              <div className="text-center">
                <p className="text-lg font-medium">No thread selected</p>
                <p className="mt-1 text-sm">Create a new thread to start a conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
