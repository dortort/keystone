import { useEffect, useRef } from 'react'
import type { Message } from '@shared/types'
import { MessageBubble } from './MessageBubble'

interface MessageListProps {
  messages: Message[]
  streamingMessageId: string | null
  onBranch?: (messageId: string) => void
}

export function MessageList({ messages, streamingMessageId, onBranch }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  // Find the content of the streaming message to trigger scroll on content changes
  const streamingContent = streamingMessageId
    ? messages.find((m) => m.id === streamingMessageId)?.content
    : undefined

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-400 dark:text-gray-500">Start a conversation</p>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
            Ask about your project architecture
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isStreaming={message.id === streamingMessageId}
          onBranch={onBranch}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
