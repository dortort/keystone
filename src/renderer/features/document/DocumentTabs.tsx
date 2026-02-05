import type { Document } from '@shared/types'

interface DocumentTabsProps {
  documents: Document[]
  activeDocumentId: string | null
  onSelect: (id: string) => void
}

export function DocumentTabs({ documents, activeDocumentId, onSelect }: DocumentTabsProps) {
  if (documents.length === 0) return null

  return (
    <div className="flex border-b border-gray-200 dark:border-gray-700">
      {documents.map((doc) => (
        <button
          key={doc.id}
          onClick={() => onSelect(doc.id)}
          className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            doc.id === activeDocumentId
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          {doc.type.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
