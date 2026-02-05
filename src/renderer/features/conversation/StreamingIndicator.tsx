export function StreamingIndicator() {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900">
        <div className="flex gap-1">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-600 dark:bg-indigo-300" style={{ animationDelay: '0ms' }} />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-600 dark:bg-indigo-300" style={{ animationDelay: '150ms' }} />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-600 dark:bg-indigo-300" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
      <span className="text-xs text-gray-400">Keystone is thinking...</span>
    </div>
  )
}
