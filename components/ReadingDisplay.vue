<template>
  <div class="reading-display">
    <!-- Reading Controls -->
    <div class="reading-controls">
      <div class="control-group">
        <button
          class="btn btn-primary btn-icon"
          @click="toggleReading"
          :aria-label="isReading ? $t('reading.pause') : $t('reading.play')"
          :disabled="speechService.isLoading.value"
        >
          <svg v-if="!isReading" viewBox="0 0 24 24" width="28" height="28">
            <path fill="currentColor" d="M8 5v14l11-7z"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" width="28" height="28">
            <path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
        </button>

        <button
          class="btn btn-outline btn-icon"
          @click="stopReading"
          :aria-label="$t('reading.stop')"
        >
          <svg viewBox="0 0 24 24" width="28" height="28">
            <path fill="currentColor" d="M6 6h12v12H6z"/>
          </svg>
        </button>

        <button
          class="btn btn-outline btn-icon"
          @click="restartReading"
          :aria-label="$t('reading.restart')"
        >
          <svg viewBox="0 0 24 24" width="28" height="28">
            <path fill="currentColor" d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
          </svg>
        </button>
      </div>

      <div class="speed-control">
        <label for="speed-slider" class="speed-label">
          {{ $t('reading.speed') }}: {{ speedLabel }}
        </label>
        <input
          id="speed-slider"
          type="range"
          class="speed-slider"
          min="1"
          max="5"
          :value="speedLevel"
          @input="updateSpeed"
        />
        <div class="speed-markers">
          <span>{{ $t('reading.verySlow') }}</span>
          <span>{{ $t('reading.slow') }}</span>
          <span>{{ $t('reading.normal') }}</span>
          <span>{{ $t('reading.fast') }}</span>
          <span>{{ $t('reading.veryFast') }}</span>
        </div>
      </div>

      <div class="voice-control">
        <label for="voice-select" class="voice-label">
          {{ $t('reading.voice') }}:
          <span v-if="speechService.isAzureAvailable.value" class="provider-badge azure">
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

    <!-- Progress Bar -->
    <div class="reading-progress">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
      </div>
      <span class="progress-text">{{ currentWordIndex + 1 }} / {{ words.length }}</span>
    </div>

    <!-- Error Message -->
    <div v-if="speechService.error.value" class="error-message">
      {{ speechService.error.value }}
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

// Use the speech service composable
const speechService = useSpeechService()

// Reactive state
const isReading = ref(false)
const currentWordIndex = ref(-1)
const speedLevel = ref(2) // 1-5 scale, 2 is slow (good for learning)
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
  // These are much shorter since they ADD to speech duration
  const speeds = [0, 800, 400, 200, 100, 50]
  return speeds[speedLevel.value] || 200
})

// Speech rate based on speed level (0.5 to 2.0)
const speechRate = computed(() => {
  const rates = [0, 0.7, 0.85, 1.0, 1.3, 1.6]
  return rates[speedLevel.value] || 1.0
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

const startReading = () => {
  if (currentWordIndex.value === -1 || currentWordIndex.value >= words.value.length - 1) {
    currentWordIndex.value = 0
  }
  isReading.value = true
  emit('start')
  advanceReading()
}

const pauseReading = () => {
  isReading.value = false
  if (readingInterval) {
    clearTimeout(readingInterval)
    readingInterval = null
  }
  speechService.stop()
  emit('pause')
}

const stopReading = () => {
  pauseReading()
  currentWordIndex.value = -1
}

const restartReading = () => {
  stopReading()
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
  if (!isReading.value) return

  const currentWord = words.value[currentWordIndex.value]
  if (currentWord) {
    await speakWord(currentWord)
    emit('wordChange', currentWordIndex.value, currentWord)
    scrollToWord(currentWordIndex.value)
  }

  readingInterval = setTimeout(() => {
    if (!isReading.value) return

    if (currentWordIndex.value < words.value.length - 1) {
      currentWordIndex.value++
      advanceReading()
    } else {
      // Reading complete
      isReading.value = false
      emit('complete')
    }
  }, speedMs.value)
}

const speakWord = async (word: string) => {
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

// Initialize speech service
onMounted(async () => {
  await speechService.initialize()

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
  if (readingInterval) {
    clearTimeout(readingInterval)
  }
  speechService.stop()
})

// Watch for text changes
watch(() => props.text, () => {
  stopReading()
  wordRefs.value = []
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
  gap: var(--spacing-lg);
}

.reading-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background-color: var(--bg-secondary);
  border-radius: var(--radius-lg);
}

.control-group {
  display: flex;
  gap: var(--spacing-sm);
}

.speed-control {
  flex: 1;
  min-width: 250px;
}

.speed-label,
.voice-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
  font-weight: 500;
  margin-bottom: var(--spacing-xs);
}

.provider-badge {
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-weight: 600;
  text-transform: uppercase;
}

.provider-badge.azure {
  background-color: #0078d4;
  color: white;
}

.provider-badge.native {
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
}

.speed-markers {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--text-light);
  margin-top: var(--spacing-xs);
}

.voice-control {
  min-width: 220px;
}

.voice-select {
  width: 100%;
  padding: var(--spacing-sm);
  font-size: var(--font-size-xs);
  border: 2px solid var(--bg-tertiary);
  border-radius: var(--radius-md);
  background-color: var(--bg-primary);
  cursor: pointer;
}

.reading-area {
  position: relative;
  background-color: var(--bg-reading);
  border-radius: var(--radius-lg);
  padding: var(--spacing-2xl);
  min-height: 300px;
  max-height: 60vh;
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
  padding: 0.15em 0.2em;
  margin: 0.1em;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-normal);
  border-bottom: 4px solid transparent;
}

.word:hover {
  background-color: var(--bg-tertiary);
}

.word.active {
  background-color: var(--highlight-word);
  box-shadow: 0 0 30px var(--highlight-word-shadow);
  transform: scale(1.08);
  border-bottom: 5px solid var(--underline-color);
  font-weight: 600;
}

.word.completed {
  color: var(--accent-green);
  border-bottom: 3px solid var(--accent-green);
}

.reading-pointer-container {
  position: absolute;
  pointer-events: none;
  transition: all var(--transition-slow);
}

.reading-pointer {
  width: 0;
  height: 0;
  border-left: 18px solid transparent;
  border-right: 18px solid transparent;
  border-bottom: 25px solid var(--pointer-color);
  animation: pointerPulse 0.6s ease-in-out infinite;
}

@keyframes pointerPulse {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  50% {
    transform: translateY(-8px) scale(1.1);
    opacity: 0.8;
  }
}

.reading-progress {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.progress-bar {
  flex: 1;
  height: 12px;
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
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-secondary);
  min-width: 80px;
  text-align: right;
}

.error-message {
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: #ffebee;
  color: #c62828;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
}

@media (max-width: 768px) {
  .reading-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .control-group {
    justify-content: center;
  }

  .speed-control {
    order: 1;
  }

  .voice-control {
    order: 2;
  }
}
</style>
