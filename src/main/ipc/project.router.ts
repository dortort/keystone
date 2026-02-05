import { z } from 'zod'
import { router, publicProcedure } from './trpc'

export const projectRouter = router({
  create: publicProcedure
    .input(z.object({ name: z.string().min(1), path: z.string().min(1) }))
    .mutation(({ input, ctx }) => {
      return ctx.projectService.create(input.name, input.path)
    }),

  open: publicProcedure
    .input(z.object({ path: z.string() }))
    .mutation(({ input, ctx }) => {
      return ctx.projectService.open(input.path)
    }),

  list: publicProcedure.query(({ ctx }) => {
    return ctx.projectService.list()
  }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input, ctx }) => {
      ctx.projectService.delete(input.id)
    }),
})
