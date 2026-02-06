import type { Document } from '@shared/types'

interface DocumentTabsProps {
  documents: Document[]
  activeDocumentId: string | null
  onSelect: (id: string) => void
}

export function DocumentTabs({ documents, activeDocumentId, onSelect }: DocumentTabsProps) {
  if (documents.length === 0) return null

  return (
    <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700" role="tablist">
      {documents.map((doc) => (
        <button
          key={doc.id}
          onClick={() => onSelect(doc.id)}
          role="tab"
          aria-selected={doc.id === activeDocumentId}
          className={`flex-shrink-0 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            doc.id === activeDocumentId
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <span className="uppercase">{doc.type}</span>
          {doc.title && (
            <span className="ml-1.5 max-w-[120px] truncate text-xs font-normal opacity-70">
              {doc.title}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
