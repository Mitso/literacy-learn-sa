<template>
  <div class="article-detail-page">
    <div class="container container-narrow">
      <!-- Back Link -->
      <NuxtLink to="/news" class="back-link mb-lg">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
        Back to News
      </NuxtLink>

      <template v-if="article">
        <!-- Article Header -->
        <header class="article-header mb-xl">
          <div class="article-meta-top">
            <span class="topic-tag" :class="article.category">
              {{ article.category }}
            </span>
            <span class="region-tag" :class="article.region">
              {{ formatRegion(article.region) }}
            </span>
            <span class="reading-level" :class="article.readingLevel">
              {{ article.readingLevel }} level
            </span>
          </div>
          <h1 class="article-title">{{ article.title }}</h1>
          <div class="article-meta-bottom">
            <span class="article-author">By {{ article.author }}</span>
            <span class="article-date">{{ formatDate(article.publishedAt) }}</span>
          </div>
        </header>

        <!-- Mode Toggle -->
        <div class="mode-toggle mb-lg">
          <button
            class="mode-btn"
            :class="{ active: mode === 'read' }"
            @click="mode = 'read'"
          >
            Read Article
          </button>
          <button
            class="mode-btn"
            :class="{ active: mode === 'practice' }"
            @click="mode = 'practice'"
          >
            Practice Reading
          </button>
        </div>

        <!-- Regular Reading Mode -->
        <article v-if="mode === 'read'" class="article-content">
          <p v-for="(paragraph, index) in paragraphs" :key="index" class="article-paragraph">
            {{ paragraph }}
          </p>
        </article>

        <!-- Practice Reading Mode -->
        <section v-else class="practice-section">
          <ReadingDisplay
            :text="article.content"
            :show-pointer="true"
          />
        </section>

        <!-- Article Footer -->
        <footer class="article-footer mt-xl">
          <div class="share-section">
            <h4>Found this helpful?</h4>
            <p>Share this article with someone who wants to practice reading.</p>
          </div>

          <div class="related-actions">
            <NuxtLink to="/lessons" class="btn btn-outline">
              Browse More Lessons
            </NuxtLink>
            <NuxtLink to="/news" class="btn btn-primary">
              Read More Articles
            </NuxtLink>
          </div>
        </footer>
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

const articleId = computed(() => route.params.id as string)
const mode = ref<'read' | 'practice'>('read')

const article = computed(() => {
  return contentStore.articles.find(a => a.id === articleId.value)
})

const paragraphs = computed(() => {
  if (!article.value) return []
  return article.value.content.split('\n\n').filter(p => p.trim())
})

const formatRegion = (region: string) => {
  const regions: Record<string, string> = {
    'south-africa': 'South Africa',
    'southern-africa': 'Southern Africa',
    'africa': 'Africa'
  }
  return regions[region] || region
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(() => {
  contentStore.initializeContent()
})
</script>

<style scoped>
.article-detail-page {
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

.article-header {
  border-bottom: 1px solid var(--bg-tertiary);
  padding-bottom: var(--spacing-lg);
}

.article-meta-top {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.topic-tag {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-xs);
  font-weight: 500;
  border-radius: var(--radius-sm);
  text-transform: uppercase;
}

.topic-tag.education { background-color: #e3f2fd; color: #1565c0; }
.topic-tag.politics { background-color: #fce4ec; color: #c62828; }
.topic-tag.health { background-color: #e8f5e9; color: #2e7d32; }
.topic-tag.technology { background-color: #f3e5f5; color: #7b1fa2; }
.topic-tag.culture { background-color: #fff3e0; color: #ef6c00; }
.topic-tag.economy { background-color: #e0f7fa; color: #00838f; }

.region-tag {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-xs);
  font-weight: 500;
  border-radius: var(--radius-sm);
  background-color: var(--bg-tertiary);
}

.region-tag.south-africa { background-color: rgba(247, 148, 29, 0.2); color: #b36b00; }
.region-tag.southern-africa { background-color: rgba(40, 167, 69, 0.2); color: #1b5e20; }
.region-tag.africa { background-color: rgba(26, 95, 122, 0.2); color: #0d3d4d; }

.reading-level {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-xs);
  font-weight: 500;
  border-radius: var(--radius-sm);
}

.reading-level.beginner { background-color: #e8f5e9; color: #2e7d32; }
.reading-level.intermediate { background-color: #fff3e0; color: #ef6c00; }
.reading-level.advanced { background-color: #fce4ec; color: #c62828; }

.article-title {
  font-size: var(--font-size-2xl);
  color: var(--text-primary);
  line-height: var(--line-height-tight);
  margin-bottom: var(--spacing-md);
}

.article-meta-bottom {
  display: flex;
  gap: var(--spacing-lg);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.mode-toggle {
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background-color: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.mode-btn {
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.mode-btn:hover {
  background-color: var(--bg-tertiary);
}

.mode-btn.active {
  background-color: var(--primary-color);
  color: var(--text-on-primary);
}

.article-content {
  padding: var(--spacing-lg) 0;
}

.article-paragraph {
  font-size: var(--font-size-lg);
  line-height: var(--line-height-reading);
  margin-bottom: var(--spacing-lg);
  color: var(--text-primary);
}

.article-footer {
  border-top: 1px solid var(--bg-tertiary);
  padding-top: var(--spacing-xl);
}

.share-section {
  text-align: center;
  margin-bottom: var(--spacing-lg);
}

.share-section h4 {
  font-size: var(--font-size-base);
  margin-bottom: var(--spacing-xs);
}

.share-section p {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
}

.related-actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.loading-state {
  color: var(--text-secondary);
}
</style>
