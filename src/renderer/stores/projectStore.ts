import { create } from 'zustand'
import type { Project, DocumentRef, ThreadRef } from '@shared/types'

interface ProjectState {
  projects: Array<{ id: string; name: string; path: string; updatedAt: string }>
  activeProject: Project | null
  setActiveProject: (project: Project | null) => void
  setProjects: (projects: Array<{ id: string; name: string; path: string; updatedAt: string }>) => void
  addProject: (project: Project) => void
  updateDocuments: (documents: DocumentRef[]) => void
  updateThreads: (threads: ThreadRef[]) => void
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  activeProject: null,
  setActiveProject: (project) => set({ activeProject: project }),
  setProjects: (projects) => set({ projects }),
  addProject: (project) =>
    set((state) => ({
      projects: [
        { id: project.id, name: project.name, path: project.path, updatedAt: project.updatedAt },
        ...state.projects,
      ],
      activeProject: project,
    })),
  updateDocuments: (documents) =>
    set((state) => ({
      activeProject: state.activeProject ? { ...state.activeProject, documents } : null,
    })),
  updateThreads: (threads) =>
    set((state) => ({
      activeProject: state.activeProject ? { ...state.activeProject, threads } : null,
    })),
}))
