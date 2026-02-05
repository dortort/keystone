export interface HeadingInfo {
  level: number
  text: string
  id: string
}

export function extractHeadings(markdown: string): HeadingInfo[] {
  const headings: HeadingInfo[] = []
  const lines = markdown.split('\n')

  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)$/)
    if (match) {
      const level = match[1].length
      const text = match[2].trim()
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      headings.push({ level, text, id })
    }
  }

  return headings
}
