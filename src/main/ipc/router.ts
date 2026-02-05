import { router } from './trpc'
import { projectRouter } from './project.router'
import { documentRouter } from './document.router'
import { threadRouter } from './thread.router'
import { aiRouter } from './ai.router'
import { settingsRouter } from './settings.router'

export const appRouter = router({
  project: projectRouter,
  document: documentRouter,
  thread: threadRouter,
  ai: aiRouter,
  settings: settingsRouter,
})

export type AppRouter = typeof appRouter
