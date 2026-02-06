import { useState, useMemo } from 'react'
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
  const [searchQuery, setSearchQuery] = useState('')
  const activeThreads = threads.filter((t) => t.status === 'active')

  const filteredThreads = useMemo(() => {
    if (!searchQuery.trim()) return activeThreads
    const query = searchQuery.toLowerCase()
    return activeThreads.filter((t) => t.title.toLowerCase().includes(query))
  }, [activeThreads, searchQuery])

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-200 px-3 py-2 dark:border-gray-700">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Threads
        </h3>
        <Button variant="ghost" size="sm" onClick={onNewThread} aria-label="Create new thread">
          + New
        </Button>
      </div>
      {activeThreads.length > 3 && (
        <div className="border-b border-gray-200 px-2 py-1.5 dark:border-gray-700">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search threads..."
            aria-label="Search threads"
            className="w-full rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:placeholder:text-gray-500"
          />
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-2">
        {activeThreads.length === 0 ? (
          <p className="px-3 py-4 text-center text-xs text-gray-400">No threads yet</p>
        ) : filteredThreads.length === 0 ? (
          <p className="px-3 py-4 text-center text-xs text-gray-400">No matching threads</p>
        ) : (
          <div className="space-y-1">
            {filteredThreads.map((thread) => (
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
