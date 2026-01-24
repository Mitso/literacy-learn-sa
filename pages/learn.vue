<template>
  <div class="learn-page">
    <div class="container">
      <!-- Page Header -->
      <header class="page-header text-center mb-xl">
        <h1 class="page-title">{{ $t('learn.title') }}</h1>
        <p class="page-subtitle">{{ $t('learn.subtitle') }}</p>
      </header>

      <!-- Quick Lessons -->
      <section class="quick-lessons mb-xl">
        <h2 class="section-title mb-lg">{{ $t('learn.selectLesson') }}</h2>
        <div class="lessons-grid">
          <button
            v-for="lesson in quickLessons"
            :key="lesson.id"
            class="lesson-btn"
            :class="{ active: selectedLesson?.id === lesson.id }"
            @click="selectLesson(lesson)"
          >
            <span class="lesson-level">{{ lesson.level }}</span>
            <span class="lesson-title">{{ lesson.title }}</span>
          </button>
        </div>
      </section>

      <!-- Reading Display -->
      <section class="reading-section mb-xl">
        <ReadingDisplay
          v-if="currentText"
          :text="currentText"
          :show-pointer="true"
          @word-change="onWordChange"
          @complete="onReadingComplete"
        />
      </section>

      <!-- Custom Text Input -->
      <section class="custom-text-section">
        <h2 class="section-title mb-lg">{{ $t('learn.customText') }}</h2>
        <div class="custom-text-form">
          <textarea
            v-model="customText"
            class="custom-textarea"
            rows="6"
            :placeholder="customTextPlaceholder"
          ></textarea>
          <button
            class="btn btn-primary"
            @click="useCustomText"
            :disabled="!customText.trim()"
          >
            {{ $t('learn.startPractice') }}
          </button>
        </div>
      </section>

      <!-- Word Bank (words learned) -->
      <section v-if="learnedWords.length > 0" class="word-bank-section mt-xl">
        <h2 class="section-title mb-lg">Words You've Practiced</h2>
        <div class="word-bank">
          <span
            v-for="(word, index) in learnedWords"
            :key="index"
            class="word-chip"
          >
            {{ word }}
          </span>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Lesson } from '~/stores/content'

const contentStore = useContentStore()

const selectedLesson = ref<Lesson | null>(null)
const customText = ref('')
const currentText = ref('')
const learnedWords = ref<string[]>([])

const quickLessons = computed(() => contentStore.beginnerLessons.slice(0, 5))

const customTextPlaceholder = `Type or paste any text here to practice reading. For example:

"Hello, my name is Maria. I live in Cape Town. I am learning to read. Reading is fun and important."`

const selectLesson = (lesson: Lesson) => {
  selectedLesson.value = lesson
  currentText.value = lesson.content
}

const useCustomText = () => {
  if (customText.value.trim()) {
    selectedLesson.value = null
    currentText.value = customText.value.trim()
  }
}

const onWordChange = (index: number, word: string) => {
  // Add unique words to learned words
  const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '')
  if (cleanWord && !learnedWords.value.includes(cleanWord)) {
    learnedWords.value.push(cleanWord)
  }
}

const onReadingComplete = () => {
  // Could trigger celebration or move to next lesson
  console.log('Reading complete!')
}

// Initialize with first lesson
onMounted(() => {
  contentStore.initializeContent()
  if (quickLessons.value.length > 0) {
    selectLesson(quickLessons.value[0])
  } else {
    // Default text if no lessons loaded
    currentText.value = `Welcome to Learn to Read SA. This platform helps you learn to read step by step. Each word will be highlighted as you read. Listen to the voice and follow along. Practice makes perfect. You can do this.`
  }
})
</script>

<style scoped>
.learn-page {
  padding: var(--spacing-xl) 0;
}

.page-header {
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.page-title {
  font-size: var(--font-size-2xl);
  color: var(--primary-color);
}

.page-subtitle {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
}

.section-title {
  font-size: var(--font-size-lg);
  color: var(--text-primary);
}

.lessons-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.lesson-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: var(--bg-secondary);
  border: 2px solid var(--bg-tertiary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
  min-width: 200px;
}

.lesson-btn:hover {
  border-color: var(--primary-color);
  background-color: var(--bg-tertiary);
}

.lesson-btn.active {
  border-color: var(--primary-color);
  background-color: var(--primary-color);
  color: var(--text-on-primary);
}

.lesson-level {
  font-size: var(--font-size-xs);
  text-transform: uppercase;
  opacity: 0.8;
  margin-bottom: var(--spacing-xs);
}

.lesson-title {
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.custom-text-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.custom-textarea {
  width: 100%;
  padding: var(--spacing-md);
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
  border: 2px solid var(--bg-tertiary);
  border-radius: var(--radius-md);
  resize: vertical;
  font-family: inherit;
}

.custom-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
}

.custom-textarea::placeholder {
  color: var(--text-light);
  font-size: var(--font-size-sm);
}

.word-bank-section {
  padding: var(--spacing-lg);
  background-color: var(--bg-secondary);
  border-radius: var(--radius-lg);
}

.word-bank {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.word-chip {
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--accent-green);
  color: var(--text-on-primary);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

@media (max-width: 768px) {
  .lessons-grid {
    flex-direction: column;
  }

  .lesson-btn {
    width: 100%;
  }
}
</style>
