<template>
  <div class="reading-display">
    <!-- Main Layout: Controls + Reading Area -->
    <div class="reading-layout">
      <div class="reading-controls-container">
      <!-- Reading Controls (Left Sidebar) -->
      <div class="reading-controls">
        <div class="control-group">
          <button
            class="btn btn-primary btn-icon has-tooltip"
            @click="toggleReading"
            :aria-label="isReading ? $t('reading.pause') : $t('reading.play')"
            :data-tooltip="isReading ? $t('reading.pause') : $t('reading.play')"
            :disabled="speechService.isLoading.value || sdkService.isLoading.value"
          >
            <svg v-if="!isReading" viewBox="0 0 24 24" width="24" height="24" class="btn-svg">
              <path fill="currentColor" d="M8 5v14l11-7z"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" width="24" height="24" class="btn-svg">
              <path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
          </button>

          <button
            class="btn btn-outline btn-icon has-tooltip"
            @click="restartReading"
            :aria-label="$t('reading.restart')"
            :data-tooltip="$t('reading.restart')"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" class="btn-svg">
              <path fill="currentColor" d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
            </svg>
          </button>
        </div>
        <div class="speed-control">
          <div class="speed-control-inner">
            <label for="speed-slider" class="speed-label">
            {{ $t('reading.speed') }}
            </label>
            <div class="speed-value">{{ speedLabel }}</div>
          </div>
          <input
            id="speed-slider"
            type="range"
            class="speed-slider"
            min="1"
            max="5"
            :value="speedLevel"
            @input="updateSpeed"
          />
          
        </div>
        <div class="voice-control">
          <label for="voice-select" class="voice-label">
            {{ $t('reading.voice') }}
            <span v-if="sdkService.isSdkAvailable.value" class="provider-badge sdk">
              SDK
            </span>
            <span v-else-if="speechService.isAzureAvailable.value" class="provider-badge azure">
              Azure
            </span>
            <span v-else class="provider-badge native">
              Native
            </span>
          </label>
          <select
            id="voice-select"
            v-model="selectedVoiceIndex"
            class="voice-select"
            @change="onVoiceChange"
          >
            <option
              v-for="(voice, index) in speechService.availableVoices.value"
              :key="voice.name"
              :value="index"
            >
              {{ formatVoiceName(voice) }}
            </option>
          </select>
        </div>
      </div>
       <!-- Progress Bar -->
       <div class="reading-progress">
          <span class="progress-text">{{ currentWordIndex + 1 }} / {{ words.length }}</span>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
          </div>
        </div>
      </div>

      <!-- Reading Area Column (Right) -->
      <div class="reading-area-column">
        <!-- Reading Area -->
        <div class="reading-area" ref="readingArea">
          <div class="reading-text">
            <span
              v-for="(word, index) in words"
              :key="index"
              class="word"
              :class="{
                'active': index === currentWordIndex,
                'completed': index < currentWordIndex
              }"
              :ref="el => setWordRef(el, index)"
              @click="jumpToWord(index)"
            >
              {{ word }}
            </span>
          </div>

          <!-- Reading Pointer -->
          <div
            v-if="showPointer && currentWordIndex >= 0"
            class="reading-pointer-container"
            :style="pointerStyle"
          >
            <div class="reading-pointer"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="speechService.error.value || sdkService.error.value" class="error-message">
      {{ sdkService.error.value || speechService.error.value }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  text: string
  showPointer?: boolean
  autoStart?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showPointer: true,
  autoStart: false
})

const emit = defineEmits<{
  (e: 'wordChange', index: number, word: string): void
  (e: 'complete'): void
  (e: 'start'): void
  (e: 'pause'): void
}>()

// Use the speech services - SDK for sentence-based, legacy for word-by-word fallback
const speechService = useSpeechService()
const sdkService = useSpeechSdkService()

// SDK mode state
const useSdkMode = ref(true) // Prefer SDK mode when available
const sdkModeActive = ref(false) // Currently using SDK for playback

// Reactive state
const isReading = ref(false)
const currentWordIndex = ref(-1)
const currentWordSpoken = ref(false) // Tracks if current word finished speaking (for pause-between-words)
const speedLevel = ref(1) // 1-5 scale, 2 is slow (good for learning)
const wordRefs = ref<(HTMLElement | null)[]>([])
const readingArea = ref<HTMLElement | null>(null)
const selectedVoiceIndex = ref(0)

// Computed
const words = computed(() => {
  return props.text
    .split(/\s+/)
    .filter(word => word.length > 0)
    .map(word => word.trim())
})

const speedLabel = computed(() => {
  const labels = ['', 'Very Slow', 'Slow', 'Normal', 'Fast', 'Very Fast']
  return labels[speedLevel.value] || 'Normal'
})

const speedMs = computed(() => {
  // Milliseconds delay after speech before moving to next word
  // This controls the "flow" or pace of reading - how long to pause between words
  // Slower = longer pause, giving learners more time to process each word
  const speeds = [0, 1200, 800, 400, 200, 100]
  return speeds[speedLevel.value] || 400
})

// Speech rate is constant - words are always spoken at normal speed
// Only the pause between words changes (controlled by speedMs above)
const speechRate = computed(() => {
  return 1.0 // Always normal speech rate
})

const progressPercent = computed(() => {
  if (words.value.length === 0) return 0
  return ((currentWordIndex.value + 1) / words.value.length) * 100
})

const pointerStyle = computed(() => {
  const wordEl = wordRefs.value[currentWordIndex.value]
  if (!wordEl || !readingArea.value) return { display: 'none' }

  const wordRect = wordEl.getBoundingClientRect()
  const areaRect = readingArea.value.getBoundingClientRect()

  return {
    left: `${wordRect.left - areaRect.left + wordRect.width / 2}px`,
    top: `${wordRect.bottom - areaRect.top + 10}px`
  }
})

// Methods
const setWordRef = (el: any, index: number) => {
  if (el) {
    wordRefs.value[index] = el as HTMLElement
  }
}

const updateSpeed = (event: Event) => {
  const target = event.target as HTMLInputElement
  speedLevel.value = parseInt(target.value)
}

const formatVoiceName = (voice: any) => {
  if (voice.provider === 'azure') {
    // Extract friendly name from Azure voice name (e.g., "en-ZA-LeahNeural" -> "Leah (SA English)")
    const parts = voice.name.split('-')
    if (parts.length >= 3) {
      const name = parts[2].replace('Neural', '')
      const lang = parts.slice(0, 2).join('-')
      return `${name} (${lang}) ★`
    }
  }
  return `${voice.name} (${voice.language})`
}

const onVoiceChange = () => {
  const voice = speechService.availableVoices.value[selectedVoiceIndex.value]
  if (voice) {
    speechService.setVoice(voice)
  }
}

let readingInterval: ReturnType<typeof setTimeout> | null = null

const toggleReading = () => {
  if (isReading.value) {
    pauseReading()
  } else {
    startReading()
  }
}

const startReading = async () => {
  // Check if SDK mode is available and preferred
  const canUseSdk = useSdkMode.value && sdkService.isSdkAvailable.value

  if (canUseSdk) {
    // Use SDK for sentence-based synthesis with word boundary events
    await startSdkReading()
  } else {
    // Fallback to word-by-word synthesis
    await startWordByWordReading()
  }
}

/**
 * SDK-based reading: speaks the entire text as a sentence with real-time word highlighting
 */
const startSdkReading = async () => {
  // Reset to beginning if not resuming from pause
  if (currentWordIndex.value === -1 || currentWordIndex.value >= words.value.length - 1) {
    currentWordIndex.value = 0
  }

  // If resuming from pause, SDK will continue from where it left off
  if (sdkService.isPlaying.value) {
    sdkService.resume()
    isReading.value = true
    sdkModeActive.value = true
    emit('start')
    return
  }

  isReading.value = true
  sdkModeActive.value = true
  emit('start')

  // Get the text to speak (from current word position to end)
  const remainingText = words.value.slice(currentWordIndex.value).join(' ')
  const startOffset = currentWordIndex.value

  try {
    // Get selected voice from legacy service (keeps voice selection unified)
    const selectedVoice = speechService.selectedVoice.value
    const voiceName = selectedVoice?.provider === 'azure' ? selectedVoice.name : undefined

    await sdkService.speak({
      text: remainingText,
      voice: voiceName,
      rate: speechRate.value,
      pitch: 1.0,
      onWordBoundary: (event) => {
        // Update word index based on SDK's word boundary event
        const newIndex = startOffset + event.wordIndex
        if (newIndex !== currentWordIndex.value && newIndex < words.value.length) {
          currentWordIndex.value = newIndex
          emit('wordChange', newIndex, words.value[newIndex])
          scrollToWord(newIndex)
        }
      },
      onComplete: () => {
        isReading.value = false
        sdkModeActive.value = false
        emit('complete')
      },
      onError: (error) => {
        console.error('SDK speech error, falling back to word-by-word:', error)
        sdkModeActive.value = false
        // Fallback to word-by-word mode on SDK failure
        startWordByWordReading()
      }
    })
  } catch (error) {
    console.error('SDK initialization error, falling back to word-by-word:', error)
    sdkModeActive.value = false
    // Fallback to word-by-word mode
    startWordByWordReading()
  }
}

/**
 * Word-by-word reading: speaks each word individually (legacy/fallback mode)
 */
const startWordByWordReading = async () => {
  // If resuming and current word was already spoken, advance to next word
  if (currentWordSpoken.value && currentWordIndex.value < words.value.length - 1) {
    currentWordIndex.value++
    currentWordSpoken.value = false
  } else if (currentWordIndex.value === -1 || currentWordIndex.value >= words.value.length - 1) {
    // Starting fresh or reached end - reset to beginning
    currentWordIndex.value = 0
    currentWordSpoken.value = false
  }

  // Reset cancellation flag in case we're recovering from a hard stop
  speechService.resetCancellation()
  isReading.value = true
  sdkModeActive.value = false
  emit('start')

  // Pre-synthesize upcoming words in background (don't await - let it run while we start)
  speechService.preSynthesizeWords(words.value, currentWordIndex.value)

  advanceReading()
}

const pauseReading = () => {
  isReading.value = false

  if (sdkModeActive.value) {
    // SDK mode: pause the audio playback (can resume later)
    sdkService.pause()
  } else {
    // Word-by-word mode: soft pause (let current word finish speaking)
    if (readingInterval) {
      clearTimeout(readingInterval)
      readingInterval = null
    }
    // Don't call speechService.stop() - let current word complete naturally
  }

  emit('pause')
}

const stopReading = () => {
  // Hard stop: interrupt speech immediately
  isReading.value = false

  if (sdkModeActive.value) {
    // SDK mode: stop and dispose synthesizer
    sdkService.stop()
    sdkModeActive.value = false
  } else {
    // Word-by-word mode: stop immediately
    if (readingInterval) {
      clearTimeout(readingInterval)
      readingInterval = null
    }
    speechService.stop()
  }

  currentWordSpoken.value = false
}

const restartReading = () => {
  stopReading() // Use hard stop to interrupt immediately
  currentWordIndex.value = 0
  startReading()
}

const jumpToWord = (index: number) => {
  currentWordIndex.value = index
  if (isReading.value) {
    speakWord(words.value[index])
  }
}

const advanceReading = async () => {
  // Check if we should proceed
  if (!isReading.value) return

  const wordIndex = currentWordIndex.value
  const currentWord = words.value[wordIndex]

  if (!currentWord) {
    isReading.value = false
    emit('complete')
    return
  }

  // Speak the current word
  await speakWord(currentWord)

  // Mark word as spoken (for pause-between-words behavior)
  currentWordSpoken.value = true

  // Check if paused during speech - if so, exit but keep word highlighted
  if (!isReading.value) return

  // Word completed while still reading - emit events and continue
  currentWordSpoken.value = false
  emit('wordChange', wordIndex, currentWord)
  scrollToWord(wordIndex)

  // Check again before scheduling (state may have changed)
  if (!isReading.value) return

  // Schedule next word
  readingInterval = setTimeout(() => {
    // Guard against stale timeout firing after pause/stop
    if (!isReading.value) return

    if (currentWordIndex.value < words.value.length - 1) {
      currentWordIndex.value++
      // Keep pre-fetching ahead as we progress
      speechService.preSynthesizeWords(words.value, currentWordIndex.value)
      advanceReading()
    } else {
      // Reading complete
      isReading.value = false
      currentWordSpoken.value = false
      emit('complete')
    }
  }, speedMs.value)
}

const speakWord = async (word: string) => {
  // Check if cancelled before speaking
  if (speechService.isCancelled.value) return

  try {
    await speechService.speak({
      text: word,
      rate: speechRate.value,
      pitch: 1.0
    })
  } catch (error) {
    console.error('Speech error:', error)
  }
}

const scrollToWord = (index: number) => {
  const wordEl = wordRefs.value[index]
  if (wordEl && readingArea.value) {
    wordEl.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    })
  }
}

// Initialize speech services
onMounted(async () => {
  // Initialize legacy speech service (also provides voice list)
  await speechService.initialize()

  // Check if SDK is available (fetches token in background)
  sdkService.checkAvailability().then((available) => {
    console.log('SDK availability:', available)
    useSdkMode.value = available
  })

  // Sync selected voice index with the service's selected voice
  syncVoiceSelection()

  if (props.autoStart) {
    setTimeout(() => startReading(), 500)
  }
})

// Sync the dropdown index with the service's selected voice
const syncVoiceSelection = () => {
  const voices = speechService.availableVoices.value
  const selected = speechService.selectedVoice.value

  if (voices.length > 0 && selected) {
    const index = voices.findIndex(v => v.name === selected.name)
    if (index >= 0) {
      selectedVoiceIndex.value = index
    }
  } else if (voices.length > 0) {
    selectedVoiceIndex.value = 0
    onVoiceChange()
  }
}

onUnmounted(() => {
  stopReading()
  speechService.clearCache()
  sdkService.stop() // Ensure SDK resources are cleaned up
})

// Watch for text changes
watch(() => props.text, () => {
  stopReading() // Hard stop when text changes (handles both SDK and word-by-word)
  speechService.clearCache() // Clear pre-synthesized audio for old text
  currentWordIndex.value = -1
  wordRefs.value = []
  sdkModeActive.value = false
})

// Watch for voice list changes and sync selection
watch(() => speechService.availableVoices.value, (voices) => {
  if (voices.length > 0) {
    syncVoiceSelection()
  }
})

// Watch for selectedVoice changes from the service
watch(() => speechService.selectedVoice.value, (voice) => {
  if (voice) {
    const index = speechService.availableVoices.value.findIndex(v => v.name === voice.name)
    if (index >= 0 && index !== selectedVoiceIndex.value) {
      selectedVoiceIndex.value = index
    }
  }
})
</script>

<style scoped>
.reading-display {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.reading-layout {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.reading-controls-container {
  position: sticky;
  top: 44px; /* Below top-bar */
  z-index: 50;
  background-color: var(--bg-secondary);
  padding: 0.75rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.reading-area-column {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.reading-progress {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--accent-green));
  border-radius: var(--radius-sm);
  transition: width var(--transition-normal);
}

.progress-text {
  font-size: var(--font-size-xs);
  font-weight: 500;
  color: var(--text-secondary);
  min-width: 50px;
  text-align: right;
}

.reading-controls {
  display: flex;
  gap: 1rem;
  padding: 0.75rem;
  justify-content: center;
  align-items: center;
  background-color: var(--bg-primary);
  border-radius: var(--radius-md);
  border: 1px solid var(--bg-tertiary);
}

.control-group {
  display: flex;
  justify-content:first baseline;
  gap: 0.5rem;
}

.control-group .btn-icon {
  width: 44px;
  height: 44px;
  cursor: pointer;
}

.control-group .btn-icon .btn-svg {
  pointer-events: none;
}

/* Tooltip styles */
.has-tooltip {
  position: relative;
}

.has-tooltip::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.375rem 0.625rem;
  background-color: var(--text-primary);
  color: var(--bg-primary);
  font-size: var(--font-size-xs);
  font-weight: 500;
  white-space: nowrap;
  border-radius: var(--radius-sm);
  opacity: 0;
  visibility: hidden;
  transition: opacity var(--transition-fast), visibility var(--transition-fast);
  pointer-events: none;
  margin-bottom: 6px;
  z-index: 10;
}

.has-tooltip::before {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: var(--text-primary);
  opacity: 0;
  visibility: hidden;
  transition: opacity var(--transition-fast), visibility var(--transition-fast);
  pointer-events: none;
  z-index: 10;
}

.has-tooltip:hover::after,
.has-tooltip:hover::before {
  opacity: 1;
  visibility: visible;
}

.has-tooltip:disabled::after,
.has-tooltip:disabled::before {
  display: none;
}

.speed-control {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.speed-label,
.voice-label {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem;
  font-size: var(--font-size-xs);
  font-weight: 500;
  color: var(--text-secondary);
  margin-right: 0.5rem
  ;
}

.speed-value {
  font-size: var(--font-size-xs);
  color: var(--text-primary);
  font-weight: 600;
  text-align: center;
}

.speed-slider {
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.speed-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: var(--primary-color);
  border-radius: 50%;
  cursor: pointer;
}

.speed-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: var(--primary-color);
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

.provider-badge {
  font-size: 0.6rem;
  padding: 1px 4px;
  border-radius: var(--radius-sm);
  font-weight: 600;
  text-transform: uppercase;
}

.provider-badge.sdk {
  background-color: #107c10;
  color: white;
}

.provider-badge.azure {
  background-color: #0078d4;
  color: white;
}

.provider-badge.native {
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
}

.voice-control {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-self: flex-end;
}

.voice-select {
  width: 100%;
  padding: 0.375rem;
  font-size: var(--font-size-xs);
  border: 1px solid var(--bg-tertiary);
  border-radius: var(--radius-sm);
  background-color: var(--bg-primary);
  cursor: pointer;
}

.reading-area {
  position: relative;
  background-color: var(--bg-reading);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  min-height: 200px;
  overflow-y: auto;
}

.reading-text {
  font-size: var(--font-size-reading);
  line-height: var(--line-height-reading);
  letter-spacing: 0.02em;
  word-spacing: 0.3em;
}

.word {
  display: inline-block;
  position: relative;
  padding: 0.1em 0.15em;
  margin: 0.05em;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-normal);
  border-bottom: 3px solid transparent;
}

.word:hover {
  background-color: var(--bg-tertiary);
}

.word.active {
  background-color: var(--highlight-word);
  box-shadow: 0 0 20px var(--highlight-word-shadow);
  transform: scale(1.05);
  border-bottom: 4px solid var(--underline-color);
  font-weight: 600;
}

.word.completed {
  color: var(--accent-green);
  border-bottom: 2px solid var(--accent-green);
}

.reading-pointer-container {
  position: absolute;
  pointer-events: none;
  transition: all var(--transition-slow);
}

.reading-pointer {
  width: 0;
  height: 0;
  border-left: 12px solid transparent;
  border-right: 12px solid transparent;
  border-bottom: 18px solid var(--pointer-color);
  animation: pointerPulse 0.6s ease-in-out infinite;
}

@keyframes pointerPulse {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  50% {
    transform: translateY(-5px) scale(1.1);
    opacity: 0.8;
  }
}

.error-message {
  padding: 0.5rem 0.75rem;
  background-color: #ffebee;
  color: #c62828;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
}

@media (max-width: 768px) {
  .reading-controls {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    order: 2;
  }

  .reading-area-column {
    order: 1;
  }

  .control-group {
    flex: 0 0 auto;
  }

  .speed-control,
  .voice-control {
    flex: 1;
    min-width: 140px;
  }
}
</style>
