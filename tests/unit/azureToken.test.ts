/**
 * Unit Tests: Azure Token Management
 *
 * Tests for server/utils/azureToken.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock the token utility functions
const mockFetch = vi.fn()
global.fetch = mockFetch

// Import after mocking
import { getAzureToken, getTokenExpiry, clearTokenCache } from '../../server/utils/azureToken'

describe('Azure Token Management', () => {
  const mockApiKey = 'test-api-key'
  const mockRegion = 'southafricanorth'
  const mockToken = 'mock-jwt-token-12345'

  beforeEach(() => {
    vi.clearAllMocks()
    clearTokenCache()
  })

  afterEach(() => {
    clearTokenCache()
  })

  describe('getAzureToken', () => {
    it('should fetch a new token when cache is empty', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockToken)
      })

      const token = await getAzureToken(mockApiKey, mockRegion)

      expect(token).toBe(mockToken)
      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(mockFetch).toHaveBeenCalledWith(
        `https://${mockRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Ocp-Apim-Subscription-Key': mockApiKey,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })
      )
    })

    it('should return cached token on subsequent calls', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockToken)
      })

      // First call - fetches new token
      const token1 = await getAzureToken(mockApiKey, mockRegion)
      // Second call - should use cache
      const token2 = await getAzureToken(mockApiKey, mockRegion)

      expect(token1).toBe(mockToken)
      expect(token2).toBe(mockToken)
      expect(mockFetch).toHaveBeenCalledTimes(1) // Only one fetch
    })

    it('should fetch new token when region changes', async () => {
      const newRegion = 'westeurope'
      const newToken = 'new-region-token'

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          text: () => Promise.resolve(mockToken)
        })
        .mockResolvedValueOnce({
          ok: true,
          text: () => Promise.resolve(newToken)
        })

      const token1 = await getAzureToken(mockApiKey, mockRegion)
      const token2 = await getAzureToken(mockApiKey, newRegion)

      expect(token1).toBe(mockToken)
      expect(token2).toBe(newToken)
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('should throw error on failed token request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401
      })

      await expect(getAzureToken(mockApiKey, mockRegion))
        .rejects.toThrow('Token request failed: 401')
    })
  })

  describe('getTokenExpiry', () => {
    it('should return 0 when no token is cached', () => {
      expect(getTokenExpiry()).toBe(0)
    })

    it('should return expiry timestamp after token fetch', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockToken)
      })

      const beforeFetch = Date.now()
      await getAzureToken(mockApiKey, mockRegion)
      const expiry = getTokenExpiry()

      // Expiry should be ~9 minutes from now
      expect(expiry).toBeGreaterThan(beforeFetch)
      expect(expiry).toBeLessThanOrEqual(beforeFetch + 9 * 60 * 1000 + 100)
    })
  })

  describe('clearTokenCache', () => {
    it('should clear the cached token', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(mockToken)
      })

      await getAzureToken(mockApiKey, mockRegion)
      expect(getTokenExpiry()).toBeGreaterThan(0)

      clearTokenCache()
      expect(getTokenExpiry()).toBe(0)

      // Next call should fetch fresh token
      await getAzureToken(mockApiKey, mockRegion)
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })
})
