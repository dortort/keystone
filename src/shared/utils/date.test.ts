import { now, formatRelative } from './date'

describe('date utils', () => {
  describe('now', () => {
    it('should return ISO 8601 formatted string', () => {
      const timestamp = now()
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    })

    it('should return a valid date', () => {
      const timestamp = now()
      const date = new Date(timestamp)
      expect(date.toString()).not.toBe('Invalid Date')
    })

    it('should be close to current time', () => {
      const before = Date.now()
      const timestamp = now()
      const after = Date.now()
      const parsed = new Date(timestamp).getTime()
      expect(parsed).toBeGreaterThanOrEqual(before)
      expect(parsed).toBeLessThanOrEqual(after)
    })
  })

  describe('formatRelative', () => {
    it('should return "just now" for recent times', () => {
      const recent = new Date(Date.now() - 30 * 1000).toISOString()
      expect(formatRelative(recent)).toBe('just now')
    })

    it('should return "just now" for current time', () => {
      const current = new Date().toISOString()
      expect(formatRelative(current)).toBe('just now')
    })

    it('should return minutes for times under an hour', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
      expect(formatRelative(fiveMinutesAgo)).toBe('5m ago')

      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()
      expect(formatRelative(thirtyMinutesAgo)).toBe('30m ago')
    })

    it('should return 1m for exactly 60 seconds', () => {
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString()
      expect(formatRelative(oneMinuteAgo)).toBe('1m ago')
    })

    it('should return hours for times under a day', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      expect(formatRelative(twoHoursAgo)).toBe('2h ago')

      const twentyHoursAgo = new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString()
      expect(formatRelative(twentyHoursAgo)).toBe('20h ago')
    })

    it('should return 1h for exactly 60 minutes', () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
      expect(formatRelative(oneHourAgo)).toBe('1h ago')
    })

    it('should return days for times under a week', () => {
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      expect(formatRelative(twoDaysAgo)).toBe('2d ago')

      const sixDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
      expect(formatRelative(sixDaysAgo)).toBe('6d ago')
    })

    it('should return 1d for exactly 24 hours', () => {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      expect(formatRelative(oneDayAgo)).toBe('1d ago')
    })

    it('should return localized date for times over a week', () => {
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
      const result = formatRelative(twoWeeksAgo)
      expect(result).not.toMatch(/ago$/)
      // Date format varies by locale, just check it contains numbers
      expect(result).toMatch(/\d/)
    })

    it('should handle edge case at 59 seconds', () => {
      const almostOneMinute = new Date(Date.now() - 59 * 1000).toISOString()
      expect(formatRelative(almostOneMinute)).toBe('just now')
    })

    it('should handle edge case at 59 minutes', () => {
      const almostOneHour = new Date(Date.now() - 59 * 60 * 1000).toISOString()
      expect(formatRelative(almostOneHour)).toBe('59m ago')
    })

    it('should handle edge case at 23 hours', () => {
      const almostOneDay = new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString()
      expect(formatRelative(almostOneDay)).toBe('23h ago')
    })

    it('should handle edge case at 7 days', () => {
      const exactlyOneWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const result = formatRelative(exactlyOneWeek)
      expect(result).not.toMatch(/ago$/)
    })

    it('should handle invalid date strings gracefully', () => {
      const result = formatRelative('invalid-date')
      expect(result).toBe('Invalid Date')
    })
  })
})
