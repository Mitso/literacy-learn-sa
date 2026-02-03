/**
 * Azure Speech Token Management
 *
 * Shared utility for managing Azure Speech Service authorization tokens.
 * Tokens are cached for 9 minutes (1-minute buffer before 10-minute expiry).
 */

interface CachedToken {
  token: string
  expiry: number
  region: string
}

let cachedToken: CachedToken | null = null

/**
 * Get Azure authorization token with caching
 *
 * @param apiKey - Azure Speech Service subscription key
 * @param region - Azure region (e.g., 'southafricanorth')
 * @returns Authorization token string
 */
export async function getAzureToken(apiKey: string, region: string): Promise<string> {
  const now = Date.now()

  // Return cached token if valid and for same region
  if (cachedToken && cachedToken.region === region && now < cachedToken.expiry) {
    return cachedToken.token
  }

  const tokenUrl = `https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': apiKey,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })

  if (!response.ok) {
    throw new Error(`Token request failed: ${response.status}`)
  }

  const token = await response.text()

  // Cache token for 9 minutes (1-minute buffer before 10-minute expiry)
  cachedToken = {
    token,
    expiry: now + 9 * 60 * 1000,
    region
  }

  console.log('Azure token refreshed, cached for 9 minutes')
  return token
}

/**
 * Get the current token expiry timestamp
 */
export function getTokenExpiry(): number {
  return cachedToken?.expiry || 0
}

/**
 * Clear the cached token (useful for testing or forced refresh)
 */
export function clearTokenCache(): void {
  cachedToken = null
}
