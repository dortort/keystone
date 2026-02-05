interface ThreadListItemProps {
  id: string
  title: string
  isActive: boolean
  updatedAt?: string
  onClick: () => void
}

export function ThreadListItem({ title, isActive, onClick }: ThreadListItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
        isActive
          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
      }`}
    >
      <div className="truncate font-medium">{title}</div>
    </button>
  )
}
