import { ThreadListItem } from './ThreadListItem'
import { Button } from '../../components/ui/Button'

interface ThreadInfo {
  id: string
  title: string
  status: string
  updatedAt?: string
}

interface ThreadListProps {
  threads: ThreadInfo[]
  activeThreadId: string | null
  onSelectThread: (id: string) => void
  onNewThread: () => void
}

export function ThreadList({ threads, activeThreadId, onSelectThread, onNewThread }: ThreadListProps) {
  const activeThreads = threads.filter((t) => t.status === 'active')

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-200 px-3 py-2 dark:border-gray-700">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Threads
        </h3>
        <Button variant="ghost" size="sm" onClick={onNewThread}>
          + New
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {activeThreads.length === 0 ? (
          <p className="px-3 py-4 text-center text-xs text-gray-400">No threads yet</p>
        ) : (
          <div className="space-y-1">
            {activeThreads.map((thread) => (
              <ThreadListItem
                key={thread.id}
                id={thread.id}
                title={thread.title}
                isActive={thread.id === activeThreadId}
                updatedAt={thread.updatedAt}
                onClick={() => onSelectThread(thread.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
