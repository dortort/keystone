import { nanoid } from 'nanoid'

export function generateId(): string {
  return nanoid(12)
}

export function generateThreadId(): string {
  return `thread-${nanoid(12)}`
}

export function generateDocumentId(): string {
  return `doc-${nanoid(12)}`
}

export function generateADRNumber(existing: number): string {
  return String(existing + 1).padStart(3, '0')
}
