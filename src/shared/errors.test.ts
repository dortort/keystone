import {
  KeystoneError,
  ProjectNotFoundError,
  DocumentNotFoundError,
  ProviderError,
  QuotaExhaustedError,
} from './errors'

describe('error classes', () => {
  describe('KeystoneError', () => {
    it('should create error with message and code', () => {
      const error = new KeystoneError('Something went wrong', 'TEST_ERROR')
      expect(error.message).toBe('Something went wrong')
      expect(error.code).toBe('TEST_ERROR')
      expect(error.name).toBe('KeystoneError')
    })

    it('should be an instance of Error', () => {
      const error = new KeystoneError('Test', 'TEST')
      expect(error).toBeInstanceOf(Error)
    })

    it('should be an instance of KeystoneError', () => {
      const error = new KeystoneError('Test', 'TEST')
      expect(error).toBeInstanceOf(KeystoneError)
    })

    it('should have a stack trace', () => {
      const error = new KeystoneError('Test', 'TEST')
      expect(error.stack).toBeDefined()
    })
  })

  describe('ProjectNotFoundError', () => {
    it('should create error with project path', () => {
      const error = new ProjectNotFoundError('/path/to/project')
      expect(error.message).toBe('Project not found at: /path/to/project')
      expect(error.code).toBe('PROJECT_NOT_FOUND')
      expect(error.name).toBe('KeystoneError')
    })

    it('should be an instance of KeystoneError', () => {
      const error = new ProjectNotFoundError('/path')
      expect(error).toBeInstanceOf(KeystoneError)
    })

    it('should handle relative paths', () => {
      const error = new ProjectNotFoundError('./relative/path')
      expect(error.message).toContain('./relative/path')
    })

    it('should handle empty path', () => {
      const error = new ProjectNotFoundError('')
      expect(error.message).toBe('Project not found at: ')
    })

    it('should handle paths with special characters', () => {
      const error = new ProjectNotFoundError('/path/with spaces/and-dashes')
      expect(error.message).toContain('/path/with spaces/and-dashes')
    })
  })

  describe('DocumentNotFoundError', () => {
    it('should create error with document ID', () => {
      const error = new DocumentNotFoundError('doc-123')
      expect(error.message).toBe('Document not found: doc-123')
      expect(error.code).toBe('DOCUMENT_NOT_FOUND')
      expect(error.name).toBe('KeystoneError')
    })

    it('should be an instance of KeystoneError', () => {
      const error = new DocumentNotFoundError('doc-123')
      expect(error).toBeInstanceOf(KeystoneError)
    })

    it('should handle empty ID', () => {
      const error = new DocumentNotFoundError('')
      expect(error.message).toBe('Document not found: ')
    })

    it('should handle IDs with special characters', () => {
      const error = new DocumentNotFoundError('doc-abc-123_xyz')
      expect(error.message).toContain('doc-abc-123_xyz')
    })
  })

  describe('ProviderError', () => {
    it('should create error with provider and message', () => {
      const error = new ProviderError('Anthropic', 'API rate limit exceeded')
      expect(error.message).toBe('Anthropic: API rate limit exceeded')
      expect(error.code).toBe('PROVIDER_ERROR')
      expect(error.name).toBe('KeystoneError')
    })

    it('should be an instance of KeystoneError', () => {
      const error = new ProviderError('OpenAI', 'Connection failed')
      expect(error).toBeInstanceOf(KeystoneError)
    })

    it('should handle different providers', () => {
      const anthropic = new ProviderError('Anthropic', 'Error 1')
      const openai = new ProviderError('OpenAI', 'Error 2')
      expect(anthropic.message).toContain('Anthropic')
      expect(openai.message).toContain('OpenAI')
    })

    it('should handle empty provider', () => {
      const error = new ProviderError('', 'Some error')
      expect(error.message).toBe(': Some error')
    })

    it('should handle empty message', () => {
      const error = new ProviderError('Provider', '')
      expect(error.message).toBe('Provider: ')
    })

    it('should preserve detailed error messages', () => {
      const detailedMessage = 'Request failed with status 503: Service temporarily unavailable'
      const error = new ProviderError('Anthropic', detailedMessage)
      expect(error.message).toContain(detailedMessage)
    })
  })

  describe('QuotaExhaustedError', () => {
    it('should create error with provider name', () => {
      const error = new QuotaExhaustedError('Anthropic')
      expect(error.message).toBe('Anthropic quota exhausted')
      expect(error.code).toBe('QUOTA_EXHAUSTED')
      expect(error.name).toBe('KeystoneError')
    })

    it('should be an instance of KeystoneError', () => {
      const error = new QuotaExhaustedError('OpenAI')
      expect(error).toBeInstanceOf(KeystoneError)
    })

    it('should handle different providers', () => {
      const anthropic = new QuotaExhaustedError('Anthropic')
      const openai = new QuotaExhaustedError('OpenAI')
      expect(anthropic.message).toContain('Anthropic')
      expect(openai.message).toContain('OpenAI')
    })

    it('should handle empty provider', () => {
      const error = new QuotaExhaustedError('')
      expect(error.message).toBe(' quota exhausted')
    })
  })

  describe('error inheritance chain', () => {
    it('should allow catching all Keystone errors', () => {
      const errors = [
        new KeystoneError('Test', 'TEST'),
        new ProjectNotFoundError('/path'),
        new DocumentNotFoundError('doc-123'),
        new ProviderError('Provider', 'Error'),
        new QuotaExhaustedError('Provider'),
      ]

      errors.forEach((error) => {
        expect(error).toBeInstanceOf(KeystoneError)
        expect(error).toBeInstanceOf(Error)
      })
    })

    it('should allow specific error type catching', () => {
      try {
        throw new ProjectNotFoundError('/missing')
      } catch (error) {
        expect(error).toBeInstanceOf(ProjectNotFoundError)
        expect(error).toBeInstanceOf(KeystoneError)
        if (error instanceof ProjectNotFoundError) {
          expect(error.code).toBe('PROJECT_NOT_FOUND')
        }
      }
    })

    it('should allow code-based error handling', () => {
      const errors = [
        new ProjectNotFoundError('/path'),
        new DocumentNotFoundError('doc-123'),
        new ProviderError('Provider', 'Error'),
        new QuotaExhaustedError('Provider'),
      ]

      const codes = errors.map((e) => e.code)
      expect(codes).toEqual([
        'PROJECT_NOT_FOUND',
        'DOCUMENT_NOT_FOUND',
        'PROVIDER_ERROR',
        'QUOTA_EXHAUSTED',
      ])
    })
  })
})
