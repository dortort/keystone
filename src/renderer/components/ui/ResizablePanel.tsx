import { type ReactNode, useCallback, useRef, useEffect } from 'react'
import { useUIStore } from '../../stores/uiStore'

interface ResizablePanelProps {
  left: ReactNode
  right: ReactNode
  minRatio?: number
  maxRatio?: number
}

export function ResizablePanel({
  left,
  right,
  minRatio = 0.2,
  maxRatio = 0.8,
}: ResizablePanelProps) {
  const ratio = useUIStore((s) => s.panelRatio)
  const setPanelRatio = useUIStore((s) => s.setPanelRatio)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    isDragging.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const newRatio = Math.min(maxRatio, Math.max(minRatio, (e.clientX - rect.left) / rect.width))
      setPanelRatio(newRatio)
    }

    const handleMouseUp = () => {
      isDragging.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [minRatio, maxRatio, setPanelRatio])

  return (
    <div ref={containerRef} className="flex h-full">
      <div style={{ width: `${ratio * 100}%` }} className="overflow-hidden">
        {left}
      </div>
      <div
        onMouseDown={handleMouseDown}
        role="separator"
        aria-orientation="vertical"
        aria-valuenow={Math.round(ratio * 100)}
        tabIndex={0}
        className="group relative w-1.5 cursor-col-resize bg-gray-200 transition-colors hover:bg-indigo-400 dark:bg-gray-700 dark:hover:bg-indigo-500"
      >
        {/* Wider invisible hit zone for easier grabbing */}
        <div className="absolute inset-y-0 -left-1 -right-1" />
      </div>
      <div style={{ width: `${(1 - ratio) * 100}%` }} className="overflow-hidden">
        {right}
      </div>
    </div>
  )
}
