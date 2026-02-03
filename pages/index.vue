<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="container">
        <div class="hero-grid">
          <div class="hero-content">
            <h1 class="hero-title">A free literacy platform</h1>
            <p class="hero-subtitle">for South Africa and beyond</p>
            <div class="hero-actions">
              <NuxtLink to="/learn" class="btn btn-primary btn-lg">
                {{ $t('home.hero.cta') }}
              </NuxtLink>
              <NuxtLink to="/lessons" class="btn btn-outline btn-lg">
                {{ $t('home.hero.secondary') }}
              </NuxtLink>
            </div>
          </div>

          <div class="hero-help">
            <h2 class="hero-help-title">How We Help You Learn</h2>
            <ul class="hero-help-list">
              <li class="hero-help-item">
                <span class="hero-help-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                  </svg>
                </span>
                <span>Words read aloud as you follow along</span>
              </li>
              <li class="hero-help-item">
                <span class="hero-help-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                    <path d="M2 17l10 5 10-5"></path>
                    <path d="M2 12l10 5 10-5"></path>
                  </svg>
                </span>
                <span>Each word highlighted as it's spoken</span>
              </li>
              <li class="hero-help-item">
                <span class="hero-help-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </span>
                <span>Control the reading speed to match your pace</span>
              </li>
              <li class="hero-help-item">
                <span class="hero-help-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                  </svg>
                </span>
                <span>Learn in 9 South African languages</span>
              </li>
              <li class="hero-help-item">
                <span class="hero-help-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  </svg>
                </span>
                <span>Real news articles simplified for learning</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Demo Reading Section -->
    <section class="demo-section py-lg bg-secondary">
      <div class="container demo-container">
        <div class="demo-header">
          <h2 class="section-title mb-sm">Try Reading Now</h2>
          <p class="section-subtitle">
            Experience our word-by-word reading system with voice guidance
          </p>
        </div>
        <ReadingDisplay
          :text="demoText"
          :show-pointer="true"
        />
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section py-lg">
      <div class="container">
        <h2 class="section-title text-center mb-md">{{ $t('home.features.title') }}</h2>
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

    <!-- Statistics Section -->
    <section class="stats-section py-lg bg-secondary">
      <div class="container">
        <h2 class="section-title text-center mb-md">{{ $t('home.stats.title') }}</h2>
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

    <!-- Call to Action -->
    <section class="cta-section py-lg">
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

    <!-- Regions Preview Section -->
    <section class="regions-section py-lg bg-secondary">
      <div class="container">
        <h2 class="section-title text-center mb-md">{{ $t('home.regions.title') }}</h2>
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
  padding: 1.5rem 0;
}

.hero-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
  align-items: center;
}

.hero-content {
  max-width: 600px;
}

.hero-help {
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-md);
  padding: 1rem 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.hero-help-title {
  font-size: var(--font-size-lg);
  color: var(--text-on-primary);
  margin-bottom: 0.75rem;
  font-weight: 600;
}

.hero-help-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.hero-help-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0;
  font-size: var(--font-size-sm);
  line-height: 1.3;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.hero-help-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.hero-help-item:first-child {
  padding-top: 0;
}

.hero-help-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.hero-help-icon svg {
  width: 16px;
  height: 16px;
  stroke: var(--text-on-primary);
}

.hero-title {
  font-size: var(--font-size-3xl);
  margin-bottom: 0.75rem;
  color: var(--text-on-primary);
}

.hero-subtitle {
  font-size: var(--font-size-base);
  opacity: 0.9;
  margin-bottom: 1.25rem;
  line-height: var(--line-height-normal);
}

.hero-actions {
  display: flex;
  gap: 0.75rem;
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
  font-size: var(--font-size-xl);
  color: var(--text-primary);
}

.section-subtitle {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
}

.demo-container {
  max-width: 100%;
}

.demo-header {
  text-align: center;
  margin-bottom: 0.75rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}

.stat-card {
  text-align: center;
  padding: 1rem;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: var(--text-on-primary);
  border-radius: var(--radius-md);
}

.stat-number {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.stat-description {
  font-size: var(--font-size-xs);
  opacity: 0.9;
  margin: 0;
}

.stat-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.crisis-card {
  background: linear-gradient(135deg, var(--accent-red), #b71c1c);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.feature-card {
  text-align: center;
  padding: 1rem;
  background-color: var(--bg-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-fast);
}

.feature-card:hover {
  box-shadow: var(--shadow-md);
}

.feature-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.feature-title {
  font-size: var(--font-size-base);
  margin-bottom: 0.25rem;
}

.feature-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
}

.regions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
}

.region-card {
  padding: 1rem;
  border-radius: var(--radius-md);
  background-color: var(--bg-primary);
  border-left: 4px solid var(--primary-color);
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
  font-size: var(--font-size-base);
  margin-bottom: 0.25rem;
}

.region-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: 0.75rem;
}

.cta-section {
  background: linear-gradient(135deg, var(--secondary-color), var(--secondary-light));
  color: var(--text-on-primary);
}

.cta-title {
  font-size: var(--font-size-xl);
  margin-bottom: 0.5rem;
  color: var(--text-on-primary);
}

.cta-description {
  font-size: var(--font-size-sm);
  max-width: 500px;
  margin: 0 auto 1rem;
  opacity: 0.95;
}

.cta-section .btn-primary {
  background-color: var(--primary-dark);
}

.cta-section .btn-primary:hover {
  background-color: var(--primary-color);
}

@media (max-width: 992px) {
  .hero-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-xl);
  }

  .hero-help {
    order: 2;
  }
}

@media (max-width: 768px) {
  .hero {
    padding: 1rem 0;
  }

  .hero-title {
    font-size: var(--font-size-2xl);
  }

  .hero-subtitle {
    font-size: var(--font-size-sm);
  }

  .hero-actions {
    flex-direction: column;
  }

  .hero-actions .btn {
    width: 100%;
    justify-content: center;
  }

  .hero-help {
    padding: var(--spacing-md);
  }

  .hero-help-title {
    font-size: var(--font-size-lg);
  }
}
</style>
