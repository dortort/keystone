import { z } from 'zod'
import { router, publicProcedure } from './trpc'

export const aiRouter = router({
  // Chat will be implemented when AI providers are ready
  // For now, provide a simple echo endpoint for testing
  chat: publicProcedure
    .input(
      z.object({
        threadId: z.string(),
        projectPath: z.string(),
        message: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Save user message
      ctx.threadService.addMessage(input.threadId, input.projectPath, 'user', input.message)

      // Placeholder: echo back (will be replaced by AI orchestrator)
      const response = `I received your message: "${input.message}". AI providers are being configured.`
      const assistantMessage = ctx.threadService.addMessage(
        input.threadId,
        input.projectPath,
        'assistant',
        response,
      )

      return assistantMessage
    }),
})
