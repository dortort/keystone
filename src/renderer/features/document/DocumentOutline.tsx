import { extractHeadings } from '@shared/utils/markdown'

interface DocumentOutlineProps {
  content: string
}

export function DocumentOutline({ content }: DocumentOutlineProps) {
  const headings = extractHeadings(content)

  if (headings.length === 0) return null

  return (
    <div className="border-l border-gray-200 p-3 dark:border-gray-700">
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Outline</h4>
      <nav className="space-y-1">
        {headings.map((heading, i) => (
          <a
            key={i}
            href={`#${heading.id}`}
            className="block truncate text-xs text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
            style={{ paddingLeft: `${(heading.level - 1) * 12}px` }}
          >
            {heading.text}
          </a>
        ))}
      </nav>
    </div>
  )
}
