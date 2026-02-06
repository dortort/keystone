import { z } from 'zod'
import { router, publicProcedure } from './trpc'

export const oauthRouter = router({
  startFlow: publicProcedure
    .input(z.object({
      provider: z.enum(['openai', 'anthropic', 'google']),
    }))
    .mutation(async ({ input, ctx }) => {
      const tokens = await ctx.oauthService.startFlow(input.provider)

      // Store tokens and update auth method
      ctx.settingsService.setOAuthTokens(input.provider, tokens)
      ctx.settingsService.setAuthMethod(input.provider, 'oauth')

      // Configure provider with OAuth token
      ctx.providerManager.configure({
        type: input.provider,
        authMethod: 'oauth',
        oauthToken: tokens.accessToken,
        accountId: tokens.accountId,
      })
      ctx.providerManager.setActive(input.provider)
      ctx.settingsService.setActiveProvider(input.provider)

      // Schedule token refresh
      ctx.oauthService.scheduleRefresh(input.provider, tokens)

      return {
        success: true,
        email: tokens.email,
        provider: input.provider,
      }
    }),

  disconnect: publicProcedure
    .input(z.object({
      provider: z.enum(['openai', 'anthropic', 'google']),
    }))
    .mutation(({ input, ctx }) => {
      // Clear tokens and refresh timer
      ctx.settingsService.deleteOAuthTokens(input.provider)
      ctx.oauthService.clearRefreshTimer(input.provider)

      // Remove the provider from memory
      ctx.providerManager.removeProvider(input.provider)

      return { success: true }
    }),

  getStatus: publicProcedure
    .input(z.object({
      provider: z.enum(['openai', 'anthropic', 'google']),
    }))
    .query(({ input, ctx }) => {
      const tokens = ctx.settingsService.getOAuthTokens(input.provider)
      const authMethod = ctx.settingsService.getAuthMethod(input.provider)

      return {
        connected: authMethod === 'oauth' && tokens !== null,
        email: tokens?.email ?? null,
        expiresAt: tokens?.expiresAt ?? null,
        authMethod,
      }
    }),

  getCapabilities: publicProcedure
    .input(z.object({
      provider: z.enum(['openai', 'anthropic', 'google']),
    }))
    .query(({ input, ctx }) => {
      return ctx.oauthService.getCapabilities(input.provider)
    }),
})
