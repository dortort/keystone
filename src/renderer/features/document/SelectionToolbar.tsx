import { useRef, useEffect, useState } from 'react'

interface SelectionToolbarProps {
  position: { top: number; left: number }
  onInquire: () => void
  onRefine: () => void
}

export function SelectionToolbar({ position, onInquire, onRefine }: SelectionToolbarProps) {
  const toolbarRef = useRef<HTMLDivElement>(null)
  const [clampedPos, setClampedPos] = useState(position)

  useEffect(() => {
    if (!toolbarRef.current) {
      setClampedPos(position)
      return
    }
    const el = toolbarRef.current
    const parent = el.offsetParent as HTMLElement | null
    if (!parent) {
      setClampedPos(position)
      return
    }

    const parentWidth = parent.clientWidth
    const elWidth = el.offsetWidth
    const clampedLeft = Math.max(4, Math.min(position.left, parentWidth - elWidth - 4))
    const clampedTop = Math.max(4, position.top)

    setClampedPos({ top: clampedTop, left: clampedLeft })
  }, [position])

  return (
    <div
      ref={toolbarRef}
      className="absolute z-40 flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-lg animate-fade-in dark:border-gray-600 dark:bg-gray-800"
      style={{ top: clampedPos.top, left: clampedPos.left }}
      role="toolbar"
      aria-label="Text selection actions"
    >
      <button
        onClick={onInquire}
        className="flex items-center gap-1 rounded px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        aria-label="Inquire about selected text"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        Inquire
      </button>
      <div className="h-5 w-px bg-gray-200 dark:bg-gray-600" aria-hidden="true" />
      <button
        onClick={onRefine}
        className="flex items-center gap-1 rounded px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        aria-label="Refine selected text"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
        Refine
      </button>
    </div>
  )
}
