import type { Message } from '@shared/types'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import { StreamingIndicator } from './StreamingIndicator'

interface ChatViewProps {
  messages: Message[]
  streamingMessageId: string | null
  isStreaming: boolean
  onSendMessage: (content: string) => void
  onBranch?: (messageId: string) => void
}

export function ChatView({ messages, streamingMessageId, isStreaming, onSendMessage, onBranch }: ChatViewProps) {
  return (
    <div className="flex h-full flex-col">
      <MessageList messages={messages} streamingMessageId={streamingMessageId} onBranch={onBranch} />
      {isStreaming && !streamingMessageId && <StreamingIndicator />}
      <MessageInput onSend={onSendMessage} disabled={isStreaming} />
    </div>
  )
}
