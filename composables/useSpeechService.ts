/**
 * Speech Service Composable
 *
 * Provides text-to-speech functionality with Azure Speech as primary
 * and Web Speech API as fallback.
 *
 * Azure Speech supports South African languages:
 * - zu-ZA (isiZulu)
 * - xh-ZA (isiXhosa)
 * - af-ZA (Afrikaans)
 * - en-ZA (South African English)
 * - st-ZA (Sesotho)
 * - tn-ZA (Setswana)
 * - sw-KE (Kiswahili)
 */

interface SpeechOptions {
  text: string
  language?: string
  rate?: number // 0.5 to 2.0
  pitch?: number // 0.5 to 2.0
  voice?: string // Azure voice name
}

interface VoiceInfo {
  name: string
  language: string
  gender: 'male' | 'female'
  provider: 'azure' | 'native'
}

// Azure voice mappings for supported languages
const AZURE_VOICES: Record<string, { name: string; gender: 'male' | 'female' }[]> = {
  'en': [
    { name: 'en-ZA-LeahNeural', gender: 'female' },
    { name: 'en-ZA-LukeNeural', gender: 'male' },
    { name: 'en-GB-SoniaNeural', gender: 'female' },
    { name: 'en-US-JennyNeural', gender: 'female' },
  ],
  'zu': [
    { name: 'zu-ZA-ThandoNeural', gender: 'female' },
    { name: 'zu-ZA-ThembaNeural', gender: 'male' },
  ],
  'xh': [
    { name: 'xh-ZA-ThandoNeural', gender: 'female' },
    { name: 'xh-ZA-ThembaNeural', gender: 'male' },
  ],
  'af': [
    { name: 'af-ZA-AdriNeural', gender: 'female' },
    { name: 'af-ZA-WillemNeural', gender: 'male' },
  ],
  'st': [
    { name: 'st-ZA-ThandoNeural', gender: 'female' },
    { name: 'st-ZA-ThembaNeural', gender: 'male' },
  ],
  'tn': [
    { name: 'tn-ZA-ThandoNeural', gender: 'female' },
    { name: 'tn-ZA-ThembaNeural', gender: 'male' },
  ],
  'sw': [
    { name: 'sw-KE-ZuriNeural', gender: 'female' },
    { name: 'sw-KE-RafikiNeural', gender: 'male' },
  ],
  'ha': [
    // Hausa not supported by Azure, will fallback to native
  ],
}

export const useSpeechService = () => {
  const config = useRuntimeConfig()
  const { locale } = useI18n()

  // State
  const isAzureAvailable = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentProvider = ref<'azure' | 'native'>('native')
  const availableVoices = ref<VoiceInfo[]>([])
  const selectedVoice = ref<VoiceInfo | null>(null)

  // Native speech synthesis
  const nativeSynthesis = ref<SpeechSynthesis | null>(null)
  const nativeVoices = ref<SpeechSynthesisVoice[]>([])

  // Audio element for Azure
  const audioElement = ref<HTMLAudioElement | null>(null)
  const audioQueue = ref<string[]>([])
  const isPlaying = ref(false)

  /**
   * Initialize the speech service
   */
  const initialize = async () => {
    // Initialize native speech synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      nativeSynthesis.value = window.speechSynthesis

      const loadNativeVoices = () => {
        nativeVoices.value = nativeSynthesis.value?.getVoices() || []
        updateAvailableVoices()
      }

      loadNativeVoices()

      if (nativeSynthesis.value.onvoiceschanged !== undefined) {
        nativeSynthesis.value.onvoiceschanged = loadNativeVoices
      }
    }

    // Check if Azure is configured
    await checkAzureAvailability()

    // Create audio element for Azure
    if (typeof window !== 'undefined') {
      audioElement.value = new Audio()
      audioElement.value.onended = () => {
        isPlaying.value = false
        playNextInQueue()
      }
      audioElement.value.onerror = () => {
        isPlaying.value = false
        error.value = 'Audio playback error'
        playNextInQueue()
      }
    }

    updateAvailableVoices()
  }

  /**
   * Check if Azure Speech service is available
   */
  const checkAzureAvailability = async () => {
    try {
      const response = await $fetch('/api/speech/status')
      isAzureAvailable.value = response.available
      if (response.available) {
        currentProvider.value = 'azure'
        console.log('Azure Speech Service is available')
      } else {
        console.log('Azure Speech Service not configured:', response.message)
      }
    } catch (err) {
      console.error('Failed to check Azure availability:', err)
      isAzureAvailable.value = false
      currentProvider.value = 'native'
    }
  }

  /**
   * Update the list of available voices based on current language
   */
  const updateAvailableVoices = () => {
    const voices: VoiceInfo[] = []
    const lang = locale.value

    // Add Azure voices if available
    if (isAzureAvailable.value && AZURE_VOICES[lang]) {
      AZURE_VOICES[lang].forEach(voice => {
        voices.push({
          name: voice.name,
          language: lang,
          gender: voice.gender,
          provider: 'azure'
        })
      })
    }

    // Add native voices
    const langPrefix = lang === 'en' ? 'en' : lang
    nativeVoices.value
      .filter(v => v.lang.toLowerCase().startsWith(langPrefix))
      .forEach(voice => {
        voices.push({
          name: voice.name,
          language: voice.lang,
          gender: voice.name.toLowerCase().includes('female') ? 'female' : 'male',
          provider: 'native'
        })
      })

    availableVoices.value = voices

    // Select default voice - always prefer Azure if available
    if (voices.length > 0) {
      const azureVoice = voices.find(v => v.provider === 'azure')
      const currentIsAzure = selectedVoice.value?.provider === 'azure'

      // If Azure is available and we don't have an Azure voice selected, select one
      if (azureVoice && !currentIsAzure) {
        selectedVoice.value = azureVoice
      } else if (!selectedVoice.value) {
        // No voice selected yet, pick best available
        const zaVoice = voices.find(v => v.language.includes('ZA'))
        selectedVoice.value = azureVoice || zaVoice || voices[0]
      }
    }
  }

  /**
   * Speak text using Azure Speech or native fallback
   */
  const speak = async (options: SpeechOptions): Promise<void> => {
    const { text, language, rate = 0.85, pitch = 1.0, voice } = options

    if (!text.trim()) return

    error.value = null
    isLoading.value = true

    const targetLang = language || locale.value
    const targetVoice = voice || selectedVoice.value?.name

    // Determine if we should use Azure
    const useAzure = isAzureAvailable.value &&
                     AZURE_VOICES[targetLang]?.length > 0 &&
                     selectedVoice.value?.provider === 'azure'

    console.log('Speech decision:', {
      isAzureAvailable: isAzureAvailable.value,
      targetLang,
      hasAzureVoices: AZURE_VOICES[targetLang]?.length > 0,
      selectedProvider: selectedVoice.value?.provider,
      selectedVoiceName: selectedVoice.value?.name,
      useAzure
    })

    try {
      if (useAzure) {
        console.log('Using Azure Speech with voice:', targetVoice)
        await speakWithAzure(text, targetLang, targetVoice, rate, pitch)
      } else {
        console.log('Using native speech')
        await speakWithNative(text, targetLang, rate, pitch)
      }
    } catch (e) {
      console.error('Speech error:', e)
      error.value = 'Failed to speak text'

      // Fallback to native if Azure fails
      if (useAzure) {
        console.log('Falling back to native speech')
        currentProvider.value = 'native'
        await speakWithNative(text, targetLang, rate, pitch)
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Speak using Azure Speech Service
   */
  const speakWithAzure = async (
    text: string,
    language: string,
    voice?: string,
    rate: number = 0.85,
    pitch: number = 1.0
  ): Promise<void> => {
    currentProvider.value = 'azure'

    // Get audio from server
    const response = await $fetch('/api/speech/synthesize', {
      method: 'POST',
      body: {
        text,
        language,
        voice,
        rate,
        pitch
      }
    })

    if (response.audioUrl) {
      return playAudio(response.audioUrl)
    } else if (response.audioBase64) {
      const audioBlob = base64ToBlob(response.audioBase64, 'audio/mp3')
      const audioUrl = URL.createObjectURL(audioBlob)
      return playAudio(audioUrl)
    }

    throw new Error('No audio data received')
  }

  /**
   * Speak using native Web Speech API
   */
  const speakWithNative = (
    text: string,
    language: string,
    rate: number = 0.85,
    pitch: number = 1.0
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!nativeSynthesis.value) {
        reject(new Error('Speech synthesis not available'))
        return
      }

      currentProvider.value = 'native'

      // Cancel any ongoing speech
      nativeSynthesis.value.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = rate
      utterance.pitch = pitch

      // Find appropriate voice
      const langPrefix = language === 'en' ? 'en' : language
      const nativeVoice = nativeVoices.value.find(v =>
        v.lang.toLowerCase().startsWith(langPrefix.toLowerCase())
      )

      if (nativeVoice) {
        utterance.voice = nativeVoice
      }

      utterance.onend = () => resolve()
      utterance.onerror = (e) => reject(e)

      nativeSynthesis.value.speak(utterance)
    })
  }

  /**
   * Play audio from URL
   */
  const playAudio = (url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!audioElement.value) {
        reject(new Error('Audio element not available'))
        return
      }

      audioElement.value.src = url
      audioElement.value.onended = () => {
        isPlaying.value = false
        resolve()
      }
      audioElement.value.onerror = () => {
        isPlaying.value = false
        reject(new Error('Audio playback failed'))
      }

      isPlaying.value = true
      audioElement.value.play().catch(reject)
    })
  }

  /**
   * Add text to speech queue
   */
  const queueSpeak = (text: string) => {
    audioQueue.value.push(text)
    if (!isPlaying.value) {
      playNextInQueue()
    }
  }

  /**
   * Play next item in queue
   */
  const playNextInQueue = async () => {
    if (audioQueue.value.length === 0) return

    const text = audioQueue.value.shift()
    if (text) {
      await speak({ text })
    }
  }

  /**
   * Stop all speech
   */
  const stop = () => {
    // Stop native
    if (nativeSynthesis.value) {
      nativeSynthesis.value.cancel()
    }

    // Stop Azure audio
    if (audioElement.value) {
      audioElement.value.pause()
      audioElement.value.currentTime = 0
    }

    // Clear queue
    audioQueue.value = []
    isPlaying.value = false
  }

  /**
   * Pause speech
   */
  const pause = () => {
    if (nativeSynthesis.value) {
      nativeSynthesis.value.pause()
    }
    if (audioElement.value) {
      audioElement.value.pause()
    }
    isPlaying.value = false
  }

  /**
   * Resume speech
   */
  const resume = () => {
    if (nativeSynthesis.value) {
      nativeSynthesis.value.resume()
    }
    if (audioElement.value && audioElement.value.paused) {
      audioElement.value.play()
    }
    isPlaying.value = true
  }

  /**
   * Set the preferred voice
   */
  const setVoice = (voice: VoiceInfo) => {
    selectedVoice.value = voice
  }

  /**
   * Convert base64 to Blob
   */
  const base64ToBlob = (base64: string, mimeType: string): Blob => {
    const byteCharacters = atob(base64)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    return new Blob([byteArray], { type: mimeType })
  }

  // Watch for language changes
  watch(locale, () => {
    updateAvailableVoices()
  })

  return {
    // State
    isAzureAvailable,
    isLoading,
    isPlaying,
    error,
    currentProvider,
    availableVoices,
    selectedVoice,

    // Methods
    initialize,
    speak,
    queueSpeak,
    stop,
    pause,
    resume,
    setVoice,

    // Constants
    AZURE_VOICES,
  }
}
