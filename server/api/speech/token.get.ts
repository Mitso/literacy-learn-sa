/**
 * Azure Speech Token Endpoint
 *
 * Provides authorization tokens for client-side Azure Speech SDK usage.
 * Tokens are valid for 10 minutes, cached for 9 minutes server-side.
 *
 * This endpoint keeps the API key secure on the server while allowing
 * the client to use the Azure Speech SDK directly for features like
 * word boundary events.
 */

import { getAzureToken } from '../../utils/azureToken'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()

  // Check if Azure is configured
  if (!config.azureSpeechKey || !config.azureSpeechRegion) {
    throw createError({
      statusCode: 503,
      message: 'Azure Speech Service not configured'
    })
  }

  try {
    const token = await getAzureToken(config.azureSpeechKey, config.azureSpeechRegion)

    return {
      token,
      region: config.azureSpeechRegion,
      expiresIn: 540 // 9 minutes in seconds (1 min buffer)
    }
  } catch (err: any) {
    console.error('Failed to get Azure token:', err)

    throw createError({
      statusCode: 500,
      message: err.message || 'Failed to get authorization token'
    })
  }
})
