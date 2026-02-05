import { type ReactNode, useState, useCallback, useRef, useEffect } from 'react'

interface ResizablePanelProps {
  left: ReactNode
  right: ReactNode
  defaultRatio?: number
  minRatio?: number
  maxRatio?: number
}

export function ResizablePanel({
  left,
  right,
  defaultRatio = 0.5,
  minRatio = 0.2,
  maxRatio = 0.8,
}: ResizablePanelProps) {
  const [ratio, setRatio] = useState(defaultRatio)
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
      setRatio(newRatio)
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
  }, [minRatio, maxRatio])

  return (
    <div ref={containerRef} className="flex h-full">
      <div style={{ width: `${ratio * 100}%` }} className="overflow-hidden">
        {left}
      </div>
      <div
        onMouseDown={handleMouseDown}
        className="w-1 cursor-col-resize bg-gray-200 transition-colors hover:bg-indigo-400 dark:bg-gray-700 dark:hover:bg-indigo-500"
      />
      <div style={{ width: `${(1 - ratio) * 100}%` }} className="overflow-hidden">
        {right}
      </div>
    </div>
  )
}
