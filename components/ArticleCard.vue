<template>
  <article class="article-card" :class="article.region">
    <div class="article-header">
      <span class="topic-tag" :class="article.category">
        {{ article.category }}
      </span>
      <span class="reading-level" :class="article.readingLevel">
        {{ article.readingLevel }}
      </span>
    </div>
    <h3 class="article-title">{{ article.title }}</h3>
    <p class="article-excerpt">{{ article.excerpt }}</p>
    <div class="article-meta">
      <span class="article-author">{{ article.author }}</span>
      <span class="article-date">{{ formatDate(article.publishedAt) }}</span>
    </div>
    <div class="article-actions">
      <NuxtLink :to="`/articles/${article.id}`" class="btn btn-outline btn-sm">
        {{ $t('news.readMore') }}
      </NuxtLink>
      <NuxtLink :to="`/learn?article=${article.id}`" class="btn btn-primary btn-sm">
        {{ $t('news.practiceReading') }}
      </NuxtLink>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Article } from '~/stores/content'

interface Props {
  article: Article
}

defineProps<Props>()

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<style scoped>
.article-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  background-color: var(--bg-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  border-left: 4px solid var(--primary-color);
  transition: box-shadow var(--transition-fast);
}

.article-card:hover {
  box-shadow: var(--shadow-md);
}

.article-card.south-africa {
  border-left-color: var(--secondary-color);
}

.article-card.southern-africa {
  border-left-color: var(--accent-green);
}

.article-card.africa {
  border-left-color: var(--primary-color);
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.topic-tag {
  display: inline-block;
  padding: 2px var(--spacing-xs);
  font-size: 0.7rem;
  font-weight: 500;
  border-radius: var(--radius-sm);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.topic-tag.education { background-color: #e3f2fd; color: #1565c0; }
.topic-tag.politics { background-color: #fce4ec; color: #c62828; }
.topic-tag.health { background-color: #e8f5e9; color: #2e7d32; }
.topic-tag.technology { background-color: #f3e5f5; color: #7b1fa2; }
.topic-tag.culture { background-color: #fff3e0; color: #ef6c00; }
.topic-tag.economy { background-color: #e0f7fa; color: #00838f; }

.reading-level {
  font-size: 0.65rem;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  text-transform: uppercase;
  font-weight: 500;
}

.reading-level.beginner {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.reading-level.intermediate {
  background-color: #fff3e0;
  color: #ef6c00;
}

.reading-level.advanced {
  background-color: #fce4ec;
  color: #c62828;
}

.article-title {
  font-size: var(--font-size-sm);
  line-height: var(--line-height-tight);
  margin: 0;
}

.article-excerpt {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  line-height: var(--line-height-normal);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--text-light);
}

.article-actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.btn-sm {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: 0.75rem;
}
</style>
