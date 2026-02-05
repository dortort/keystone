import { generateId, generateThreadId, generateDocumentId, generateADRNumber } from './id'

describe('id utils', () => {
  describe('generateId', () => {
    it('should generate a 12-character ID', () => {
      const id = generateId()
      expect(id).toHaveLength(12)
    })

    it('should generate unique IDs', () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).not.toBe(id2)
    })

    it('should only contain URL-safe characters', () => {
      const id = generateId()
      expect(id).toMatch(/^[A-Za-z0-9_-]+$/)
    })
  })

  describe('generateThreadId', () => {
    it('should generate ID with thread- prefix', () => {
      const id = generateThreadId()
      expect(id).toMatch(/^thread-/)
    })

    it('should have total length of 19 characters (thread- + 12)', () => {
      const id = generateThreadId()
      expect(id).toHaveLength(19)
    })

    it('should generate unique thread IDs', () => {
      const id1 = generateThreadId()
      const id2 = generateThreadId()
      expect(id1).not.toBe(id2)
    })
  })

  describe('generateDocumentId', () => {
    it('should generate ID with doc- prefix', () => {
      const id = generateDocumentId()
      expect(id).toMatch(/^doc-/)
    })

    it('should have total length of 16 characters (doc- + 12)', () => {
      const id = generateDocumentId()
      expect(id).toHaveLength(16)
    })

    it('should generate unique document IDs', () => {
      const id1 = generateDocumentId()
      const id2 = generateDocumentId()
      expect(id1).not.toBe(id2)
    })
  })

  describe('generateADRNumber', () => {
    it('should increment by 1 and pad to 3 digits', () => {
      expect(generateADRNumber(0)).toBe('001')
      expect(generateADRNumber(5)).toBe('006')
      expect(generateADRNumber(99)).toBe('100')
    })

    it('should handle single digit numbers', () => {
      expect(generateADRNumber(1)).toBe('002')
      expect(generateADRNumber(8)).toBe('009')
    })

    it('should handle double digit numbers', () => {
      expect(generateADRNumber(10)).toBe('011')
      expect(generateADRNumber(42)).toBe('043')
    })

    it('should handle triple digit numbers without padding', () => {
      expect(generateADRNumber(100)).toBe('101')
      expect(generateADRNumber(999)).toBe('1000')
    })

    it('should handle zero', () => {
      expect(generateADRNumber(0)).toBe('001')
    })

    it('should handle large numbers', () => {
      expect(generateADRNumber(9999)).toBe('10000')
    })
  })
})
