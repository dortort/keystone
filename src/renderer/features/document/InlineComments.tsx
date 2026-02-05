import type { Comment } from '@shared/types'

interface InlineCommentsProps {
  comments: Comment[]
  onClickComment: (commentId: string) => void
}

const statusStyles: Record<Comment['status'], string> = {
  open: 'bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-900/40 dark:border-yellow-700 dark:text-yellow-300',
  resolved: 'bg-gray-100 border-gray-300 text-gray-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400',
  dismissed: 'bg-gray-100 border-gray-300 text-gray-400 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-500',
}

const statusLabels: Record<Comment['status'], string> = {
  open: 'Open',
  resolved: 'Resolved',
  dismissed: 'Dismissed',
}

export function InlineComments({ comments, onClickComment }: InlineCommentsProps) {
  if (comments.length === 0) return null

  return (
    <div className="w-56 flex-shrink-0 overflow-y-auto border-l border-gray-200 p-3 dark:border-gray-700">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        Comments ({comments.length})
      </h3>
      <div className="flex flex-col gap-2">
        {comments.map((comment) => (
          <button
            key={comment.id}
            onClick={() => onClickComment(comment.id)}
            className={`w-full rounded border px-2 py-1.5 text-left text-xs transition-colors hover:opacity-80 ${statusStyles[comment.status]}`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium truncate">{comment.agentId}</span>
              <span className="ml-1 flex-shrink-0 text-[10px] opacity-70">
                {statusLabels[comment.status]}
              </span>
            </div>
            <p className="mt-0.5 line-clamp-2 opacity-80">
              {comment.content}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}
