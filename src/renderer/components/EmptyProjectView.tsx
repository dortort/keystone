interface EmptyProjectViewProps {
  projectName: string
  onNewThread: () => void
  onOpenSettings: () => void
}

export function EmptyProjectView({ projectName, onNewThread, onOpenSettings }: EmptyProjectViewProps) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl px-8 py-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Get started with {projectName}
        </h1>
        <p className="mt-3 text-base text-gray-600 dark:text-gray-400">
          Start by creating your first conversation thread, or configure an AI provider in settings.
        </p>

        <div className="mt-12 flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
          {/* Card 1 - Start a Conversation */}
          <div className="group w-full max-w-xs cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg hover:shadow-indigo-100 dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/50 dark:hover:shadow-indigo-900/20">
            <div className="p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-900/30 dark:text-indigo-400 dark:group-hover:bg-indigo-600">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-gray-900 dark:text-gray-100">
                Start a Conversation
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                Create a thread to discuss architecture, requirements, or design decisions with AI
              </p>
              <button
                onClick={onNewThread}
                className="mt-6 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800"
              >
                New Thread
              </button>
            </div>
          </div>

          {/* Card 2 - Configure AI Provider */}
          <div className="group w-full max-w-xs cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg hover:shadow-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/50 dark:hover:shadow-gray-900/30">
            <div className="p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition-colors group-hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:group-hover:bg-gray-600">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-gray-900 dark:text-gray-100">
                Configure AI Provider
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                Connect an AI provider like OpenAI, Anthropic, or Google to enable AI-assisted conversations
              </p>
              <button
                onClick={onOpenSettings}
                className="mt-6 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:focus-visible:ring-offset-gray-800"
              >
                Open Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
