import { DecisionDetector } from './DecisionDetector'
import type { Thread } from '@shared/types/thread'

describe('DecisionDetector', () => {
  let detector: DecisionDetector

  beforeEach(() => {
    detector = new DecisionDetector()
  })

  const createThread = (messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>, documentId?: string): Thread => ({
    id: 'thread-123',
    projectId: 'project-123',
    documentId,
    title: 'Test Thread',
    status: 'active',
    messages: messages.map((msg, idx) => ({
      id: `msg-${idx}`,
      role: msg.role,
      content: msg.content,
      createdAt: '2024-01-01T00:00:00.000Z',
    })),
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  })

  describe('detectPivot', () => {
    it('should return null for empty thread', () => {
      const thread = createThread([])
      expect(detector.detectPivot(thread)).toBeNull()
    })

    it('should return null for single message thread', () => {
      const thread = createThread([
        { role: 'user', content: 'Hello' },
      ])
      expect(detector.detectPivot(thread)).toBeNull()
    })

    it('should return null when no decision language present', () => {
      const thread = createThread([
        { role: 'user', content: 'Can you help me?' },
        { role: 'assistant', content: 'Sure, what do you need?' },
      ])
      expect(detector.detectPivot(thread)).toBeNull()
    })

    it('should detect "use X instead of Y" pattern', () => {
      const thread = createThread([
        { role: 'user', content: "Let's use React instead of Vue." },
        { role: 'assistant', content: 'Good choice!' },
      ])
      const pivot = detector.detectPivot(thread)
      expect(pivot).not.toBeNull()
      expect(pivot?.newDecision).toBe('React')
      expect(pivot?.previousDecision).toBe('Vue')
    })

    it('should detect "switch to X instead of Y" pattern', () => {
      const thread = createThread([
        { role: 'user', content: 'We should switch to PostgreSQL instead of MySQL.' },
        { role: 'assistant', content: 'Understood' },
      ])
      const pivot = detector.detectPivot(thread)
      expect(pivot).not.toBeNull()
      expect(pivot?.newDecision).toBe('PostgreSQL')
      expect(pivot?.previousDecision).toBe('MySQL')
    })

    it('should detect "go with X rather than Y" pattern', () => {
      const thread = createThread([
        { role: 'user', content: "Let's go with TypeScript rather than JavaScript." },
        { role: 'assistant', content: 'Great decision' },
      ])
      const pivot = detector.detectPivot(thread)
      expect(pivot).not.toBeNull()
      expect(pivot?.newDecision).toBe('TypeScript')
      expect(pivot?.previousDecision).toBe('JavaScript')
    })

    it('should detect "chose X over Y" pattern', () => {
      const thread = createThread([
        { role: 'user', content: 'I think we should go with Tailwind instead of Bootstrap.' },
        { role: 'assistant', content: 'OK' },
      ])
      const pivot = detector.detectPivot(thread)
      expect(pivot).not.toBeNull()
      expect(pivot?.newDecision).toBe('Tailwind')
      expect(pivot?.previousDecision).toBe('Bootstrap')
    })

    it('should detect "decided on X instead of Y" pattern', () => {
      const thread = createThread([
        { role: 'user', content: 'We decided on Redis instead of Memcached.' },
        { role: 'assistant', content: 'Noted' },
      ])
      const pivot = detector.detectPivot(thread)
      expect(pivot).not.toBeNull()
      expect(pivot?.newDecision).toBe('Redis')
      expect(pivot?.previousDecision).toBe('Memcached')
    })

    it('should be case insensitive for decision keywords', () => {
      const thread = createThread([
        { role: 'user', content: 'INSTEAD OF using X, we should use Y' },
        { role: 'assistant', content: 'OK' },
      ])
      const pivot = detector.detectPivot(thread)
      expect(pivot).toBeNull() // This won't match the pattern, but keyword is detected
    })

    it('should only analyze last 5 messages', () => {
      const thread = createThread([
        { role: 'user', content: 'Use React instead of Vue' }, // 6th message back
        { role: 'assistant', content: 'msg 2' },
        { role: 'user', content: 'msg 3' },
        { role: 'assistant', content: 'msg 4' },
        { role: 'user', content: 'msg 5' },
        { role: 'assistant', content: 'msg 6' },
        { role: 'user', content: 'msg 7' },
      ])
      // The "React instead of Vue" is 6 messages back, so it won't be analyzed
      const pivot = detector.detectPivot(thread)
      expect(pivot).toBeNull()
    })

    it('should include context from recent messages', () => {
      const thread = createThread([
        { role: 'user', content: "Let's use React instead of Vue" },
        { role: 'assistant', content: 'Sounds good' },
      ])
      const pivot = detector.detectPivot(thread)
      expect(pivot?.context).toContain('user:')
      expect(pivot?.context).toContain('assistant:')
      expect(pivot?.context).toContain('React')
      expect(pivot?.context).toContain('Vue')
    })

    it('should include documentId in affected documents', () => {
      const thread = createThread(
        [
          { role: 'user', content: 'Use React instead of Vue' },
          { role: 'assistant', content: 'OK' },
        ],
        'doc-123',
      )
      const pivot = detector.detectPivot(thread)
      expect(pivot?.affectedDocuments).toEqual(['doc-123'])
    })

    it('should have empty affected documents when no documentId', () => {
      const thread = createThread([
        { role: 'user', content: 'Use React instead of Vue' },
        { role: 'assistant', content: 'OK' },
      ])
      const pivot = detector.detectPivot(thread)
      expect(pivot?.affectedDocuments).toEqual([])
    })

    it('should filter out system messages', () => {
      const thread = createThread([
        { role: 'system', content: 'You are a helpful assistant' },
        { role: 'user', content: 'Use React instead of Vue' },
        { role: 'system', content: 'Another system message' },
        { role: 'assistant', content: 'OK' },
      ])
      const pivot = detector.detectPivot(thread)
      expect(pivot).not.toBeNull()
      expect(pivot?.context).not.toContain('system:')
    })

    it('should handle decision language without matching pattern', () => {
      const thread = createThread([
        { role: 'user', content: 'I decided to refactor the code' },
        { role: 'assistant', content: 'Good idea' },
      ])
      // Has "decided to" keyword but no "X instead of Y" pattern
      const pivot = detector.detectPivot(thread)
      expect(pivot).toBeNull()
    })

    it('should handle multi-word technology names', () => {
      const thread = createThread([
        { role: 'user', content: 'Use React Query instead of Redux Toolkit' },
        { role: 'assistant', content: 'OK' },
      ])
      const pivot = detector.detectPivot(thread)
      expect(pivot).not.toBeNull()
      expect(pivot?.newDecision).toMatch(/React/)
      expect(pivot?.previousDecision).toMatch(/Redux/)
    })

    it('should handle decisions ending with period', () => {
      const thread = createThread([
        { role: 'user', content: 'We should use React instead of Vue.' },
        { role: 'assistant', content: 'OK' },
      ])
      const pivot = detector.detectPivot(thread)
      expect(pivot).not.toBeNull()
      expect(pivot?.newDecision).toBe('React')
    })

    it('should handle decisions ending with comma', () => {
      const thread = createThread([
        { role: 'user', content: 'Use React instead of Vue, it has better support' },
        { role: 'assistant', content: 'OK' },
      ])
      const pivot = detector.detectPivot(thread)
      expect(pivot).not.toBeNull()
      expect(pivot?.newDecision).toBe('React')
    })

    it('should trim whitespace from decisions', () => {
      const thread = createThread([
        { role: 'user', content: 'Use   React   instead of   Vue  ' },
        { role: 'assistant', content: 'OK' },
      ])
      const pivot = detector.detectPivot(thread)
      expect(pivot).not.toBeNull()
      expect(pivot?.newDecision.trim()).toBe(pivot?.newDecision)
      expect(pivot?.previousDecision.trim()).toBe(pivot?.previousDecision)
    })

    it('should detect multiple decision keywords', () => {
      const thread = createThread([
        { role: 'user', content: "We decided to switch from MySQL to PostgreSQL. Let's use it instead of MySQL" },
        { role: 'assistant', content: 'OK' },
      ])
      const pivot = detector.detectPivot(thread)
      expect(pivot).not.toBeNull()
    })

    it('should handle assistant making the decision', () => {
      const thread = createThread([
        { role: 'user', content: 'What should we use?' },
        { role: 'assistant', content: 'I recommend we use React instead of Vue' },
      ])
      const pivot = detector.detectPivot(thread)
      expect(pivot).not.toBeNull()
      expect(pivot?.newDecision).toBe('React')
      expect(pivot?.previousDecision).toBe('Vue')
    })
  })
})
