<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">{{ $t('home.hero.title') }}</h1>
          <p class="hero-subtitle">{{ $t('home.hero.subtitle') }}</p>
          <div class="hero-actions">
            <NuxtLink to="/learn" class="btn btn-primary btn-lg">
              {{ $t('home.hero.cta') }}
            </NuxtLink>
            <NuxtLink to="/lessons" class="btn btn-outline btn-lg">
              {{ $t('home.hero.secondary') }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Statistics Section -->
    <section class="stats-section py-2xl bg-secondary">
      <div class="container">
        <h2 class="section-title text-center mb-xl">{{ $t('home.stats.title') }}</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">{{ $t('home.stats.percentage') }}</div>
            <div class="stat-label">{{ $t('home.stats.learners') }}</div>
            <p class="stat-description">{{ $t('home.stats.description') }}</p>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ $t('home.stats.languages') }}</div>
            <div class="stat-label">{{ $t('home.stats.languagesDesc') }}</div>
          </div>
          <div class="stat-card crisis-card">
            <div class="stat-icon">📉</div>
            <div class="stat-label">South Africa ranks among the lowest in literacy assessments globally</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section py-2xl">
      <div class="container">
        <h2 class="section-title text-center mb-xl">{{ $t('home.features.title') }}</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🔊</div>
            <h3 class="feature-title">{{ $t('home.features.voice.title') }}</h3>
            <p class="feature-description">{{ $t('home.features.voice.description') }}</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">✨</div>
            <h3 class="feature-title">{{ $t('home.features.highlight.title') }}</h3>
            <p class="feature-description">{{ $t('home.features.highlight.description') }}</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">⏱️</div>
            <h3 class="feature-title">{{ $t('home.features.speed.title') }}</h3>
            <p class="feature-description">{{ $t('home.features.speed.description') }}</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🌍</div>
            <h3 class="feature-title">{{ $t('home.features.languages.title') }}</h3>
            <p class="feature-description">{{ $t('home.features.languages.description') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Demo Reading Section -->
    <section class="demo-section py-2xl bg-secondary">
      <div class="container container-narrow">
        <h2 class="section-title text-center mb-lg">Try Reading Now</h2>
        <p class="section-subtitle text-center mb-xl">
          Experience our word-by-word reading system with voice guidance
        </p>
        <ReadingDisplay
          :text="demoText"
          :show-pointer="true"
        />
      </div>
    </section>

    <!-- Regions Preview Section -->
    <section class="regions-section py-2xl">
      <div class="container">
        <h2 class="section-title text-center mb-xl">{{ $t('home.regions.title') }}</h2>
        <div class="regions-grid">
          <div class="region-card south-africa">
            <h3 class="region-title">{{ $t('home.regions.southAfrica') }}</h3>
            <p class="region-description">
              News and articles focused on South African literacy, education, and current events.
            </p>
            <NuxtLink to="/news?region=south-africa" class="btn btn-secondary">
              Explore
            </NuxtLink>
          </div>
          <div class="region-card southern-africa">
            <h3 class="region-title">{{ $t('home.regions.southernAfrica') }}</h3>
            <p class="region-description">
              Stories from Botswana, Zimbabwe, Namibia, Zambia, and neighboring countries.
            </p>
            <NuxtLink to="/news?region=southern-africa" class="btn btn-secondary">
              Explore
            </NuxtLink>
          </div>
          <div class="region-card africa">
            <h3 class="region-title">{{ $t('home.regions.africa') }}</h3>
            <p class="region-description">
              Pan-African news covering education and literacy initiatives across the continent.
            </p>
            <NuxtLink to="/news?region=africa" class="btn btn-secondary">
              Explore
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Call to Action -->
    <section class="cta-section py-2xl">
      <div class="container text-center">
        <h2 class="cta-title">Start Your Reading Journey Today</h2>
        <p class="cta-description">
          Learning to read opens doors to education, employment, and a better future.
          Our free platform is here to help you every step of the way.
        </p>
        <NuxtLink to="/learn" class="btn btn-primary btn-lg">
          Begin Learning
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const demoText = `The sun rises in the east. It brings light and warmth to the world. People wake up and start their day. Children go to school. They learn to read and write. Reading opens many doors. It helps us understand the world. Every word we learn makes us stronger.`

// Initialize content store
const contentStore = useContentStore()

onMounted(() => {
  contentStore.initializeContent()
})
</script>

<style scoped>
.hero {
  background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-color) 100%);
  color: var(--text-on-primary);
  padding: var(--spacing-2xl) 0;
  min-height: 60vh;
  display: flex;
  align-items: center;
}

.hero-content {
  max-width: 800px;
}

.hero-title {
  font-size: var(--font-size-3xl);
  margin-bottom: var(--spacing-lg);
  color: var(--text-on-primary);
}

.hero-subtitle {
  font-size: var(--font-size-lg);
  opacity: 0.9;
  margin-bottom: var(--spacing-xl);
  line-height: var(--line-height-relaxed);
}

.hero-actions {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.hero-actions .btn-outline {
  border-color: var(--text-on-primary);
  color: var(--text-on-primary);
}

.hero-actions .btn-outline:hover {
  background-color: var(--text-on-primary);
  color: var(--primary-color);
}

.section-title {
  font-size: var(--font-size-2xl);
  color: var(--text-primary);
}

.section-subtitle {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-lg);
}

.stat-card {
  text-align: center;
  padding: var(--spacing-xl);
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: var(--text-on-primary);
  border-radius: var(--radius-lg);
}

.stat-number {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  margin-bottom: var(--spacing-sm);
}

.stat-label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  margin-bottom: var(--spacing-sm);
}

.stat-description {
  font-size: var(--font-size-xs);
  opacity: 0.9;
  margin: 0;
}

.stat-icon {
  font-size: 3rem;
  margin-bottom: var(--spacing-md);
}

.crisis-card {
  background: linear-gradient(135deg, var(--accent-red), #b71c1c);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
}

.feature-card {
  text-align: center;
  padding: var(--spacing-xl);
  background-color: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-fast);
}

.feature-card:hover {
  box-shadow: var(--shadow-lg);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: var(--spacing-md);
}

.feature-title {
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-sm);
}

.feature-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
}

.regions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

.region-card {
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  background-color: var(--bg-primary);
  border-left: 6px solid var(--primary-color);
  box-shadow: var(--shadow-sm);
}

.region-card.south-africa {
  border-left-color: var(--secondary-color);
}

.region-card.southern-africa {
  border-left-color: var(--accent-green);
}

.region-card.africa {
  border-left-color: var(--primary-color);
}

.region-title {
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-sm);
}

.region-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
}

.cta-section {
  background: linear-gradient(135deg, var(--secondary-color), var(--secondary-light));
  color: var(--text-on-primary);
}

.cta-title {
  font-size: var(--font-size-2xl);
  margin-bottom: var(--spacing-md);
  color: var(--text-on-primary);
}

.cta-description {
  font-size: var(--font-size-base);
  max-width: 600px;
  margin: 0 auto var(--spacing-lg);
  opacity: 0.95;
}

.cta-section .btn-primary {
  background-color: var(--primary-dark);
}

.cta-section .btn-primary:hover {
  background-color: var(--primary-color);
}

@media (max-width: 768px) {
  .hero {
    padding: var(--spacing-xl) 0;
    min-height: auto;
  }

  .hero-title {
    font-size: var(--font-size-2xl);
  }

  .hero-subtitle {
    font-size: var(--font-size-base);
  }

  .hero-actions {
    flex-direction: column;
  }

  .hero-actions .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
