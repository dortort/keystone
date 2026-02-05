import { useState, useCallback, useEffect } from 'react'
import { ErrorBoundary } from './components/ErrorBoundary'
import { TitleBar } from './components/TitleBar'
import { Sidebar } from './components/Sidebar'
import { StatusBar } from './components/StatusBar'
import { ResizablePanel } from './components/ui/ResizablePanel'
import { ConversationPanel } from './features/conversation/ConversationPanel'
import { DocumentPanel } from './features/document/DocumentPanel'
import { NewProjectDialog } from './features/project/NewProjectDialog'
import { SettingsDialog } from './features/settings/SettingsDialog'
import { ADRPromptDialog } from './features/document/ADRPromptDialog'
import { useUIStore } from './stores/uiStore'
import { useProjectStore } from './stores/projectStore'
import { useThreadStore } from './stores/threadStore'
import { useDocumentStore } from './stores/documentStore'
import { useSettingsStore } from './stores/settingsStore'
import { trpc } from './lib/trpc'
import { ADR_TEMPLATE } from '@shared/constants'

export function App() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const [showNewProject, setShowNewProject] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [pendingPivot, setPendingPivot] = useState<{
    previousDecision: string
    newDecision: string
    threadId: string
  } | null>(null)

  const activeProject = useProjectStore((s) => s.activeProject)
  const setProjects = useProjectStore((s) => s.setProjects)
  const addProject = useProjectStore((s) => s.addProject)
  const setActiveProject = useProjectStore((s) => s.setActiveProject)
  const updateDocuments = useProjectStore((s) => s.updateDocuments)
  const updateThreads = useProjectStore((s) => s.updateThreads)

  const setThreads = useThreadStore((s) => s.setThreads)
  const addThread = useThreadStore((s) => s.addThread)
  const addMessage = useThreadStore((s) => s.addMessage)
  const addStreamingMessage = useThreadStore((s) => s.addStreamingMessage)
  const setStreamingMessageId = useThreadStore((s) => s.setStreamingMessageId)

  const setDocuments = useDocumentStore((s) => s.setDocuments)
  const addDocument = useDocumentStore((s) => s.addDocument)

  const loadSettings = useSettingsStore((s) => s.loadSettings)

  // Listen for AI streaming chunks and completion via Electron IPC
  useEffect(() => {
    if (!window.keystoneIPC) return

    window.keystoneIPC.onAIChunk((data) => {
      const streamingId = useThreadStore.getState().streamingMessageId
      if (streamingId) {
        useThreadStore.getState().appendToMessage(data.threadId, streamingId, data.chunk)
      }
    })

    window.keystoneIPC.onAIDone(() => {
      useThreadStore.getState().setStreamingMessageId(null)
    })

    return () => {
      window.keystoneIPC?.removeAIListeners()
    }
  }, [])

  // Load settings and project list on mount
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projects = await trpc.project.list.query()
        setProjects(projects)
      } catch (err) {
        console.error('Failed to load projects:', err)
      }
    }
    loadProjects()
    loadSettings()
  }, [setProjects, loadSettings])

  const handleCreateProject = useCallback(
    async (name: string, path: string) => {
      try {
        const project = await trpc.project.create.mutate({ name, path })
        addProject(project)
      } catch (err) {
        console.error('Failed to create project:', err)
      }
    },
    [addProject],
  )

  const handleNewThread = useCallback(async () => {
    if (!activeProject) return
    try {
      const thread = await trpc.thread.create.mutate({
        projectId: activeProject.id,
        projectPath: activeProject.path,
      })
      addThread(thread)
    } catch (err) {
      console.error('Failed to create thread:', err)
    }
  }, [activeProject, addThread])

  const handleSendMessage = useCallback(
    async (content: string) => {
      const activeThreadId = useThreadStore.getState().activeThreadId
      const activeProj = useProjectStore.getState().activeProject
      if (!activeThreadId || !activeProj) return

      // Optimistically add user message to UI
      const tempUserMessage = {
        id: `temp-${Date.now()}`,
        role: 'user' as const,
        content,
        createdAt: new Date().toISOString(),
      }
      addMessage(activeThreadId, tempUserMessage)

      // Create a placeholder assistant message for streaming
      const streamingId = `streaming-${Date.now()}`
      addStreamingMessage(activeThreadId, streamingId)

      try {
        // ai.chat saves the user message and returns the assistant response
        // While the mutation runs, chunks arrive via IPC and fill the placeholder
        const response = await trpc.ai.chat.mutate({
          threadId: activeThreadId,
          projectId: activeProj.id,
          projectPath: activeProj.path,
          message: content,
        })

        // Extract the decisionPivot (if present)
        const { decisionPivot } = response as typeof response & {
          decisionPivot?: { previousDecision: string; newDecision: string }
        }

        // Streaming already populated the message content via IPC.
        // Ensure streaming state is cleared (in case ai:done arrived before mutation returned).
        setStreamingMessageId(null)

        // Check if a decision pivot was detected
        if (decisionPivot) {
          setPendingPivot({
            previousDecision: decisionPivot.previousDecision,
            newDecision: decisionPivot.newDecision,
            threadId: activeThreadId,
          })
        }
      } catch (err) {
        console.error('Failed to send message:', err)
        // Clear streaming state
        setStreamingMessageId(null)
        // Add error message so user sees feedback
        addMessage(activeThreadId, {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Failed to get a response. Please try again.',
          createdAt: new Date().toISOString(),
        })
      }
    },
    [addMessage, addStreamingMessage, setStreamingMessageId],
  )

  const handleInquire = useCallback(
    async (selectedText: string) => {
      if (!activeProject) return
      try {
        const thread = await trpc.thread.create.mutate({
          projectId: activeProject.id,
          projectPath: activeProject.path,
          context: {
            initialContext: selectedText,
            mode: 'inquiry',
          },
        })
        addThread(thread)
      } catch (err) {
        console.error('Failed to create inquiry thread:', err)
      }
    },
    [activeProject, addThread],
  )

  const handleRefine = useCallback(
    async (selectedText: string) => {
      if (!activeProject) return
      try {
        const thread = await trpc.thread.create.mutate({
          projectId: activeProject.id,
          projectPath: activeProject.path,
          context: {
            initialContext: selectedText,
            mode: 'refinement',
          },
        })
        addThread(thread)
      } catch (err) {
        console.error('Failed to create refinement thread:', err)
      }
    },
    [activeProject, addThread],
  )

  const handleSelectProject = useCallback(
    async (_path: string) => {
      try {
        // Open project via backend (loads full project with doc/thread refs)
        const project = await trpc.project.open.mutate({ path: _path })
        setActiveProject(project)

        // Load threads for the project
        const threadList = await trpc.thread.listByProject.query({ projectId: project.id })
        const threadRefs = threadList.map((t) => ({
          id: t.id,
          title: t.title,
          status: t.status as 'active' | 'archived',
        }))
        updateThreads(threadRefs)

        // Load full thread data for the conversation panel
        const fullThreads = await Promise.all(
          threadList.map((t) =>
            trpc.thread.get.query({ threadId: t.id, projectPath: project.path }),
          ),
        )
        setThreads(fullThreads.filter((t): t is NonNullable<typeof t> => t !== null))

        // Load documents for the project
        const docList = await trpc.document.listByProject.query({ projectId: project.id })
        const docRefs = docList.map((d) => ({
          id: d.id,
          type: d.type as 'prd' | 'tdd' | 'adr',
          title: d.title,
          filename: d.filename,
        }))
        updateDocuments(docRefs)

        // Load full document data
        const fullDocs = await Promise.all(
          docList.map((d) =>
            trpc.document.get.query({ id: d.id, projectPath: project.path }),
          ),
        )
        setDocuments(fullDocs)
      } catch (err) {
        console.error('Failed to select project:', err)
      }
    },
    [setActiveProject, updateThreads, updateDocuments, setThreads, setDocuments],
  )

  const handleCreateADR = useCallback(async () => {
    if (!pendingPivot || !activeProject) return

    try {
      // Get existing ADR count for numbering
      const existingDocs = useDocumentStore.getState().documents
      const adrCount = existingDocs.filter((d) => d.type === 'adr').length
      const adrNumber = String(adrCount + 1).padStart(3, '0')

      // Create the ADR document
      const newDoc = await trpc.document.create.mutate({
        projectId: activeProject.id,
        projectPath: activeProject.path,
        type: 'adr',
        title: `Decision: ${pendingPivot.newDecision}`,
      })

      // Fill in the ADR template
      const adrContent = ADR_TEMPLATE.replace('{number}', adrNumber)
        .replace('{title}', pendingPivot.newDecision)
        .replace(
          '{context}',
          `A decision pivot was detected during conversation in thread ${pendingPivot.threadId}.`,
        )
        .replace(
          '{decision}',
          `Changed from: ${pendingPivot.previousDecision}\n\nTo: ${pendingPivot.newDecision}`,
        )
        .replace('{consequences}', '[To be determined]')
        .replace('{threadLink}', pendingPivot.threadId)

      // Update the document with the filled template
      const updatedDoc = await trpc.document.update.mutate({
        id: newDoc.id,
        projectPath: activeProject.path,
        content: adrContent,
      })

      // Add to store
      addDocument(updatedDoc)

      // Update project document references
      const docRefs = useProjectStore.getState().activeProject?.documents || []
      updateDocuments([
        ...docRefs,
        {
          id: updatedDoc.id,
          type: 'adr',
          title: updatedDoc.title,
          filename: `adrs/ADR-${adrNumber}.md`,
        },
      ])

      // Clear pending pivot
      setPendingPivot(null)
    } catch (err) {
      console.error('Failed to create ADR:', err)
    }
  }, [pendingPivot, activeProject, addDocument, updateDocuments])

  return (
    <ErrorBoundary>
      <div className="flex h-full flex-col">
        <TitleBar
          onOpenSettings={() => setShowSettings(true)}
          onNewProject={() => setShowNewProject(true)}
        />

        <div className="flex flex-1 overflow-hidden">
          {sidebarOpen && <Sidebar onSelectProject={handleSelectProject} />}

          {activeProject ? (
            <ResizablePanel
              left={
                <ConversationPanel
                  onSendMessage={handleSendMessage}
                  onNewThread={handleNewThread}
                />
              }
              right={<DocumentPanel onInquire={handleInquire} onRefine={handleRefine} />}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-300 dark:text-gray-600">Welcome to Keystone</h2>
                <p className="mt-2 text-gray-400 dark:text-gray-500">
                  Create or open a project to get started
                </p>
                <button
                  onClick={() => setShowNewProject(true)}
                  className="mt-4 rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  New Project
                </button>
              </div>
            </div>
          )}
        </div>

        <StatusBar />

        <NewProjectDialog
          open={showNewProject}
          onClose={() => setShowNewProject(false)}
          onCreate={handleCreateProject}
        />

        <SettingsDialog open={showSettings} onClose={() => setShowSettings(false)} />

        {pendingPivot && (
          <ADRPromptDialog
            open={true}
            previousDecision={pendingPivot.previousDecision}
            newDecision={pendingPivot.newDecision}
            onCreateADR={handleCreateADR}
            onDismiss={() => setPendingPivot(null)}
          />
        )}
      </div>
    </ErrorBoundary>
  )
}
