import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import type Database from 'better-sqlite3'
import type { Thread, Message, ThreadContext } from '@shared/types'
import { generateThreadId, generateId } from '@shared/utils/id'
import { now } from '@shared/utils/date'

export class ThreadService {
  constructor(private db: Database.Database) {}

  create(projectId: string, projectPath: string, context?: ThreadContext): Thread {
    const id = generateThreadId()
    const timestamp = now()
    const title = context?.mode === 'inquiry' ? 'Inquiry' : context?.mode === 'refinement' ? 'Refinement' : 'New Thread'

    this.db
      .prepare(
        'INSERT INTO threads (id, project_id, document_id, parent_thread_id, title, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      )
      .run(id, projectId, context?.documentId ?? null, null, title, 'active', timestamp, timestamp)

    const thread: Thread = {
      id,
      projectId,
      documentId: context?.documentId,
      selectionRange: context?.selectionRange,
      title,
      messages: [],
      status: 'active',
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    // If there's initial context, add a system message
    if (context?.initialContext) {
      const systemMessage: Message = {
        id: generateId(),
        role: 'system',
        content: `Context: "${context.initialContext}"`,
        createdAt: timestamp,
      }
      thread.messages.push(systemMessage)
    }

    // Save thread to filesystem
    this.saveThreadFile(projectPath, thread)

    return thread
  }

  get(threadId: string, projectPath: string): Thread | null {
    const row = this.db.prepare('SELECT * FROM threads WHERE id = ?').get(threadId) as {
      id: string
      project_id: string
      document_id: string | null
      parent_thread_id: string | null
      title: string
      status: string
      created_at: string
      updated_at: string
    } | undefined

    if (!row) return null

    const threadFile = join(projectPath, 'threads', `${threadId}.json`)
    let messages: Message[] = []

    if (existsSync(threadFile)) {
      const data = JSON.parse(readFileSync(threadFile, 'utf-8'))
      messages = data.messages || []
    }

    return {
      id: row.id,
      projectId: row.project_id,
      parentThreadId: row.parent_thread_id ?? undefined,
      documentId: row.document_id ?? undefined,
      title: row.title,
      messages,
      status: row.status as Thread['status'],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }

  addMessage(threadId: string, projectPath: string, role: Message['role'], content: string, agentId?: string): Message {
    const message: Message = {
      id: generateId(),
      role,
      content,
      agentId,
      createdAt: now(),
    }

    const threadFile = join(projectPath, 'threads', `${threadId}.json`)
    let threadData: { messages: Message[] } = { messages: [] }

    if (existsSync(threadFile)) {
      threadData = JSON.parse(readFileSync(threadFile, 'utf-8'))
    }

    threadData.messages.push(message)

    const threadsDir = join(projectPath, 'threads')
    if (!existsSync(threadsDir)) {
      mkdirSync(threadsDir, { recursive: true })
    }
    writeFileSync(threadFile, JSON.stringify(threadData, null, 2), 'utf-8')

    // Update thread timestamp
    this.db.prepare('UPDATE threads SET updated_at = ? WHERE id = ?').run(now(), threadId)

    return message
  }

  updateTitle(threadId: string, title: string): void {
    this.db.prepare('UPDATE threads SET title = ?, updated_at = ? WHERE id = ?').run(title, now(), threadId)
  }

  archive(threadId: string): void {
    this.db.prepare("UPDATE threads SET status = 'archived', updated_at = ? WHERE id = ?").run(now(), threadId)
  }

  branch(threadId: string, projectPath: string, fromMessageId: string): Thread {
    const sourceThread = this.get(threadId, projectPath)
    if (!sourceThread) {
      throw new Error(`Thread not found: ${threadId}`)
    }

    const newId = generateThreadId()
    const timestamp = now()
    const title = `${sourceThread.title} (branched)`

    // Create new thread in database
    this.db
      .prepare(
        'INSERT INTO threads (id, project_id, document_id, parent_thread_id, title, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      )
      .run(newId, sourceThread.projectId, sourceThread.documentId ?? null, threadId, title, 'active', timestamp, timestamp)

    // Copy messages up to and including fromMessageId
    const messageIndex = sourceThread.messages.findIndex((m) => m.id === fromMessageId)
    const copiedMessages = messageIndex >= 0 ? sourceThread.messages.slice(0, messageIndex + 1) : []

    const newThread: Thread = {
      id: newId,
      projectId: sourceThread.projectId,
      parentThreadId: threadId,
      documentId: sourceThread.documentId,
      selectionRange: sourceThread.selectionRange,
      title,
      messages: copiedMessages,
      status: 'active',
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    // Save thread file
    this.saveThreadFile(projectPath, newThread)

    return newThread
  }

  listByProject(projectId: string): Array<{ id: string; title: string; status: string; documentId: string | null; updatedAt: string }> {
    return this.db
      .prepare(
        'SELECT id, title, status, document_id as documentId, updated_at as updatedAt FROM threads WHERE project_id = ? ORDER BY updated_at DESC',
      )
      .all(projectId) as Array<{ id: string; title: string; status: string; documentId: string | null; updatedAt: string }>
  }

  private saveThreadFile(projectPath: string, thread: Thread): void {
    const threadsDir = join(projectPath, 'threads')
    if (!existsSync(threadsDir)) {
      mkdirSync(threadsDir, { recursive: true })
    }
    const threadFile = join(threadsDir, `${thread.id}.json`)
    writeFileSync(
      threadFile,
      JSON.stringify({ messages: thread.messages, selectionRange: thread.selectionRange }, null, 2),
      'utf-8',
    )
  }
}
