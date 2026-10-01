interface ThreadListItemProps {
  id: string
  title: string
  isActive: boolean
  updatedAt?: string
  onClick: () => void
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function ThreadListItem({ title, isActive, updatedAt, onClick }: ThreadListItemProps) {
  return (
    <button
      onClick={onClick}
      aria-current={isActive ? 'true' : undefined}
      className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
        isActive
          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
      }`}
    >
      <div className="truncate font-medium">{title}</div>
      {updatedAt && (
        <div className="mt-0.5 truncate text-xs text-gray-400 dark:text-gray-500">
          {formatRelativeTime(updatedAt)}
        </div>
      )}
    </button>
  )
}
