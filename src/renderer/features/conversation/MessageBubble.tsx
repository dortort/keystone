import type { Message } from '@shared/types'

interface MessageBubbleProps {
  message: Message
  isStreaming?: boolean
  onBranch?: (messageId: string) => void
}

export function MessageBubble({ message, isStreaming, onBranch }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'
  const isAssistant = message.role === 'assistant'

  if (isSystem) {
    return (
      <div className="mx-auto my-2 max-w-lg rounded bg-gray-100 px-3 py-1 text-center text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
        {message.content}
      </div>
    )
  }

  return (
    <div className={`group flex gap-3 px-4 py-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-medium text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300">
          K
        </div>
      )}
      <div className="flex flex-col">
        <div
          className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
            isUser
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
          }`}
        >
          <div className="whitespace-pre-wrap">{message.content}</div>
          {isStreaming && (
            <span className="inline-block h-4 w-1 animate-pulse bg-current opacity-70" />
          )}
        </div>
        {isAssistant && onBranch && !isStreaming && (
          <button
            onClick={() => onBranch(message.id)}
            className="mt-1 self-start rounded px-1.5 py-0.5 text-xs text-gray-400 opacity-0 transition-opacity hover:bg-gray-100 hover:text-gray-600 group-hover:opacity-100 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            title="Branch conversation from this message"
          >
            Branch
          </button>
        )}
      </div>
      {isUser && (
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
          U
        </div>
      )}
    </div>
  )
}
