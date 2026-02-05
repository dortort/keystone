import { z } from 'zod'
import { router, publicProcedure } from './trpc'

export const settingsRouter = router({
  getSettings: publicProcedure.query(({ ctx }) => {
    return {
      activeProvider: ctx.settingsService.getActiveProvider(),
      configuredProviders: ctx.settingsService.getConfiguredProviders()
    }
  }),

  setApiKey: publicProcedure
    .input(z.object({
      provider: z.string(),
      apiKey: z.string()
    }))
    .mutation(({ ctx, input }) => {
      ctx.settingsService.setApiKey(input.provider, input.apiKey)
      return { success: true }
    }),

  deleteApiKey: publicProcedure
    .input(z.object({
      provider: z.string()
    }))
    .mutation(({ ctx, input }) => {
      ctx.settingsService.deleteApiKey(input.provider)
      return { success: true }
    }),

  setActiveProvider: publicProcedure
    .input(z.object({
      provider: z.string()
    }))
    .mutation(({ ctx, input }) => {
      ctx.settingsService.setActiveProvider(input.provider)
      return { success: true }
    }),

  hasApiKey: publicProcedure
    .input(z.object({
      provider: z.string()
    }))
    .query(({ ctx, input }) => {
      return {
        hasKey: ctx.settingsService.hasApiKey(input.provider)
      }
    }),

  getApiKey: publicProcedure
    .input(z.object({
      provider: z.string()
    }))
    .query(({ ctx, input }) => {
      const apiKey = ctx.settingsService.getApiKey(input.provider)
      return {
        apiKey: apiKey || null
      }
    })
})
