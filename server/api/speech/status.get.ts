/**
 * Azure Speech Service Status Endpoint
 *
 * Checks if Azure Speech is configured and available
 */

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()

  const isConfigured = !!(
    config.azureSpeechKey &&
    config.azureSpeechRegion
  )

  return {
    available: isConfigured,
    provider: 'azure',
    message: isConfigured
      ? 'Azure Speech Service is configured'
      : 'Azure Speech Service not configured. Using native speech fallback.'
  }
})
