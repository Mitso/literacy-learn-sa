/**
 * Azure Speech SDK Service Composable
 *
 * Provides sentence-based speech synthesis using the Azure Speech SDK
 * with real-time word boundary events for perfect word highlighting.
 *
 * Benefits over REST API approach:
 * - Natural prosody and intonation across sentences
 * - Real-time word boundary events for highlighting
 * - Single API call per sentence (vs per word)
 * - Lower latency and cost
 */

import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk'

export interface WordBoundaryEvent {
  wordIndex: number
  word: string
  audioOffsetMs: number
  textOffset: number
  duration: number
}

export interface SdkSpeakOptions {
  text: string
  voice?: string
  rate?: number
  pitch?: number
  onWordBoundary?: (event: WordBoundaryEvent) => void
  onComplete?: () => void
  onError?: (error: Error) => void
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

export const useSpeechSdkService = () => {
  const { locale } = useI18n()

  // State
  const isInitialized = ref(false)
  const isSdkAvailable = ref(false)
  const isPlaying = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // SDK instances (non-reactive for performance)
  let synthesizer: SpeechSDK.SpeechSynthesizer | null = null
  let player: SpeechSDK.SpeakerAudioDestination | null = null
  let currentVoice: string | null = null

  // Token management
  let currentToken = ''
  let currentRegion = ''
  let tokenExpiry = 0

  /**
   * Fetch authorization token from server
   */
  const fetchToken = async (): Promise<{ token: string; region: string }> => {
    const now = Date.now()

    // Return cached token if still valid (with 1 min buffer)
    if (currentToken && now < tokenExpiry - 60000) {
      return { token: currentToken, region: currentRegion }
    }

    try {
      const response = await $fetch<{ token: string; region: string; expiresIn: number }>('/api/speech/token')
      currentToken = response.token
      currentRegion = response.region
      tokenExpiry = now + (response.expiresIn * 1000)
      isSdkAvailable.value = true
      return { token: currentToken, region: currentRegion }
    } catch (err) {
      console.error('Failed to fetch speech token:', err)
      isSdkAvailable.value = false
      throw err
    }
  }

  /**
   * Initialize or reinitialize the synthesizer with a specific voice
   */
  const initSynthesizer = async (voice?: string): Promise<SpeechSDK.SpeechSynthesizer> => {
    const targetVoice = voice || DEFAULT_VOICES[locale.value] || DEFAULT_VOICES['en']

    // Reuse existing synthesizer if voice hasn't changed
    if (synthesizer && currentVoice === targetVoice) {
      return synthesizer
    }

    // Dispose existing synthesizer
    if (synthesizer) {
      try {
        synthesizer.close()
      } catch (e) {
        // Ignore close errors
      }
      synthesizer = null
    }

    const { token, region } = await fetchToken()

    // Create speech config from authorization token (keeps API key server-side)
    const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(token, region)
    speechConfig.speechSynthesisVoiceName = targetVoice
    speechConfig.speechSynthesisOutputFormat = SpeechSDK.SpeechSynthesisOutputFormat.Audio24Khz96KBitRateMonoMp3

    // Create audio destination for playback
    player = new SpeechSDK.SpeakerAudioDestination()
    const audioConfig = SpeechSDK.AudioConfig.fromSpeakerOutput(player)

    synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig)
    currentVoice = targetVoice
    isInitialized.value = true

    return synthesizer
  }

  /**
   * Build SSML with rate and pitch control
   */
  const buildSSML = (text: string, voice: string, rate: number, pitch: number): string => {
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

    // Extract locale from voice name (e.g., en-ZA-LeahNeural -> en-ZA)
    const localeParts = voice.split('-')
    const xmlLang = localeParts.length >= 2 ? `${localeParts[0]}-${localeParts[1]}` : 'en-ZA'

    return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${xmlLang}">
  <voice name="${voice}">
    <prosody rate="${rateString}" pitch="${pitchString}">
      ${escapedText}
    </prosody>
  </voice>
</speak>`
  }

  /**
   * Calculate word index from character offset
   */
  const calculateWordIndex = (textOffset: number, words: string[], originalText: string): number => {
    let charCount = 0

    for (let i = 0; i < words.length; i++) {
      // Find the word's position in original text
      const wordStart = originalText.indexOf(words[i], charCount)
      const wordEnd = wordStart + words[i].length

      if (textOffset >= wordStart && textOffset < wordEnd + 1) {
        return i
      }

      charCount = wordEnd
    }

    return words.length - 1
  }

  /**
   * Speak text with word boundary callbacks
   */
  const speak = async (options: SdkSpeakOptions): Promise<void> => {
    const {
      text,
      voice,
      rate = 1.0,
      pitch = 1.0,
      onWordBoundary,
      onComplete,
      onError
    } = options

    if (!text.trim()) {
      onComplete?.()
      return
    }

    error.value = null
    isLoading.value = true

    try {
      const targetVoice = voice || DEFAULT_VOICES[locale.value] || DEFAULT_VOICES['en']
      const synth = await initSynthesizer(targetVoice)

      // Build SSML with rate/pitch
      const ssml = buildSSML(text, targetVoice, rate, pitch)

      // Pre-calculate words for index mapping
      const words = text.split(/\s+/).filter(w => w.length > 0)

      // Set up word boundary handler
      synth.wordBoundary = (_, e) => {
        if (onWordBoundary) {
          const wordIndex = calculateWordIndex(e.textOffset, words, text)
          onWordBoundary({
            wordIndex,
            word: e.text,
            audioOffsetMs: e.audioOffset / 10000, // Convert from 100ns ticks to ms
            textOffset: e.textOffset,
            duration: e.duration / 10000
          })
        }
      }

      // Perform synthesis
      return new Promise((resolve, reject) => {
        isLoading.value = false
        isPlaying.value = true

        synth.speakSsmlAsync(
          ssml,
          (result) => {
            if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
              isPlaying.value = false
              onComplete?.()
              resolve()
            } else if (result.reason === SpeechSDK.ResultReason.Canceled) {
              const cancellation = SpeechSDK.CancellationDetails.fromResult(result)
              isPlaying.value = false

              if (cancellation.reason === SpeechSDK.CancellationReason.Error) {
                const err = new Error(`Synthesis canceled: ${cancellation.errorDetails}`)
                error.value = cancellation.errorDetails
                onError?.(err)
                reject(err)
              } else {
                // User-initiated cancellation
                onComplete?.()
                resolve()
              }
            }
          },
          (err) => {
            isLoading.value = false
            isPlaying.value = false
            error.value = err
            const synthError = new Error(err)
            onError?.(synthError)
            reject(synthError)
          }
        )
      })
    } catch (e) {
      isLoading.value = false
      isPlaying.value = false
      const err = e as Error
      error.value = err.message
      onError?.(err)
      throw e
    }
  }

  /**
   * Stop playback and dispose synthesizer
   */
  const stop = () => {
    if (player) {
      try {
        player.pause()
      } catch (e) {
        // Ignore pause errors
      }
    }

    if (synthesizer) {
      try {
        synthesizer.close()
      } catch (e) {
        // Ignore close errors
      }
      synthesizer = null
      currentVoice = null
    }

    isPlaying.value = false
    isInitialized.value = false
  }

  /**
   * Pause playback
   */
  const pause = () => {
    if (player) {
      try {
        player.pause()
        isPlaying.value = false
      } catch (e) {
        console.error('Failed to pause:', e)
      }
    }
  }

  /**
   * Resume playback
   */
  const resume = () => {
    if (player) {
      try {
        player.resume()
        isPlaying.value = true
      } catch (e) {
        console.error('Failed to resume:', e)
      }
    }
  }

  /**
   * Check if SDK is available
   */
  const checkAvailability = async (): Promise<boolean> => {
    try {
      await fetchToken()
      return true
    } catch {
      return false
    }
  }

  // Cleanup on unmount
  onUnmounted(() => {
    stop()
  })

  return {
    // State
    isInitialized,
    isSdkAvailable,
    isPlaying,
    isLoading,
    error,

    // Methods
    speak,
    stop,
    pause,
    resume,
    checkAvailability,
  }
}
