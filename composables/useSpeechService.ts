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
  const isPlaying = ref(false)

  // Track blob URL for cleanup (memory leak prevention)
  let currentBlobUrl: string | null = null

  // Track pending speech promise rejection
  let rejectCurrentSpeech: (() => void) | null = null

  // Cancellation flag - checked by speech functions to abort early
  const isCancelled = ref(false)

  // Pre-synthesis cache for Azure (word -> blob URL)
  const audioCache = new Map<string, string>()
  const pendingFetches = new Map<string, Promise<string>>()
  const PRE_FETCH_AHEAD = 10 // Number of words to pre-fetch ahead

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
      // Note: onended and onerror are set in playAudio() for each playback
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

    // Check if cancelled before starting
    if (isCancelled.value) {
      return
    }

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

    // Check cache first (for single words)
    const trimmedText = text.trim()
    if (audioCache.has(trimmedText)) {
      return playAudio(audioCache.get(trimmedText)!)
    }

    // Check if already being fetched
    if (pendingFetches.has(trimmedText)) {
      const audioUrl = await pendingFetches.get(trimmedText)!
      return playAudio(audioUrl)
    }

    // Not in cache, fetch synchronously
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

    if (!response.audioBase64) {
      throw new Error('No audio data received')
    }

    const audioBlob = base64ToBlob(response.audioBase64, 'audio/mp3')
    const audioUrl = URL.createObjectURL(audioBlob)

    // Cache single words for reuse
    if (!trimmedText.includes(' ')) {
      audioCache.set(trimmedText, audioUrl)
    }

    return playAudio(audioUrl)
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

      // Store reject function for stop/pause
      rejectCurrentSpeech = () => {
        rejectCurrentSpeech = null
        resolve() // Resolve instead of reject to avoid error handling
      }

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

      utterance.onend = () => {
        rejectCurrentSpeech = null
        resolve()
      }
      utterance.onerror = (e) => {
        rejectCurrentSpeech = null
        // Ignore 'interrupted' errors from cancel()
        if (e.error === 'interrupted') {
          resolve()
        } else {
          reject(e)
        }
      }

      nativeSynthesis.value.speak(utterance)
    })
  }

  /**
   * Check if a blob URL is in the cache (should not be revoked)
   */
  const isUrlCached = (url: string): boolean => {
    for (const cachedUrl of audioCache.values()) {
      if (cachedUrl === url) return true
    }
    return false
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

      // Only revoke previous blob URL if it's NOT in the cache
      // Cached URLs are managed by clearCache() and should persist for reuse
      if (currentBlobUrl && !isUrlCached(currentBlobUrl)) {
        URL.revokeObjectURL(currentBlobUrl)
      }
      currentBlobUrl = null

      // Track new blob URL if applicable
      if (url.startsWith('blob:')) {
        currentBlobUrl = url
      }

      // Store resolve function for stop
      rejectCurrentSpeech = () => {
        rejectCurrentSpeech = null
        resolve() // Resolve instead of reject to avoid error handling
      }

      audioElement.value.src = url
      audioElement.value.onended = () => {
        isPlaying.value = false
        rejectCurrentSpeech = null
        resolve()
      }
      audioElement.value.onerror = () => {
        isPlaying.value = false
        rejectCurrentSpeech = null
        reject(new Error('Audio playback failed'))
      }

      isPlaying.value = true
      audioElement.value.play().catch(reject)
    })
  }

  /**
   * Synthesize a word to cache without playing it (Azure only)
   */
  const synthesizeToCache = async (word: string): Promise<string> => {
    // Check if already cached
    if (audioCache.has(word)) {
      return audioCache.get(word)!
    }

    // Check if already being fetched
    if (pendingFetches.has(word)) {
      return pendingFetches.get(word)!
    }

    const targetVoice = selectedVoice.value?.name
    const targetLang = locale.value

    // Create the fetch promise
    const fetchPromise = (async () => {
      try {
        const response = await $fetch('/api/speech/synthesize', {
          method: 'POST',
          body: {
            text: word,
            language: targetLang,
            voice: targetVoice,
            rate: 1.0,
            pitch: 1.0
          }
        })

        if (!response.audioBase64) {
          throw new Error('No audio data received')
        }

        const audioBlob = base64ToBlob(response.audioBase64, 'audio/mp3')
        const audioUrl = URL.createObjectURL(audioBlob)

        // Store in cache
        audioCache.set(word, audioUrl)
        pendingFetches.delete(word)

        return audioUrl
      } catch (err) {
        pendingFetches.delete(word)
        throw err
      }
    })()

    pendingFetches.set(word, fetchPromise)
    return fetchPromise
  }

  /**
   * Pre-synthesize multiple words in background (Azure only)
   * Call this when starting to read to warm up the cache
   */
  const preSynthesizeWords = async (words: string[], startIndex: number = 0) => {
    if (!isAzureAvailable.value || selectedVoice.value?.provider !== 'azure') {
      return // Only pre-fetch for Azure
    }

    const wordsToFetch = words
      .slice(startIndex, startIndex + PRE_FETCH_AHEAD)
      .filter(word => word.trim().length > 0)
      .filter(word => !audioCache.has(word) && !pendingFetches.has(word))

    // Fetch in parallel (but limit concurrency to avoid overwhelming the API)
    const BATCH_SIZE = 5
    for (let i = 0; i < wordsToFetch.length; i += BATCH_SIZE) {
      const batch = wordsToFetch.slice(i, i + BATCH_SIZE)
      await Promise.all(batch.map(word => synthesizeToCache(word).catch(() => {})))
    }
  }

  /**
   * Clear the audio cache and revoke all blob URLs
   */
  const clearCache = () => {
    audioCache.forEach(url => URL.revokeObjectURL(url))
    audioCache.clear()
    pendingFetches.clear()
  }

  /**
   * Stop all speech
   */
  const stop = () => {
    // Set cancellation flag first - this prevents any pending operations from continuing
    isCancelled.value = true

    // Resolve any pending speech promise
    if (rejectCurrentSpeech) {
      rejectCurrentSpeech()
    }

    // Stop native speech
    if (nativeSynthesis.value) {
      nativeSynthesis.value.cancel()
    }

    // Stop Azure audio
    if (audioElement.value) {
      audioElement.value.pause()
      audioElement.value.currentTime = 0
    }

    // Cleanup blob URL only if not in cache (cached URLs are managed by clearCache())
    if (currentBlobUrl && !isUrlCached(currentBlobUrl)) {
      URL.revokeObjectURL(currentBlobUrl)
    }
    currentBlobUrl = null

    isPlaying.value = false
  }

  /**
   * Reset cancellation flag - call before starting new speech sequence
   */
  const resetCancellation = () => {
    isCancelled.value = false
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
    // P2 Optimization: Clear cache when language changes (audio is language-specific)
    clearCache()
  })

  // P2 Optimization: Clear cache when voice changes (audio is voice-specific)
  // Only clear when switching between Azure voices (not during initial setup from native to Azure)
  watch(selectedVoice, (newVoice, oldVoice) => {
    if (oldVoice && newVoice && oldVoice.name !== newVoice.name) {
      // Only clear cache if both voices are Azure (user intentionally switching)
      // Skip if transitioning from native to Azure (initial setup)
      if (oldVoice.provider === 'azure' && newVoice.provider === 'azure') {
        console.log(`Voice changed from ${oldVoice.name} to ${newVoice.name}, clearing audio cache`)
        clearCache()
      } else {
        console.log(`Voice changed from ${oldVoice.name} to ${newVoice.name} (provider switch, keeping cache)`)
      }
    }
  })

  return {
    // State
    isAzureAvailable,
    isLoading,
    isPlaying,
    isCancelled,
    error,
    currentProvider,
    availableVoices,
    selectedVoice,

    // Methods
    initialize,
    speak,
    stop,
    setVoice,
    resetCancellation,
    preSynthesizeWords,
    clearCache,

    // Constants
    AZURE_VOICES,
  }
}
