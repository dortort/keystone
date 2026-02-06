import { z } from 'zod'
import { BrowserWindow } from 'electron'
import { router, publicProcedure } from './trpc'
import { DecisionDetector } from '../../agents/orchestrator/DecisionDetector'
import type { AgentRequest } from '@shared/types/agent'

const decisionDetector = new DecisionDetector()

/** Send an IPC event to the first available renderer window. */
function sendToRenderer(channel: string, data: unknown): void {
  const win = BrowserWindow.getAllWindows()[0]
  if (win && !win.isDestroyed()) {
    win.webContents.send(channel, data)
  }
}

export const aiRouter = router({
  chat: publicProcedure
    .input(
      z.object({
        threadId: z.string(),
        projectId: z.string(),
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

        // Load recent documents for context
        const docRefs = ctx.documentService.listByProject(input.projectId)
        const recentDocuments = docRefs.map((docRef) => {
          const doc = ctx.documentService.get(docRef.id, input.projectPath)
          return {
            id: doc.id,
            type: doc.type,
            content: doc.content,
          }
        })

        // Check if thread has a specific document context
        const currentThread = ctx.threadService.get(input.threadId, input.projectPath)
        const contextDocumentType = currentThread?.documentId
          ? ctx.documentService.get(currentThread.documentId, input.projectPath).type
          : input.documentType

        // Build the AgentRequest
        const agentRequest: AgentRequest = {
          threadId: input.threadId,
          message: input.message,
          context: {
            documentType: contextDocumentType,
            action: input.action ?? 'inquiry',
            recentDocuments,
          },
        }

        // Stream response chunks to the renderer via IPC while collecting the full response
        let fullResponse = ''
        let agentId: string | undefined

        for await (const chunk of ctx.orchestrator.process(agentRequest, llm)) {
          fullResponse += chunk.content
          if (!agentId) {
            agentId = chunk.agentId
          }

          // Send each chunk to the renderer for real-time display
          sendToRenderer('ai:chunk', {
            threadId: input.threadId,
            chunk: chunk.content,
            agentId: chunk.agentId,
          })
        }

        // Save the complete assistant response to persistent storage
        const assistantMessage = ctx.threadService.addMessage(
          input.threadId,
          input.projectPath,
          'assistant',
          fullResponse,
          agentId,
        )

        // Notify the renderer that streaming is complete
        sendToRenderer('ai:done', {
          threadId: input.threadId,
          messageId: assistantMessage.id,
        })

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
        // Notify the renderer that streaming ended (with error)
        sendToRenderer('ai:done', {
          threadId: input.threadId,
          messageId: null,
        })

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
        apiKey: z.string().min(1).optional(),
        authMethod: z.enum(['apiKey', 'oauth']).optional(),
        oauthToken: z.string().optional(),
        accountId: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const authMethod = input.authMethod || 'apiKey'

      if (authMethod === 'oauth' && input.oauthToken) {
        ctx.providerManager.configure({
          type: input.type,
          authMethod: 'oauth',
          oauthToken: input.oauthToken,
          accountId: input.accountId,
        })
      } else if (input.apiKey) {
        ctx.providerManager.configure({ type: input.type, authMethod: 'apiKey', apiKey: input.apiKey })
        ctx.settingsService.setApiKey(input.type, input.apiKey)
        ctx.settingsService.setAuthMethod(input.type, 'apiKey')
      }

      ctx.providerManager.setActive(input.type)
      ctx.settingsService.setActiveProvider(input.type)

      return {
        success: true,
        activeProvider: input.type,
        configuredProviders: ctx.providerManager.getConfiguredProviders(),
      }
    }),
})
