import { ThreadList } from './ThreadList'
import { ChatView } from './ChatView'
import { useThreadStore } from '../../stores/threadStore'

interface ConversationPanelProps {
  onSendMessage: (content: string) => void
  onNewThread: () => void
}

export function ConversationPanel({ onSendMessage, onNewThread }: ConversationPanelProps) {
  const threads = useThreadStore((s) => s.threads)
  const activeThreadId = useThreadStore((s) => s.activeThreadId)
  const streamingMessageId = useThreadStore((s) => s.streamingMessageId)
  const setActiveThread = useThreadStore((s) => s.setActiveThread)

  const activeThread = threads.find((t) => t.id === activeThreadId)
  const threadInfos = threads.map((t) => ({
    id: t.id,
    title: t.title,
    status: t.status,
    updatedAt: t.updatedAt,
  }))

  return (
    <div className="flex h-full">
      <div className="w-56 flex-shrink-0 border-r border-gray-200 dark:border-gray-700">
        <ThreadList
          threads={threadInfos}
          activeThreadId={activeThreadId}
          onSelectThread={setActiveThread}
          onNewThread={onNewThread}
        />
      </div>
      <div className="flex-1">
        {activeThread ? (
          <ChatView
            messages={activeThread.messages}
            streamingMessageId={streamingMessageId}
            isStreaming={!!streamingMessageId}
            onSendMessage={onSendMessage}
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
  )
}
