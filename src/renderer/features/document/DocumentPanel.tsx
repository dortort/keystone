import { DocumentTabs } from './DocumentTabs'
import { MarkdownPreview } from './MarkdownPreview'
import { DocumentOutline } from './DocumentOutline'
import { useDocumentStore } from '../../stores/documentStore'

interface DocumentPanelProps {
  onInquire?: (selectedText: string) => void
  onRefine?: (selectedText: string) => void
}

export function DocumentPanel({ onInquire, onRefine }: DocumentPanelProps) {
  const documents = useDocumentStore((s) => s.documents)
  const activeDocumentId = useDocumentStore((s) => s.activeDocumentId)
  const setActiveDocument = useDocumentStore((s) => s.setActiveDocument)

  const activeDocument = documents.find((d) => d.id === activeDocumentId)

  return (
    <div className="flex h-full flex-col">
      <DocumentTabs
        documents={documents}
        activeDocumentId={activeDocumentId}
        onSelect={setActiveDocument}
      />
      <div className="flex flex-1 overflow-hidden">
        {activeDocument ? (
          <>
            <MarkdownPreview
              content={activeDocument.content}
              onInquire={onInquire}
              onRefine={onRefine}
            />
            <DocumentOutline content={activeDocument.content} />
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-gray-400 dark:text-gray-500">
            <div className="text-center">
              <p className="text-lg font-medium">No document selected</p>
              <p className="mt-1 text-sm">Create or open a document to view it here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
