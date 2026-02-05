import { z } from 'zod'
import { router, publicProcedure } from './trpc'
import { DecisionDetector } from '../../agents/orchestrator/DecisionDetector'
import type { AgentRequest } from '@shared/types/agent'

const decisionDetector = new DecisionDetector()

export const aiRouter = router({
  chat: publicProcedure
    .input(
      z.object({
        threadId: z.string(),
        projectPath: z.string(),
        message: z.string(),
        documentType: z.enum(['prd', 'tdd', 'adr']).optional(),
        action: z.enum(['inquiry', 'refinement', 'proactive']).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Save user message
      ctx.threadService.addMessage(input.threadId, input.projectPath, 'user', input.message)

      // Check if an AI provider is configured
      if (!ctx.providerManager.isConfigured()) {
        const assistantMessage = ctx.threadService.addMessage(
          input.threadId,
          input.projectPath,
          'assistant',
          'No AI provider configured. Please add an API key in Settings.',
        )
        return assistantMessage
      }

      try {
        const llm = ctx.providerManager.getActive()

        // Build the AgentRequest
        const agentRequest: AgentRequest = {
          threadId: input.threadId,
          message: input.message,
          context: {
            documentType: input.documentType,
            action: input.action ?? 'inquiry',
            recentDocuments: [],
          },
        }

        // Collect streaming response chunks into a full response
        let fullResponse = ''
        let agentId: string | undefined

        for await (const chunk of ctx.orchestrator.process(agentRequest, llm)) {
          fullResponse += chunk.content
          if (!agentId) {
            agentId = chunk.agentId
          }
        }

        // Save the assistant response
        const assistantMessage = ctx.threadService.addMessage(
          input.threadId,
          input.projectPath,
          'assistant',
          fullResponse,
          agentId,
        )

        // Check for decision pivots in the updated thread
        const thread = ctx.threadService.get(input.threadId, input.projectPath)
        let decisionPivot: { previousDecision: string; newDecision: string } | null = null

        if (thread) {
          const pivot = decisionDetector.detectPivot(thread)
          if (pivot) {
            decisionPivot = {
              previousDecision: pivot.previousDecision,
              newDecision: pivot.newDecision,
            }
          }
        }

        return { ...assistantMessage, decisionPivot }
      } catch (error) {
        // Graceful error: save as assistant message so the user sees it in the thread
        const errorMsg =
          error instanceof Error ? error.message : 'An unexpected error occurred while contacting the AI provider.'
        const assistantMessage = ctx.threadService.addMessage(
          input.threadId,
          input.projectPath,
          'assistant',
          `I encountered an error: ${errorMsg}`,
        )
        return assistantMessage
      }
    }),

  configureProvider: publicProcedure
    .input(
      z.object({
        type: z.enum(['openai', 'anthropic', 'google']),
        apiKey: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Configure the in-memory provider
      ctx.providerManager.configure({ type: input.type, apiKey: input.apiKey })
      ctx.providerManager.setActive(input.type)

      // Persist the API key and active provider selection
      ctx.settingsService.setApiKey(input.type, input.apiKey)
      ctx.settingsService.setActiveProvider(input.type)

      return {
        success: true,
        activeProvider: input.type,
        configuredProviders: ctx.providerManager.getConfiguredProviders(),
      }
    }),
})
