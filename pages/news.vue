<template>
  <div class="news-page">
    <div class="container">
      <!-- Page Header -->
      <header class="page-header text-center mb-xl">
        <h1 class="page-title">{{ $t('news.title') }}</h1>
        <p class="page-subtitle">{{ $t('news.subtitle') }}</p>
      </header>

      <!-- Filters -->
      <div class="filters-section mb-xl">
        <div class="filter-group">
          <label class="filter-label">{{ $t('news.filterRegion') }}</label>
          <div class="filter-buttons">
            <button
              class="filter-btn"
              :class="{ active: selectedRegion === 'all' }"
              @click="selectedRegion = 'all'"
            >
              {{ $t('news.allRegions') }}
            </button>
            <button
              class="filter-btn south-africa"
              :class="{ active: selectedRegion === 'south-africa' }"
              @click="selectedRegion = 'south-africa'"
            >
              {{ $t('home.regions.southAfrica') }}
            </button>
            <button
              class="filter-btn southern-africa"
              :class="{ active: selectedRegion === 'southern-africa' }"
              @click="selectedRegion = 'southern-africa'"
            >
              {{ $t('home.regions.southernAfrica') }}
            </button>
            <button
              class="filter-btn africa"
              :class="{ active: selectedRegion === 'africa' }"
              @click="selectedRegion = 'africa'"
            >
              {{ $t('home.regions.africa') }}
            </button>
          </div>
        </div>

        <div class="filter-group">
          <label class="filter-label">{{ $t('news.filterCategory') }}</label>
          <div class="filter-buttons">
            <button
              class="filter-btn"
              :class="{ active: selectedCategory === 'all' }"
              @click="selectedCategory = 'all'"
            >
              {{ $t('news.allCategories') }}
            </button>
            <button
              v-for="category in categories"
              :key="category.id"
              class="filter-btn"
              :class="{ active: selectedCategory === category.id }"
              @click="selectedCategory = category.id"
            >
              {{ category.name }}
            </button>
          </div>
        </div>
      </div>

      <!-- Region Comparison View -->
      <div class="region-comparison mb-xl">
        <div class="comparison-grid">
          <!-- South Africa Column -->
          <div class="region-column">
            <h2 class="region-header south-africa">
              <span class="region-flag">🇿🇦</span>
              South Africa
            </h2>
            <div class="articles-list">
              <ArticleCard
                v-for="article in southAfricaArticles"
                :key="article.id"
                :article="article"
              />
              <p v-if="southAfricaArticles.length === 0" class="empty-message">
                No articles in this category
              </p>
            </div>
          </div>

          <!-- Southern Africa Column -->
          <div class="region-column">
            <h2 class="region-header southern-africa">
              <span class="region-flag">🌍</span>
              Southern Africa
            </h2>
            <div class="articles-list">
              <ArticleCard
                v-for="article in southernAfricaArticles"
                :key="article.id"
                :article="article"
              />
              <p v-if="southernAfricaArticles.length === 0" class="empty-message">
                No articles in this category
              </p>
            </div>
          </div>

          <!-- Rest of Africa Column -->
          <div class="region-column">
            <h2 class="region-header africa">
              <span class="region-flag">🌍</span>
              Rest of Africa
            </h2>
            <div class="articles-list">
              <ArticleCard
                v-for="article in africaArticles"
                :key="article.id"
                :article="article"
              />
              <p v-if="africaArticles.length === 0" class="empty-message">
                No articles in this category
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- External News Sources -->
      <section class="external-sources-section py-xl bg-secondary">
        <h2 class="section-title text-center mb-lg">{{ $t('news.externalSources') }}</h2>
        <p class="section-subtitle text-center mb-xl">
          Visit these trusted news sources for more reading practice
        </p>
        <div class="sources-grid">
          <a
            v-for="source in contentStore.newsSources"
            :key="source.id"
            :href="source.url"
            target="_blank"
            rel="noopener noreferrer"
            class="source-card"
            :class="source.region"
          >
            <h3 class="source-name">{{ source.name }}</h3>
            <span class="source-region">{{ formatRegion(source.region) }}</span>
            <span class="source-link">
              {{ $t('news.visitSource') }}
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
              </svg>
            </span>
          </a>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TOPIC_CATEGORIES } from '~/types'

const contentStore = useContentStore()
const route = useRoute()

const selectedRegion = ref('all')
const selectedCategory = ref('all')

const categories = TOPIC_CATEGORIES

// Set initial region from query params
onMounted(() => {
  contentStore.initializeContent()
  if (route.query.region) {
    selectedRegion.value = route.query.region as string
  }
})

const filteredArticles = computed(() => {
  let articles = contentStore.articles

  if (selectedCategory.value !== 'all') {
    articles = articles.filter(a => a.category === selectedCategory.value)
  }

  return articles
})

const southAfricaArticles = computed(() => {
  if (selectedRegion.value !== 'all' && selectedRegion.value !== 'south-africa') {
    return []
  }
  return filteredArticles.value.filter(a => a.region === 'south-africa')
})

const southernAfricaArticles = computed(() => {
  if (selectedRegion.value !== 'all' && selectedRegion.value !== 'southern-africa') {
    return []
  }
  return filteredArticles.value.filter(a => a.region === 'southern-africa')
})

const africaArticles = computed(() => {
  if (selectedRegion.value !== 'all' && selectedRegion.value !== 'africa') {
    return []
  }
  return filteredArticles.value.filter(a => a.region === 'africa')
})

const formatRegion = (region: string) => {
  const regions: Record<string, string> = {
    'south-africa': 'South Africa',
    'southern-africa': 'Southern Africa',
    'africa': 'Africa'
  }
  return regions[region] || region
}
</script>

<style scoped>
.news-page {
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

.filters-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background-color: var(--bg-secondary);
  border-radius: var(--radius-lg);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.filter-label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-secondary);
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.filter-btn {
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: var(--font-size-xs);
  font-weight: 500;
  background-color: var(--bg-primary);
  border: 2px solid var(--bg-tertiary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.filter-btn:hover {
  border-color: var(--primary-color);
}

.filter-btn.active {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: var(--text-on-primary);
}

.filter-btn.south-africa.active {
  background-color: var(--secondary-color);
  border-color: var(--secondary-color);
}

.filter-btn.southern-africa.active {
  background-color: var(--accent-green);
  border-color: var(--accent-green);
}

.comparison-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-lg);
}

.region-column {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.region-header {
  font-size: var(--font-size-lg);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.region-header.south-africa {
  background-color: rgba(247, 148, 29, 0.1);
  border-left: 4px solid var(--secondary-color);
}

.region-header.southern-africa {
  background-color: rgba(40, 167, 69, 0.1);
  border-left: 4px solid var(--accent-green);
}

.region-header.africa {
  background-color: rgba(26, 95, 122, 0.1);
  border-left: 4px solid var(--primary-color);
}

.region-flag {
  font-size: 1.5rem;
}

.articles-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.empty-message {
  color: var(--text-light);
  font-size: var(--font-size-sm);
  text-align: center;
  padding: var(--spacing-lg);
  background-color: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.section-title {
  font-size: var(--font-size-xl);
}

.section-subtitle {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.sources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--spacing-md);
  padding: 0 var(--spacing-lg);
}

.source-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: var(--spacing-lg);
  background-color: var(--bg-primary);
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--text-primary);
  border-left: 4px solid var(--primary-color);
  transition: all var(--transition-fast);
}

.source-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.source-card.south-africa {
  border-left-color: var(--secondary-color);
}

.source-card.southern-africa {
  border-left-color: var(--accent-green);
}

.source-name {
  font-size: var(--font-size-base);
  font-weight: 600;
}

.source-region {
  font-size: var(--font-size-xs);
  color: var(--text-light);
}

.source-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-xs);
  color: var(--primary-color);
  margin-top: var(--spacing-sm);
}

@media (max-width: 992px) {
  .comparison-grid {
    grid-template-columns: 1fr;
  }
}
</style>
