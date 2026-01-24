<template>
  <div class="lesson-detail-page">
    <div class="container container-narrow">
      <!-- Back Link -->
      <NuxtLink to="/lessons" class="back-link mb-lg">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
        Back to Lessons
      </NuxtLink>

      <template v-if="lesson">
        <!-- Lesson Header -->
        <header class="lesson-header mb-xl">
          <span class="lesson-level-badge" :class="lesson.level">
            {{ lesson.level }}
          </span>
          <h1 class="lesson-title">{{ lesson.title }}</h1>
          <p class="lesson-description">{{ lesson.description }}</p>
        </header>

        <!-- Reading Display -->
        <section class="reading-section mb-xl">
          <ReadingDisplay
            :text="lesson.content"
            :show-pointer="true"
            @complete="onLessonComplete"
          />
        </section>

        <!-- Navigation -->
        <div class="lesson-navigation">
          <NuxtLink
            v-if="previousLesson"
            :to="`/lessons/${previousLesson.id}`"
            class="btn btn-outline"
          >
            Previous Lesson
          </NuxtLink>
          <div v-else></div>
          <NuxtLink
            v-if="nextLesson"
            :to="`/lessons/${nextLesson.id}`"
            class="btn btn-primary"
          >
            Next Lesson
          </NuxtLink>
        </div>
      </template>

      <!-- Loading State -->
      <div v-else class="loading-state text-center py-2xl">
        <p>{{ $t('common.loading') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const contentStore = useContentStore()

const lessonId = computed(() => route.params.id as string)

const lesson = computed(() => {
  return contentStore.lessons.find(l => l.id === lessonId.value)
})

const previousLesson = computed(() => {
  if (!lesson.value) return null
  const lessons = contentStore.getLessonsByLevel(lesson.value.level)
  const currentIndex = lessons.findIndex(l => l.id === lesson.value?.id)
  return currentIndex > 0 ? lessons[currentIndex - 1] : null
})

const nextLesson = computed(() => {
  if (!lesson.value) return null
  const lessons = contentStore.getLessonsByLevel(lesson.value.level)
  const currentIndex = lessons.findIndex(l => l.id === lesson.value?.id)
  return currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null
})

const onLessonComplete = () => {
  // Could save progress, show celebration, etc.
  console.log('Lesson completed:', lessonId.value)
}

onMounted(() => {
  contentStore.initializeContent()
})
</script>

<style scoped>
.lesson-detail-page {
  padding: var(--spacing-xl) 0;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--text-secondary);
  text-decoration: none;
  font-size: var(--font-size-sm);
  transition: color var(--transition-fast);
}

.back-link:hover {
  color: var(--primary-color);
}

.lesson-header {
  text-align: center;
}

.lesson-level-badge {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-xs);
  font-weight: 500;
  border-radius: var(--radius-sm);
  text-transform: uppercase;
  margin-bottom: var(--spacing-md);
}

.lesson-level-badge.beginner {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.lesson-level-badge.intermediate {
  background-color: #fff3e0;
  color: #ef6c00;
}

.lesson-level-badge.advanced {
  background-color: #fce4ec;
  color: #c62828;
}

.lesson-title {
  font-size: var(--font-size-2xl);
  color: var(--primary-color);
  margin-bottom: var(--spacing-sm);
}

.lesson-description {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
}

.lesson-navigation {
  display: flex;
  justify-content: space-between;
  gap: var(--spacing-md);
  padding-top: var(--spacing-xl);
  border-top: 1px solid var(--bg-tertiary);
}

.loading-state {
  color: var(--text-secondary);
}

@media (max-width: 576px) {
  .lesson-navigation {
    flex-direction: column;
  }

  .lesson-navigation .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
