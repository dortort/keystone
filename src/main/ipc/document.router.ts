import { z } from 'zod'
import { router, publicProcedure } from './trpc'

export const documentRouter = router({
  create: publicProcedure
    .input(
      z.object({
        projectId: z.string(),
        projectPath: z.string(),
        type: z.enum(['prd', 'tdd', 'adr']),
        title: z.string().min(1),
      }),
    )
    .mutation(({ input, ctx }) => {
      return ctx.documentService.create(input.projectId, input.projectPath, input.type, input.title)
    }),

  get: publicProcedure
    .input(z.object({ id: z.string(), projectPath: z.string() }))
    .query(({ input, ctx }) => {
      return ctx.documentService.get(input.id, input.projectPath)
    }),

  update: publicProcedure
    .input(z.object({ id: z.string(), projectPath: z.string(), content: z.string() }))
    .mutation(({ input, ctx }) => {
      return ctx.documentService.update(input.id, input.projectPath, input.content)
    }),

  history: publicProcedure
    .input(z.object({ id: z.string(), projectPath: z.string() }))
    .query(({ input, ctx }) => {
      return ctx.documentService.getHistory(input.id, input.projectPath)
    }),

  rollback: publicProcedure
    .input(z.object({ id: z.string(), projectPath: z.string(), version: z.number().int().positive() }))
    .mutation(({ input, ctx }) => {
      return ctx.documentService.rollback(input.id, input.projectPath, input.version)
    }),

  listByProject: publicProcedure
    .input(z.object({ projectId: z.string() }))
    .query(({ input, ctx }) => {
      return ctx.documentService.listByProject(input.projectId)
    }),
})
