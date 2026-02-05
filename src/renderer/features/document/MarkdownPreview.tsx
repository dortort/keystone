import { useState, useCallback, useRef, useEffect } from 'react'
import { SelectionToolbar } from './SelectionToolbar'

interface MarkdownPreviewProps {
  content: string
  onInquire?: (selectedText: string) => void
  onRefine?: (selectedText: string) => void
}

export function MarkdownPreview({ content, onInquire, onRefine }: MarkdownPreviewProps) {
  const [selection, setSelection] = useState<{ text: string; position: { top: number; left: number } } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseUp = useCallback(() => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || !sel.toString().trim()) {
      setSelection(null)
      return
    }

    const range = sel.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    const containerRect = containerRef.current?.getBoundingClientRect()

    if (containerRect) {
      setSelection({
        text: sel.toString(),
        position: {
          top: rect.top - containerRect.top - 40,
          left: rect.left - containerRect.left + rect.width / 2 - 80,
        },
      })
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = () => setSelection(null)
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Simple markdown to HTML rendering (no dependencies needed for basic rendering)
  const renderMarkdown = (md: string): string => {
    const html = md
      // Headers
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2" id="$1">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold mt-6 mb-3" id="$1">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-8 mb-4" id="$1">$1</h1>')
      // Bold and italic
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Code blocks
      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-gray-100 dark:bg-gray-900 rounded-md p-3 my-3 overflow-x-auto text-sm"><code>$2</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-900 px-1.5 py-0.5 rounded text-sm">$1</code>')
      // Lists
      .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
      .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-indigo-600 hover:underline dark:text-indigo-400">$1</a>')
      // Horizontal rule
      .replace(/^---$/gm, '<hr class="my-6 border-gray-200 dark:border-gray-700" />')
      // Paragraphs (simple)
      .replace(/\n\n/g, '</p><p class="my-2">')

    return `<p class="my-2">${html}</p>`
  }

  return (
    <div ref={containerRef} className="relative flex-1 overflow-y-auto p-6">
      {selection && (
        <SelectionToolbar
          position={selection.position}
          onInquire={() => {
            onInquire?.(selection.text)
            setSelection(null)
          }}
          onRefine={() => {
            onRefine?.(selection.text)
            setSelection(null)
          }}
        />
      )}
      <div
        className="prose prose-sm max-w-none dark:prose-invert"
        onMouseUp={handleMouseUp}
        dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
      />
      {!content && (
        <div className="flex h-full items-center justify-center text-gray-400">
          <p>No document content</p>
        </div>
      )}
    </div>
  )
}
