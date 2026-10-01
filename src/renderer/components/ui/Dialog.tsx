import { type ReactNode, useEffect, useRef, useCallback } from 'react'

interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function Dialog({ open, onClose, title, children }: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Focus trap: keep focus within dialog
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }

      if (e.key !== 'Tab' || !dialogRef.current) return

      const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      const firstEl = focusableElements[0]
      const lastEl = focusableElements[focusableElements.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault()
          lastEl?.focus()
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault()
          firstEl?.focus()
        }
      }
    },
    [onClose],
  )

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement
      document.addEventListener('keydown', handleKeyDown)

      // Focus the first focusable element in the dialog
      requestAnimationFrame(() => {
        const firstFocusable = dialogRef.current?.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )
        firstFocusable?.focus()
      })
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      // Return focus to previously focused element
      if (previousFocusRef.current) {
        previousFocusRef.current.focus()
        previousFocusRef.current = null
      }
    }
  }, [open, handleKeyDown])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="presentation">
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className="relative z-50 w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800"
      >
        <h2 id="dialog-title" className="mb-4 text-lg font-semibold">{title}</h2>
        {children}
      </div>
    </div>
  )
}
