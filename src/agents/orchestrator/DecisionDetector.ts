import type { Thread } from '@shared/types/thread'

export interface DecisionPivot {
  previousDecision: string
  newDecision: string
  context: string
  affectedDocuments: string[]
}

export class DecisionDetector {
  private decisionKeywords = [
    'instead of',
    'switch from',
    'change from',
    'replace',
    'pivot to',
    'go with',
    'decided to',
    "let's use",
    'better to use',
    'moving to',
  ]

  detectPivot(thread: Thread): DecisionPivot | null {
    const messages = thread.messages.filter((m) => m.role !== 'system')
    if (messages.length < 2) return null

    const recentMessages = messages.slice(-5)
    const conversationText = recentMessages.map((m) => m.content).join(' ')

    const hasDecisionLanguage = this.decisionKeywords.some((kw) =>
      conversationText.toLowerCase().includes(kw),
    )

    if (!hasDecisionLanguage) return null

    // Simple heuristic: look for "X instead of Y" patterns
    const pivotMatch = conversationText.match(
      /(?:use|switch to|go with|chose|decided on)\s+(.+?)\s+(?:instead of|rather than|over)\s+(.+?)(?:\.|,|$)/i,
    )

    if (pivotMatch) {
      return {
        newDecision: pivotMatch[1].trim(),
        previousDecision: pivotMatch[2].trim(),
        context: recentMessages.map((m) => `${m.role}: ${m.content}`).join('\n'),
        affectedDocuments: thread.documentId ? [thread.documentId] : [],
      }
    }

    return null
  }
}
