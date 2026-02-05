import { useState, useCallback } from 'react'
import { ErrorBoundary } from './components/ErrorBoundary'
import { TitleBar } from './components/TitleBar'
import { Sidebar } from './components/Sidebar'
import { StatusBar } from './components/StatusBar'
import { ResizablePanel } from './components/ui/ResizablePanel'
import { ConversationPanel } from './features/conversation/ConversationPanel'
import { DocumentPanel } from './features/document/DocumentPanel'
import { NewProjectDialog } from './features/project/NewProjectDialog'
import { SettingsDialog } from './features/settings/SettingsDialog'
import { useUIStore } from './stores/uiStore'
import { useProjectStore } from './stores/projectStore'
import { useThreadStore } from './stores/threadStore'
import type { Thread } from '@shared/types'

export function App() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const [showNewProject, setShowNewProject] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const activeProject = useProjectStore((s) => s.activeProject)
  const addProject = useProjectStore((s) => s.addProject)
  const setActiveProject = useProjectStore((s) => s.setActiveProject)

  const addThread = useThreadStore((s) => s.addThread)
  const addMessage = useThreadStore((s) => s.addMessage)

  const handleCreateProject = useCallback(
    (name: string, path: string) => {
      // For now, create a mock project (will be connected to tRPC later)
      const project = {
        id: `proj-${Date.now()}`,
        name,
        path: `${path}/${name}`,
        documents: [],
        threads: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      addProject(project)
    },
    [addProject],
  )

  const handleNewThread = useCallback(() => {
    if (!activeProject) return
    const thread: Thread = {
      id: `thread-${Date.now()}`,
      projectId: activeProject.id,
      title: 'New Thread',
      messages: [],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    addThread(thread)
  }, [activeProject, addThread])

  const handleSendMessage = useCallback(
    (content: string) => {
      const activeThreadId = useThreadStore.getState().activeThreadId
      if (!activeThreadId) return

      const userMessage = {
        id: `msg-${Date.now()}`,
        role: 'user' as const,
        content,
        createdAt: new Date().toISOString(),
      }
      addMessage(activeThreadId, userMessage)

      // Placeholder response (will be connected to AI provider later)
      setTimeout(() => {
        const aiMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant' as const,
          content: `I received your message. AI providers are being configured. You said: "${content}"`,
          createdAt: new Date().toISOString(),
        }
        addMessage(activeThreadId, aiMessage)
      }, 500)
    },
    [addMessage],
  )

  const handleInquire = useCallback(
    (selectedText: string) => {
      if (!activeProject) return
      const thread: Thread = {
        id: `thread-${Date.now()}`,
        projectId: activeProject.id,
        title: 'Inquiry',
        messages: [
          {
            id: `msg-${Date.now()}`,
            role: 'system',
            content: `Context: "${selectedText}"`,
            createdAt: new Date().toISOString(),
          },
        ],
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      addThread(thread)
    },
    [activeProject, addThread],
  )

  const handleRefine = useCallback(
    (selectedText: string) => {
      if (!activeProject) return
      const thread: Thread = {
        id: `thread-${Date.now()}`,
        projectId: activeProject.id,
        title: 'Refinement',
        messages: [
          {
            id: `msg-${Date.now()}`,
            role: 'system',
            content: `Refine this text: "${selectedText}"`,
            createdAt: new Date().toISOString(),
          },
        ],
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      addThread(thread)
    },
    [activeProject, addThread],
  )

  const handleSelectProject = useCallback(
    (_path: string) => {
      // Will be connected to tRPC later
      const projects = useProjectStore.getState().projects
      const project = projects.find((p) => p.path === _path)
      if (project) {
        setActiveProject({
          ...project,
          documents: [],
          threads: [],
          createdAt: project.updatedAt,
        })
      }
    },
    [setActiveProject],
  )

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
      </div>
    </ErrorBoundary>
  )
}
