import { useState, useCallback, type KeyboardEvent } from 'react'

interface MessageInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export function MessageInput({ onSend, disabled, placeholder = 'Type a message...' }: MessageInputProps) {
  const [value, setValue] = useState('')

  const handleSend = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
  }, [value, disabled, onSend])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend],
  )

  return (
    <div className="border-t border-gray-200 p-3 dark:border-gray-700">
      <div className="flex items-end gap-2">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          aria-label="Message input"
          className="flex-1 resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:placeholder:text-gray-500"
          style={{ maxHeight: '120px' }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement
            target.style.height = 'auto'
            target.style.height = `${Math.min(target.scrollHeight, 120)}px`
          }}
        />
        <button
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
          aria-label="Send message"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </div>
      <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">
        <kbd className="rounded border border-gray-300 px-1 py-0.5 text-[10px] dark:border-gray-600">Enter</kbd> to send,{' '}
        <kbd className="rounded border border-gray-300 px-1 py-0.5 text-[10px] dark:border-gray-600">Shift+Enter</kbd> for new line
      </p>
    </div>
  )
}
