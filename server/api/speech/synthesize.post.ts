/**
 * Azure Speech Synthesis Endpoint
 *
 * Converts text to speech using Microsoft Azure Cognitive Services
 *
 * Supported South African voices:
 * - zu-ZA-ThandoNeural (Female Zulu)
 * - zu-ZA-ThembaNeural (Male Zulu)
 * - xh-ZA-ThandoNeural (Female Xhosa)
 * - xh-ZA-ThembaNeural (Male Xhosa)
 * - af-ZA-AdriNeural (Female Afrikaans)
 * - af-ZA-WillemNeural (Male Afrikaans)
 * - en-ZA-LeahNeural (Female SA English)
 * - en-ZA-LukeNeural (Male SA English)
 */

import { getAzureToken } from '../../utils/azureToken'

interface SynthesizeRequest {
  text: string
  language?: string
  voice?: string
  rate?: number
  pitch?: number
}

// Default voices for each language
const DEFAULT_VOICES: Record<string, string> = {
  'en': 'en-ZA-LeahNeural',
  'zu': 'zu-ZA-ThandoNeural',
  'xh': 'xh-ZA-ThandoNeural',
  'af': 'af-ZA-AdriNeural',
  'st': 'st-ZA-ThandoNeural',
  'tn': 'tn-ZA-ThandoNeural',
  'sw': 'sw-KE-ZuriNeural',
}

// Language to locale mapping
const LANGUAGE_LOCALES: Record<string, string> = {
  'en': 'en-ZA',
  'zu': 'zu-ZA',
  'xh': 'xh-ZA',
  'af': 'af-ZA',
  'st': 'st-ZA',
  'tn': 'tn-ZA',
  'sw': 'sw-KE',
  'ha': 'ha-NG', // Note: Hausa may not be fully supported
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // Check if Azure is configured
  if (!config.azureSpeechKey || !config.azureSpeechRegion) {
    throw createError({
      statusCode: 503,
      message: 'Azure Speech Service not configured'
    })
  }

  // Parse request body
  const body = await readBody<SynthesizeRequest>(event)

  if (!body.text || typeof body.text !== 'string') {
    throw createError({
      statusCode: 400,
      message: 'Text is required'
    })
  }

  // Sanitize and limit text
  const text = body.text.trim().slice(0, 5000) // Limit to 5000 chars
  const language = body.language || 'en'
  const voice = body.voice || DEFAULT_VOICES[language] || DEFAULT_VOICES['en']
  const rate = Math.max(0.5, Math.min(2.0, body.rate || 1.0))
  const pitch = Math.max(0.5, Math.min(2.0, body.pitch || 1.0))

  // Get locale for the language
  const locale = LANGUAGE_LOCALES[language] || 'en-ZA'

  // Build SSML
  const ssml = buildSSML(text, voice, locale, rate, pitch)

  try {
    // Get access token (with caching - P0 optimization)
    const accessToken = await getAzureToken(config.azureSpeechKey, config.azureSpeechRegion)

    // Synthesize speech
    const synthesizeUrl = `https://${config.azureSpeechRegion}.tts.speech.microsoft.com/cognitiveservices/v1`

    const audioResponse = await fetch(synthesizeUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-96kbitrate-mono-mp3',
        'User-Agent': 'LearnToReadSA'
      },
      body: ssml
    })

    if (!audioResponse.ok) {
      const errorText = await audioResponse.text()
      console.error('Azure TTS error:', errorText)
      throw new Error(`Speech synthesis failed: ${audioResponse.status}`)
    }

    // Get audio as buffer
    const audioBuffer = await audioResponse.arrayBuffer()
    const audioBase64 = Buffer.from(audioBuffer).toString('base64')

    return {
      success: true,
      audioBase64,
      format: 'audio/mp3',
      voice,
      language: locale
    }

  } catch (err: any) {
    console.error('Azure Speech synthesis error:', err)

    throw createError({
      statusCode: 500,
      message: err.message || 'Speech synthesis failed'
    })
  }
})

/**
 * Build SSML (Speech Synthesis Markup Language) for Azure
 */
function buildSSML(
  text: string,
  voice: string,
  locale: string,
  rate: number,
  pitch: number
): string {
  // Escape XML special characters
  const escapedText = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

  // Convert rate to percentage (1.0 = 0%, 0.5 = -50%, 2.0 = +100%)
  const ratePercent = Math.round((rate - 1) * 100)
  const rateString = ratePercent >= 0 ? `+${ratePercent}%` : `${ratePercent}%`

  // Convert pitch to percentage
  const pitchPercent = Math.round((pitch - 1) * 50)
  const pitchString = pitchPercent >= 0 ? `+${pitchPercent}%` : `${pitchPercent}%`

  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${locale}">
  <voice name="${voice}">
    <prosody rate="${rateString}" pitch="${pitchString}">
      ${escapedText}
    </prosody>
  </voice>
</speak>`
}
