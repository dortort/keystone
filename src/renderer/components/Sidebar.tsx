import { useProjectStore } from '../stores/projectStore'

interface SidebarProps {
  onSelectProject: (path: string) => void
}

export function Sidebar({ onSelectProject }: SidebarProps) {
  const projects = useProjectStore((s) => s.projects)
  const activeProject = useProjectStore((s) => s.activeProject)

  return (
    <aside className="flex h-full w-52 flex-shrink-0 flex-col border-r border-gray-200 bg-gray-50 transition-all dark:border-gray-700 dark:bg-[#181825]">
      <div className="border-b border-gray-200 px-3 py-2 dark:border-gray-700">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Projects
        </h3>
      </div>
      <nav className="flex-1 overflow-y-auto p-2" aria-label="Project list">
        {projects.length === 0 ? (
          <p className="px-3 py-4 text-center text-xs text-gray-400">
            No projects yet. Create one to get started.
          </p>
        ) : (
          <div className="space-y-1">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => onSelectProject(project.path)}
                aria-current={activeProject?.id === project.id ? 'page' : undefined}
                className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  activeProject?.id === project.id
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                {project.name}
              </button>
            ))}
          </div>
        )}
      </nav>
    </aside>
  )
}
