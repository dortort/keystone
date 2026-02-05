import { useState, useCallback, useRef, useEffect } from 'react'
import { SelectionToolbar } from './SelectionToolbar'
import { renderMarkdown } from '@/lib/markdown'

interface MarkdownPreviewProps {
  content: string
  onInquire?: (selectedText: string) => void
  onRefine?: (selectedText: string) => void
}

export function MarkdownPreview({ content, onInquire, onRefine }: MarkdownPreviewProps) {
  const [selection, setSelection] = useState<{ text: string; position: { top: number; left: number } } | null>(null)
  const [renderedHtml, setRenderedHtml] = useState<string>('')
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

  useEffect(() => {
    renderMarkdown(content).then(setRenderedHtml)
  }, [content])

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
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
      />
      {!content && (
        <div className="flex h-full items-center justify-center text-gray-400">
          <p>No document content</p>
        </div>
      )}
    </div>
  )
}
