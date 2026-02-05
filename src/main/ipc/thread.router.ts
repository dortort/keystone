import { z } from 'zod'
import { router, publicProcedure } from './trpc'

export const threadRouter = router({
  create: publicProcedure
    .input(
      z.object({
        projectId: z.string(),
        projectPath: z.string(),
        context: z
          .object({
            documentId: z.string().optional(),
            selectionRange: z.object({ start: z.number(), end: z.number() }).optional(),
            initialContext: z.string().optional(),
            mode: z.enum(['inquiry', 'refinement']).optional(),
          })
          .optional(),
      }),
    )
    .mutation(({ input, ctx }) => {
      return ctx.threadService.create(input.projectId, input.projectPath, input.context)
    }),

  get: publicProcedure
    .input(z.object({ threadId: z.string(), projectPath: z.string() }))
    .query(({ input, ctx }) => {
      return ctx.threadService.get(input.threadId, input.projectPath)
    }),

  addMessage: publicProcedure
    .input(
      z.object({
        threadId: z.string(),
        projectPath: z.string(),
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string(),
        agentId: z.string().optional(),
      }),
    )
    .mutation(({ input, ctx }) => {
      return ctx.threadService.addMessage(input.threadId, input.projectPath, input.role, input.content, input.agentId)
    }),

  updateTitle: publicProcedure
    .input(z.object({ threadId: z.string(), title: z.string() }))
    .mutation(({ input, ctx }) => {
      ctx.threadService.updateTitle(input.threadId, input.title)
    }),

  archive: publicProcedure
    .input(z.object({ threadId: z.string() }))
    .mutation(({ input, ctx }) => {
      ctx.threadService.archive(input.threadId)
    }),

  listByProject: publicProcedure
    .input(z.object({ projectId: z.string() }))
    .query(({ input, ctx }) => {
      return ctx.threadService.listByProject(input.projectId)
    }),
})
