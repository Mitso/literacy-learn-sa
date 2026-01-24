<template>
  <div class="lessons-page">
    <div class="container">
      <!-- Page Header -->
      <header class="page-header text-center mb-xl">
        <h1 class="page-title">{{ $t('lessons.title') }}</h1>
        <p class="page-subtitle">{{ $t('lessons.subtitle') }}</p>
      </header>

      <!-- Level Tabs -->
      <div class="level-tabs mb-xl">
        <button
          v-for="level in levels"
          :key="level.id"
          class="level-tab"
          :class="{ active: activeLevel === level.id }"
          @click="activeLevel = level.id"
        >
          {{ $t(`lessons.${level.id}`) }}
          <span class="tab-count">{{ getLessonCount(level.id) }}</span>
        </button>
      </div>

      <!-- Lessons Grid -->
      <div class="lessons-list">
        <article
          v-for="(lesson, index) in filteredLessons"
          :key="lesson.id"
          class="lesson-card"
        >
          <div class="lesson-number">{{ index + 1 }}</div>
          <div class="lesson-content">
            <h3 class="lesson-title">{{ lesson.title }}</h3>
            <p class="lesson-description">{{ lesson.description }}</p>
            <div class="lesson-meta">
              <span class="lesson-category">{{ lesson.category }}</span>
              <span class="lesson-level-badge" :class="lesson.level">
                {{ $t(`lessons.${lesson.level}`) }}
              </span>
            </div>
          </div>
          <div class="lesson-actions">
            <NuxtLink
              :to="`/lessons/${lesson.id}`"
              class="btn btn-primary"
            >
              {{ $t('lessons.startLesson') }}
            </NuxtLink>
          </div>
        </article>
      </div>

      <!-- Empty State -->
      <div v-if="filteredLessons.length === 0" class="empty-state text-center py-2xl">
        <div class="empty-icon">📚</div>
        <h3>No lessons found</h3>
        <p>Try selecting a different level.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const contentStore = useContentStore()

const activeLevel = ref('beginner')

const levels = [
  { id: 'beginner', name: 'Beginner' },
  { id: 'intermediate', name: 'Intermediate' },
  { id: 'advanced', name: 'Advanced' },
]

const filteredLessons = computed(() => {
  return contentStore.getLessonsByLevel(activeLevel.value)
})

const getLessonCount = (level: string) => {
  return contentStore.getLessonsByLevel(level).length
}

onMounted(() => {
  contentStore.initializeContent()
})
</script>

<style scoped>
.lessons-page {
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

.level-tabs {
  display: flex;
  justify-content: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.level-tab {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-lg);
  font-size: var(--font-size-sm);
  font-weight: 500;
  background-color: var(--bg-secondary);
  border: 2px solid var(--bg-tertiary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.level-tab:hover {
  border-color: var(--primary-color);
}

.level-tab.active {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: var(--text-on-primary);
}

.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 var(--spacing-xs);
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: var(--radius-full);
  font-size: 0.875rem;
}

.level-tab.active .tab-count {
  background-color: rgba(255, 255, 255, 0.2);
}

.lessons-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.lesson-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background-color: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-fast);
}

.lesson-card:hover {
  box-shadow: var(--shadow-md);
}

.lesson-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background-color: var(--primary-color);
  color: var(--text-on-primary);
  border-radius: var(--radius-full);
  font-size: var(--font-size-lg);
  font-weight: 700;
  flex-shrink: 0;
}

.lesson-content {
  flex: 1;
}

.lesson-title {
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-xs);
}

.lesson-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}

.lesson-meta {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.lesson-category {
  font-size: var(--font-size-xs);
  text-transform: uppercase;
  color: var(--text-light);
}

.lesson-level-badge {
  padding: 2px var(--spacing-xs);
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: var(--radius-sm);
  text-transform: uppercase;
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

.lesson-actions {
  flex-shrink: 0;
}

.empty-state {
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-md);
}

@media (max-width: 768px) {
  .lesson-card {
    flex-direction: column;
    text-align: center;
  }

  .lesson-meta {
    justify-content: center;
  }
}
</style>
